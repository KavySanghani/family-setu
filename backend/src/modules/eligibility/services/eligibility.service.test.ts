import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { EligibilityService } from './eligibility.service';
import { EligibilityRepository } from '../repositories/eligibility.repository';

vi.mock('../repositories/eligibility.repository');

describe('EligibilityService', () => {
  let service: EligibilityService;
  let repository: Mocked<EligibilityRepository>;

  beforeEach(() => {
    repository = new EligibilityRepository() as Mocked<EligibilityRepository>;
    service = new EligibilityService(repository);
    vi.clearAllMocks();
  });

  describe('storeEvaluationResult', () => {
    it('should validate and store an evaluation result', async () => {
      const input = {
        familyId: '11111111-1111-4111-a111-111111111111',
        schemeId: '22222222-2222-4222-a222-222222222222',
        schemeVersionId: '33333333-3333-4333-a333-333333333333',
        status: 'POTENTIALLY_ELIGIBLE',
        reasons: ['Condition A met'],
        missingInformation: []
      };

      const mockEvaluation = { id: 'e1', ...input, evaluated_at: '2023-01-01' };
      repository.storeEvaluationResult.mockResolvedValue(mockEvaluation);

      const result = await service.storeEvaluationResult(input);

      expect(repository.storeEvaluationResult).toHaveBeenCalledWith(expect.objectContaining({
        family_id: '11111111-1111-4111-a111-111111111111',
        status: 'POTENTIALLY_ELIGIBLE',
        reasons: ['Condition A met']
      }));
      expect(result).toEqual(mockEvaluation);
    });

    it('should throw validation error on invalid status', async () => {
      const input = {
        familyId: '11111111-1111-4111-a111-111111111111',
        schemeId: '22222222-2222-4222-a222-222222222222',
        schemeVersionId: '33333333-3333-4333-a333-333333333333',
        status: 'GOVERNMENT_ELIGIBLE' // Invalid status per docs
      };

      await expect(service.storeEvaluationResult(input)).rejects.toThrow();
    });
  });
});
