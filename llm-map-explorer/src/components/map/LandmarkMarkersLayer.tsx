
'use client';

import { LandmarkMarker } from './LandmarkMarker';
import { useMapStore } from '@/lib/store';
import { useProgressiveLandmarkDisclosure } from '@/hooks/useProgressiveLandmarkDisclosure';

/**
 * LandmarkMarkersLayer Component
 *
 * Renders landmark markers on the map with progressive disclosure based on zoom level.
 * Manages selection state and integrates with Zustand store.
 */
export function LandmarkMarkersLayer() {
  const { landmarks, selectEntity, selectedEntity } = useMapStore();

  // Apply progressive disclosure filtering
  const visibleLandmarks = useProgressiveLandmarkDisclosure(landmarks);

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
