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
}
