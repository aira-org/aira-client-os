'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Offline Indicator component that displays a banner when the user loses internet connection.
 * Automatically detects online/offline status and shows/hides accordingly.
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);
      // Hide "back online" message after 3 seconds
      setTimeout(() => setShowOnlineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineMessage(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed left-0 right-0 top-0 z-50 bg-destructive p-3 text-center text-sm font-medium text-white shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Some features may be unavailable.</span>
          </div>
        </motion.div>
      )}

      {isOnline && showOnlineMessage && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed left-0 right-0 top-0 z-50 bg-success p-3 text-center text-sm font-medium text-white shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <Wifi className="h-4 w-4" />
            <span>You're back online!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
