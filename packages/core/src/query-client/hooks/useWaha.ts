'use client';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { getApiClient } from '../../api/apiClient';
import { CONNECTORS_QUERY_KEY, useConnectors } from './useConnectors';
import { SUGGESTIONS_QUERY_KEY } from './useSuggestion';
import { useIsAuthenticated } from '../../stores';
import { useIsWahaConnected, useWahaLinkCode, useWahaStore } from '../../stores/waha/wahaStore';
import {
  WahaConnectResponseSchema,
  WahaDisconnectSchemaResponse,
  WahaIsConnectedSchema,
  WahaGetGroupsSchema,
  WahaUpdateModerationJobResponseSchema,
  WahaUpdateModerationEventDataSchema,
  WahaSyncChatsJobResponseSchema,
  WahaSyncChatsEventDataSchema,
} from '../../schemas';
import type {
  WahaConnectResponse,
  WahaDisconnectResponse,
  WahaIsConnectedResponse,
  WahaGetGroupsResponse,
  WahaUpdateModerationRequest,
  WahaUpdateModerationResponse,
  WahaUpdateModerationJobResponse,
  WahaSyncChatsJobResponse,
} from '../../schemas';
import { delayAndExecute, listenToSSE } from '../../utils';

export const WAHA_QUERY_KEY = ['waha'] as const;
export const WAHA_CONNECT_KEY = [...WAHA_QUERY_KEY, 'connect'] as const;
export const WAHA_POLLING_KEY = [...WAHA_QUERY_KEY, 'polling'] as const;
export const WAHA_SYNC_KEY = [...WAHA_QUERY_KEY, 'sync'] as const;
export const WAHA_GROUPS_KEY = [...WAHA_QUERY_KEY, 'groups'] as const;

export const useWahaConnect = (): UseMutationResult<WahaConnectResponse, Error, void> => {
  const setLinkCode = useWahaStore(state => state.setLinkCode);

  return useMutation({
    mutationKey: WAHA_CONNECT_KEY,
    mutationFn: async (): Promise<WahaConnectResponse> => {
      const apiClient = getApiClient();
      return await apiClient.post<WahaConnectResponse>(
        '/v1/waha/connect-whatsapp',
        WahaConnectResponseSchema,
      );
    },
    onSuccess: data => {
      if (data.status && data.code) {
        setLinkCode(data.code);
      }
    },
  });
};

export const useWahaDisconnect = (): UseMutationResult<WahaDisconnectResponse, Error, void> => {
  const queryClient = useQueryClient();
  const disconnect = useWahaStore(state => state.disconnect);
  return useMutation({
    mutationFn: async (): Promise<WahaDisconnectResponse> => {
      const apiClient = getApiClient();

      return await apiClient.delete<WahaDisconnectResponse>(
        `/v1/waha/delete-session`,
        undefined,
        WahaDisconnectSchemaResponse,
      );
    },
    onSuccess: () => {
      disconnect();
      void queryClient.invalidateQueries({ queryKey: CONNECTORS_QUERY_KEY });
    },
  });
};

type PollingStatus = 'idle' | 'polling' | 'syncing' | 'success' | 'error';

interface UseWahaLinkPollingResult {
  status: PollingStatus;
  error: Error | null;
  reset: () => void;
}

export interface UseWahaLinkPollingCallbacks {
  onSyncStart?: () => void;
  onSyncComplete?: (message?: string) => void;
}

