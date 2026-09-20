import { Router } from 'express';
import { EligibilityController } from '../controllers/eligibility.controller';
import { EligibilityService } from '../services/eligibility.service';
import { EligibilityRepository } from '../repositories/eligibility.repository';
import { requireAuth } from '../../../shared/middleware/auth';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import { StoreEvaluationResultSchema } from '../schemas/eligibility.schema';

const router = Router();

const repository = new EligibilityRepository();
const service = new EligibilityService(repository);
const controller = new EligibilityController(service);

router.use(requireAuth);

router.post('/evaluations', validateRequest(StoreEvaluationResultSchema), controller.storeEvaluationResult);

export default router;
