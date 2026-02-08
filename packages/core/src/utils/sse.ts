// Browser EventSource interface for cross-platform compatibility
interface SSEInstance {
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: (() => void) | null;
  addEventListener: (type: string, listener: (event: { data?: string }) => void) => void;
  close: () => void;
}

interface SSEConstructor {
  new (url: string, init?: { withCredentials?: boolean }): SSEInstance;
}

declare const EventSource: SSEConstructor;

export interface SSEListenerOptions<T> {
  url: string;
  baseURL?: string;
  onMessage: (data: T) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  completeEvent?: string;
}

export const listenToSSE = <T = unknown>(options: SSEListenerOptions<T>): Promise<void> => {
  const {
    url,
    baseURL,
    onMessage,
    onComplete,
    onError,
    timeout = 5 * 60 * 1000,
    completeEvent = 'process_complete',
  } = options;

  return new Promise((resolve, reject) => {
    const fullURL = baseURL ? `${baseURL}${url}` : url;
    let eventSource: SSEInstance | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isCompleted = false;

    // Handle mock mode
    try {
      const { getApiClient } = require('../api/apiClient');
      const client = getApiClient();
      if (client.hasMockHandler()) {
        console.warn('[SSE] Mock mode detected, simulating success');
        setTimeout(() => {
          if (!isCompleted) {
            onComplete?.();
            resolve();
            isCompleted = true;
          }
        }, 1000);
        return;
      }
    } catch (e) {
      // Fallback for environments where ApiClient might not be initialized
    }

    const cleanup = (): void => {
      console.warn('[SSE] Cleaning up connection');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (eventSource) {
        eventSource.close();
      }
      isCompleted = true;
    };

    const handleError = (error: Error): void => {
      cleanup();
      onError?.(error);
      reject(error);
    };

    const handleComplete = (): void => {
      cleanup();
      onComplete?.();
      resolve();
    };

    timeoutId = setTimeout(() => {
      if (!isCompleted) {
        console.error('[SSE] Connection timeout after', timeout, 'ms');
        handleError(new Error('SSE connection timeout'));
      }
    }, timeout);

    try {
      eventSource = new EventSource(fullURL, { withCredentials: true });
      console.warn('[SSE] Connecting to:', fullURL);

      eventSource.onopen = () => {
        console.warn('[SSE] Connection established');
      };

      eventSource.onmessage = event => {
        console.warn('[SSE] Generic message received (ignoring):', event.data);
      };

      eventSource.addEventListener(completeEvent, (event: { data?: string }) => {
        console.warn(`[SSE] Completion event '${completeEvent}' received`);
        try {
          const parsed = JSON.parse(event.data ?? '') as T;
          console.warn('[SSE] Completion data:', parsed);
          onMessage(parsed);
          handleComplete();
        } catch {
          console.warn('[SSE] Completing without data');
          handleComplete();
        }
      });

      eventSource.addEventListener('error', () => {
        if (!isCompleted) {
          console.error('[SSE] Connection error occurred');
          handleError(new Error('SSE connection error'));
        }
      });
    } catch (err) {
      console.error('[SSE] Failed to create connection:', err);
      handleError(err instanceof Error ? err : new Error('Failed to create SSE connection'));
    }
  });
};
