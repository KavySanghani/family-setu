import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  read_at?: string;
  created_at: string;
}

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/api/v1/notifications').then((r: any) => r.data as Notification[]),
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => apiClient.get('/api/v1/notifications/unread-count').then((r: any) => r.data.count as number),
    refetchInterval: 30000,
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/api/v1/notifications/${id}/read`).then((r: any) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });
};
