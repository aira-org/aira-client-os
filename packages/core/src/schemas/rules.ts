import { z } from 'zod';

export const RuleStatusSchema = z.enum(['active', 'inactive']);

export const RuleSchema = z.object({
  rule_id: z.string(),
  w_id: z.array(z.string()),
  raw_text: z.string(),
  status: RuleStatusSchema,
  trigger_time: z.string().nullable().optional(),
  /** End time for "once" window or daily time span. */
  trigger_time_end: z.string().nullable().optional(),
  interval: z.number().nullable().optional(),
  /** Repeat every X minutes within time span (daily etc.). */
  interval_minutes: z.number().nullable().optional(),
  /** For "once": how many times to run in the window. */
  run_count: z.number().nullable().optional(),
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
  /** End time for "once" range or daily time span. */
  trigger_time_end?: string;
  /** Repeat interval in days (daily=1, weekly=7, etc.). */
  interval?: number;
  /** Repeat every X minutes within time span (for daily etc.). */
  interval_minutes?: number;
  /** For "once": how many times to run in the window. */
  run_count?: number;
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
