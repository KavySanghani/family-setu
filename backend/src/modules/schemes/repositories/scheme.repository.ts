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
