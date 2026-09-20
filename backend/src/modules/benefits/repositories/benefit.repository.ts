import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class BenefitRepository {
  async recordBenefit(data: any): Promise<any> {
    const { data: benefit, error } = await supabase
      .from('benefit_history')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to record benefit: ${error.message}`);
    }
    return benefit;
  }

  async listBenefits(filters?: { familyId?: string; memberId?: string; schemeId?: string }): Promise<any[]> {
    let query = supabase.from('benefit_history').select('*').order('created_at', { ascending: false });
    if (filters?.familyId) query = query.eq('family_id', filters.familyId);
    if (filters?.memberId) query = query.eq('member_id', filters.memberId);
    if (filters?.schemeId) query = query.eq('scheme_id', filters.schemeId);
    const { data, error } = await query;
    if (error) throw AppError.internalError(`Failed to list benefits: ${error.message}`);
    return data || [];
  }

  async getBenefitById(id: string): Promise<any> {
    const { data: benefit, error } = await supabase
      .from('benefit_history')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !benefit) throw AppError.notFound(`Benefit ${id} not found.`);
    return benefit;
  }
}
