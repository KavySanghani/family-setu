import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { BenefitService } from './benefit.service';
import { BenefitRepository } from '../repositories/benefit.repository';
import { AuditService } from '../../../shared/utils/audit';

vi.mock('../repositories/benefit.repository');
vi.mock('../../../shared/utils/audit');

describe('BenefitService', () => {
  let service: BenefitService;
  let repository: Mocked<BenefitRepository>;

  beforeEach(() => {
    repository = new BenefitRepository() as Mocked<BenefitRepository>;
    service = new BenefitService(repository);
    vi.clearAllMocks();
  });

  describe('recordBenefit', () => {
    it('should validate and record a benefit', async () => {
      const input = {
        familyId: '11111111-1111-4111-a111-111111111111',
        schemeId: '22222222-2222-4222-a222-222222222222',
        benefitType: 'CASH',
        status: 'DISBURSED',
        amount: 5000,
        currency: 'INR'
      };

      const mockBenefit = { id: 'b1', ...input };
      repository.recordBenefit.mockResolvedValue(mockBenefit);

      const result = await service.recordBenefit('actor1', input);

      expect(repository.recordBenefit).toHaveBeenCalled();
      expect(AuditService.logAction).toHaveBeenCalled();
      expect(AuditService.emitEvent).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'BENEFIT_RECORDED'
      }));
      expect(result).toEqual(mockBenefit);
    });
  });
});
