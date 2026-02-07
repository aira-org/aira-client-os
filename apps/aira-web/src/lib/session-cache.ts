/**
 * Session cache utility with TTL (Time To Live) support.
 * Stores data in sessionStorage with automatic expiration.
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export const sessionCache = {
  /**
   * Store data in session cache with TTL
   * @param key - Storage key
   * @param data - Data to store
   * @param ttl - Time to live in milliseconds (default: 1 hour)
   */
  set: <T>(key: string, data: T, ttl = 3600000): void => {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      sessionStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.error(`Failed to set sessionStorage key "${key}":`, error);
    }
  },

  /**
   * Get data from session cache
   * Returns null if expired or not found
   * @param key - Storage key
   * @returns The cached data or null
   */
  get: <T>(key: string): T | null => {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) {
        return null;
      }

      const cached = JSON.parse(raw) as CachedData<T>;

      // Check if expired
      if (Date.now() - cached.timestamp > cached.ttl) {
        sessionStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error(`Failed to get sessionStorage key "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove data from session cache
   * @param key - Storage key
   */
  remove: (key: string): void => {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove sessionStorage key "${key}":`, error);
    }
  },

  /**
   * Clear all session cache
   */
  clear: (): void => {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  },

  /**
   * Check if a key exists and is not expired
   * @param key - Storage key
   * @returns true if key exists and is valid
   */
  has: (key: string): boolean => {
    return sessionCache.get(key) !== null;
  },
};
