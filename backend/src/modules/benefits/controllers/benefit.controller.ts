import { Request, Response, NextFunction } from 'express';
import { BenefitService } from '../services/benefit.service';

export class BenefitController {
  constructor(private readonly service: BenefitService) {}

  listBenefits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { familyId, memberId, schemeId } = req.query as Record<string, string>;
      const benefits = await this.service.listBenefits({ familyId, memberId, schemeId });
      res.status(200).json({ data: benefits });
    } catch (err) { next(err); }
  };

  getBenefit = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const benefit = await this.service.getBenefit(req.params.id);
      res.status(200).json({ data: benefit });
    } catch (err) { next(err); }
  };

  recordBenefit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const benefit = await this.service.recordBenefit(actorId, req.body);
      res.status(201).json({ data: benefit });
    } catch (err) {
      next(err);
    }
  };
}
