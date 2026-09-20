import { z } from 'zod';

export const ApplicationStatusEnum = z.enum([
  'DRAFT',
  'INITIATED',
  'REDIRECTED',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN',
  'COMPLETED'
]);

export const CreateApplicationSchema = z.object({
  familyId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  schemeId: z.string().uuid(),
  idempotencyKey: z.string().min(1) // Required to prevent dupes on retries
});

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatusEnum,
  externalReferenceId: z.string().optional(),
  comments: z.string().optional()
});

export const RecordRedirectSchema = z.object({
  applicationId: z.string().uuid(),
  targetUrl: z.string().url()
});
