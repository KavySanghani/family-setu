import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { supabase } from '../db/supabase';
import { AuthUser } from '../types/auth';

/**
 * Middleware to enforce authentication and establish the RequestContext.
 * Verifies the Supabase JWT and loads application_user details (roles, permissions, scopes).
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw AppError.unauthorized('Token not provided');
    }

    // 1. Verify token with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authData.user) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    const authUserId = authData.user.id;

    // 2. Resolve application user identity and RBAC details
    // using the backend service client to bypass RLS for this resolution
    const { data: appUser, error: dbError } = await supabase
      .from('application_user')
      .select(`
        id,
        auth_user_id,
        email,
        full_name,
        department_id,
        is_active,
        user_role (
          role (
            name,
            role_permission (
              permission (
                code
              )
            )
          )
        ),
        user_scope (
          scope_type,
          scope_value
        )
      `)
      .eq('auth_user_id', authUserId)
      .single();

    if (dbError || !appUser) {
      throw AppError.unauthorized('Application user not found or inactive');
    }

    if (!appUser.is_active) {
      throw AppError.forbidden('User account is inactive');
    }

    // 3. Flatten relationships into the context object
    const roles: string[] = [];
    const permissions: string[] = [];

    const userRoles = appUser.user_role as any[] || [];
    for (const ur of userRoles) {
      const role = ur.role;
      if (role) {
        roles.push(role.name);
        const rolePerms = role.role_permission as any[] || [];
        for (const rp of rolePerms) {
          if (rp.permission) {
            permissions.push(rp.permission.code);
          }
        }
      }
    }

    const scopes = (appUser.user_scope as any[] || []).map(s => ({
      type: s.scope_type,
      value: s.scope_value
    }));

    const userContext: AuthUser = {
      id: appUser.id,
      authUserId: appUser.auth_user_id,
      email: appUser.email,
      fullName: appUser.full_name,
      departmentId: appUser.department_id,
      isActive: appUser.is_active,
      roles,
      permissions: Array.from(new Set(permissions)), // dedup
      scopes
    };

    req.user = userContext;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(AppError.unauthorized('Authentication failed'));
  }
};
