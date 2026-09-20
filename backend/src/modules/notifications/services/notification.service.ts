import { NotificationRepository } from '../repositories/notification.repository';

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  async listForUser(userId: string) {
    return this.repository.listForUser(userId);
  }

  async markAsRead(id: string) {
    return this.repository.markAsRead(id);
  }

  async getUnreadCount(userId: string) {
    return this.repository.getUnreadCount(userId);
  }

  async create(data: { userId: string; type: string; title: string; message: string; metadata?: any }) {
    return this.repository.create({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
    });
  }
}
