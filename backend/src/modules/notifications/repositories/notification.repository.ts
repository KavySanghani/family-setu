import { supabase } from '../../../shared/db/supabase';
import { AppError } from '../../../shared/errors/AppError';

export class NotificationRepository {
  async listForUser(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('notification')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw AppError.internalError(`Failed to list notifications: ${error.message}`);
    return data || [];
  }

  async markAsRead(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('notification')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw AppError.internalError(`Failed to mark notification: ${error.message}`);
    return data;
  }

  async create(data: any): Promise<any> {
    const { data: notif, error } = await supabase
      .from('notification')
      .insert([data])
      .select()
      .single();
    if (error) throw AppError.internalError(`Failed to create notification: ${error.message}`);
    return notif;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notification')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null);
    if (error) return 0;
    return count || 0;
  }
}
