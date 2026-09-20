import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = requestId;

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log safe metadata only (no passwords, sensitive PII, or full bodies)
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      actorId: (req as any).user?.id || 'anonymous'
    }));
  });

  next();
};
