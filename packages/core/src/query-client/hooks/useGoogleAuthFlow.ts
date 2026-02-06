import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { z } from 'zod';
import { getApiClient } from '../../api/apiClient';
import { authStore } from '../../stores';
import { createTokenStorage } from '../../utils';

const VerifyAuthRequestSchema = z.object({
  auth_token: z.string(),
});

const VerifyAuthResponseSchema = z.object({
  access_token: z.string(),
});

type VerifyAuthRequest = z.infer<typeof VerifyAuthRequestSchema>;
type VerifyAuthResponse = z.infer<typeof VerifyAuthResponseSchema>;

export const useVerifyGoogleAuth = (): UseMutationResult<
  VerifyAuthResponse,
  Error,
  VerifyAuthRequest
> => {
  return useMutation({
    mutationFn: async (request: VerifyAuthRequest): Promise<VerifyAuthResponse> => {
      const apiClient = getApiClient();
      const response = await apiClient.post<VerifyAuthResponse>(
        '/v1/auth/verify-auth',
        VerifyAuthRequestSchema.parse(request),
        VerifyAuthResponseSchema,
      );
      return response;
    },
  });
};

interface GoogleAuthFlowParams {
  auth_token: string;
}

interface GoogleAuthFlowResult {
  success: boolean;
}

export const useGoogleAuthFlow = (): UseMutationResult<
  GoogleAuthFlowResult,
  Error,
  GoogleAuthFlowParams
> => {
  const tokenStorage = createTokenStorage();

  return useMutation({
    mutationFn: async ({ auth_token }: GoogleAuthFlowParams): Promise<GoogleAuthFlowResult> => {
      authStore.setState({ isLoading: true });

      const apiClient = getApiClient();
      const verifyResponse = await apiClient.post<VerifyAuthResponse>(
        '/v1/auth/verify-auth',
        VerifyAuthRequestSchema.parse({ auth_token }),
        VerifyAuthResponseSchema,
      );

      await tokenStorage.set(verifyResponse.access_token);
      authStore.setState({ isLoading: false, isAuthenticated: true });

      return { success: true };
    },
    onError: error => {
      authStore.setState({ isLoading: false, isAuthenticated: false });
      console.error('error', error);
    },
  });
};
