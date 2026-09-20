import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchemeService } from './scheme.service';
import { SchemeRepository } from '../repositories/scheme.repository';
import { AuditService } from '../../../shared/utils/audit';

vi.mock('../repositories/scheme.repository');
vi.mock('../../../shared/utils/audit');

describe('SchemeService', () => {
  let service: SchemeService;
  let repository: vi.Mocked<SchemeRepository>;

  beforeEach(() => {
    repository = new SchemeRepository() as vi.Mocked<SchemeRepository>;
    service = new SchemeService(repository);
    vi.clearAllMocks();
  });

  describe('createScheme', () => {
    it('should validate and create a scheme', async () => {
      const input = {
        departmentId: 'd7a9616d-31ad-4672-88fc-8e47087e58fc',
        name: 'Scholarship Scheme',
        state: 'Maharashtra'
      };

      const mockScheme = { id: 's1', ...input, status: 'ACTIVE' };
      repository.createScheme.mockResolvedValue(mockScheme);

      const result = await service.createScheme('actor1', input);

      expect(repository.createScheme).toHaveBeenCalledWith(expect.objectContaining(input));
      expect(AuditService.logAction).toHaveBeenCalled();
      expect(AuditService.emitEvent).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'SCHEME_CREATED'
      }));
      expect(result).toEqual(mockScheme);
    });
  });

  describe('createSchemeVersion', () => {
    it('should validate and create a scheme version', async () => {
      const input = {
        schemeId: 'd7a9616d-31ad-4672-88fc-8e47087e58fc',
        ruleDefinition: { conditions: [] },
        benefitsDefinition: { amount: 1000 },
        effectiveFrom: '2023-01-01'
      };

      const mockVersion = { id: 'v1', ...input };
      repository.createSchemeVersion.mockResolvedValue(mockVersion);

      const result = await service.createSchemeVersion('actor1', input);

      expect(repository.createSchemeVersion).toHaveBeenCalled();
      expect(AuditService.logAction).toHaveBeenCalled();
      expect(result).toEqual(mockVersion);
    });
  });
});
