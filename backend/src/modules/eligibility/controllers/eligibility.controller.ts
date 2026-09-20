import { Request, Response, NextFunction } from 'express';
import { EligibilityService } from '../services/eligibility.service';

export class EligibilityController {
  constructor(private readonly service: EligibilityService) {}

  listEvaluations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { familyId, schemeId, status } = req.query as Record<string, string>;
      const evals = await this.service.listEvaluations({ familyId, schemeId, status });
      res.status(200).json({ data: evals });
    } catch (err) { next(err); }
  };

  getEvaluation = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const evaluation = await this.service.getEvaluation(req.params.id);
      res.status(200).json({ data: evaluation });
    } catch (err) { next(err); }
  };

  getFamilyEvaluations = async (req: Request<{ familyId: string }>, res: Response, next: NextFunction) => {
    try {
      const evals = await this.service.getEvaluationsForFamily(req.params.familyId);
      res.status(200).json({ data: evals });
    } catch (err) { next(err); }
  };

  storeEvaluationResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const evaluation = await this.service.storeEvaluationResult(req.body);
      res.status(201).json({ data: evaluation });
    } catch (err) {
      next(err);
    }
  };
}
