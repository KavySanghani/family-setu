import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Application {
  id: string;
  family_id: string;
  member_id?: string;
  scheme_id: string;
  status: string;
  external_reference_id?: string;
  idempotency_key: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export const useApplications = (filters?: { familyId?: string; status?: string }) => {
  const params = new URLSearchParams();
  if (filters?.familyId) params.set('familyId', filters.familyId);
  if (filters?.status) params.set('status', filters.status);
  const qs = params.toString();
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => apiClient.get(`/api/v1/applications${qs ? '?' + qs : ''}`).then((r: any) => r.data as Application[]),
  });
};

export const useApplication = (id?: string) =>
  useQuery({
    queryKey: ['applications', id],
    queryFn: () => apiClient.get(`/api/v1/applications/${id}`).then((r: any) => r.data as Application),
    enabled: !!id,
  });

export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post('/api/v1/applications', data).then((r: any) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); },
  });
};

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: unknown }) => apiClient.patch(`/api/v1/applications/${id}/status`, data).then((r: any) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); },
  });
};

export const useRecordRedirect = () =>
  useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post('/api/v1/applications/redirect', data).then((r: any) => r.data),
  });
