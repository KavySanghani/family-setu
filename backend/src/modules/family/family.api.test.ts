import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

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
  it('should reject requests without auth boundary header', async () => {
    const res = await request(app)
      .post('/api/v1/families')
      .send({});
      
    expect(res.status).toBe(401);
  });

  it('should reject invalid input via Zod middleware', async () => {
    const res = await request(app)
      .post('/api/v1/families')
      .set('x-actor-id', 'test-actor')
      .send({ addressLine1: '' }); // Missing required fields
      
    expect(res.status).toBe(422); // Validation error code mapped in AppError -> status
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should create family on valid input', async () => {
    const res = await request(app)
      .post('/api/v1/families')
      .set('x-actor-id', 'test-actor')
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
