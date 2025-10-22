'use client';

import React, { useEffect } from 'react';
import { useMapStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TourPauseBanner } from './TourPauseBanner';

/**
 * LandmarkDetailsForPause Component
 * Displays landmark details when a tour is paused
 */
function LandmarkDetailsForPause({ landmarkId }: { landmarkId: string }) {
  const { landmarks } = useMapStore();
  const landmark = landmarks.find((l) => l.id === landmarkId);

  if (!landmark) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">Landmark not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{landmark.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{landmark.description}</p>
        {landmark.year && (
          <p className="text-xs text-gray-500">Year: {landmark.year}</p>
        )}
      </div>
    </div>
  );
}

/**
 * TourPanel displays the current stage of a guided tour with navigation controls.
 * Shows tour progress, narration, and landmarks for the current stage.
 * When paused, displays a pause banner and the selected landmark details.
 */
export const TourPanel: React.FC = () => {
  const {
    currentTour,
    currentTourStageIndex,
    advanceTourStage,
    exitTour,
    resumeTour,
    isTourPaused,
    landmarks,
    selectedEntity,
  } = useMapStore();

  // Handle keyboard navigation
  useEffect(() => {
    if (!currentTour || isTourPaused) return;

    const totalStages = currentTour.stages.length;
    const isFirstStage = currentTourStageIndex === 0;
    const isLastStage = currentTourStageIndex === totalStages - 1;

    const handleKeyDown = (e: KeyboardEvent) => {
      // [ key = previous stage
      if (e.key === '[') {
        e.preventDefault();
        if (!isFirstStage) {
          advanceTourStage('previous');
        }
      }
      // ] key = next stage
      else if (e.key === ']') {
        e.preventDefault();
        if (!isLastStage) {
          advanceTourStage('next');
        }
      }
      // Escape = exit tour
      else if (e.key === 'Escape') {
        e.preventDefault();
        exitTour();
      }
      // ArrowLeft = previous stage (alternative)
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!isFirstStage) {
          advanceTourStage('previous');
        }
      }
      // ArrowRight = next stage (alternative)
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isLastStage) {
          advanceTourStage('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTour, currentTourStageIndex, advanceTourStage, exitTour, isTourPaused]);

  if (!currentTour) {
    return null;
  }

  const currentStage = currentTour.stages[currentTourStageIndex];
  const totalStages = currentTour.stages.length;
  const progressPercent = ((currentTourStageIndex + 1) / totalStages) * 100;
  const isFirstStage = currentTourStageIndex === 0;
  const isLastStage = currentTourStageIndex === totalStages - 1;

  const handlePreviousClick = () => {
    if (!isFirstStage) {
      advanceTourStage('previous');
    }
  };

  const handleNextClick = () => {
    if (isLastStage) {
      exitTour();
    } else {
      advanceTourStage('next');
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // When tour is paused, show pause banner and landmark details
  if (isTourPaused) {
    return (
      <div
        className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        data-testid="tour-panel"
      >
        <TourPauseBanner
          tourTitle={currentTour.title}
          onResume={resumeTour}
          onExit={exitTour}
        />

        {/* Paused content area with landmark details or empty state */}
        <div className="flex-1 overflow-y-auto">
          {selectedEntity && selectedEntity.type === 'landmark' ? (
            <LandmarkDetailsForPause landmarkId={selectedEntity.id} />
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Explore other landmarks, then click Resume to continue.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200"
      data-testid="tour-panel"
    >
      {/* aria-live region for stage announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Stage {currentTourStageIndex + 1} of {totalStages}: {currentStage.title}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{currentTour.title}</h2>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(currentTour.difficulty)}`}
            >
              {currentTour.difficulty.charAt(0).toUpperCase() + currentTour.difficulty.slice(1)}
            </span>
            <span className="text-sm text-gray-600">{currentTour.estimatedDuration} min</span>
          </div>
        </div>
        <button
          onClick={exitTour}
          className="p-1 hover:bg-gray-100 rounded-lg transition"
          aria-label="Exit tour (press Escape)"
          title="Exit tour (press Escape)"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 pt-4">
        <Progress value={progressPercent} className="h-2 mb-2" />
        <p
          className="text-xs text-gray-600 text-center"
          data-testid="tour-stage-indicator"
        >
          Stage {currentTourStageIndex + 1} of {totalStages}
        </p>
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStage.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{currentStage.description}</p>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
            {currentStage.narration}
          </p>
        </div>

        {/* Landmarks in this stage */}
        {currentStage.landmarkIds && currentStage.landmarkIds.length > 0 && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-900 mb-2">Key Landmarks</p>
            <ul className="text-xs text-blue-800 space-y-1">
              {currentStage.landmarkIds.map((id) => {
                const landmark = landmarks.find((l) => l.id === id);
                return (
                  <li key={id} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0"></span>
                    <span className="truncate">{landmark?.name || id}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousClick}
            disabled={isFirstStage}
            className="flex-1 h-10"
            aria-label="Go to previous stage (press [ key)"
            title="Go to previous stage (press [ key)"
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>
          <Button
            variant="default"
            onClick={handleNextClick}
            className="flex-1 h-10"
            aria-label={isLastStage ? 'Complete tour' : 'Go to next stage (press ] key)'}
            title={isLastStage ? 'Complete tour' : 'Go to next stage (press ] key)'}
          >
            {isLastStage ? 'Complete Tour' : 'Next'}
            {!isLastStage && <ChevronRight size={16} className="ml-2" />}
          </Button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="bg-blue-50 rounded p-2 border border-blue-100">
          <p className="text-xs text-blue-800 text-center space-x-1">
            <span className="inline-block">
              <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono">[</kbd>
            </span>
            <span className="inline-block">Previous</span>
            <span className="inline-block">
              <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono">]</kbd>
            </span>
            <span className="inline-block">Next</span>
            <span className="inline-block">
              <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono">Esc</kbd>
            </span>
            <span className="inline-block">Exit</span>
          </p>
        </div>
      </div>
    </div>
  );
};
