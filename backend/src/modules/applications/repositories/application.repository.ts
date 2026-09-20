import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class ApplicationRepository {
  async getApplicationByIdempotencyKey(key: string): Promise<any> {
    const { data: application } = await supabase
      .from('scheme_application')
      .select('*')
      .eq('idempotency_key', key)
      .single();
    
    return application || null;
  }

  async createApplication(data: any): Promise<any> {
    const { data: application, error } = await supabase
      .from('scheme_application')
      .insert([data])
      .select()
      .single();

    if (error) {
      // In a real app we might catch unique constraint violations and map to AppError.conflict
      throw AppError.internalError(`Failed to create application: ${error.message}`);
    }
    return application;
  }

  async getApplicationById(id: string): Promise<any> {
    const { data: application, error } = await supabase
      .from('scheme_application')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !application) {
      throw AppError.notFound(`Application ${id} not found.`);
    }
    return application;
  }

  async updateApplicationStatus(id: string, updateData: any, expectedVersion?: number): Promise<any> {
    const query = supabase
      .from('scheme_application')
      .update(updateData)
      .eq('id', id);

    // If implementing optimistic concurrency on application state
    if (expectedVersion) {
      query.eq('profile_version', expectedVersion); // Using profile_version as placeholder for state version if defined
    }

    const { data: application, error } = await query.select().single();

    if (error) {
      throw AppError.internalError(`Failed to update application status: ${error.message}`);
    }
    return application;
  }

  async recordRedirectEvent(data: any): Promise<any> {
    const { data: redirect, error } = await supabase
      .from('redirect_event')
      .insert([data])
      .select()
      .single();
      
    if (error) {
      throw AppError.internalError(`Failed to record redirect: ${error.message}`);
    }
    return redirect;
  }
}
