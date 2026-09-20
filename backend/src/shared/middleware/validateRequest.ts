import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert ZodError to AppError
        const details = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return next(AppError.validation('Invalid request data', details));
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return next(AppError.validation('Invalid query parameters', details));
      }
      next(error);
    }
  };
};
