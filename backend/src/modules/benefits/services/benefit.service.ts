import { BenefitRepository } from '../repositories/benefit.repository';
import { AuditService } from '../../../shared/utils/audit';
import { RecordBenefitSchema } from '../schemas/benefit.schema';

export class BenefitService {
  constructor(private readonly repository: BenefitRepository) {}

  /**
   * Records a benefit distribution in the system.
   */
  async recordBenefit(actorId: string, data: any) {
    const parsedData = RecordBenefitSchema.parse(data);

    const benefit = await this.repository.recordBenefit({
      family_id: parsedData.familyId,
      member_id: parsedData.memberId || null,
      scheme_id: parsedData.schemeId,
      application_id: parsedData.applicationId || null,
      benefit_type: parsedData.benefitType,
      status: parsedData.status,
      amount: parsedData.amount,
      currency: parsedData.currency,
      description: parsedData.description,
      disbursed_at: parsedData.disbursedAt,
      source_reference: parsedData.sourceReference
    });

    await AuditService.logAction({
      actorId,
      action: 'RECORD_BENEFIT',
      entityType: 'benefit_history',
      entityId: benefit.id,
      newData: benefit
    });

    await AuditService.emitEvent({
      eventType: 'BENEFIT_RECORDED',
      payload: benefit,
      entityType: 'benefit_history',
      entityId: benefit.id
    });

    return benefit;
  }
}
