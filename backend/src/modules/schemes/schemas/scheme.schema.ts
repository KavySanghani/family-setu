import { z } from 'zod';

export const CreateSchemeSchema = z.object({
  departmentId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  targetAudience: z.string().optional(),
  state: z.string().min(1),
  district: z.string().optional(),
  officialPortalUrl: z.string().url().optional(),
});

export const CreateSchemeVersionSchema = z.object({
  schemeId: z.string().uuid(),
  ruleDefinition: z.record(z.any()), // JSON structure defining rules
  benefitsDefinition: z.record(z.any()), // JSON structure defining benefits
  requiredDocuments: z.array(z.string()).default([]),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
