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
   * Retrieves the family associated with the authenticated user's scopes.
   */
  async getMyFamily(scopes: { type: string; value: string }[]) {
    const familyScope = scopes.find(s => s.type === 'FAMILY');
    if (!familyScope) {
      throw AppError.notFound('No family associated with this user.');
    }
    return this.repository.getFamilyById(familyScope.value);
  }

  /**
   * Retrieves a family by ID, enforcing authorization.
   */
  async getFamily(scopes: { type: string; value: string }[], familyId: string) {
    this.assertFamilyAccess(scopes, familyId);
    return this.repository.getFamilyById(familyId);
  }

  /**
   * Retrieves family members, enforcing authorization.
   */
  async getFamilyMembers(scopes: { type: string; value: string }[], familyId: string) {
    await this.getFamily(scopes, familyId); // Enforce auth
    return this.repository.getFamilyMembers(familyId);
  }

  /**
   * Retrieves life events, enforcing authorization.
   */
  async getLifeEvents(scopes: { type: string; value: string }[], familyId: string) {
    await this.getFamily(scopes, familyId); // Enforce auth
    return this.repository.getLifeEvents(familyId);
  }

  /**
   * Creates a new family and emits the creation event.
   */
  async createFamily(actorId: string, data: any) {
    // 1. Validation
    const parsedData = CreateFamilySchema.parse(data);

    // Generate unique readable ID
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedFamilyId = `GJ-FAM-${randomSuffix}`;

    // 2. Business Logic / Persistence
    const family = await this.repository.createFamily({
      ...parsedData,
      family_id: generatedFamilyId,
      status: 'VERIFIED', // Initial state for prototype
      profile_version: 1
    });

    // Link the user to the newly created family
    await this.repository.linkUserToFamily(actorId, family.id);

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
    this.assertFamilyAccess(data.scopes ?? [], familyId);
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

    this.assertFamilyAccess(data.scopes ?? [], parsedData.familyId);
    // Ensure family exists
    await this.repository.getFamilyById(parsedData.familyId);

    // Generate unique readable ID
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedMemberId = `GJ-MEM-${randomSuffix}`;

    const member = await this.repository.createMember({
      ...parsedData,
      member_id: generatedMemberId,
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
    this.assertFamilyAccess(data.scopes ?? [], parsedData.familyId);

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

  private assertFamilyAccess(scopes: { type: string; value: string }[], familyId: string) {
    const hasAccess = scopes.some(scope => scope.type === 'FAMILY' && scope.value === familyId)
      || scopes.some(scope => scope.type === 'DEPARTMENT');
    if (!hasAccess) throw AppError.forbidden('You do not have permission to access this family.');
  }
}
