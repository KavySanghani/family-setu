import { Request, Response, NextFunction } from 'express';
import { EligibilityService } from '../services/eligibility.service';

export class EligibilityController {
  constructor(private readonly service: EligibilityService) {}

  storeEvaluationResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.storeEvaluationResult(req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  };
}
