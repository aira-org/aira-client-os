'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the
 * child component tree and displays a fallback UI instead of crashing the app.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
    // In production, send to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-destructive/20 p-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              Something went wrong
            </h2>

            <p className="mb-6 text-sm text-muted-foreground">
              We're sorry for the inconvenience. The error has been logged and
              we'll look into it.
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-left">
                <p className="mb-2 text-xs font-semibold text-destructive">
                  Error Details:
                </p>
                <p className="text-xs text-muted-foreground">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
