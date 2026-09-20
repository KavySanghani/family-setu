import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await this.service.listForUser(req.user!.id);
      res.status(200).json({ data: notifications });
    } catch (err) { next(err); }
  };

  unreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.service.getUnreadCount(req.user!.id);
      res.status(200).json({ data: { count } });
    } catch (err) { next(err); }
  };

  markRead = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const notif = await this.service.markAsRead(req.params.id);
      res.status(200).json({ data: notif });
    } catch (err) { next(err); }
  };
}
