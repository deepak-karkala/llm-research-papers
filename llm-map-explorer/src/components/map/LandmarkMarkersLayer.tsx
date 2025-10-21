
'use client';

import { LandmarkMarker } from './LandmarkMarker';
import { useMapStore } from '@/lib/store';
import { useProgressiveLandmarkDisclosure } from '@/hooks/useProgressiveLandmarkDisclosure';
import { useLandmarkCulling } from '@/hooks/useLandmarkCulling';

/**
 * LandmarkMarkersLayer Component
 *
 * Renders landmark markers on the map with two layers of optimization:
 * 1. Progressive disclosure: hides landmarks below zoom threshold
 * 2. Viewport culling: only renders landmarks in visible viewport + 20% buffer
 *
 * This combined approach ensures:
 * - Smooth 60fps performance with 200+ landmarks
 * - Reduced DOM nodes and memory footprint
 * - Seamless panning/zooming without visual artifacts
 *
 * Manages selection state and integrates with Zustand store.
 */
export function LandmarkMarkersLayer() {
  const { selectEntity, selectedEntity } = useMapStore();

  // First layer: Progressive disclosure filtering by zoom level
  const allVisibleLandmarks = useProgressiveLandmarkDisclosure(useMapStore(state => state.landmarks));

  // Second layer: Viewport-based culling (only render visible landmarks)
  const viewportVisibleLandmarks = useLandmarkCulling();

  // Combine both filters: landmarks that pass both criteria
  // We use viewportVisibleLandmarks which has already been filtered by culling,
  // but we still apply progressive disclosure to respect zoom thresholds
  const visibleLandmarks = viewportVisibleLandmarks.filter(landmark =>
    allVisibleLandmarks.some(vl => vl.id === landmark.id)
  );

  const handleSelectLandmark = (id: string) => {
    console.log('[LandmarkMarkersLayer] Selecting landmark:', id);
    selectEntity('landmark', id);
  };

  return (
    <>
      {visibleLandmarks.map((landmark) => (
        <LandmarkMarker
          key={landmark.id}
          landmark={landmark}
          isSelected={selectedEntity?.id === landmark.id}
          onSelect={handleSelectLandmark}
        />
      ))}
    </>
  );
}
