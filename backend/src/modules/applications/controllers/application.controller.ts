import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';

export class ApplicationController {
  constructor(private readonly service: ApplicationService) {}

  initiateApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const application = await this.service.initiateApplication(actorId, req.body);
      res.status(201).json({ data: application });
    } catch (err) {
      next(err);
    }
  };

  updateApplicationStatus = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const { id } = req.params;
      const application = await this.service.updateApplicationStatus(actorId, id, req.body);
      res.status(200).json({ data: application });
    } catch (err) {
      next(err);
    }
  };

  recordRedirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const redirect = await this.service.recordRedirect(actorId, req.body);
      res.status(201).json({ data: redirect });
    } catch (err) {
      next(err);
    }
  };
}
