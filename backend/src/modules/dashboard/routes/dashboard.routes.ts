import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';
import { requireAuth } from '../../../shared/middleware/auth';
import { requireRole } from '../../../shared/middleware/rbac';

const router = Router();
const service = new DashboardService();
const controller = new DashboardController(service);

router.use(requireAuth);
router.use(requireRole(['OFFICER', 'ADMIN']));

router.get('/stats', controller.getStats);
router.get('/application-distribution', controller.getApplicationDistribution);
router.get('/scheme-popularity', controller.getSchemePopularity);

export default router;
