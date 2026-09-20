import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export interface AssistantProvider {
  answer(question: string, context: { eligibility: any[]; applications: any[]; benefits: any[] }): Promise<{ mode: 'DEMO'; answer: string }>;
}

class StructuredDemoProvider implements AssistantProvider {
  async answer(question: string, context: { eligibility: any[]; applications: any[]; benefits: any[] }) {
    const lower = question.toLowerCase();
    if (lower.includes('missing')) {
      const missing = context.eligibility.flatMap(item => item.missing_information || []);
      return { mode: 'DEMO' as const, answer: missing.length ? `Based on recorded deterministic evaluations, information still needed: ${[...new Set(missing)].join(', ')}.` : 'No missing-information items are recorded in the current deterministic evaluations.' };
    }
    if (lower.includes('application')) return { mode: 'DEMO' as const, answer: `There are ${context.applications.length} recorded external application${context.applications.length === 1 ? '' : 's'}. FamilySetu tracks records you provide; it does not verify government status.` };
    if (lower.includes('benefit')) return { mode: 'DEMO' as const, answer: `There are ${context.benefits.length} benefit-history record${context.benefits.length === 1 ? '' : 's'} associated with this family.` };
    const eligible = context.eligibility.filter(item => item.status === 'ELIGIBLE' || item.result_state === 'POTENTIALLY_ELIGIBLE').length;
    return { mode: 'DEMO' as const, answer: `This is a structured demo explanation based on FamilySetu records: ${eligible} evaluation${eligible === 1 ? '' : 's'} may be potentially relevant. Final eligibility is determined by the concerned authority.` };
  }
}

export class AssistantService {
  private readonly provider: AssistantProvider = new StructuredDemoProvider();
  async ask(scopes: { type: string; value: string }[], familyId: string, question: string) {
    if (!scopes.some(scope => (scope.type === 'FAMILY' && scope.value === familyId) || scope.type === 'DEPARTMENT')) throw AppError.forbidden('You do not have permission to use this family context.');
    const [eligibility, applications, benefits] = await Promise.all([
      supabase.from('eligibility_evaluation').select('status,result_state,missing_information').eq('family_id', familyId),
      supabase.from('scheme_application').select('id,status').eq('family_id', familyId),
      supabase.from('benefit_history').select('id,status').eq('family_id', familyId),
    ]);
    const failed = [eligibility, applications, benefits].find(result => result.error);
    if (failed?.error) throw AppError.internalError('Assistant context is currently unavailable.');
    return this.provider.answer(question, { eligibility: eligibility.data || [], applications: applications.data || [], benefits: benefits.data || [] });
  }
}
