// src/components/map/CapabilityPolygonsLayer.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Capability } from '@/types/data';

// Dynamically import CapabilityPolygon to avoid SSR issues
import dynamic from 'next/dynamic';

const CapabilityPolygon = dynamic(
  () => import('./CapabilityPolygon').then((mod) => mod.CapabilityPolygon),
  { ssr: false }
);

interface CapabilityPolygonsLayerProps {
  capabilities: Capability[];
}

export function CapabilityPolygonsLayer({ capabilities }: CapabilityPolygonsLayerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Placeholder: Zustand store integration in future story
  const selectedEntityId = null;
  const handleSelect = (id: string) => {
    console.log('Selected capability:', id);
    // Future: selectEntity(id, 'capability')
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      {capabilities.map((capability) => (
        <CapabilityPolygon
          key={capability.id}
          capability={capability}
          isSelected={selectedEntityId === capability.id}
          onSelect={handleSelect}
        />
      ))}
    </>
  );
}