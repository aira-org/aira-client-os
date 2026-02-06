import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { getApiClient } from '../../api/apiClient';
import { useAuthActions } from '../../stores';

export const useLogout = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  const { logout } = useAuthActions();

  return useMutation({
    mutationFn: async () => {
      const apiClient = getApiClient();
      await apiClient.post('/v1/auth/logout');
    },
    onSuccess: async () => {
      // Clear auth state
      await logout();
      // Clear all cached queries
      queryClient.clear();
    },
  });
};

export const useDeleteAccount = (): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  const { logout } = useAuthActions();

  return useMutation({
    mutationFn: async () => {
      const apiClient = getApiClient();
      await apiClient.delete('/v1/users/delete-account');
    },
    onSuccess: async () => {
      // Clear auth state
      await logout();
      // Clear all cached queries
      queryClient.clear();
    },
  });
};
