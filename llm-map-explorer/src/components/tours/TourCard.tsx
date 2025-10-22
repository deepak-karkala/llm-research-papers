'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Zap } from 'lucide-react';
import { useMapStore } from '@/lib/store';
import type { Tour } from '@/types/data';

interface TourCardProps {
  tour: Tour;
  onTourStart?: (tour: Tour) => void;
}

/**
 * TourCard Component
 *
 * Displays a single tour as a card with:
 * - Tour title and description
 * - Difficulty badge with color coding
 * - Estimated duration and stage count
 * - Start Tour button
 *
 * Supports:
 * - Hover effects for better UX
 * - Accessibility with ARIA labels
 * - Responsive sizing
 * - Keyboard navigation and focus states
 */
export const TourCard: React.FC<TourCardProps> = ({ tour, onTourStart }) => {
  const { startTour } = useMapStore();

  const handleStartTour = () => {
    startTour(tour);
    onTourStart?.(tour);
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyIcon = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '⭐';
      case 'intermediate':
        return '⭐⭐';
      case 'advanced':
        return '⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  const formattedDifficulty = tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1);

  return (
    <Card
      className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 hover:border-blue-300 cursor-pointer"
      role="article"
      data-testid={`tour-card-${tour.id}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{tour.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {tour.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Metadata Row */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={14} className="flex-shrink-0" />
            <span data-testid="tour-duration">{tour.estimatedDuration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={14} className="flex-shrink-0" />
            <span data-testid="tour-stages">{tour.stages.length} stages</span>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div
          className={`w-fit text-xs font-medium border rounded px-2.5 py-1 ${getDifficultyColor(tour.difficulty)}`}
          data-testid="tour-difficulty"
        >
          <span className="mr-1">{getDifficultyIcon(tour.difficulty)}</span>
          {formattedDifficulty}
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStartTour}
          variant="default"
          size="sm"
          className="w-full mt-auto"
          aria-label={`Start ${tour.title} tour`}
          data-testid="tour-start-button"
        >
          Start Tour
        </Button>
      </CardContent>
    </Card>
  );
};

TourCard.displayName = 'TourCard';
