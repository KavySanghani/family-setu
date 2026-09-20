import { SchemeRepository } from '../repositories/scheme.repository';
import { AuditService } from '../../../shared/utils/audit';
import { CreateSchemeSchema, CreateSchemeVersionSchema } from '../schemas/scheme.schema';

export class SchemeService {
  constructor(private readonly repository: SchemeRepository) {}

  /**
   * Creates a new scheme in the catalogue.
   */
  async createScheme(actorId: string, data: any) {
    const parsedData = CreateSchemeSchema.parse(data);

    const scheme = await this.repository.createScheme({
      ...parsedData,
      status: 'ACTIVE'
    });

    await AuditService.logAction({
      actorId,
      action: 'CREATE_SCHEME',
      entityType: 'scheme',
      entityId: scheme.id,
      newData: scheme
    });

    await AuditService.emitEvent({
      eventType: 'SCHEME_CREATED',
      payload: scheme,
      entityType: 'scheme',
      entityId: scheme.id
    });

    return scheme;
  }

  /**
   * Adds a new version (rules/benefits) to an existing scheme.
   */
  async createSchemeVersion(actorId: string, data: any) {
    const parsedData = CreateSchemeVersionSchema.parse(data);

    const version = await this.repository.createSchemeVersion({
      scheme_id: parsedData.schemeId,
      rule_definition: parsedData.ruleDefinition,
      benefits_definition: parsedData.benefitsDefinition,
      required_documents: parsedData.requiredDocuments,
      effective_from: parsedData.effectiveFrom,
      effective_to: parsedData.effectiveTo
    });

    await AuditService.logAction({
      actorId,
      action: 'CREATE_SCHEME_VERSION',
      entityType: 'scheme_version',
      entityId: version.id,
      newData: version
    });

    await AuditService.emitEvent({
      eventType: 'SCHEME_VERSION_CREATED',
      payload: version,
      entityType: 'scheme_version',
      entityId: version.id
    });

    return version;
  }

  /**
   * Resolves the active version of a scheme for a given date.
   */
  async getEffectiveVersion(schemeId: string, evaluationDate: string = new Date().toISOString().split('T')[0]) {
    return this.repository.getEffectiveVersion(schemeId, evaluationDate);
  }
}
