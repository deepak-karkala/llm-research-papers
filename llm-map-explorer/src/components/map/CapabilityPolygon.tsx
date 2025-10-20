// src/components/map/CapabilityPolygon.tsx
'use client';

import React, { useMemo, useCallback } from 'react';
import { Polygon } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import type { Capability } from '@/types/data';

interface CapabilityPolygonProps {
  capability: Capability;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const CapabilityPolygon = React.memo(({
  capability,
  isSelected,
  onSelect,
}: CapabilityPolygonProps) => {
  // Convert LatLng[] to [number, number][] for React-Leaflet
  const positions = useMemo(
    () => capability.polygonCoordinates.map((coord) => [coord.lat, coord.lng] as [number, number]),
    [capability.polygonCoordinates]
  );

  // Base path options from visualStyleHints
  const basePathOptions = useMemo(() => ({
    fillColor: capability.visualStyleHints.fillColor,
    fillOpacity: capability.visualStyleHints.fillOpacity,
    color: capability.visualStyleHints.strokeColor,
    weight: capability.visualStyleHints.strokeWeight,
    fillRule: 'evenodd' as const,
  }), [capability.visualStyleHints]);

  // Enhanced path options for selected state
  const pathOptions = useMemo(() => {
    if (isSelected) {
      return {
        ...basePathOptions,
        fillOpacity: basePathOptions.fillOpacity + 0.2,
        weight: 4,
        dashArray: '5, 10',
        color: '#1976d2',
      };
    }
    return basePathOptions;
  }, [basePathOptions, isSelected]);

  // Event handlers
  const handleClick = useCallback((e: LeafletMouseEvent) => {
    e.originalEvent.stopPropagation();
    onSelect(capability.id);
  }, [capability.id, onSelect]);

  const handleMouseOver = useCallback((e: LeafletMouseEvent) => {
    const layer = e.target;
    layer.setStyle({
      fillOpacity: capability.visualStyleHints.fillOpacity + 0.15,
      weight: 3,
    });
  }, [capability.visualStyleHints.fillOpacity]);

  const handleMouseOut = useCallback((e: LeafletMouseEvent) => {
    if (!isSelected) {
      const layer = e.target;
      layer.setStyle({
        fillOpacity: capability.visualStyleHints.fillOpacity,
        weight: capability.visualStyleHints.strokeWeight,
      });
    }
  }, [capability.visualStyleHints, isSelected]);

  const eventHandlers = useMemo(() => ({
    click: handleClick,
    mouseover: handleMouseOver,
    mouseout: handleMouseOut,
  }), [handleClick, handleMouseOver, handleMouseOut]);

  return (
    <Polygon
      positions={positions}
      pathOptions={pathOptions}
      eventHandlers={eventHandlers}
    />
  );
});

CapabilityPolygon.displayName = 'CapabilityPolygon';