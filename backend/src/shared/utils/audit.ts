import { supabase } from '../db/supabase';
import { AppError } from '../errors/AppError';

export interface AuditLogData {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface OutboxEventData {
  eventType: string;
  payload: any;
  entityType: string;
  entityId: string;
}

export class AuditService {
  /**
   * Logs a business action to the audit_log table.
   */
  static async logAction(data: AuditLogData): Promise<void> {
    const { error } = await supabase.from('audit_log').insert([{
      actor_id: data.actorId,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      old_data: data.oldData,
      new_data: data.newData,
      ip_address: data.ipAddress,
      user_agent: data.userAgent
    }]);

    if (error) {
      console.error('Audit log failed:', error);
      throw AppError.internalError(`Failed to create audit log: ${error.message}`);
    }
  }

  /**
   * Emits an asynchronous outbox event to be processed by a worker.
   */
  static async emitEvent(data: OutboxEventData): Promise<void> {
    const { error } = await supabase.from('outbox_event').insert([{
      event_type: data.eventType,
      payload: data.payload,
      entity_type: data.entityType,
      entity_id: data.entityId,
      status: 'PENDING'
    }]);

    if (error) {
      console.error('Outbox event failed:', error);
      throw AppError.internalError(`Failed to create outbox event: ${error.message}`);
    }
  }
}
