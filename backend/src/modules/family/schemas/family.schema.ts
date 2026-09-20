import { z } from 'zod';

export const CreateFamilySchema = z.object({
  headOfFamilyId: z.string().uuid().optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  villageWard: z.string().optional(),
  district: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/, "Must be a 6 digit pincode"),
});

export const UpdateFamilySchema = CreateFamilySchema.partial().extend({
  expectedVersion: z.number().int().min(1, "Expected version is required for optimistic concurrency"),
});

export const CreateMemberSchema = z.object({
  familyId: z.string().uuid(),
  fullName: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED']),
  relationshipToHead: z.string().min(1),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'UNDISCLOSED']).optional(),
  educationLevel: z.string().optional(),
  employmentStatus: z.string().optional(),
  annualIncome: z.number().nonnegative().optional(),
  disabilityStatus: z.boolean().default(false),
  casteCategory: z.string().optional(),
});

export const UpdateMemberSchema = CreateMemberSchema.partial().extend({
  expectedVersion: z.number().int().min(1, "Expected version is required for optimistic concurrency"),
});

export const RecordLifeEventSchema = z.object({
  familyId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  eventType: z.string().min(1),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().optional(),
});
