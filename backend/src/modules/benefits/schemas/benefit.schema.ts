import { z } from 'zod';

export const BenefitTypeEnum = z.enum([
  'CASH',
  'IN_KIND',
  'SERVICE',
  'SUBSIDY',
  'OTHER'
]);

export const BenefitStatusEnum = z.enum([
  'PENDING',
  'DISBURSED',
  'FAILED',
  'REVERSED'
]);

export const RecordBenefitSchema = z.object({
  familyId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  schemeId: z.string().uuid(),
  applicationId: z.string().uuid().optional(),
  benefitType: BenefitTypeEnum,
  status: BenefitStatusEnum,
  amount: z.number().nonnegative().optional(),
  currency: z.string().default('INR'),
  description: z.string().optional(),
  disbursedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sourceReference: z.string().optional()
});
