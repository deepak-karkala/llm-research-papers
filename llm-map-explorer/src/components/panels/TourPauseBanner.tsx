'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, RotateCcw, X } from 'lucide-react';

interface TourPauseBannerProps {
  tourTitle: string;
  onResume: () => void;
  onExit: () => void;
}

/**
 * TourPauseBanner Component
 *
 * Displays a compact banner when a tour is paused, showing:
 * - Tour pause status with icon
 * - Tour name
 * - Resume button to return to the tour
 * - Exit button to close the tour completely
 *
 * Accessibility features:
 * - Role="status" announces pause state to screen readers
 * - aria-label provides context for the pause state
 * - Proper focus management on buttons
 */
export const TourPauseBanner: React.FC<TourPauseBannerProps> = ({
  tourTitle,
  onResume,
  onExit,
}) => {
  return (
    <div
      className="bg-yellow-50 border-b-2 border-yellow-300 p-3 shadow-sm"
      role="status"
      aria-label={`Tour paused: ${tourTitle}`}
      data-testid="tour-pause-banner"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Pause indicator and tour name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Pause size={18} className="text-yellow-700 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-yellow-900">Tour Paused</p>
            <p className="text-xs text-yellow-800 truncate">{tourTitle}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onResume}
            aria-label={`Resume ${tourTitle} tour`}
            className="text-xs whitespace-nowrap border-yellow-300 hover:bg-yellow-100 text-yellow-900"
          >
            <RotateCcw size={14} className="mr-1" />
            Resume
          </Button>
          <button
            onClick={onExit}
            className="p-1.5 hover:bg-yellow-100 rounded transition text-yellow-700"
            aria-label="Exit tour"
            title="Exit tour"
            data-testid="tour-exit-button"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

TourPauseBanner.displayName = 'TourPauseBanner';
