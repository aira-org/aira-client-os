import { z } from 'zod';

export const RuleStatusSchema = z.enum(['active', 'inactive']);

export const RuleSchema = z.object({
  rule_id: z.string(),
  w_id: z.array(z.string()),
  raw_text: z.string(),
  status: RuleStatusSchema,
  trigger_time: z.string().nullable().optional(),
  interval: z.number().nullable().optional(),
  is_default: z.boolean(),
});

export const RulesResponseSchema = z.array(RuleSchema);

export const RuleMutationResponseSchema = z.object({
  success: z.string(),
  rule_id: z.string(),
});

export type RuleStatus = z.infer<typeof RuleStatusSchema>;
export type Rule = z.infer<typeof RuleSchema>;

export interface CreateRuleRequest {
  w_id: string[];
  raw_text: string;
  trigger_time?: string;
  interval?: number;
  status?: RuleStatus;
  suggestion_id?: string;
}

export interface UpdateRuleRequest extends CreateRuleRequest {
  rule_id: string;
}

export interface DeleteRuleRequest {
  rule_id: string;
}

export type RuleMutationResponse = z.infer<typeof RuleMutationResponseSchema>;

// Run once: execute rule end-to-end once against real data, actually send messages, no rule persistence
export const RunRuleOnceGroupResultSchema = z.object({
  w_id: z.string(),
  chat_name: z.string(),
  message_count: z.number(),
});

export const RunRuleOnceActionSchema = z.object({
  type: z.string(),
  description: z.string(),
  target: z.string().optional(),
  preview: z.string().optional(),
});

export const RunRuleOnceResponseSchema = z.object({
  success: z.boolean(),
  summary: z.string().optional(),
  messages_scanned: z.number().optional(),
  groups_processed: z.array(RunRuleOnceGroupResultSchema).optional(),
  actions: z.array(RunRuleOnceActionSchema).optional(),
  error: z.string().optional(),
});

export type RunRuleOnceGroupResult = z.infer<typeof RunRuleOnceGroupResultSchema>;
export type RunRuleOnceAction = z.infer<typeof RunRuleOnceActionSchema>;
export type RunRuleOnceResponse = z.infer<typeof RunRuleOnceResponseSchema>;
