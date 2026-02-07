import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /**
   * Icon component from lucide-react to display
   */
  icon: LucideIcon;

  /**
   * Main title text
   */
  title: string;

  /**
   * Descriptive text explaining the empty state
   */
  description: string;

  /**
   * Optional action button or element to display
   */
  action?: React.ReactNode;

  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * Empty State component for displaying when there's no content to show.
 * Provides consistent UX across the application for empty lists, searches, etc.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={MessageSquare}
 *   title="No tasks yet"
 *   description="Your pending tasks will appear here"
 *   action={
 *     <Button onClick={() => router.push('/workspace')}>
 *       Connect Services
 *     </Button>
 *   }
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>

      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      {action && <div className="flex gap-3">{action}</div>}
    </div>
  );
}
