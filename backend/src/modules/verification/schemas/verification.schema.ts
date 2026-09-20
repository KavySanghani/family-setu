import { z } from 'zod';

export const VerificationStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'MORE_INFO_REQUIRED'
]);

export const SubmitVerificationSchema = z.object({
  familyId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  entityType: z.string().min(1), // e.g., 'address', 'income'
  entityId: z.string().uuid().optional(),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  evidencePayload: z.any().optional()
});

export const DecideVerificationSchema = z.object({
  status: VerificationStatusEnum.exclude(['PENDING']),
  comments: z.string().optional()
});
