import { z } from 'zod';

export const UserSchema = z.object({
  i: z.string(),
  f_n: z.string(),
  l_n: z.string(),
  u: z.string(),
  c_at: z.string(),
  e: z.string().email(),
  is_email_verified: z.boolean(),
  is_active: z.boolean(),
  p_id: z.string().nullable(),
  is_admin: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export const UpdateUserRequestSchema = z
  .object({
    f_n: z.string().optional(),
    l_n: z.string().optional(),
    p_n: z.string().optional(),
  })
  .refine(data => data.f_n !== undefined || data.l_n !== undefined || data.p_n !== undefined, {
    message: 'At least one of f_n, l_n, or p_n is required',
  });

export const UpdateUserResponseSchema = z.object({
  m: z.string(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
