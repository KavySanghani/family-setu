import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface EligibilityEvaluation {
  id: string;
  family_id: string;
  member_id?: string;
  scheme_id: string;
  scheme_version_id: string;
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFORMATION' | 'NOT_EVALUATED';
  reasons: { rule: string; group: string; status: string; detail: string }[];
  missing_information: string[];
  evaluated_at: string;
}

export const useEligibilityEvaluations = (filters?: { familyId?: string; schemeId?: string }) => {
  const params = new URLSearchParams();
  if (filters?.familyId) params.set('familyId', filters.familyId);
  if (filters?.schemeId) params.set('schemeId', filters.schemeId);
  const qs = params.toString();
  return useQuery({
    queryKey: ['eligibility', filters],
    queryFn: () => apiClient.get(`/api/v1/eligibility${qs ? '?' + qs : ''}`).then((r: any) => r.data as EligibilityEvaluation[]),
  });
};

export const useFamilyEligibility = (familyId?: string) =>
  useQuery({
    queryKey: ['eligibility', 'family', familyId],
    queryFn: () => apiClient.get(`/api/v1/eligibility/family/${familyId}`).then((r: any) => r.data as EligibilityEvaluation[]),
    enabled: !!familyId,
  });

export const useEligibilityEvaluation = (id?: string) =>
  useQuery({
    queryKey: ['eligibility', id],
    queryFn: () => apiClient.get(`/api/v1/eligibility/${id}`).then((r: any) => r.data as EligibilityEvaluation),
    enabled: !!id,
  });
