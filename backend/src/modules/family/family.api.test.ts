import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import app from '../../app';

vi.mock('../../shared/middleware/auth', () => {
  return {
    requireAuth: vi.fn((req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization;
      if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
      req.user = { id: 'test-actor', authUserId: 'auth-123', email: 'test@example.com', fullName: 'Test', departmentId: null, isActive: true, roles: [], permissions: [], scopes: [] };
      next();
    })
  };
});

vi.mock('./repositories/family.repository', () => {
  return {
    FamilyRepository: class {
      createFamily = vi.fn().mockResolvedValue({ id: '11111111-1111-4111-a111-111111111111', headOfFamilyId: '22222222-2222-4222-a222-222222222222', address: '123 Test St' });
    }
  };
});

vi.mock('../../shared/utils/audit', () => {
  return {
    AuditService: {
      logAction: vi.fn().mockResolvedValue(true),
      emitEvent: vi.fn().mockResolvedValue(true)
    }
  };
});

describe('Family API', () => {
  it('should reject requests without authorization header', async () => {
    const res = await request(app)
      .post('/api/v1/families')
      .send({});
      
    expect(res.status).toBe(401);
  });

  it('should reject invalid input via Zod middleware', async () => {
    const res = await request(app)
      .post('/api/v1/families')
      .set('Authorization', 'Bearer mock-token')
      .send({ addressLine1: '' }); // Missing required fields
      
    expect(res.status).toBe(422); // Validation error code mapped in AppError -> status
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should create family on valid input', async () => {
    const res = await request(app)
      .post('/api/v1/families')
      .set('Authorization', 'Bearer mock-token')
      .send({ 
        headOfFamilyId: '22222222-2222-4222-a222-222222222222', 
        addressLine1: '123 Test St',
        district: 'Test District',
        state: 'Test State',
        pincode: '123456'
      });
      
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
  });
});
