import { Request, Response, NextFunction } from 'express';
import { FamilyService } from '../services/family.service';

export class FamilyController {
  constructor(private readonly service: FamilyService) {}

  getMyFamily = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const family = await this.service.getMyFamily(req.user!.scopes);
      res.status(200).json({ data: family });
    } catch (err) {
      next(err);
    }
  };

  listFamilies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const families = await this.service.listFamilies(req.user!.scopes, search);
      res.status(200).json({ data: families });
    } catch (err) { next(err); }
  };

  getFamily = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const family = await this.service.getFamily(req.user!.scopes, req.params.id);
      res.status(200).json({ data: family });
    } catch (err) {
      next(err);
    }
  };

  getFamilyMembers = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const members = await this.service.getFamilyMembers(req.user!.scopes, req.params.id);
      res.status(200).json({ data: members });
    } catch (err) {
      next(err);
    }
  };

  getLifeEvents = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const events = await this.service.getLifeEvents(req.user!.scopes, req.params.id);
      res.status(200).json({ data: events });
    } catch (err) {
      next(err);
    }
  };

  getBeneficiary360 = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const view = await this.service.getBeneficiary360(req.user!.scopes, req.params.id);
      res.status(200).json({ data: view });
    } catch (err) {
      next(err);
    }
  };

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
      const family = await this.service.updateFamily(actorId, id, { ...req.body, scopes: req.user!.scopes });
      res.status(200).json({ data: family });
    } catch (err) {
      next(err);
    }
  };

  addMember = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const { id } = req.params;
      const member = await this.service.addMember(actorId, { ...req.body, familyId: id, scopes: req.user!.scopes });
      res.status(201).json({ data: member });
    } catch (err) {
      next(err);
    }
  };

  recordLifeEvent = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const { id } = req.params;
      const event = await this.service.recordLifeEvent(actorId, { ...req.body, familyId: id, scopes: req.user!.scopes });
      res.status(201).json({ data: event });
    } catch (err) {
      next(err);
    }
  };
}
