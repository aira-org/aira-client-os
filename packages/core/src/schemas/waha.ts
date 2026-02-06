import { z } from 'zod';

export type WahaConnectResponse = z.infer<typeof WahaConnectResponseSchema>;
export type WahaDisconnectResponse = z.infer<typeof WahaDisconnectSchemaResponse>;
export type WahaDisconnectRequest = z.infer<typeof WahaDisconnectRequestSchema>;
export type WahaIsConnectedResponse = z.infer<typeof WahaIsConnectedSchema>;
export type WahaGetGroupsResponse = z.infer<typeof WahaGetGroupsSchema>;
export type WahaChatItem = z.infer<typeof WahaChatItemSchema>;
export type WahaSyncChatsResponse = z.infer<typeof WahaSyncChatsSchema>;

export const WahaDisconnectSchemaResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  session_id: z.string(),
});

export const WahaConnectResponseSchema = z.object({
  code: z.string(),
  status: z.boolean(),
  error: z.string().nullable().optional(),
  msg: z.string().optional(),
});

export const WahaDisconnectRequestSchema = z.object({
  session_id: z.string(),
});

export const WahaIsConnectedSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

const WahaChatItemSchema = z.object({
  w_id: z.string(),
  chat_name: z.string(),
  num_active_rules: z.number(),
  num_inactive_rules: z.number(),
  moderation_status: z.boolean(),
});

export const WahaGetGroupsSchema = z.object({
  groups: z.array(WahaChatItemSchema),
  chats: z.array(WahaChatItemSchema),
  num_groups: z.number(),
  num_chats: z.number(),
});

export const WahaSyncChatsSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// Sync chats SSE schemas
export type WahaSyncChatsJobResponse = z.infer<typeof WahaSyncChatsJobResponseSchema>;
export type WahaSyncChatsEventData = z.infer<typeof WahaSyncChatsEventDataSchema>;

export const WahaSyncChatsJobResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  job_id: z.string().nullable().optional(),
});

export const WahaSyncChatsEventDataSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  total_synced: z.number(),
});

export type WahaUpdateModerationRequest = z.infer<typeof WahaUpdateModerationRequestSchema>;
export type WahaUpdateModerationResponse = z.infer<typeof WahaUpdateModerationResponseSchema>;
export type WahaUpdateModerationJobResponse = z.infer<typeof WahaUpdateModerationJobResponseSchema>;
export type WahaUpdateModerationEventData = z.infer<typeof WahaUpdateModerationEventDataSchema>;

export const WahaUpdateModerationRequestSchema = z.object({
  chats: z.record(z.string(), z.boolean()),
});

export const WahaUpdateModerationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const WahaUpdateModerationJobResponseSchema = z.object({
  success: z.boolean(),
  job_id: z.string(),
});

export const WahaUpdateModerationEventDataSchema = z.object({
  success: z.boolean(),
  total_suggestions: z.number(),
});
