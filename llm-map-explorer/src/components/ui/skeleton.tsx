import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton - Loading placeholder component
 *
 * Displays an animated skeleton screen while content loads.
 * Uses pulse animation to indicate loading state.
 *
 * @example
 * // Display skeleton while loading
 * <div className="space-y-4">
 *   <Skeleton className="h-12 w-3/4" />
 *   <Skeleton className="h-4 w-full" />
 *   <Skeleton className="h-4 w-2/3" />
 * </div>
 */
interface SkeletonProps {
  /** Additional CSS classes to customize the skeleton */
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'rounded-md bg-muted animate-pulse',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

/**
 * InfoPanelSkeleton - Skeleton for info panel content
 *
 * Displays a loading skeleton matching the structure of InfoPanel
 *
 * @example
 * {isLoading ? <InfoPanelSkeleton /> : <InfoPanelContent data={data} />}
 */
export const InfoPanelSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    <Skeleton className="h-8 w-3/4" /> {/* Title */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
      <Skeleton className="h-4 w-2/3" /> {/* Description line 2 */}
    </div>
    <Skeleton className="h-px w-full my-4" /> {/* Divider */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" /> {/* Label */}
      <Skeleton className="h-4 w-full" /> {/* Content line 1 */}
      <Skeleton className="h-4 w-3/4" /> {/* Content line 2 */}
    </div>
    <div className="space-y-2 mt-4">
      <Skeleton className="h-10 w-full" /> {/* Button 1 */}
      <Skeleton className="h-10 w-full" /> {/* Button 2 */}
    </div>
  </div>
);

/**
 * TourPanelSkeleton - Skeleton for tour panel content
 *
 * Displays a loading skeleton matching the structure of TourPanel
 */
export const TourPanelSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    <Skeleton className="h-6 w-3/4" /> {/* Title */}
    <Skeleton className="h-2 w-full rounded-full" /> {/* Progress bar */}
    <div className="space-y-3 mt-6">
      <Skeleton className="h-6 w-2/3" /> {/* Stage title */}
      <Skeleton className="h-4 w-full" /> {/* Content 1 */}
      <Skeleton className="h-4 w-full" /> {/* Content 2 */}
      <Skeleton className="h-4 w-4/5" /> {/* Content 3 */}
    </div>
    <div className="space-y-2 mt-6">
      <Skeleton className="h-10 w-full" /> {/* Next button */}
    </div>
  </div>
);

/**
 * SearchResultsSkeleton - Skeleton for search results dropdown
 *
 * Displays loading skeleton for search results
 */
export const SearchResultsSkeleton: React.FC = () => (
  <div className="space-y-2 p-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-8 w-full rounded" />
    ))}
  </div>
);
