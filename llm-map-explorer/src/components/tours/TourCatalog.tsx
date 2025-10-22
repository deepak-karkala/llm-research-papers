'use client';

import React, { useMemo } from 'react';
import { TourCard } from './TourCard';
import type { Tour } from '@/types/data';

interface TourCatalogProps {
  tours: Tour[];
  onTourStart?: (tour: Tour) => void;
}

/**
 * TourCatalog Component
 *
 * Displays a responsive grid of all available tours.
 * Features:
 * - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
 * - Tours sorted by difficulty (beginner → advanced)
 * - Empty state handling
 * - Proper accessibility with semantic HTML
 */
export const TourCatalog: React.FC<TourCatalogProps> = ({ tours, onTourStart }) => {
  // Sort tours by difficulty for better UX
  const sortedTours = useMemo(() => {
    const difficultyOrder: Record<string, number> = {
      beginner: 0,
      intermediate: 1,
      advanced: 2,
    };

    return [...tours].sort(
      (a, b) =>
        (difficultyOrder[a.difficulty.toLowerCase()] ?? 99) -
        (difficultyOrder[b.difficulty.toLowerCase()] ?? 99)
    );
  }, [tours]);

  if (tours.length === 0) {
    return (
      <div
        className="p-8 text-center text-gray-500"
        role="status"
        aria-label="No tours available"
        data-testid="empty-tours"
      >
        <p className="text-sm">No tours available</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 auto-rows-max"
      role="main"
      aria-label="Tour catalog"
      data-testid="tour-catalog"
    >
      {sortedTours.map((tour) => (
        <TourCard
          key={tour.id}
          tour={tour}
          onTourStart={onTourStart}
        />
      ))}
    </div>
  );
};

TourCatalog.displayName = 'TourCatalog';
