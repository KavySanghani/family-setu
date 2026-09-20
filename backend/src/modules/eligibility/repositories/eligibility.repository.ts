import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class EligibilityRepository {
  async storeEvaluationResult(data: any): Promise<any> {
    const { data: evaluation, error } = await supabase
      .from('eligibility_evaluation')
      .upsert([data], { onConflict: 'family_id,member_id,scheme_id' })
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to store eligibility evaluation: ${error.message}`);
    }
    return evaluation;
  }

  async listEvaluations(filters?: { familyId?: string; schemeId?: string; status?: string }): Promise<any[]> {
    let query = supabase.from('eligibility_evaluation').select('*').order('evaluated_at', { ascending: false });
    if (filters?.familyId) query = query.eq('family_id', filters.familyId);
    if (filters?.schemeId) query = query.eq('scheme_id', filters.schemeId);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query;
    if (error) throw AppError.internalError(`Failed to list evaluations: ${error.message}`);
    return data || [];
  }

  async getEvaluationById(id: string): Promise<any> {
    const { data: evaluation, error } = await supabase
      .from('eligibility_evaluation')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !evaluation) throw AppError.notFound(`Evaluation ${id} not found.`);
    return evaluation;
  }

  async getEvaluationsForFamily(familyId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('eligibility_evaluation')
      .select('*')
      .eq('family_id', familyId)
      .order('evaluated_at', { ascending: false });
    if (error) throw AppError.internalError(`Failed to list family evaluations: ${error.message}`);
    return data || [];
  }
}
