import { FamilyRepository } from '../repositories/family.repository';
import { AppError } from '../../../shared/errors/AppError';
import { AuditService } from '../../../shared/utils/audit';
import { 
  CreateFamilySchema, 
  UpdateFamilySchema, 
  CreateMemberSchema, 
  RecordLifeEventSchema 
} from '../schemas/family.schema';

export class FamilyService {
  constructor(private readonly repository: FamilyRepository) {}

  /**
   * Creates a new family and emits the creation event.
   */
  async createFamily(actorId: string, data: any) {
    // 1. Validation
    const parsedData = CreateFamilySchema.parse(data);

    // 2. Business Logic / Persistence
    const family = await this.repository.createFamily({
      ...parsedData,
      status: 'VERIFIED', // Initial state for prototype
      profile_version: 1
    });

    // 3. Audit and Outbox (Eventual consistency)
    await AuditService.logAction({
      actorId,
      action: 'CREATE_FAMILY',
      entityType: 'family',
      entityId: family.id,
      newData: family
    });

    await AuditService.emitEvent({
      eventType: 'FAMILY_CREATED',
      payload: family,
      entityType: 'family',
      entityId: family.id
    });

    return family;
  }

  /**
   * Updates a family utilizing optimistic concurrency.
   */
  async updateFamily(actorId: string, familyId: string, data: any) {
    const parsedData = UpdateFamilySchema.parse(data);
    const { expectedVersion, ...updatePayload } = parsedData;

    const oldFamily = await this.repository.getFamilyById(familyId);

    const family = await this.repository.updateFamily(familyId, expectedVersion, updatePayload);

    await AuditService.logAction({
      actorId,
      action: 'UPDATE_FAMILY',
      entityType: 'family',
      entityId: family.id,
      oldData: oldFamily,
      newData: family
    });

    await AuditService.emitEvent({
      eventType: 'FAMILY_UPDATED',
      payload: family,
      entityType: 'family',
      entityId: family.id
    });

    return family;
  }

  /**
   * Adds a member to an existing family.
   */
  async addMember(actorId: string, data: any) {
    const parsedData = CreateMemberSchema.parse(data);

    // Ensure family exists
    await this.repository.getFamilyById(parsedData.familyId);

    const member = await this.repository.createMember({
      ...parsedData,
      profile_version: 1,
      status: 'ACTIVE'
    });

    await AuditService.logAction({
      actorId,
      action: 'CREATE_MEMBER',
      entityType: 'family_member',
      entityId: member.id,
      newData: member
    });

    await AuditService.emitEvent({
      eventType: 'MEMBER_ADDED',
      payload: member,
      entityType: 'family_member',
      entityId: member.id
    });

    return member;
  }

  /**
   * Records a life event (e.g., birth, death, marriage).
   */
  async recordLifeEvent(actorId: string, data: any) {
    const parsedData = RecordLifeEventSchema.parse(data);

    const lifeEvent = await this.repository.recordLifeEvent(parsedData);

    await AuditService.logAction({
      actorId,
      action: 'RECORD_LIFE_EVENT',
      entityType: 'life_event',
      entityId: lifeEvent.id,
      newData: lifeEvent
    });

    await AuditService.emitEvent({
      eventType: 'LIFE_EVENT_RECORDED',
      payload: lifeEvent,
      entityType: 'life_event',
      entityId: lifeEvent.id
    });

    return lifeEvent;
  }
}
