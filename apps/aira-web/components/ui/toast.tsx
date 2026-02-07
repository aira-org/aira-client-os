'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, Info, ChevronRight } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  navigateTo?: string;
  persistent?: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  options?: ToastOptions;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    options?: ToastOptions,
  ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { id, message, type, options }]);

      if (!options?.persistent) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
      }
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toast.options?.navigateTo) {
      onClose();
      window.location.href = toast.options.navigateTo;
    }
  };

  const icons = {
    success: Sparkles,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[toast.type];
  const isClickable = !!toast.options?.navigateTo;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl border border-border/50 
        bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20
        min-w-[320px] max-w-95
        ${isClickable ? 'cursor-pointer' : ''}
      `}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary/50 via-primary to-primary/50" />

      <div className="flex items-center gap-3 p-4">
        {/* Icon with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">
            {toast.message}
          </p>
          {isClickable && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap to view suggestions
            </p>
          )}
        </div>

        {/* Action area */}
        <div className="flex items-center gap-1">
          {isClickable && (
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 rounded-full p-1.5 hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
