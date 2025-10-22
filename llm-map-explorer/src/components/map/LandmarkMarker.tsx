
'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import type L from 'leaflet';
import type { Landmark } from '@/types/data';
import { useMapStore } from '@/lib/store';

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

interface IconState {
  isSelected: boolean;
  isDimmed: boolean;
  isHighlighted: boolean;
  isCurrentTourLandmark?: boolean;
  isPreviousTourLandmark?: boolean;
  isFutureTourLandmark?: boolean;
  type: Landmark['type'];
  orgColor?: string;
}

/**
 * Creates a custom icon for Leaflet markers
 * Uses DivIcon to support CSS-based visual states and transitions
 * Supports both organization-based and tour-based highlighting
 */
function createLandmarkIcon(
  iconUrl: string,
  iconState: IconState
) {
  const {
    isSelected,
    isDimmed,
    isHighlighted,
    isCurrentTourLandmark = false,
    isPreviousTourLandmark = false,
    isFutureTourLandmark = false,
    type,
    orgColor,
  } = iconState;
  // Dynamic import to avoid SSR issues with Leaflet
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet');

  // Determine visual state styling based on tour or org highlighting
  let opacity: string;
  let scale: string;
  let filter: string;

  if (isCurrentTourLandmark) {
    // Current stage: bright glow effect
    opacity = '1';
    scale = '1.3';
    filter = 'drop-shadow(0 0 10px rgba(59, 130, 246, 1)) drop-shadow(0 0 4px rgba(37, 99, 235, 0.8))';
  } else if (isPreviousTourLandmark) {
    // Previous stage: dimmed appearance
    opacity = '0.4';
    scale = isDimmed ? '0.85' : '1';
    filter = 'grayscale(0.6) opacity(0.6)';
  } else if (isFutureTourLandmark) {
    // Future stage: subtle outline
    opacity = '0.6';
    scale = '1';
    filter = 'drop-shadow(0 0 2px rgba(100, 116, 139, 0.8)) opacity(0.7)';
  } else if (isHighlighted) {
    // Organization highlighting
    opacity = '1';
    scale = '1.2';
    filter = `drop-shadow(0 0 8px ${orgColor || 'rgba(59, 130, 246, 0.6)'})`;
  } else if (isSelected) {
    opacity = '1';
    scale = '1.2';
    filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))';
  } else if (isDimmed) {
    opacity = '0.3';
    scale = '0.85';
    filter = 'grayscale(0.8)';
  } else {
    // Normal state
    opacity = '1';
    scale = '1';
    filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
  }

  // Build class list for highlighting
  const classes = [
    'landmark-marker',
    `landmark-marker-${type}`,
    isHighlighted && 'landmark-marker-highlighted',
    isCurrentTourLandmark && 'landmark-marker-tour-current',
    isPreviousTourLandmark && 'landmark-marker-tour-previous',
    isFutureTourLandmark && 'landmark-marker-tour-future',
    isDimmed && 'landmark-marker-dimmed',
  ]
    .filter(Boolean)
    .join(' ');

  const html = `
    <div class="${classes}"
         style="
           width: 32px;
           height: 32px;
           display: flex;
           align-items: center;
           justify-content: center;
           transform: scale(${scale});
           opacity: ${opacity};
           filter: ${filter};
           transition: transform 200ms ease-in-out, opacity 300ms ease-out, filter 200ms ease-in;
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

  // Get highlighting state from store (both org-based and tour-based)
  const { highlightedLandmarkIds, highlightedOrgId, organizations, tourHighlights } = useMapStore();

  // Determine if this landmark is highlighted by organization
  const isHighlightedByOrg = highlightedLandmarkIds.includes(landmark.id);

  // Determine if this landmark is highlighted by tour
  const isCurrentTourLandmark = tourHighlights.current.includes(landmark.id);
  const isPreviousTourLandmark = tourHighlights.previous.includes(landmark.id);
  const isFutureTourLandmark = tourHighlights.future.includes(landmark.id);
  const isTourHighlighted = isCurrentTourLandmark || isPreviousTourLandmark || isFutureTourLandmark;

  // Determine combined highlighting state
  const isHighlighted = isHighlightedByOrg || isTourHighlighted;

  // If highlighting is active but this landmark is not highlighted, dim it
  // Also support isDimmed prop for backward compatibility
  // Tour highlighting takes precedence over org highlighting for dimming
  const shouldDim = isDimmed || (!isTourHighlighted && tourHighlights.current.length > 0) || (highlightedOrgId !== null && !isHighlighted);

  // Get organization color for highlighted state
  const highlightedOrg = useMemo(
    () => organizations.find((o) => o.id === highlightedOrgId),
    [organizations, highlightedOrgId]
  );
  const orgColor = highlightedOrg?.color;

  // Create accessible label for the landmark
  const ariaLabel = useMemo(() => {
    let label = `${landmark.name} · ${landmark.type} · ${landmark.year} · ${landmark.organization}`;
    if (isHighlighted) {
      label += ` · Highlighted from ${highlightedOrg?.name || 'organization'}`;
    }
    return label;
  }, [landmark.name, landmark.type, landmark.year, landmark.organization, isHighlighted, highlightedOrg?.name]);

  // Create tooltip text
  const tooltipText = useMemo(
    () => `${landmark.name} · ${landmark.type} · ${landmark.year}`,
    [landmark.name, landmark.type, landmark.year]
  );

  // Create icon with proper memoization
  const icon = useMemo(
    () => createLandmarkIcon(iconMap[landmark.type], {
      isSelected,
      isDimmed: shouldDim,
      isHighlighted,
      isCurrentTourLandmark,
      isPreviousTourLandmark,
      isFutureTourLandmark,
      type: landmark.type,
      orgColor,
    }),
    [
      landmark.type,
      isSelected,
      shouldDim,
      isHighlighted,
      isCurrentTourLandmark,
      isPreviousTourLandmark,
      isFutureTourLandmark,
      orgColor,
    ]
  );

  // Memoized event handlers
  const handleClick = useCallback(() => {
    console.log('[LandmarkMarker] Clicked landmark:', landmark.id, landmark.name);
    onSelect(landmark.id);
  }, [landmark.id, onSelect, landmark.name]);

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
