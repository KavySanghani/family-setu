import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Benefit {
  id: string;
  family_id: string;
  member_id?: string;
  scheme_id: string;
  application_id?: string;
  benefit_type: string;
  status: string;
  amount?: number;
  currency?: string;
  description?: string;
  disbursed_at?: string;
  source_reference?: string;
  created_at: string;
}

export const useBenefits = (filters?: { familyId?: string }) => {
  const params = new URLSearchParams();
  if (filters?.familyId) params.set('familyId', filters.familyId);
  const qs = params.toString();
  return useQuery({
    queryKey: ['benefits', filters],
    queryFn: () => apiClient.get(`/api/v1/benefits${qs ? '?' + qs : ''}`).then((r: any) => r.data as Benefit[]),
  });
};

export const useBenefit = (id?: string) =>
  useQuery({
    queryKey: ['benefits', id],
    queryFn: () => apiClient.get(`/api/v1/benefits/${id}`).then((r: any) => r.data as Benefit),
    enabled: !!id,
  });
