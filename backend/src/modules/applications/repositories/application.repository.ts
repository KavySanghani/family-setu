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

  async listApplications(filters?: { familyId?: string; schemeId?: string; status?: string }): Promise<any[]> {
    let query = supabase.from('scheme_application').select('*').order('created_at', { ascending: false });
    if (filters?.familyId) query = query.eq('family_id', filters.familyId);
    if (filters?.schemeId) query = query.eq('scheme_id', filters.schemeId);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query;
    if (error) throw AppError.internalError(`Failed to list applications: ${error.message}`);
    return data || [];
  }

  async createApplication(data: any): Promise<any> {
    const { data: application, error } = await supabase
      .from('scheme_application')
      .insert([data])
      .select()
      .single();

    if (error) {
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

    if (expectedVersion) {
      query.eq('profile_version', expectedVersion);
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
