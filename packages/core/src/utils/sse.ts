// Browser EventSource interface for cross-platform compatibility
import { logger } from './logger';

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

    const cleanup = (): void => {
      logger.debug('[SSE] Cleaning up connection');
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
        logger.error('[SSE] Connection timeout after', timeout, 'ms');
        handleError(new Error('SSE connection timeout'));
      }
    }, timeout);

    try {
      eventSource = new EventSource(fullURL, { withCredentials: true });
      logger.debug('[SSE] Connecting to:', fullURL);

      eventSource.onopen = () => {
        logger.debug('[SSE] Connection established');
      };

      eventSource.onmessage = event => {
        logger.debug('[SSE] Generic message received (ignoring):', event.data);
      };

      eventSource.addEventListener(completeEvent, (event: { data?: string }) => {
        logger.debug(`[SSE] Completion event '${completeEvent}' received`);
        try {
          const parsed = JSON.parse(event.data ?? '') as T;
          logger.debug('[SSE] Completion data:', parsed);
          onMessage(parsed);
          handleComplete();
        } catch {
          logger.debug('[SSE] Completing without data');
          handleComplete();
        }
      });

      eventSource.addEventListener('error', () => {
        if (!isCompleted) {
          logger.error('[SSE] Connection error occurred');
          handleError(new Error('SSE connection error'));
        }
      });
    } catch (err) {
      logger.error('[SSE] Failed to create connection:', err);
      handleError(err instanceof Error ? err : new Error('Failed to create SSE connection'));
    }
  });
};
