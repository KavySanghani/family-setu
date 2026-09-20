import { VerificationRepository } from '../repositories/verification.repository';
import { AuditService } from '../../../shared/utils/audit';
import { AppError } from '../../../shared/errors/AppError';
import { 
  SubmitVerificationSchema, 
  DecideVerificationSchema 
} from '../schemas/verification.schema';

export class VerificationService {
  constructor(private readonly repository: VerificationRepository) {}

  /**
   * Submits a protected field change for verification.
   */
  async submitVerificationRequest(actorId: string, data: any) {
    const parsedData = SubmitVerificationSchema.parse(data);

    const request = await this.repository.submitVerificationRequest({
      family_id: parsedData.familyId,
      member_id: parsedData.memberId || null,
      entity_type: parsedData.entityType,
      entity_id: parsedData.entityId || null,
      old_value: parsedData.oldValue,
      new_value: parsedData.newValue,
      evidence_payload: parsedData.evidencePayload,
      status: 'PENDING',
      requested_by: actorId
    });

    await AuditService.logAction({
      actorId,
      action: 'SUBMIT_VERIFICATION',
      entityType: 'verification_request',
      entityId: request.id,
      newData: request
    });

    // In a real flow we might transition the underlying family status to UNDER_VERIFICATION

    return request;
  }

  /**
   * Officer decides on a pending verification request.
   */
  async decideVerification(actorId: string, requestId: string, data: any) {
    const parsedData = DecideVerificationSchema.parse(data);

    const currentReq = await this.repository.getVerificationRequest(requestId);
    
    if (currentReq.status !== 'PENDING') {
      throw AppError.invalidStateTransition(`Cannot decide on request in ${currentReq.status} state.`);
    }

    const request = await this.repository.updateVerificationDecision(requestId, {
      status: parsedData.status,
      comments: parsedData.comments,
      reviewed_by: actorId,
      reviewed_at: new Date().toISOString()
    });

    await AuditService.logAction({
      actorId,
      action: 'DECIDE_VERIFICATION',
      entityType: 'verification_request',
      entityId: request.id,
      oldData: { status: 'PENDING' },
      newData: { status: parsedData.status, comments: parsedData.comments }
    });

    // Emitting event so downstream services can update the actual protected profile fields if APPROVED
    await AuditService.emitEvent({
      eventType: `VERIFICATION_${parsedData.status}`,
      payload: request,
      entityType: 'verification_request',
      entityId: request.id
    });

    return request;
  }
}
