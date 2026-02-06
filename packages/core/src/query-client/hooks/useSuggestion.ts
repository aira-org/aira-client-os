'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { getApiClient } from '../../api/apiClient';
import { useIsAuthenticated } from '../../stores';
import { SuggestionsResponseSchema, DeleteSuggestionResponseSchema } from '../../schemas';
import type { SuggestionsResponse, DeleteSuggestionResponse } from '../../schemas';

export const SUGGESTIONS_QUERY_KEY = ['suggestions'] as const;

export const useSuggestions = (): UseQueryResult<SuggestionsResponse, Error> => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: SUGGESTIONS_QUERY_KEY,
    queryFn: async (): Promise<SuggestionsResponse> => {
      const apiClient = getApiClient();
      return await apiClient.get<SuggestionsResponse>('/v1/suggestions', SuggestionsResponseSchema);
    },
    enabled: isAuthenticated,
  });
};

export const useDeleteSuggestion = (): UseMutationResult<
  DeleteSuggestionResponse,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string): Promise<DeleteSuggestionResponse> => {
      const apiClient = getApiClient();
      return await apiClient.delete<DeleteSuggestionResponse>(
        `/v1/suggestions/${suggestionId}`,
        undefined,
        DeleteSuggestionResponseSchema,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY });
    },
  });
};
