
'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Landmark } from '@/types/data';

/**
 * Props for LandmarkMarker component
 */
interface LandmarkMarkerProps {
  /** Landmark data to display */
  landmark: Landmark;
  /** Whether the marker is currently selected */
  isSelected: boolean;
  /** Whether the marker is dimmed (e.g., during filtering) */
  isDimmed?: boolean;
  /** Callback fired when marker is clicked */
  onSelect: (id: string) => void;
  /** Callback fired when marker is hovered */
  onHover?: (id: string | null) => void;
}

/**
 * Icon URL mapping by landmark type
 * - Lighthouse: Papers (information beacons)
 * - Ship: Models (carries knowledge)
 * - Wrench: Tools (utility, implementation)
 * - Target: Benchmarks (achievement milestones)
 */
const iconMap: Record<Landmark['type'], string> = {
  paper: '/icons/landmarks/lighthouse.svg',
  model: '/icons/landmarks/ship.svg',
  tool: '/icons/landmarks/wrench.svg',
  benchmark: '/icons/landmarks/target.svg',
};

/**
 * Creates a custom icon for Leaflet markers
 * Uses DivIcon to support CSS-based visual states and transitions
 */
function createLandmarkIcon(
  iconUrl: string,
  isSelected: boolean,
  isDimmed: boolean,
  type: Landmark['type']
): L.DivIcon {
  // Determine visual state styling
  const opacity = isDimmed ? '0.4' : '1';
  const scale = isDimmed ? '0.85' : isSelected ? '1.2' : '1';
  const filter = isSelected
    ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))'
    : isDimmed
      ? 'grayscale(0.6) opacity(0.5)'
      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';

  const html = `
    <div class="landmark-marker landmark-marker-${type}"
         style="
           width: 32px;
           height: 32px;
           display: flex;
           align-items: center;
           justify-content: center;
           transform: scale(${scale});
           opacity: ${opacity};
           filter: ${filter};
           transition: transform 200ms ease-in-out, opacity 200ms ease-in-out, filter 200ms ease-in-out;
           cursor: pointer;
           position: relative;
         ">
      <img src="${iconUrl}"
           alt="${type}"
           style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;" />
    </div>
  `;

  return new L.DivIcon({
    html,
    className: '', // Clear default Leaflet classes
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
}

/**
 * LandmarkMarker Component
 *
 * Renders an interactive marker for a landmark on the map with:
 * - Custom icon based on landmark type
 * - Click handler to select/show info panel
 * - Hover tooltip with landmark metadata
 * - Visual states (normal, hover, selected, dimmed)
 * - Full accessibility support (keyboard, ARIA labels)
 * - Proper memoization to prevent unnecessary re-renders
 */
export const LandmarkMarker = React.memo(function LandmarkMarker({
  landmark,
  isSelected,
  isDimmed = false,
  onSelect,
  onHover,
}: LandmarkMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  // Create accessible label for the landmark
  const ariaLabel = useMemo(
    () => `${landmark.name} · ${landmark.type} · ${landmark.year} · ${landmark.organization}`,
    [landmark.name, landmark.type, landmark.year, landmark.organization]
  );

  // Create tooltip text
  const tooltipText = useMemo(
    () => `${landmark.name} · ${landmark.type} · ${landmark.year}`,
    [landmark.name, landmark.type, landmark.year]
  );

  // Create icon with proper memoization
  const icon = useMemo(
    () => createLandmarkIcon(
      iconMap[landmark.type],
      isSelected,
      isDimmed,
      landmark.type
    ),
    [landmark.type, isSelected, isDimmed]
  );

  // Memoized event handlers
  const handleClick = useCallback(() => {
    onSelect(landmark.id);
  }, [landmark.id, onSelect]);

  const handleMouseEnter = useCallback(() => {
    onHover?.(landmark.id);
  }, [landmark.id, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover?.(null);
  }, [onHover]);

  // Keyboard handler for accessibility
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(landmark.id);
    }
  }, [landmark.id, onSelect]);

  // Setup keyboard event listener
  useEffect(() => {
    const elem = markerRef.current?.getElement();
    if (elem) {
      elem.addEventListener('keydown', handleKeyDown);
      return () => elem.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  const eventHandlers = useMemo(() => ({
    click: handleClick,
    mouseenter: handleMouseEnter,
    mouseleave: handleMouseLeave,
  }), [handleClick, handleMouseEnter, handleMouseLeave]);

  return (
    <Marker
      ref={markerRef}
      position={[landmark.coordinates.lat, landmark.coordinates.lng]}
      icon={icon}
      eventHandlers={eventHandlers}
      title={ariaLabel}
    >
      <Tooltip
        permanent={false}
        interactive={false}
        direction="top"
        offset={[0, -10]}
        opacity={0.95}
      >
        <div className="text-sm font-medium whitespace-nowrap">
          {tooltipText}
        </div>
      </Tooltip>
    </Marker>
  );
});

LandmarkMarker.displayName = 'LandmarkMarker';
