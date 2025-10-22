import React from 'react';
import { cn } from '@/lib/utils';

/**
 * HoverCard - Interactive card with hover effects
 *
 * A styled card component that responds to hover with elevation and border changes.
 * Perfect for tour cards, result items, and other interactive elements.
 *
 * @example
 * <HoverCard>
 *   <div className="p-4">
 *     <h3>Title</h3>
 *     <p>Description</p>
 *   </div>
 * </HoverCard>
 */
interface HoverCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether the card should be interactive (show hover effects) */
  interactive?: boolean;
  /** Callback when card is clicked */
  onClick?: () => void;
  /** Optional aria-label for accessibility */
  ariaLabel?: string;
  /** Optional role for accessibility */
  role?: string;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className,
  interactive = true,
  onClick,
  ariaLabel,
  role,
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'rounded-lg border bg-white',
        'border-border',
        // Interactive styles
        interactive && [
          'transition-all duration-200',
          'hover:shadow-md hover:border-border/80',
          onClick && 'cursor-pointer',
        ],
        className
      )}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      tabIndex={interactive && onClick ? 0 : undefined}
      onKeyDown={
        interactive && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

/**
 * HoverCardContent - Content wrapper for HoverCard
 *
 * Provides consistent padding and spacing for card content.
 *
 * @example
 * <HoverCard>
 *   <HoverCardContent>
 *     <h3>Title</h3>
 *     <p>Description</p>
 *   </HoverCardContent>
 * </HoverCard>
 */
interface HoverCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const HoverCardContent: React.FC<HoverCardContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
};

/**
 * HoverCardHeader - Header section for HoverCard
 *
 * @example
 * <HoverCard>
 *   <HoverCardHeader>
 *     <h3>Title</h3>
 *   </HoverCardHeader>
 *   <HoverCardContent>
 *     <p>Description</p>
 *   </HoverCardContent>
 * </HoverCard>
 */
interface HoverCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const HoverCardHeader: React.FC<HoverCardHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('px-4 pt-4', className)}>
      {children}
    </div>
  );
};
