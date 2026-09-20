import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from '../repositories/application.repository';

vi.mock('../repositories/application.repository');
vi.mock('../../../shared/utils/audit');

describe('ApplicationService', () => {
  let service: ApplicationService;
  let repository: Mocked<ApplicationRepository>;

  beforeEach(() => {
    repository = new ApplicationRepository() as Mocked<ApplicationRepository>;
    service = new ApplicationService(repository);
    vi.clearAllMocks();
  });

  describe('updateApplicationStatus', () => {
    it('should validate allowed state transitions', async () => {
      const currentApp = { id: '33333333-3333-4333-a333-333333333333', status: 'INITIATED' };
      repository.getApplicationById.mockResolvedValue(currentApp);
      
      const updatedApp = { ...currentApp, status: 'SUBMITTED' };
      repository.updateApplicationStatus.mockResolvedValue(updatedApp);

      const result = await service.updateApplicationStatus('actor1', '33333333-3333-4333-a333-333333333333', { status: 'SUBMITTED' });
      
      expect(result.status).toBe('SUBMITTED');
      expect(repository.updateApplicationStatus).toHaveBeenCalled();
    });

    it('should reject invalid state transitions', async () => {
      const currentApp = { id: '33333333-3333-4333-a333-333333333333', status: 'INITIATED' };
      repository.getApplicationById.mockResolvedValue(currentApp);
      
      // Cannot jump from INITIATED directly to COMPLETED
      await expect(service.updateApplicationStatus('actor1', '33333333-3333-4333-a333-333333333333', { status: 'COMPLETED' }))
        .rejects.toThrow(/Cannot transition/);
        
      expect(repository.updateApplicationStatus).not.toHaveBeenCalled();
    });
  });

  describe('initiateApplication', () => {
    it('should be idempotent', async () => {
      const input = {
        familyId: '11111111-1111-4111-a111-111111111111',
        schemeId: '22222222-2222-4222-a222-222222222222',
        idempotencyKey: 'key1'
      };

      const existingApp = { id: '33333333-3333-4333-a333-333333333333', ...input, status: 'INITIATED' };
      // Simulate existing record found
      repository.getApplicationByIdempotencyKey.mockResolvedValue(existingApp);

      const result = await service.initiateApplication('actor1', input);
      
      // Should return the existing app and NOT create a new one
      expect(repository.createApplication).not.toHaveBeenCalled();
      expect(result).toEqual(existingApp);
    });
  });
});
