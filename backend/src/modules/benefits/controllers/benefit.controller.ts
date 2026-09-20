import { Request, Response, NextFunction } from 'express';
import { BenefitService } from '../services/benefit.service';

export class BenefitController {
  constructor(private readonly service: BenefitService) {}

  recordBenefit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = (req as any).user.id;
      const benefit = await this.service.recordBenefit(actorId, req.body);
      res.status(201).json({ data: benefit });
    } catch (err) {
      next(err);
    }
  };
}
