import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class VerificationRepository {
  async getVerificationRequest(id: string): Promise<any> {
    const { data: request, error } = await supabase
      .from('verification_request')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !request) {
      throw AppError.notFound(`Verification request ${id} not found.`);
    }
    return request;
  }

  async submitVerificationRequest(data: any): Promise<any> {
    const { data: request, error } = await supabase
      .from('verification_request')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to submit verification request: ${error.message}`);
    }
    return request;
  }

  async updateVerificationDecision(id: string, updateData: any): Promise<any> {
    const { data: request, error } = await supabase
      .from('verification_request')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to update verification decision: ${error.message}`);
    }
    return request;
  }
}
