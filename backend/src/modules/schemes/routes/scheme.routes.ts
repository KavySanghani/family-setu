import { Router } from 'express';
import { SchemeController } from '../controllers/scheme.controller';
import { SchemeService } from '../services/scheme.service';
import { SchemeRepository } from '../repositories/scheme.repository';
import { requireAuth } from '../../../shared/middleware/auth';
import { validateRequest, validateQuery } from '../../../shared/middleware/validateRequest';
import { CreateSchemeSchema, CreateSchemeVersionSchema } from '../schemas/scheme.schema';
import { z } from 'zod';

const router = Router();

const repository = new SchemeRepository();
const service = new SchemeService(repository);
const controller = new SchemeController(service);

router.use(requireAuth);

// Read routes
router.get('/', controller.listSchemes);
router.get('/:id', controller.getScheme);
router.get('/:id/effective', validateQuery(z.object({
  evaluationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
})), controller.getEffectiveVersion);

// Write routes
router.post('/', validateRequest(CreateSchemeSchema), controller.createScheme);
router.put('/:id', controller.updateScheme);
router.post('/versions', validateRequest(CreateSchemeVersionSchema), controller.createSchemeVersion);

export default router;
