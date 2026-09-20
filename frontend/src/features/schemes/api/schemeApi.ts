import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  department: string;
  status: string;
  official_portal_url?: string;
  application_method?: string;
  created_at: string;
  versions?: SchemeVersion[];
}

export interface SchemeVersion {
  id: string;
  scheme_id: string;
  rule_definition: any;
  benefits_definition: any;
  required_documents: string[];
  effective_from: string;
  effective_to?: string;
}

export const useSchemes = (filters?: { category?: string; search?: string }) => {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  const qs = params.toString();
  return useQuery({
    queryKey: ['schemes', filters],
    queryFn: () => apiClient.get(`/api/v1/schemes${qs ? '?' + qs : ''}`).then((r: any) => r.data as Scheme[]),
  });
};

export const useScheme = (id?: string) =>
  useQuery({
    queryKey: ['schemes', id],
    queryFn: () => apiClient.get(`/api/v1/schemes/${id}`).then((r: any) => r.data as Scheme),
    enabled: !!id,
  });

export const useCreateScheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post('/api/v1/schemes', data).then((r: any) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schemes'] }); },
  });
};

export const useUpdateScheme = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: unknown }) => apiClient.put(`/api/v1/schemes/${id}`, data).then((r: any) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schemes'] }); },
  });
};

export const useCreateSchemeVersion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post('/api/v1/schemes/versions', data).then((r: any) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['schemes'] }); },
  });
};
