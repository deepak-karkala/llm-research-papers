import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * ErrorAlert - Error state display component
 *
 * Displays error messages with retry and dismiss options.
 * Uses accessible design with proper ARIA labels and color contrast.
 *
 * @example
 * <ErrorAlert
 *   title="Failed to load data"
 *   message="Unable to fetch landmarks. Check your connection and try again."
 *   onRetry={() => refetch()}
 *   onDismiss={() => closeAlert()}
 * />
 */
interface ErrorAlertProps {
  /** Error title */
  title: string;
  /** Detailed error message */
  message: string;
  /** Optional callback for retry action */
  onRetry?: () => void;
  /** Optional callback for dismiss action */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Variant of error alert */
  variant?: 'default' | 'destructive' | 'warning';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  onRetry,
  onDismiss,
  className,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-red-200 bg-red-50',
    destructive: 'border-destructive/50 bg-destructive/10',
    warning: 'border-yellow-200 bg-yellow-50',
  };

  const iconStyles = {
    default: 'text-red-600',
    destructive: 'text-destructive',
    warning: 'text-yellow-600',
  };

  const titleStyles = {
    default: 'text-red-900',
    destructive: 'text-destructive',
    warning: 'text-yellow-900',
  };

  const messageStyles = {
    default: 'text-red-700',
    destructive: 'text-destructive/80',
    warning: 'text-yellow-700',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        'animate-fadeIn transition-all duration-300',
        variantStyles[variant],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <AlertTriangle
          className={cn(
            'h-5 w-5 flex-shrink-0 mt-0.5',
            iconStyles[variant]
          )}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold', titleStyles[variant])}>
            {title}
          </h3>
          <p className={cn('text-sm mt-1', messageStyles[variant])}>
            {message}
          </p>

          {/* Actions */}
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className={cn(
                    variant === 'default' && 'border-red-300 hover:bg-red-100',
                    variant === 'warning' && 'border-yellow-300 hover:bg-yellow-100'
                  )}
                >
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        {onDismiss && !onRetry && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
            aria-label="Close error message"
          >
            <X className={cn('h-4 w-4', iconStyles[variant])} />
          </button>
        )}
      </div>
    </div>
  );
};
