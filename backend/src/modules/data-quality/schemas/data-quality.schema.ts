import { z } from 'zod';

export const FlagDuplicateSchema = z.object({
  entityType: z.enum(['family', 'family_member']),
  entityId1: z.string().uuid(),
  entityId2: z.string().uuid(),
  reason: z.string().min(1),
  confidenceScore: z.number().min(0).max(100).optional()
});

export const ResolveDataIssueSchema = z.object({
  resolutionAction: z.enum(['IGNORE', 'MERGED_EXTERNALLY', 'MANUAL_FIX_APPLIED']),
  comments: z.string().optional()
});
