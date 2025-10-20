'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CapabilityPolygonsLayer } from './CapabilityPolygonsLayer';
import type { Capability } from '@/types/data';

type LeafletModule = typeof import('leaflet');
type ReactLeafletModule = typeof import('react-leaflet');

const MAP_WIDTH = 4096;
const MAP_HEIGHT = 3072;
const MAP_BOUNDS: LatLngBoundsExpression = [
  [0, 0],
  [MAP_HEIGHT, MAP_WIDTH],
];

interface MapContainerProps {
  children?: ReactNode;
  className?: string;
}

export function MapContainer({ children, className }: MapContainerProps) {
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [leafletComponents, setLeafletComponents] = useState<{
    MapContainer: ReactLeafletModule['MapContainer'];
    ImageOverlay: ReactLeafletModule['ImageOverlay'];
  } | null>(null);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Only proceed if window is available (client-side)
        if (typeof window === 'undefined') {
          return;
        }

        const [leafletModule, reactLeafletModule, capabilitiesRes] = await Promise.all([
          import('leaflet'),
          import('react-leaflet'),
          fetch('/data/capabilities.json'),
        ]);

        if (!isMounted) {
          return;
        }

        const capabilitiesData = await capabilitiesRes.json();

        setLeaflet(leafletModule);
        setLeafletComponents({
          MapContainer: reactLeafletModule.MapContainer,
          ImageOverlay: reactLeafletModule.ImageOverlay,
        });
        setCapabilities(capabilitiesData as Capability[]);
      } catch {
        // Silently fail in tests - mocks will provide data
        if (isMounted) {
          setCapabilities([]);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const center = useMemo(() => [MAP_HEIGHT / 2, MAP_WIDTH / 2] as [number, number], []);

  if (!leaflet || !leafletComponents) {
    return <div className={cn('h-screen w-full', className)} data-testid="map-container-loading" />;
  }

  const { MapContainer: LeafletMap, ImageOverlay } = leafletComponents;

  return (
    <div
      className={cn('h-screen w-full', className)}
      role="application"
      aria-label="Interactive LLM Research Map"
      aria-describedby="map-instructions"
      tabIndex={0}
    >
      <div id="map-instructions" className="sr-only">
        Navigate the map using arrow keys to pan, plus and minus keys to zoom.
        Press Tab to focus on landmarks, Enter to view details.
      </div>
      <LeafletMap
        crs={leaflet.CRS.Simple}
        bounds={MAP_BOUNDS}
        maxBounds={MAP_BOUNDS}
        minZoom={-1}
        maxZoom={2}
        zoom={-1}
        center={center}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        keyboard={true}
      >
        <ImageOverlay url="/images/map-base.png" bounds={MAP_BOUNDS} />
        <CapabilityPolygonsLayer capabilities={capabilities} />
        {children}
      </LeafletMap>
    </div>
  );
}
