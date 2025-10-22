'use client';

import React, { useMemo } from 'react';
import type { Tour } from '@/types/data';
import { useMapStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface TourListProps {
  tours: Tour[];
  onTourSelect?: (tour: Tour) => void;
}

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  intermediate: 'bg-amber-100 text-amber-800 border border-amber-200',
  advanced: 'bg-rose-100 text-rose-800 border border-rose-200',
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const difficultyIcons: Record<string, string> = {
  beginner: '⭐',
  intermediate: '⭐⭐',
  advanced: '⭐⭐⭐',
};

function formatDifficulty(difficulty: string) {
  const key = difficulty.toLowerCase();
  return difficultyLabels[key] ?? difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function getDifficultyClass(difficulty: string) {
  const key = difficulty.toLowerCase();
  return difficultyStyles[key] ?? 'bg-slate-100 text-slate-800 border border-slate-200';
}

function getDifficultyIcon(difficulty: string) {
  const key = difficulty.toLowerCase();
  return difficultyIcons[key] ?? '⭐';
}

function formatStages(count: number) {
  if (count === 1) {
    return '1 stage';
  }
  return `${count} stages`;
}

export const TourList: React.FC<TourListProps> = ({ tours, onTourSelect }) => {
  const startTour = useMapStore((state) => state.startTour);

  const sortedTours = useMemo(() => {
    const order: Record<string, number> = {
      beginner: 0,
      intermediate: 1,
      advanced: 2,
    };
    return [...tours].sort(
      (a, b) => (order[a.difficulty.toLowerCase()] ?? 99) - (order[b.difficulty.toLowerCase()] ?? 99)
    );
  }, [tours]);

  const handleSelect = (tour: Tour) => {
    startTour(tour);
    onTourSelect?.(tour);
  };

  if (sortedTours.length === 0) {
    return (
      <div
        className="text-sm text-muted-foreground px-4 py-6 border border-dashed border-muted rounded-md"
        role="status"
        aria-label="No tours available"
        data-testid="tour-list-empty"
      >
        Guided tours coming soon. Check back later!
      </div>
    );
  }

  return (
    <ul className="space-y-2" data-testid="tour-list" role="list">
      {sortedTours.map((tour) => (
        <li key={tour.id} role="listitem">
          <button
            type="button"
            onClick={() => handleSelect(tour)}
            className={cn(
              'w-full text-left rounded-md border border-border bg-background/60 p-3',
              'transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'flex flex-col gap-2'
            )}
            aria-label={`Start ${tour.title} tour`}
            data-testid={`tour-list-item-${tour.id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug">{tour.title}</p>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mt-1">
                  {tour.description}
                </p>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap',
                  getDifficultyClass(tour.difficulty)
                )}
                data-testid="tour-difficulty"
              >
                <span className="mr-1" aria-hidden="true">
                  {getDifficultyIcon(tour.difficulty)}
                </span>
                {formatDifficulty(tour.difficulty)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span data-testid="tour-duration">{tour.estimatedDuration} min</span>
              <span aria-hidden="true">•</span>
              <span data-testid="tour-stages">{formatStages(tour.stages.length)}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
};

TourList.displayName = 'TourList';

