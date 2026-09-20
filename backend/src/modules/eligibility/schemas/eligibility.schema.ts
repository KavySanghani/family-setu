import { z } from 'zod';

export const EligibilityStateEnum = z.enum([
  'POTENTIALLY_ELIGIBLE',
  'POTENTIALLY_NOT_ELIGIBLE',
  'INSUFFICIENT_INFORMATION',
  'REQUIRES_MANUAL_VERIFICATION'
]);

export const StoreEvaluationResultSchema = z.object({
  familyId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  schemeId: z.string().uuid(),
  schemeVersionId: z.string().uuid(),
  status: EligibilityStateEnum,
  reasons: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([])
});
