import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { getApiClient } from '../../api/apiClient';
import {
  RulesResponseSchema,
  RuleMutationResponseSchema,
  RunRuleOnceResponseSchema,
  type Rule,
  type CreateRuleRequest,
  type UpdateRuleRequest,
  type DeleteRuleRequest,
  type RuleMutationResponse,
  type RunRuleOnceResponse,
} from '../../schemas/rules';
import { useIsAuthenticated } from '../../stores';
import { SUGGESTIONS_QUERY_KEY } from './useSuggestion';

export const RULES_QUERY_KEY = ['rules'] as const;
export const CHAT_RULES_QUERY_KEY = ['rules', 'chat'] as const;

export const useRules = (): UseQueryResult<Rule[], Error> => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: RULES_QUERY_KEY,
    queryFn: async () => {
      const apiClient = getApiClient();
      return apiClient.get<Rule[]>('/v1/rules', RulesResponseSchema);
    },
    enabled: isAuthenticated,
  });
};

export const useChatRules = (chatId: string): UseQueryResult<Rule[], Error> => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: [...CHAT_RULES_QUERY_KEY, chatId],
    queryFn: async () => {
      const apiClient = getApiClient();
      return apiClient.get<Rule[]>(`/v1/rules/${chatId}/rules`, RulesResponseSchema);
    },
    enabled: isAuthenticated && !!chatId,
  });
};

export const useCreateRule = (): UseMutationResult<
  RuleMutationResponse,
  Error,
  CreateRuleRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRuleRequest) => {
      const apiClient = getApiClient();
      return apiClient.post<RuleMutationResponse>('/v1/rules', request, RuleMutationResponseSchema);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CHAT_RULES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY });
    },
  });
};

export const useUpdateRule = (): UseMutationResult<
  RuleMutationResponse,
  Error,
  UpdateRuleRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateRuleRequest) => {
      const apiClient = getApiClient();
      return apiClient.put<RuleMutationResponse>('/v1/rules', request, RuleMutationResponseSchema);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CHAT_RULES_QUERY_KEY });
    },
  });
};

export const useDeleteRule = (): UseMutationResult<
  RuleMutationResponse,
  Error,
  DeleteRuleRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: DeleteRuleRequest) => {
      const apiClient = getApiClient();
      return apiClient.delete<RuleMutationResponse>(
        '/v1/rules',
        { rule_id: request.rule_id },
        RuleMutationResponseSchema,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RULES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CHAT_RULES_QUERY_KEY });
    },
  });
};

export const useRunRuleOnce = (): UseMutationResult<
  RunRuleOnceResponse,
  Error,
  CreateRuleRequest
> => {
  return useMutation({
    mutationFn: async (request: CreateRuleRequest) => {
      const apiClient = getApiClient();
      return apiClient.post<RunRuleOnceResponse>(
        '/v1/rules/run-once',
        request,
        RunRuleOnceResponseSchema,
      );
    },
  });
};
