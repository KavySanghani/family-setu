import { ApplicationRepository } from '../repositories/application.repository';
import { AuditService } from '../../../shared/utils/audit';
import { AppError } from '../../../shared/errors/AppError';
import { 
  CreateApplicationSchema, 
  UpdateApplicationStatusSchema, 
  RecordRedirectSchema 
} from '../schemas/application.schema';

export class ApplicationService {
  constructor(private readonly repository: ApplicationRepository) {}

  async listApplications(filters?: { familyId?: string; schemeId?: string; status?: string }) {
    return this.repository.listApplications(filters);
  }

  async getApplication(id: string) {
    return this.repository.getApplicationById(id);
  }

  /**
   * Initiates a tracking record for a new application.
   * Ensures idempotency to prevent duplicate submissions from retries.
   */
  async initiateApplication(actorId: string, data: any) {
    const parsedData = CreateApplicationSchema.parse(data);

    // Idempotency check
    const existing = await this.repository.getApplicationByIdempotencyKey(parsedData.idempotencyKey);
    if (existing) {
      return existing; // Return existing record on retry
    }

    const application = await this.repository.createApplication({
      family_id: parsedData.familyId,
      member_id: parsedData.memberId || null,
      scheme_id: parsedData.schemeId,
      idempotency_key: parsedData.idempotencyKey,
      status: 'INITIATED',
      submitted_at: new Date().toISOString()
    });

    await AuditService.logAction({
      actorId,
      action: 'INITIATE_APPLICATION',
      entityType: 'scheme_application',
      entityId: application.id,
      newData: application
    });

    await AuditService.emitEvent({
      eventType: 'APPLICATION_CREATED',
      payload: application,
      entityType: 'scheme_application',
      entityId: application.id
    });

    return application;
  }

  /**
   * Updates an application status, verifying valid state transitions.
   */
  async updateApplicationStatus(actorId: string, applicationId: string, data: any) {
    const parsedData = UpdateApplicationStatusSchema.parse(data);
    
    const current = await this.repository.getApplicationById(applicationId);
    
    // State transition guard
    if (this.isInvalidTransition(current.status, parsedData.status)) {
      throw AppError.invalidStateTransition(`Cannot transition application from ${current.status} to ${parsedData.status}`);
    }

    const application = await this.repository.updateApplicationStatus(applicationId, {
      status: parsedData.status,
      external_reference_id: parsedData.externalReferenceId || current.external_reference_id,
      updated_at: new Date().toISOString()
    });

    await AuditService.logAction({
      actorId,
      action: 'UPDATE_APPLICATION_STATUS',
      entityType: 'scheme_application',
      entityId: application.id,
      oldData: { status: current.status },
      newData: { status: application.status, comments: parsedData.comments }
    });

    await AuditService.emitEvent({
      eventType: 'APPLICATION_STATUS_CHANGED',
      payload: application,
      entityType: 'scheme_application',
      entityId: application.id
    });

    return application;
  }

  /**
   * Records that a user was redirected to an official portal.
   */
  async recordRedirect(actorId: string, data: any) {
    const parsedData = RecordRedirectSchema.parse(data);

    const redirect = await this.repository.recordRedirectEvent({
      application_id: parsedData.applicationId,
      user_id: actorId,
      target_url: parsedData.targetUrl,
      redirected_at: new Date().toISOString()
    });

    // Optionally transition application to REDIRECTED if it's currently INITIATED
    const currentApp = await this.repository.getApplicationById(parsedData.applicationId);
    if (currentApp.status === 'INITIATED') {
      await this.updateApplicationStatus(actorId, currentApp.id, { status: 'REDIRECTED' });
    }

    return redirect;
  }

  private isInvalidTransition(from: string, to: string): boolean {
    const transitions: Record<string, string[]> = {
      'DRAFT': ['INITIATED', 'WITHDRAWN'],
      'INITIATED': ['REDIRECTED', 'SUBMITTED', 'WITHDRAWN'],
      'REDIRECTED': ['SUBMITTED', 'WITHDRAWN'],
      'SUBMITTED': ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
      'UNDER_REVIEW': ['APPROVED', 'REJECTED', 'WITHDRAWN'],
      'APPROVED': ['COMPLETED'],
      'REJECTED': [],
      'WITHDRAWN': [],
      'COMPLETED': []
    };

    const allowed = transitions[from] || [];
    return !allowed.includes(to);
  }
}
