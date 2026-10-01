import { z } from 'zod';

/** .strict() rejects unknown keys, so role/perms/status can never be mass-assigned. */
export const ProfileUpdate = z
  .object({
    displayName: z.string().min(1).max(80).optional(),
    bio: z.string().max(500).optional(),
    locale: z.enum(['en', 'uz']).optional(),
  })
  .strict();

export const GradeInput = z
  .object({
    studentId: z.string(),
    subjectId: z.string(),
    classId: z.string(),
    score: z.number().min(0).max(100),
    assessmentType: z.string().max(40),
    note: z.string().max(300).optional(),
  })
  .strict();

export const HomeworkInput = z
  .object({
    title: z.string().min(1).max(120),
    description: z.string().max(4000),
    dueAt: z.string(),
    classId: z.string(),
    subjectId: z.string(),
  })
  .strict();

export const AnnouncementInput = z
  .object({
    title: z.string().min(1).max(160),
    content: z.string().min(1).max(8000),
    classId: z.string().optional(),
    schoolWide: z.boolean().optional(),
  })
  .strict();

export const SignInInput = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();

export const PasswordChange = z
  .object({ current: z.string().min(1), next: z.string().min(10).max(200) })
  .strict();
