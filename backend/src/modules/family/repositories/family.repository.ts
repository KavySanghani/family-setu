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
}
