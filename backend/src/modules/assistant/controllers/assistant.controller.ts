import { Request, Response, NextFunction } from 'express';
import { AssistantService } from '../services/assistant.service';

export class AssistantController {
  constructor(private readonly service: AssistantService) {}
  ask = async (req: Request, res: Response, next: NextFunction) => { try { const answer = await this.service.ask(req.user!.scopes, req.body.familyId, req.body.question); res.json({ data: answer }); } catch (error) { next(error); } };
}
