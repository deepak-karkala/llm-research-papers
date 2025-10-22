/**
 * Hook for synchronizing map state with tour progression
 * Handles map fly-to animations and landmark highlighting
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useMapStore } from '@/lib/store';
import type { Tour } from '@/types/data';

interface TourMapSyncOptions {
  /** FlyTo animation duration in milliseconds */
  duration?: number;
  /** Easing factor for animation (0-1, lower = more easing) */
  easeLinearity?: number;
}

const DEFAULT_OPTIONS: TourMapSyncOptions = {
  duration: 1000,
  easeLinearity: 0.25,
};

/**
 * Synchronizes map with tour stage progression
 * Automatically pans and zooms map to stage coordinates
 * Updates landmark highlighting based on tour context
 *
 * @param options Configuration options for map sync behavior
 *
 * @example
 * ```tsx
 * export const MyMap: React.FC = () => {
 *   const { mapRef } = useMapStore();
 *   useTourMapSync({ duration: 1000 });
 *
 *   return (
 *     <MapContainer>
 *       Map content here
 *     </MapContainer>
 *   );
 * };
 * ```
 */
export const useTourMapSync = (options?: TourMapSyncOptions) => {
  const {
    currentTour,
    currentTourStageIndex,
    mapRef,
    updateTourHighlights,
  } = useMapStore();

  // Merge provided options with defaults, memoized to avoid unnecessary effect reruns
  const mergedOptions = useMemo(
    () => ({
      ...DEFAULT_OPTIONS,
      ...options,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options?.duration, options?.easeLinearity]
  );

  /**
   * Update highlight state based on current tour stage
   * Categorizes landmarks as current, previous, or future
   */
  const updateLandmarkHighlighting = useCallback(
    (tour: Tour, stageIndex: number) => {
      const currentStage = tour.stages[stageIndex];
      const previousStage = stageIndex > 0 ? tour.stages[stageIndex - 1] : null;

      // Collect all future stage landmark IDs
      const futureIds = new Set<string>();
      for (let i = stageIndex + 1; i < tour.stages.length; i++) {
        if (tour.stages[i].landmarkIds) {
          tour.stages[i].landmarkIds.forEach((id: string) => futureIds.add(id));
        }
      }

      // Update store with new highlight state
      updateTourHighlights(
        currentStage.landmarkIds || [],
        previousStage?.landmarkIds || [],
        Array.from(futureIds)
      );
    },
    [updateTourHighlights]
  );

  useEffect(() => {
    if (!currentTour || !mapRef) {
      return;
    }

    const stage = currentTour.stages[currentTourStageIndex];
    if (!stage) {
      return;
    }

    // Leaflet flyTo accepts [lat, lng] array or L.LatLng object with methods
    // We use array format for simplicity
    const center: [number, number] = [stage.mapCenter.lat, stage.mapCenter.lng];

    // Animate map to stage coordinates
    try {
      mapRef.flyTo(center, stage.mapZoom, {
        duration: mergedOptions.duration,
        easeLinearity: mergedOptions.easeLinearity,
      });
    } catch (error) {
      console.warn('Map flyTo failed:', error);
    }

    // Update landmark highlighting
    updateLandmarkHighlighting(currentTour, currentTourStageIndex);
  }, [currentTour, currentTourStageIndex, mapRef, mergedOptions, updateTourHighlights, updateLandmarkHighlighting]);
};
