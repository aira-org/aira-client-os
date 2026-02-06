import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { getApiClient } from '../../api/apiClient';
import { UserSchema, UpdateUserResponseSchema } from '../../schemas';
import type { User, UpdateUserRequest, UpdateUserResponse } from '../../schemas';
import { useIsAuthenticated } from '../../stores';

export const USER_QUERY_KEY = ['user', 'me'] as const;

export const useUser = (): UseQueryResult<User, Error> => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async (): Promise<User> => {
      const apiClient = getApiClient();
      return await apiClient.get<User>('/v1/users/me', UserSchema);
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useUpdateUser = (): UseMutationResult<
  UpdateUserResponse,
  Error,
  UpdateUserRequest
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateUserRequest) => {
      const apiClient = getApiClient();
      return await apiClient.patch<UpdateUserResponse>('/v1/users', body, UpdateUserResponseSchema);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
};
