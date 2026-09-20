import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Placeholder Authentication Boundary
 * 
 * Future implementation will verify Supabase Auth JWTs here.
 * For now, this requires a mock header X-Actor-ID to simulate an authenticated identity
 * and sets req.user accordingly.
 */
export const authBoundary = (req: Request, res: Response, next: NextFunction) => {
  const actorId = req.headers['x-actor-id'] as string;

  if (!actorId) {
    return next(AppError.unauthorized('Missing X-Actor-ID header. (Mock authentication boundary)'));
  }

  // Inject a mock user object into the request
  // Need to extend Express.Request locally or cast to any for prototype
  (req as any).user = {
    id: actorId,
    role: 'OFFICER' // Mock role
  };

  next();
};
