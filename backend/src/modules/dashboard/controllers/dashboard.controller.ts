import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getOfficerStats();
      res.status(200).json({ data: stats });
    } catch (err) { next(err); }
  };

  getApplicationDistribution = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const dist = await this.service.getApplicationStatusDistribution();
      res.status(200).json({ data: dist });
    } catch (err) { next(err); }
  };

  getSchemePopularity = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const dist = await this.service.getSchemePopularity();
      res.status(200).json({ data: dist });
    } catch (err) { next(err); }
  };
}