export const useWahaLinkPolling = (
  callbacks?: UseWahaLinkPollingCallbacks,
): UseWahaLinkPollingResult => {
  const isAuthenticated = useIsAuthenticated();
  const linkCode = useWahaLinkCode();
  const isConnected = useIsWahaConnected();
  const connect = useWahaStore(state => state.connect);
  const disconnect = useWahaStore(state => state.disconnect);
  const queryClient = useQueryClient();
  const [shouldSync, setShouldSync] = useState(false);
  const [syncStarted, setSyncStarted] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const shouldPoll = isAuthenticated && !!linkCode && !isConnected;

  // Poll /v1/waha/is-connected every 3 seconds
  const pollingQuery = useQuery({
    queryKey: WAHA_POLLING_KEY,
    queryFn: async (): Promise<WahaIsConnectedResponse> => {
      const apiClient = getApiClient();
      return await apiClient.get<WahaIsConnectedResponse>(
        '/v1/waha/is-connected',
        WahaIsConnectedSchema,
      );
    },
    enabled: shouldPoll,
    refetchInterval: query => {
      if (query.state.data?.success || query.state.error) {
        return false;
      }
      return 3000;
    },
    retry: false,
  });

  useEffect(() => {
    if (pollingQuery.data?.success) {
      void delayAndExecute(3000, () => {
        setShouldSync(true);
      });
    }
  }, [pollingQuery.data?.success]);

  // Start sync and get job_id, then start SSE in background
  useEffect(() => {
    if (!shouldSync || syncStarted || isConnected) {
      return;
    }

    const startSync = async (): Promise<void> => {
      try {
        setSyncStarted(true);
        const apiClient = getApiClient();
        const response = await apiClient.get<WahaSyncChatsJobResponse>(
          '/v1/waha/sync-chats',
          WahaSyncChatsJobResponseSchema,
        );

        if (!response.success) {
          return;
        }

        if (!response.job_id) {
          // No job_id, mark as connected and continue
          connect();
          void queryClient.invalidateQueries({ queryKey: CONNECTORS_QUERY_KEY });
          void queryClient.invalidateQueries({ queryKey: WAHA_GROUPS_KEY });
          return;
        }

        // Got job_id - redirect to hub immediately
        callbacks?.onSyncStart?.();

        // Start SSE in background
        void listenToSSE({
          url: `/v1/waha/sync-chats/stream/${response.job_id}`,
          baseURL: apiClient.getBaseURL(),
          timeout: 5 * 60 * 1000,
          completeEvent: 'sync_chats_complete',
          onMessage: (data: unknown) => {
            const parseResult = WahaSyncChatsEventDataSchema.safeParse(data);
            if (parseResult.success) {
              const eventData = parseResult.data;
              const message = `Synced ${eventData.total_synced} chats`;
              callbacks?.onSyncComplete?.(message);
            }
            connect();
            void queryClient.invalidateQueries({ queryKey: CONNECTORS_QUERY_KEY });
            void queryClient.invalidateQueries({ queryKey: WAHA_GROUPS_KEY });
          },
          onError: () => {
            // Silently handle error - don't block user
            connect();
            void queryClient.invalidateQueries({ queryKey: CONNECTORS_QUERY_KEY });
          },
        });
      } catch (err) {
        setSyncError(err instanceof Error ? err : new Error('Sync failed'));
      }
    };

    void startSync();
  }, [shouldSync, syncStarted, isConnected, connect, queryClient, callbacks]);

  const getStatus = (): PollingStatus => {
    if (pollingQuery.error ?? syncError) {
      return 'error';
    }
    if (syncStarted) {
      return 'syncing';
    }
    if (pollingQuery.isFetching || shouldPoll) {
      return 'polling';
    }
    return 'idle';
  };

  const reset = useCallback(() => {
    disconnect();
    setShouldSync(false);
    setSyncStarted(false);
    setSyncError(null);
    void queryClient.resetQueries({ queryKey: WAHA_POLLING_KEY });
  }, [disconnect, queryClient]);

  return {
    status: getStatus(),
    error: pollingQuery.error ?? syncError ?? null,
    reset,
  };
};

export interface UseWahaGroupsOptions {
  moderation_status?: boolean | null;
}

export const useWahaGroups = (
  options?: UseWahaGroupsOptions,
): UseQueryResult<WahaGetGroupsResponse, Error> => {
  const isAuthenticated = useIsAuthenticated();
  const { data: connectors } = useConnectors();

  const hasWhatsApp = connectors?.available_services.includes('whatsapp') ?? false;

  return useQuery({
    queryKey: [...WAHA_GROUPS_KEY, options?.moderation_status],
    queryFn: async (): Promise<WahaGetGroupsResponse> => {
      const apiClient = getApiClient();
      const params = new URLSearchParams();
      if (options?.moderation_status !== undefined && options.moderation_status !== null) {
        params.append('moderation_status', String(options.moderation_status));
      }
      const queryString = params.toString();
      const url = queryString ? `/v1/groups?${queryString}` : '/v1/groups';
      return await apiClient.get<WahaGetGroupsResponse>(url, WahaGetGroupsSchema);
    },
    enabled: isAuthenticated && hasWhatsApp,
    staleTime: 0.2 * 60 * 1000,
    gcTime: 0.2 * 60 * 1000,
  });
};

export interface WahaSyncChatsResult {
  success: boolean;
  message?: string;
  total_synced?: number;
}

export interface UseWahaSyncChatsCallbacks {
  onSyncStart?: (jobId: string) => void;
  onSyncComplete?: (message?: string) => void;
}

