import { z } from 'zod';

export const RuleStatusSchema = z.enum(['active', 'inactive']);

export const RuleSchema = z.object({
  rule_id: z.string(),
  w_id: z.array(z.string()),
  raw_text: z.string(),
  status: RuleStatusSchema,
  trigger_time: z.string().nullable().optional(),
  interval: z.number().nullable().optional(),
  last_triggered_at: z.string().nullable().optional(),
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
