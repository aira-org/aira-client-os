import { z } from 'zod';

export type Suggestion = z.infer<typeof SuggestionSchema>;
export type SuggestionsResponse = z.infer<typeof SuggestionsResponseSchema>;
export type DeleteSuggestionResponse = z.infer<typeof DeleteSuggestionResponseSchema>;

export const SuggestionSchema = z.object({
  _id: z.string(),
  user_id: z.string(),
  suggestion_type: z.string(),
  status: z.string(),
  why: z.string(),
  chats: z.array(z.object({ w_id: z.string(), chat_name: z.string() })),
  rule: z.string(),
  action: z.string(),
  display_rule: z.string(),
  deadline: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SuggestionsResponseSchema = z.array(SuggestionSchema);

export const DeleteSuggestionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
