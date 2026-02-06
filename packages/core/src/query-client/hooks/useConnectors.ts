import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { type z } from 'zod';
import { getApiClient } from '../../api/apiClient';
import {
  ConnectorsAllResponseSchema,
  ConnectConnectorResponseSchema,
  DisconnectConnectorResponseSchema,
} from '../../schemas';
import type {
  ConnectorsAllResponse,
  ConnectConnectorResponse,
  DisconnectConnectorResponse,
  ConnectPlatform,
} from '../../schemas';
import { useIsAuthenticated } from '../../stores';

export const CONNECTORS_QUERY_KEY = ['connectors', 'all'] as const;

interface ConnectConnectorParams {
  connectorType: string;
  platform: ConnectPlatform;
}

export const useConnectConnector = (): UseMutationResult<
  ConnectConnectorResponse,
  Error,
  ConnectConnectorParams
> => {
  return useMutation({
    mutationFn: async ({
      connectorType,
      platform,
    }: ConnectConnectorParams): Promise<ConnectConnectorResponse> => {
      const api = getApiClient();
      const url = `/v1/connectors/connect/${encodeURIComponent(connectorType)}?state=connector:${encodeURIComponent(platform)}`;
      const schema = ConnectConnectorResponseSchema as z.ZodType<ConnectConnectorResponse>;
      return await api.get<ConnectConnectorResponse>(url, schema);
    },
  });
};

export const useConnectors = (): UseQueryResult<ConnectorsAllResponse, Error> => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: CONNECTORS_QUERY_KEY,
    queryFn: async (): Promise<ConnectorsAllResponse> => {
      const apiClient = getApiClient();
      const schema = ConnectorsAllResponseSchema as z.ZodType<ConnectorsAllResponse>;
      return await apiClient.get<ConnectorsAllResponse>('/v1/connectors/all', schema);
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useDisconnectConnector = (): UseMutationResult<
  DisconnectConnectorResponse,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectorType: string): Promise<DisconnectConnectorResponse> => {
      const api = getApiClient();
      const schema = DisconnectConnectorResponseSchema as z.ZodType<DisconnectConnectorResponse>;
      return await api.delete<DisconnectConnectorResponse>(
        `/v1/connectors/disconnect/${encodeURIComponent(connectorType)}`,
        undefined,
        schema,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CONNECTORS_QUERY_KEY });
    },
  });
};
