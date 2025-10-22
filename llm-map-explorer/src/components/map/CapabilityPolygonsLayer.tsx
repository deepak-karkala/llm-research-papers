// src/components/map/CapabilityPolygonsLayer.tsx
'use client';

import { CapabilityPolygon } from './CapabilityPolygon';
import { useMapStore } from '@/lib/store';
import type { Capability } from '@/types/data';

interface CapabilityPolygonsLayerProps {
  capabilities: Capability[];
}

export function CapabilityPolygonsLayer({ capabilities }: CapabilityPolygonsLayerProps) {
  const { selectEntity, selectedEntity, currentTour, tourHighlights } = useMapStore();

  const handleSelect = (id: string) => {
    selectEntity('capability', id);
  };

  /**
   * Determine if a capability contains landmarks from the current tour stage
   */
  const isCapabilityInCurrentTourStage = (capability: Capability): boolean => {
    if (!currentTour || tourHighlights.current.length === 0) {
      return false;
    }

    // Check if any of this capability's landmarks are in the current stage
    return capability.relatedLandmarks?.some((id) => tourHighlights.current.includes(id)) ?? false;
  };

  return (
    <>
      {capabilities.map((capability) => (
        <CapabilityPolygon
          key={capability.id}
          capability={capability}
          isSelected={selectedEntity?.id === capability.id}
          isInCurrentTourStage={isCapabilityInCurrentTourStage(capability)}
          onSelect={handleSelect}
        />
      ))}
    </>
  );
}