import { Router } from 'express';
import { BenefitController } from '../controllers/benefit.controller';
import { BenefitService } from '../services/benefit.service';
import { BenefitRepository } from '../repositories/benefit.repository';
import { authBoundary } from '../../../shared/middleware/authBoundary';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import { RecordBenefitSchema } from '../schemas/benefit.schema';

const router = Router();

const repository = new BenefitRepository();
const service = new BenefitService(repository);
const controller = new BenefitController(service);

router.use(authBoundary);

router.post('/', validateRequest(RecordBenefitSchema), controller.recordBenefit);

export default router;
