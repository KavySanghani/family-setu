import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/verification.service';

export class VerificationController {
  constructor(private readonly service: VerificationService) {}

  initiateVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const request = await this.service.submitVerificationRequest(actorId, req.body);
      res.status(201).json({ data: request });
    } catch (err) {
      next(err);
    }
  };

  recordDecision = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const actorId = req.user!.id;
      const { id } = req.params;
      const decision = await this.service.decideVerification(actorId, id, req.body);
      res.status(200).json({ data: decision });
    } catch (err) {
      next(err);
    }
  };
}
