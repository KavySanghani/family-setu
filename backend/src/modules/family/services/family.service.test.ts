import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { FamilyService } from './family.service';
import { FamilyRepository } from '../repositories/family.repository';
import { AppError } from '../../../shared/errors/AppError';
import { AuditService } from '../../../shared/utils/audit';

// Mock dependencies
vi.mock('../repositories/family.repository');
vi.mock('../../../shared/utils/audit');

describe('FamilyService', () => {
  let service: FamilyService;
  let repository: Mocked<FamilyRepository>;

  beforeEach(() => {
    repository = new FamilyRepository() as Mocked<FamilyRepository>;
    service = new FamilyService(repository);
    vi.clearAllMocks();
  });

  describe('createFamily', () => {
    it('should validate input and create a family', async () => {
      const input = {
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      };

      const mockFamily = { id: 'f1', ...input, profile_version: 1, status: 'VERIFIED' };
      repository.createFamily.mockResolvedValue(mockFamily);

      const result = await service.createFamily('actor1', input);

      expect(repository.createFamily).toHaveBeenCalledWith(expect.objectContaining({
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        profile_version: 1,
        status: 'VERIFIED'
      }));
      expect(AuditService.logAction).toHaveBeenCalled();
      expect(AuditService.emitEvent).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'FAMILY_CREATED'
      }));
      expect(result).toEqual(mockFamily);
    });

    it('should throw validation error on invalid pincode', async () => {
      const input = {
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '123' // Invalid
      };

      await expect(service.createFamily('actor1', input)).rejects.toThrow();
    });
  });

  describe('updateFamily', () => {
    it('should validate optimistic concurrency and update family', async () => {
      const input = {
        expectedVersion: 1,
        addressLine1: 'New Address'
      };

      const mockOldFamily = { id: 'f1', profile_version: 1 };
      const mockUpdatedFamily = { id: 'f1', profile_version: 2, addressLine1: 'New Address' };
      
      repository.getFamilyById.mockResolvedValue(mockOldFamily);
      repository.updateFamily.mockResolvedValue(mockUpdatedFamily);

      const result = await service.updateFamily('actor1', 'f1', input);

      expect(repository.updateFamily).toHaveBeenCalledWith('f1', 1, { addressLine1: 'New Address' });
      expect(AuditService.logAction).toHaveBeenCalled();
      expect(AuditService.emitEvent).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedFamily);
    });
  });
});
