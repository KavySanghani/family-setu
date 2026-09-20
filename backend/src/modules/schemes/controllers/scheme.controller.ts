import { Request, Response, NextFunction } from 'express';
import { SchemeService } from '../services/scheme.service';

export class SchemeController {
  constructor(private readonly service: SchemeService) {}

  listSchemes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, status, search } = req.query as Record<string, string>;
      const schemes = await this.service.listSchemes({ category, status, search });
      res.status(200).json({ data: schemes });
    } catch (err) { next(err); }
  };

  getScheme = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const scheme = await this.service.getSchemeDetails(req.params.id);
      res.status(200).json({ data: scheme });
    } catch (err) { next(err); }
  };

  updateScheme = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const scheme = await this.service.updateScheme(req.user!.id, req.params.id, req.body);
      res.status(200).json({ data: scheme });
    } catch (err) { next(err); }
  };

  createScheme = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const scheme = await this.service.createScheme(actorId, req.body);
      res.status(201).json({ data: scheme });
    } catch (err) { next(err); }
  };

  createSchemeVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const version = await this.service.createSchemeVersion(actorId, req.body);
      res.status(201).json({ data: version });
    } catch (err) { next(err); }
  };

  getEffectiveVersion = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { evaluationDate } = req.query;
      const version = await this.service.getEffectiveVersion(id, evaluationDate as string | undefined);
      res.status(200).json({ data: version });
    } catch (err) { next(err); }
  };
}
