import { z } from 'zod';

export const VerifyAuthRequestSchema = z.object({
  auth_token: z.string(),
});

export const VerifyAuthResponseSchema = z.object({
  access_token: z.string(),
});

export type VerifyAuthRequest = z.infer<typeof VerifyAuthRequestSchema>;
export type VerifyAuthResponse = z.infer<typeof VerifyAuthResponseSchema>;
