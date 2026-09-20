import { Request, Response, NextFunction } from 'express';
import { DataQualityService } from '../services/data-quality.service';

export class DataQualityController {
  constructor(private readonly service: DataQualityService) {}

  flagDuplicate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const duplicate = await this.service.flagDuplicate(actorId, req.body);
      res.status(201).json({ data: duplicate });
    } catch (err) {
      next(err);
    }
  };

  resolveIssue = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const { id } = req.params;
      const issue = await this.service.resolveIssue(actorId, id, req.body);
      res.status(200).json({ data: issue });
    } catch (err) {
      next(err);
    }
  };
}
