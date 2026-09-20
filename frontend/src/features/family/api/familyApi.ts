import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────

export interface Family {
  id: string;
  family_id: string;
  head_member_id: string | null;
  status: string;
  verification_status: string;
  profile_version: number;
  household_size: number;
  annual_income: number | null;
  address_line1?: string;
  village_ward?: string;
  district?: string;
  state?: string;
  pincode?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  member_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  relationship_to_head: string;
  education_level?: string;
  employment_status?: string;
  annual_income?: number;
  marital_status?: string;
  disability_status: boolean;
  caste_category?: string;
  profile_version: number;
  status: string;
  created_at: string;
}

export interface LifeEvent {
  id: string;
  family_id: string;
  member_id?: string;
  event_type: string;
  event_date: string;
  description?: string;
  created_at: string;
}

// ─── Family Hooks ─────────────────────────────────────────────────

export const useMyFamily = () =>
  useQuery({
    queryKey: ['family', 'me'],
    queryFn: () => apiClient.get('/api/v1/families/me').then((r: any) => r.data as Family),
    retry: false,
  });

export const useFamily = (familyId?: string) =>
  useQuery({
    queryKey: ['family', familyId],
    queryFn: () => apiClient.get(`/api/v1/families/${familyId}`).then((r: any) => r.data as Family),
    enabled: !!familyId,
  });

export const useCreateFamily = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post('/api/v1/families', data).then((r: any) => r.data as Family),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['family', 'me'] }); },
  });
};

export const useUpdateFamily = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, ...data }: { familyId: string; [k: string]: unknown }) =>
      apiClient.put(`/api/v1/families/${familyId}`, data).then((r: any) => r.data as Family),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['family'] }); },
  });
};

// ─── Member Hooks ─────────────────────────────────────────────────

export const useFamilyMembers = (familyId?: string) =>
  useQuery({
    queryKey: ['family', familyId, 'members'],
    queryFn: () => apiClient.get(`/api/v1/families/${familyId}/members`).then((r: any) => r.data as FamilyMember[]),
    enabled: !!familyId,
  });

export const useAddMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, ...data }: { familyId: string; [k: string]: unknown }) =>
      apiClient.post(`/api/v1/families/${familyId}/members`, data).then((r: any) => r.data as FamilyMember),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['family', v.familyId, 'members'] }); },
  });
};

// ─── Life Event Hooks ─────────────────────────────────────────────

export const useLifeEvents = (familyId?: string) =>
  useQuery({
    queryKey: ['family', familyId, 'lifeEvents'],
    queryFn: () => apiClient.get(`/api/v1/families/${familyId}/life-events`).then((r: any) => r.data as LifeEvent[]),
    enabled: !!familyId,
  });

export const useRecordLifeEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, ...data }: { familyId: string; [k: string]: unknown }) =>
      apiClient.post(`/api/v1/families/${familyId}/life-events`, data).then((r: any) => r.data as LifeEvent),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['family', v.familyId, 'lifeEvents'] }); },
  });
};
