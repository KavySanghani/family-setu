import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { FamilyService } from '../services/family.service';
import { FamilyRepository } from '../repositories/family.repository';
import { requireAuth } from '../../../shared/middleware/auth';
import { requireRole } from '../../../shared/middleware/rbac';
import { validateRequest } from '../../../shared/middleware/validateRequest';
import { 
  CreateFamilySchema, 
  UpdateFamilySchema, 
  CreateMemberSchema, 
  RecordLifeEventSchema 
} from '../schemas/family.schema';

const router = Router();

// DI Setup
const repository = new FamilyRepository();
const service = new FamilyService(repository);
const controller = new FamilyController(service);

// Routes
router.use(requireAuth);

router.get('/me', controller.getMyFamily);
router.get('/', requireRole(['OFFICER', 'ADMIN']), controller.listFamilies);
router.get('/:id', controller.getFamily);
router.get('/:id/members', controller.getFamilyMembers);
router.get('/:id/life-events', controller.getLifeEvents);
router.get('/:id/beneficiary-360', requireRole(['OFFICER', 'ADMIN']), controller.getBeneficiary360);

router.post('/', validateRequest(CreateFamilySchema), controller.createFamily);
router.put('/:id', validateRequest(UpdateFamilySchema), controller.updateFamily);
router.post('/:id/members', validateRequest(CreateMemberSchema.omit({ familyId: true })), controller.addMember);
router.post('/:id/life-events', validateRequest(RecordLifeEventSchema.omit({ familyId: true })), controller.recordLifeEvent);

export default router;
