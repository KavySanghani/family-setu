import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller';
import { VerificationService } from '../services/verification.service';
import { VerificationRepository } from '../repositories/verification.repository';
import { requireAuth } from '../../../shared/middleware/auth';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import { SubmitVerificationSchema, DecideVerificationSchema } from '../schemas/verification.schema';

const router = Router();

const repository = new VerificationRepository();
const service = new VerificationService(repository);
const controller = new VerificationController(service);

router.use(requireAuth);

router.post('/requests', validateRequest(SubmitVerificationSchema), controller.initiateVerification);
router.patch('/requests/:id/decision', validateRequest(DecideVerificationSchema), controller.recordDecision);

export default router;
