import { Router } from 'express';
import { DataQualityController } from '../controllers/data-quality.controller';
import { DataQualityService } from '../services/data-quality.service';
import { DataQualityRepository } from '../repositories/data-quality.repository';
import { authBoundary } from '../../../shared/middleware/authBoundary';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import { FlagDuplicateSchema, ResolveDataIssueSchema } from '../schemas/data-quality.schema';

const router = Router();

const repository = new DataQualityRepository();
const service = new DataQualityService(repository);
const controller = new DataQualityController(service);

router.use(authBoundary);

router.post('/duplicates', validateRequest(FlagDuplicateSchema), controller.flagDuplicate);
router.patch('/issues/:id/resolve', validateRequest(ResolveDataIssueSchema), controller.resolveIssue);

export default router;
