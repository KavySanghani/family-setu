import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { requireAuth } from '../../../shared/middleware/auth';

const router = Router();
const repository = new NotificationRepository();
const service = new NotificationService(repository);
const controller = new NotificationController(service);

router.use(requireAuth);

router.get('/', controller.list);
router.get('/unread-count', controller.unreadCount);
router.patch('/:id/read', controller.markRead);

export default router;
