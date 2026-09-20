import { supabase } from '../../../lib/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class FamilyRepository {
  async createFamily(data: any): Promise<any> {
    const { data: family, error } = await supabase
      .from('family')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to create family: ${error.message}`);
    }
    return family;
  }

  async getFamilyById(id: string): Promise<any> {
    const { data: family, error } = await supabase
      .from('family')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !family) {
      throw AppError.notFound(`Family with ID ${id} not found.`);
    }
    return family;
  }

  async updateFamily(id: string, expectedVersion: number, data: any): Promise<any> {
    // Optimistic concurrency check
    const current = await this.getFamilyById(id);
    if (current.profile_version !== expectedVersion) {
      throw AppError.conflict('Stale update: The family profile has been updated since you last fetched it.');
    }

    const { data: updatedFamily, error } = await supabase
      .from('family')
      .update({
        ...data,
        profile_version: expectedVersion + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to update family: ${error.message}`);
    }
    return updatedFamily;
  }

  async createMember(data: any): Promise<any> {
    const { data: member, error } = await supabase
      .from('family_member')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to create member: ${error.message}`);
    }
    return member;
  }

  async getFamilyMembers(familyId: string): Promise<any[]> {
    const { data: members, error } = await supabase
      .from('family_member')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (error) {
      throw AppError.internalError(`Failed to fetch family members: ${error.message}`);
    }
    return members || [];
  }

  async recordLifeEvent(data: any): Promise<any> {
    const { data: event, error } = await supabase
      .from('life_event')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to record life event: ${error.message}`);
    }
    return event;
  }

  async getLifeEvents(familyId: string): Promise<any[]> {
    const { data: events, error } = await supabase
      .from('life_event')
      .select('*')
      .eq('family_id', familyId)
      .order('event_date', { ascending: false });

    if (error) {
      throw AppError.internalError(`Failed to fetch life events: ${error.message}`);
    }
    return events || [];
  }

  async linkUserToFamily(userId: string, familyId: string): Promise<void> {
    const { error } = await supabase
      .from('user_scope')
      .insert([{
        user_id: userId,
        scope_type: 'FAMILY',
        scope_value: familyId
      }]);

    if (error) {
      throw AppError.internalError(`Failed to link user to family: ${error.message}`);
    }
  }
}
