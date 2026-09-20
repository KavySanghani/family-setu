import { DataQualityRepository } from '../repositories/data-quality.repository';
import { AuditService } from '../../../shared/utils/audit';
import { FlagDuplicateSchema, ResolveDataIssueSchema } from '../schemas/data-quality.schema';

export class DataQualityService {
  constructor(private readonly repository: DataQualityRepository) {}

  /**
   * Flags two entities as potential duplicates for human review.
   * Does NOT auto-merge or delete them.
   */
  async flagDuplicate(actorId: string, data: any) {
    const parsedData = FlagDuplicateSchema.parse(data);

    const issue = await this.repository.createDuplicateFlag({
      entity_type: parsedData.entityType,
      entity_id_1: parsedData.entityId1,
      entity_id_2: parsedData.entityId2,
      reason: parsedData.reason,
      confidence_score: parsedData.confidenceScore
    });

    await AuditService.logAction({
      actorId,
      action: 'FLAG_DUPLICATE',
      entityType: 'data_quality_issue',
      entityId: issue.id,
      newData: issue
    });

    return issue;
  }

  /**
   * Resolves a data quality issue manually.
   */
  async resolveIssue(actorId: string, issueId: string, data: any) {
    const parsedData = ResolveDataIssueSchema.parse(data);

    const issue = await this.repository.resolveIssue(issueId, {
      status: 'RESOLVED',
      resolution_details: {
        action: parsedData.resolutionAction,
        comments: parsedData.comments,
        resolvedBy: actorId,
        resolvedAt: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    });

    await AuditService.logAction({
      actorId,
      action: 'RESOLVE_DATA_ISSUE',
      entityType: 'data_quality_issue',
      entityId: issue.id,
      newData: issue
    });

    return issue;
  }
}
