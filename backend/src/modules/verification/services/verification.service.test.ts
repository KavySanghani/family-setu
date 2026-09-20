import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { VerificationService } from './verification.service';
import { VerificationRepository } from '../repositories/verification.repository';

vi.mock('../repositories/verification.repository');
vi.mock('../../../shared/utils/audit');

describe('VerificationService', () => {
  let service: VerificationService;
  let repository: Mocked<VerificationRepository>;

  beforeEach(() => {
    repository = new VerificationRepository() as Mocked<VerificationRepository>;
    service = new VerificationService(repository);
    vi.clearAllMocks();
  });

  describe('decideVerification', () => {
    it('should validate and process an APPROVED decision', async () => {
      const pendingReq = { id: 'v1', status: 'PENDING' };
      repository.getVerificationRequest.mockResolvedValue(pendingReq);

      const approvedReq = { ...pendingReq, status: 'APPROVED' };
      repository.updateVerificationDecision.mockResolvedValue(approvedReq);

      const result = await service.decideVerification('officer1', 'v1', { status: 'APPROVED' });

      expect(repository.updateVerificationDecision).toHaveBeenCalledWith('v1', expect.objectContaining({
        status: 'APPROVED',
        reviewed_by: 'officer1'
      }));
      expect(result).toEqual(approvedReq);
    });

    it('should reject decision if not in PENDING state', async () => {
      const approvedReq = { id: 'v1', status: 'APPROVED' };
      repository.getVerificationRequest.mockResolvedValue(approvedReq);

      await expect(service.decideVerification('officer1', 'v1', { status: 'REJECTED' }))
        .rejects.toThrow(/Cannot decide/);
        
      expect(repository.updateVerificationDecision).not.toHaveBeenCalled();
    });
  });
});
