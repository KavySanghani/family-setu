import { Request, Response, NextFunction } from 'express';
import { SchemeService } from '../services/scheme.service';

export class SchemeController {
  constructor(private readonly service: SchemeService) {}

  createScheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const scheme = await this.service.createScheme(actorId, req.body);
      res.status(201).json({ data: scheme });
    } catch (err) {
      next(err);
    }
  };

  createSchemeVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const version = await this.service.createSchemeVersion(actorId, req.body);
      res.status(201).json({ data: version });
    } catch (err) {
      next(err);
    }
  };

  getEffectiveVersion = async (req: Request<{ id: string }, any, any, { evaluationDate?: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { evaluationDate } = req.query;
      const version = await this.service.getEffectiveVersion(id, evaluationDate as string | undefined);
      res.status(200).json({ data: version });
    } catch (err) {
      next(err);
    }
  };
}
