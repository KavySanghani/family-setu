import { Request, Response, NextFunction } from 'express';
import { FamilyService } from '../services/family.service';

export class FamilyController {
  constructor(private readonly service: FamilyService) {}

  createFamily = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const family = await this.service.createFamily(actorId, req.body);
      res.status(201).json({ data: family });
    } catch (err) {
      next(err);
    }
  };

  updateFamily = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const { id } = req.params;
      const family = await this.service.updateFamily(actorId, id, req.body);
      res.status(200).json({ data: family });
    } catch (err) {
      next(err);
    }
  };

  addMember = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const { id } = req.params;
      const member = await this.service.addMember(actorId, { ...req.body, familyId: id });
      res.status(201).json({ data: member });
    } catch (err) {
      next(err);
    }
  };

  recordLifeEvent = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const { id } = req.params;
      const event = await this.service.recordLifeEvent(actorId, { ...req.body, familyId: id });
      res.status(201).json({ data: event });
    } catch (err) {
      next(err);
    }
  };
}
