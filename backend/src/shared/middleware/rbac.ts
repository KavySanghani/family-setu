import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

/**
 * Ensures the authenticated user holds at least one of the required roles.
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    
    if (!hasRole) {
      return next(AppError.forbidden('Insufficient role permissions'));
    }

    next();
  };
};

/**
 * Ensures the authenticated user holds all of the required permissions.
 */
export const requirePermission = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const hasAllPermissions = requiredPermissions.every(perm => 
      req.user!.permissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
};
