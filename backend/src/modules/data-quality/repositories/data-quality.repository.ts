import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class DataQualityRepository {
  async createDuplicateFlag(data: any): Promise<any> {
    const { data: issue, error } = await supabase
      .from('data_quality_issue')
      .insert([{
        issue_type: 'DUPLICATE',
        entity_type: data.entity_type,
        entity_id: data.entity_id_1, // Track it under the first entity
        details: {
          duplicateOf: data.entity_id_2,
          reason: data.reason,
          confidence: data.confidence_score
        },
        status: 'OPEN'
      }])
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to flag duplicate: ${error.message}`);
    }
    return issue;
  }

  async resolveIssue(id: string, updateData: any): Promise<any> {
    const { data: issue, error } = await supabase
      .from('data_quality_issue')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw AppError.internalError(`Failed to resolve data quality issue: ${error.message}`);
    }
    return issue;
  }
}
