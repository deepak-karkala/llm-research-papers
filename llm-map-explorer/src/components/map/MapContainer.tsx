'use client';

import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInitializeMapData } from '@/hooks/useInitializeMapData';
import { useProgressiveDisclosure } from '@/hooks/useProgressiveDisclosure';
import { useMapStore } from '@/lib/store';

// Lazy load CapabilityPolygonsLayer to avoid SSR issues
const CapabilityPolygonsLayer = lazy(() =>
  import('./CapabilityPolygonsLayer').then(mod => ({ default: mod.CapabilityPolygonsLayer }))
);

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

function MapEvents() {
  const { useMapEvents } = require('react-leaflet');
  const setCurrentZoom = useMapStore((state) => state.setCurrentZoom);
  const setMapRef = useMapStore((state) => state.setMapRef);

  const map = useMapEvents({
    zoomend: () => {
      setCurrentZoom(map.getZoom());
    },
  });

  useEffect(() => {
    setCurrentZoom(map.getZoom());
    setMapRef(map);
  }, [map, setCurrentZoom, setMapRef]);

  return null;
}

export function MapContainer({ children, className }: MapContainerProps) {
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [leafletComponents, setLeafletComponents] = useState<{
    MapContainer: ReactLeafletModule['MapContainer'];
    ImageOverlay: ReactLeafletModule['ImageOverlay'];
  } | null>(null);

  useInitializeMapData();
  const visibleCapabilities = useProgressiveDisclosure();

  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      const [leafletModule, reactLeafletModule] = await Promise.all([
        import('leaflet'),
        import('react-leaflet'),
      ]);

      if (isMounted) {
        setLeaflet(leafletModule);
        setLeafletComponents({
          MapContainer: reactLeafletModule.MapContainer,
          ImageOverlay: reactLeafletModule.ImageOverlay,
        });
      }
    };

    void loadLeaflet();

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
        <Suspense fallback={null}>
          <CapabilityPolygonsLayer capabilities={visibleCapabilities} />
        </Suspense>
        <MapEvents />
        {children}
      </LeafletMap>
    </div>
  );
}
