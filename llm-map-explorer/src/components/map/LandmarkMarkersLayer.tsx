
'use client';

import { useEffect, useState, useCallback } from 'react';
import { LandmarkMarker } from './LandmarkMarker';
import type { Landmark } from '@/types/data';

/**
 * LandmarkMarkersLayer Component
 *
 * Renders all landmark markers on the map and manages selection state.
 * Fetches landmark data from landmarks.json and manages local selection/hover state.
 * When a landmark is selected, it triggers a callback to parent component which
 * can update global state for info panel display.
 */
export function LandmarkMarkersLayer() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(null);
  const [hoveredLandmarkId, setHoveredLandmarkId] = useState<string | null>(null);

  // Fetch landmarks data on mount
  useEffect(() => {
    const fetchLandmarks = async () => {
      try {
        const res = await fetch('/data/landmarks.json');
        const data = await res.json();
        setLandmarks(data);
      } catch (error) {
        console.error('Failed to fetch landmarks:', error);
      }
    };
    fetchLandmarks();
  }, []);

  // Handle landmark selection
  const handleSelectLandmark = useCallback((id: string) => {
    setSelectedLandmarkId(id);
    // TODO: Integrate with global store when selectEntity is available
    // This will trigger info panel display in parent components
  }, []);

  // Handle landmark hover
  const handleHoverLandmark = useCallback((id: string | null) => {
    setHoveredLandmarkId(id);
  }, []);

  return (
    <>
      {landmarks.map((landmark) => (
        <LandmarkMarker
          key={landmark.id}
          landmark={landmark}
          isSelected={selectedLandmarkId === landmark.id}
          isDimmed={hoveredLandmarkId !== null && hoveredLandmarkId !== landmark.id}
          onSelect={handleSelectLandmark}
          onHover={handleHoverLandmark}
        />
      ))}
    </>
  );
}
