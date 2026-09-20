import { supabase } from '../../../lib/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class FamilyRepository {
  async listFamilies(search?: string, limit = 50): Promise<any[]> {
    const safeSearch = search?.replace(/[,%()]/g, '');
    let query = supabase.from('family').select('*').order('created_at', { ascending: false }).limit(Math.min(limit, 100));
    if (safeSearch) query = query.or(`family_id.ilike.%${safeSearch}%,district.ilike.%${safeSearch}%`);
    const { data, error } = await query;
    if (error) throw AppError.internalError(`Failed to list families: ${error.message}`);
    return data || [];
  }
  async createFamily(data: any): Promise<any> {
    const { headOfFamilyId, addressLine1, addressLine2, villageWard, ...familyData } = data;
    const { data: family, error } = await supabase
      .from('family')
      .insert([{ ...familyData, head_member_id: headOfFamilyId, address_line1: addressLine1, address_line2: addressLine2, village_ward: villageWard }])
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

    const { headOfFamilyId, addressLine1, addressLine2, villageWard, expectedVersion: _expectedVersion, ...familyData } = data;
    const { data: updatedFamily, error } = await supabase
      .from('family')
      .update({
        ...familyData,
        ...(headOfFamilyId !== undefined ? { head_member_id: headOfFamilyId } : {}),
        ...(addressLine1 !== undefined ? { address_line1: addressLine1 } : {}),
        ...(addressLine2 !== undefined ? { address_line2: addressLine2 } : {}),
        ...(villageWard !== undefined ? { village_ward: villageWard } : {}),
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
    const { familyId, dateOfBirth, fullName, relationshipToHead, educationLevel, employmentStatus, annualIncome, maritalStatus, disabilityStatus, casteCategory, ...memberData } = data;
    const { data: member, error } = await supabase
      .from('family_member')
      .insert([{ ...memberData, family_id: familyId, date_of_birth: dateOfBirth, full_name: fullName, relationship_to_head: relationshipToHead, education_level: educationLevel, employment_status: employmentStatus, annual_income: annualIncome, marital_status: maritalStatus, disability_status: String(disabilityStatus ?? false), caste_category: casteCategory }])
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
    const { familyId, memberId, eventType, eventDate, description } = data;
    const { data: event, error } = await supabase
      .from('life_event')
      .insert([{ family_id: familyId, member_id: memberId, event_type: eventType, event_date: eventDate, description }])
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

  async getBeneficiary360(familyId: string): Promise<any> {
    const members = await this.getFamilyMembers(familyId);
    const [family, addresses, relationships, lifeEvents, eligibility, applications, benefits, verification, qualityIssues, audit] = await Promise.all([
      this.getFamilyById(familyId),
      supabase.from('family_address').select('*').eq('family_id', familyId).order('created_at', { ascending: false }),
      members.length ? supabase.from('member_relationship').select('*').in('member_id', members.map(member => member.id)) : Promise.resolve({ data: [], error: null }),
      this.getLifeEvents(familyId),
      supabase.from('eligibility_evaluation').select('*').eq('family_id', familyId).order('evaluated_at', { ascending: false }),
      supabase.from('scheme_application').select('*').eq('family_id', familyId).order('created_at', { ascending: false }),
      supabase.from('benefit_history').select('*').eq('family_id', familyId).order('created_at', { ascending: false }),
      supabase.from('verification_request').select('*').eq('entity_id', familyId).order('created_at', { ascending: false }),
      supabase.from('data_quality_issue').select('*').eq('entity_id', familyId).order('created_at', { ascending: false }),
      supabase.from('audit_log').select('id, action, entity_type, entity_id, created_at').eq('entity_id', familyId).order('created_at', { ascending: false }).limit(20),
    ]);
    const records = [addresses, relationships, eligibility, applications, benefits, verification, qualityIssues, audit];
    const failure = records.find(record => record.error);
    if (failure?.error) throw AppError.internalError(`Failed to build beneficiary view: ${failure.error.message}`);
    return {
      family,
      members,
      addresses: addresses.data || [], relationships: relationships.data || [], lifeEvents,
      eligibility: eligibility.data || [], applications: applications.data || [], benefits: benefits.data || [],
      verification: verification.data || [], dataQualityIssues: qualityIssues.data || [], audit: audit.data || [],
    };
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