export const useWahaSyncChats = (
  callbacks?: UseWahaSyncChatsCallbacks,
): UseMutationResult<WahaSyncChatsResult, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: WAHA_SYNC_KEY,
    mutationFn: async (): Promise<WahaSyncChatsResult> => {
      const apiClient = getApiClient();

      const response = await apiClient.get<WahaSyncChatsJobResponse>(
        '/v1/waha/sync-chats',
        WahaSyncChatsJobResponseSchema,
      );

      if (!response.success) {
        throw new Error('Failed to start sync');
      }

      // If no job_id, nothing to do
      if (!response.job_id) {
        return { success: true, message: 'No sync needed' };
      }

      const jobId = response.job_id;
      callbacks?.onSyncStart?.(jobId);

      // Listen to SSE until complete
      return await new Promise<WahaSyncChatsResult>((resolve, reject) => {
        void listenToSSE({
          url: `/v1/waha/sync-chats/stream/${jobId}`,
          baseURL: apiClient.getBaseURL(),
          timeout: 5 * 60 * 1000,
          completeEvent: 'sync_chats_complete',
          onMessage: (data: unknown) => {
            const parseResult = WahaSyncChatsEventDataSchema.safeParse(data);

            if (!parseResult.success) {
              resolve({ success: true, message: 'Sync complete' });
              return;
            }

            const eventData = parseResult.data;
            const message = `Synced ${eventData.total_synced} chats`;
            callbacks?.onSyncComplete?.(message);
            resolve({
              success: true,
              message,
              total_synced: eventData.total_synced,
            });
          },
          onError: reject,
        }).catch((error: unknown) => {
          reject(error instanceof Error ? error : new Error(String(error)));
        });
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WAHA_GROUPS_KEY });
    },
  });
};

export interface UseUpdateWahaGroupsCallbacks {
  onJobStart?: (jobId: string) => void;
  onJobComplete?: (message?: string) => void;
  onNoJob?: () => void;
}

export const useUpdateWahaGroups = (
  callbacks?: UseUpdateWahaGroupsCallbacks,
): UseMutationResult<WahaUpdateModerationResponse, Error, WahaUpdateModerationRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: WahaUpdateModerationRequest,
    ): Promise<WahaUpdateModerationResponse> => {
      const apiClient = getApiClient();

      console.warn('[useWaha] Initiating group update job with request:', request);
      const jobResponse: WahaUpdateModerationJobResponse = await apiClient.put(
        '/v1/groups',
        request,
        WahaUpdateModerationJobResponseSchema,
      );
      console.warn('[useWaha] Job response:', jobResponse);

      if (!jobResponse.success) {
        console.error('[useWaha] Job response unsuccessful');
        throw new Error('Failed to initiate group update job');
      }

      if (!jobResponse.job_id) {
        console.warn('[useWaha] No job_id returned, skipping SSE');
        callbacks?.onNoJob?.();
        return { success: true, message: 'No suggestions needed' };
      }

      const { job_id } = jobResponse;
      console.warn('[useWaha] Job started with ID:', job_id);

      callbacks?.onJobStart?.(job_id);

      return await new Promise<WahaUpdateModerationResponse>((resolve, reject) => {
        void listenToSSE({
          url: `/v1/groups/suggestion/${job_id}`,
          baseURL: apiClient.getBaseURL(),
          timeout: 10 * 60 * 1000,
          completeEvent: 'suggestion_job_complete',
          onMessage: (sse_data: unknown) => {
            console.warn('[useWaha] Processing SSE event:', sse_data);
            const parseResult = WahaUpdateModerationEventDataSchema.safeParse(sse_data);

            if (!parseResult.success) {
              console.error('[useWaha] Invalid SSE event data:', parseResult.error);
              return;
            }

            const eventData = parseResult.data;
            console.warn('[useWaha] Job complete event received:', eventData);

            // Invalidate groups and suggestions to refetch fresh data
            void queryClient.invalidateQueries({ queryKey: WAHA_GROUPS_KEY });
            void queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY });

            const message = `Generated ${eventData.total_suggestions} AI suggestions`;
            callbacks?.onJobComplete?.(message);
            resolve({
              success: true,
              message,
            });
          },
          onError: reject,
        }).catch((error: unknown) => {
          reject(error instanceof Error ? error : new Error(String(error)));
        });
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: WAHA_GROUPS_KEY });
    },
  });
};
