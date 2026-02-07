export { createTokenStorage, type TokenStorage } from './tokenStorage';
export { TOKEN_KEY } from '../auth/constants';
export { listenToSSE, type SSEListenerOptions } from './sse';
export { logger } from './logger';

export const delayAndExecute = (ms: number, callback: () => void): Promise<void> =>
  new Promise<void>(resolve =>
    setTimeout(() => {
      callback();
      resolve();
    }, ms),
  );
