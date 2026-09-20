import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { ApplicationService } from '../services/application.service';
import { ApplicationRepository } from '../repositories/application.repository';
import { requireAuth } from '../../../shared/middleware/auth';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import { 
  CreateApplicationSchema, 
  UpdateApplicationStatusSchema, 
  RecordRedirectSchema 
} from '../schemas/application.schema';

const router = Router();

const repository = new ApplicationRepository();
const service = new ApplicationService(repository);
const controller = new ApplicationController(service);

router.use(requireAuth);

// Read routes
router.get('/', controller.listApplications);
router.get('/:id', controller.getApplication);

// Write routes
router.post('/', validateRequest(CreateApplicationSchema), controller.initiateApplication);
router.patch('/:id/status', validateRequest(UpdateApplicationStatusSchema), controller.updateApplicationStatus);
router.post('/redirect', validateRequest(RecordRedirectSchema), controller.recordRedirect);

export default router;
