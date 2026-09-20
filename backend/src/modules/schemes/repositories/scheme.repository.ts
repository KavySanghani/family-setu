import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class SchemeRepository {
  async createScheme(data: any): Promise<any> {
    const { data: scheme, error } = await supabase
      .from('scheme')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to create scheme: ${error.message}`);
    }
    return scheme;
  }

  async listSchemes(filters?: { category?: string; status?: string; search?: string }): Promise<any[]> {
    let query = supabase.from('scheme').select('*').order('created_at', { ascending: false });
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    const { data, error } = await query;
    if (error) throw AppError.internalError(`Failed to list schemes: ${error.message}`);
    return data || [];
  }

  async getSchemeById(id: string): Promise<any> {
    const { data: scheme, error } = await supabase
      .from('scheme')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !scheme) throw AppError.notFound(`Scheme ${id} not found.`);
    return scheme;
  }

  async updateScheme(id: string, updateData: any): Promise<any> {
    const { data: scheme, error } = await supabase
      .from('scheme')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw AppError.internalError(`Failed to update scheme: ${error.message}`);
    return scheme;
  }

  async listSchemeVersions(schemeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('scheme_version')
      .select('*')
      .eq('scheme_id', schemeId)
      .order('effective_from', { ascending: false });
    if (error) throw AppError.internalError(`Failed to list scheme versions: ${error.message}`);
    return data || [];
  }

  async createSchemeVersion(data: any): Promise<any> {
    const { data: version, error } = await supabase
      .from('scheme_version')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to create scheme version: ${error.message}`);
    }
    return version;
  }

  async getEffectiveVersion(schemeId: string, evaluationDate: string): Promise<any> {
    const { data: versions, error } = await supabase
      .from('scheme_version')
      .select('*')
      .eq('scheme_id', schemeId)
      .lte('effective_from', evaluationDate)
      .order('effective_from', { ascending: false })
      .limit(1);

    if (error) {
      throw AppError.internalError(`Failed to query scheme versions: ${error.message}`);
    }

    if (!versions || versions.length === 0) {
      throw AppError.notFound(`No effective scheme version found for scheme ${schemeId} on ${evaluationDate}`);
    }

    return versions[0];
  }
}
