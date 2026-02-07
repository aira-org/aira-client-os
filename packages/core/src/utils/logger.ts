/**
 * Production-safe logger utility
 * Logs are only shown in development mode
 * In production, errors are logged to console but without sensitive data
 */

const IS_DEV = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Debug-level logging (only in development)
   */
  debug: (...args: unknown[]): void => {
    if (IS_DEV) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Info-level logging (only in development)
   */
  info: (...args: unknown[]): void => {
    if (IS_DEV) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning-level logging (only in development)
   */
  warn: (...args: unknown[]): void => {
    if (IS_DEV) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error-level logging (sanitized in production)
   */
  error: (...args: unknown[]): void => {
    if (IS_DEV) {
      console.error('[ERROR]', ...args);
    } else {
      // In production, log generic error message
      // In a real app, send to error tracking service (Sentry, etc.)
      console.error('[ERROR] An error occurred');
    }
  },

  /**
   * Log API requests (only in development)
   */
  api: (method: string, url: string, data?: unknown): void => {
    if (IS_DEV) {
      console.log(`🚀 API ${method.toUpperCase()}: ${url}`, data);
    }
  },

  /**
   * Log API responses (only in development)
   */
  apiResponse: (url: string, data?: unknown): void => {
    if (IS_DEV) {
      console.log(`✅ API Response: ${url}`, data);
    }
  },

  /**
   * Log API errors (only in development)
   */
  apiError: (url: string, error: unknown): void => {
    if (IS_DEV) {
      console.error(`❌ API Error: ${url}`, error);
    }
  },
};
