
'use client';

import { useEffect, useState, useCallback } from 'react';
import { LandmarkMarker } from './LandmarkMarker';
import { useProgressiveLandmarkDisclosure } from '@/hooks/useProgressiveLandmarkDisclosure';
import type { Landmark } from '@/types/data';

/**
 * LandmarkMarkersLayer Component
 *
 * Renders landmark markers on the map with progressive disclosure based on zoom level.
 * Fetches landmark data from landmarks.json and manages local selection/hover state.
 * Uses zoom-based filtering to prevent map clutter at low zoom levels.
 *
 * Visible landmarks by zoom:
 * - Z0 (continental): 5 seminal papers
 * - Z1 (archipelago): 12 important papers + models
 * - Z2 (island): all 26 landmarks
 */
export function LandmarkMarkersLayer() {
  const [allLandmarks, setAllLandmarks] = useState<Landmark[]>([]);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string | null>(null);
  const [hoveredLandmarkId, setHoveredLandmarkId] = useState<string | null>(null);

  // Get filtered landmarks based on zoom level
  const visibleLandmarks = useProgressiveLandmarkDisclosure(allLandmarks);

  // Fetch all landmarks data on mount
  useEffect(() => {
    const fetchLandmarks = async () => {
      try {
        const res = await fetch('/data/landmarks.json');
        const data = await res.json();
        setAllLandmarks(data);
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
      {visibleLandmarks.map((landmark) => (
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
