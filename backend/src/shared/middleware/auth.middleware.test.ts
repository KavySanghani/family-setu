import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from './auth';
import { requireRole, requirePermission } from './rbac';
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';

vi.mock('../db/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }
}));

describe('Authentication Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {};
    nextFunction = vi.fn();
    vi.clearAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    await requireAuth(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it('should return 401 if token is invalid', async () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    (supabase.auth.getUser as any).mockResolvedValue({ error: new Error('Invalid token') });

    await requireAuth(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it('should attach user context on successful auth', async () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: { id: 'auth-123' } },
      error: null
    });
    
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'user-123',
        auth_user_id: 'auth-123',
        email: 'test@example.com',
        full_name: 'Test Officer',
        department_id: 'dept-1',
        is_active: true,
        user_role: [{ role: { name: 'OFFICER', role_permission: [{ permission: { code: 'CREATE_FAMILY' } }] } }],
        user_scope: [{ scope_type: 'DISTRICT', scope_value: 'DIST-1' }]
      },
      error: null
    });

    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle
    });

    await requireAuth(mockReq as Request, mockRes as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalledWith(); // success (no error passed to next)
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user!.id).toBe('user-123');
    expect(mockReq.user!.roles).toContain('OFFICER');
    expect(mockReq.user!.permissions).toContain('CREATE_FAMILY');
  });
});

describe('RBAC Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: {
        id: 'user-123',
        authUserId: 'auth-123',
        email: 'test@example.com',
        fullName: 'Test Officer',
        departmentId: 'dept-1',
        isActive: true,
        roles: ['OFFICER'],
        permissions: ['CREATE_FAMILY', 'VIEW_SCHEMES'],
        scopes: []
      }
    };
    mockRes = {};
    nextFunction = vi.fn();
  });

  it('requireRole allows request if user has the role', () => {
    const middleware = requireRole(['OFFICER', 'ADMIN']);
    middleware(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('requireRole blocks request with 403 if user lacks the role', () => {
    const middleware = requireRole(['ADMIN']);
    middleware(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 })
    );
  });

  it('requirePermission allows request if user has all permissions', () => {
    const middleware = requirePermission(['CREATE_FAMILY']);
    middleware(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('requirePermission blocks request with 403 if user lacks any permission', () => {
    const middleware = requirePermission(['CREATE_FAMILY', 'DELETE_FAMILY']);
    middleware(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 })
    );
  });
});
