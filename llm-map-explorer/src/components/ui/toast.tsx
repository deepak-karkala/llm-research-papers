'use client';

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Toast - Notification component
 *
 * Displays temporary notifications that auto-dismiss or can be manually closed.
 * Respects prefers-reduced-motion for accessibility.
 *
 * @example
 * <Toast
 *   type="success"
 *   message="Link copied to clipboard!"
 *   onClose={() => setShowToast(false)}
 *   duration={3000}
 * />
 */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  /** Type of toast determines styling and icon */
  type: ToastType;
  /** Message text to display */
  message: string;
  /** Callback when toast closes */
  onClose: () => void;
  /** Duration in milliseconds before auto-closing (0 = no auto-close) */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-600" />,
  error: <AlertCircle className="h-5 w-5 text-red-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
};

const toastBgColors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-yellow-50 border-yellow-200',
};

const toastTextColors: Record<ToastType, string> = {
  success: 'text-green-900',
  error: 'text-red-900',
  info: 'text-blue-900',
  warning: 'text-yellow-900',
};

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 3000,
  className,
}) => {
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 rounded-lg border p-4',
        'flex items-center gap-3 shadow-lg',
        'z-50 max-w-sm',
        prefersReducedMotion ? 'opacity-100' : 'animate-slideInRight',
        toastBgColors[type],
        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {toastIcons[type]}
      </div>

      {/* Message */}
      <span className={cn('text-sm font-medium flex-1', toastTextColors[type])}>
        {message}
      </span>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={cn(
          'ml-auto flex-shrink-0 p-1',
          'hover:bg-white/50 rounded transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-0'
        )}
        aria-label="Close notification"
      >
        <X className={cn('h-4 w-4', toastTextColors[type])} />
      </button>
    </div>
  );
};

/**
 * ToastContainer - Container for multiple toasts
 *
 * Manages multiple toast notifications with proper stacking.
 *
 * @example
 * const [toasts, setToasts] = useState<Array<{id: string; message: string}>>([]);
 *
 * <ToastContainer
 *   toasts={toasts}
 *   onRemove={(id) => setToasts(t => t.filter(toast => toast.id !== id))}
 * />
 */
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div key={toast.id} className="pointer-events-auto" style={{ zIndex: 50 + index }}>
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => onRemove(toast.id)}
            duration={3000}
          />
        </div>
      ))}
    </div>
  );
};
