import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class EligibilityRepository {
  async storeEvaluationResult(data: any): Promise<any> {
    const { data: evaluation, error } = await supabase
      .from('eligibility_evaluation')
      .upsert([data], { onConflict: 'family_id,member_id,scheme_id' }) // Replace old evaluation for this context
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to store eligibility evaluation: ${error.message}`);
    }
    return evaluation;
  }
}
