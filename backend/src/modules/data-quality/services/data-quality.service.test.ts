import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { DataQualityService } from './data-quality.service';
import { DataQualityRepository } from '../repositories/data-quality.repository';
import { AuditService } from '../../../shared/utils/audit';

vi.mock('../repositories/data-quality.repository');
vi.mock('../../../shared/utils/audit');

describe('DataQualityService', () => {
  let service: DataQualityService;
  let repository: Mocked<DataQualityRepository>;

  beforeEach(() => {
    repository = new DataQualityRepository() as Mocked<DataQualityRepository>;
    service = new DataQualityService(repository);
    vi.clearAllMocks();
  });

  describe('flagDuplicate', () => {
    it('should validate and create a duplicate flag', async () => {
      const input = {
        entityType: 'family',
        entityId1: '11111111-1111-4111-a111-111111111111',
        entityId2: '22222222-2222-4222-a222-222222222222',
        reason: 'Same phone number and address'
      };

      const mockIssue = { id: 'dq1', ...input };
      repository.createDuplicateFlag.mockResolvedValue(mockIssue);

      const result = await service.flagDuplicate('actor1', input);

      expect(repository.createDuplicateFlag).toHaveBeenCalled();
      expect(AuditService.logAction).toHaveBeenCalled();
      expect(result).toEqual(mockIssue);
    });
  });

  describe('resolveIssue', () => {
    it('should validate and resolve the issue', async () => {
      const input = {
        resolutionAction: 'IGNORE',
        comments: 'Not actually a duplicate'
      };

      const mockIssue = { id: 'dq1', status: 'RESOLVED' };
      repository.resolveIssue.mockResolvedValue(mockIssue);

      const result = await service.resolveIssue('actor1', 'dq1', input);

      expect(repository.resolveIssue).toHaveBeenCalled();
      expect(AuditService.logAction).toHaveBeenCalled();
      expect(result).toEqual(mockIssue);
    });
  });
});
