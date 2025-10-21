// src/components/map/CapabilityPolygonsLayer.tsx
'use client';

import { CapabilityPolygon } from './CapabilityPolygon';
import { useMapStore } from '@/lib/store';
import type { Capability } from '@/types/data';

interface CapabilityPolygonsLayerProps {
  capabilities: Capability[];
}

export function CapabilityPolygonsLayer({ capabilities }: CapabilityPolygonsLayerProps) {
  const { selectEntity, selectedEntity } = useMapStore();

  const handleSelect = (id: string) => {
    selectEntity('capability', id);
  };

  return (
    <>
      {capabilities.map((capability) => (
        <CapabilityPolygon
          key={capability.id}
          capability={capability}
          isSelected={selectedEntity?.id === capability.id}
          onSelect={handleSelect}
        />
      ))}
    </>
  );
}