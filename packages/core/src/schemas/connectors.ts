import { z } from 'zod';

export const AvailableServiceSchema = z.enum([
  'email_scope',
  'google_calendar',
  'google_drive',
  'profile',
  'whatsapp',
]);

export type AvailableService = z.infer<typeof AvailableServiceSchema>;

export const ConnectorsAllResponseSchema = z.object({
  count: z.number(),
  available_services: z.array(AvailableServiceSchema),
});

export type ConnectorsAllResponse = z.infer<typeof ConnectorsAllResponseSchema>;

export const ConnectPlatformSchema = z.enum(['app', 'web']);
export type ConnectPlatform = z.infer<typeof ConnectPlatformSchema>;

export const ConnectConnectorResponseSchema = z.object({
  redirect_url: z.string(),
});
export type ConnectConnectorResponse = z.infer<typeof ConnectConnectorResponseSchema>;

export const DisconnectConnectorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DisconnectConnectorResponse = z.infer<typeof DisconnectConnectorResponseSchema>;
