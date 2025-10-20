import { useMemo } from 'react';
import { useMapStore } from '@/lib/store';
import type { Landmark } from '@/types/data';

/**
 * A custom hook that determines which landmarks should be visible
 * based on the current zoom level, implementing progressive disclosure
 * to prevent map clutter.
 *
 * Zoom thresholds for landmarks:
 * - Z0 (0 ≤ zoom < 1): Show only seminal papers (zoomThreshold = -1)
 * - Z1 (1 ≤ zoom < 2): Show seminal papers + important models (zoomThreshold ≤ 0)
 * - Z2 (2 ≤ zoom ≤ 3): Show all landmarks (zoomThreshold ≤ 1)
 *
 * @param landmarks - Array of landmarks to filter
 * @returns Array of landmarks that are visible at the current zoom level
 */
export function useProgressiveLandmarkDisclosure(landmarks: Landmark[]): Landmark[] {
  const currentZoom = useMapStore((state) => state.currentZoom);

  const visibleLandmarks = useMemo(() => {
    // Z0 (Continental): 0 <= zoom < 1
    if (currentZoom < 1) {
      return landmarks.filter((l) => l.zoomThreshold <= -1);
    }

    // Z1 (Archipelago): 1 <= zoom < 2
    if (currentZoom < 2) {
      return landmarks.filter((l) => l.zoomThreshold <= 0);
    }

    // Z2 (Island): 2 <= zoom <= 3
    return landmarks.filter((l) => l.zoomThreshold <= 1);
  }, [landmarks, currentZoom]);

  return visibleLandmarks;
}
