import dynamicImport from 'next/dynamic';

// Skip static generation since MapContainer requires browser APIs
export const dynamic = 'force-dynamic';

// Dynamically import all map-related components to avoid SSR issues with Leaflet
const MapContainer = dynamicImport(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  { ssr: false }
);

// Dynamically import LandmarkMarkersLayer to avoid SSR issues
const LandmarkMarkersLayer = dynamicImport(
  () => import('@/components/map/LandmarkMarkersLayer').then((mod) => mod.LandmarkMarkersLayer),
  { ssr: false }
);

// Dynamically import InfoPanel to avoid SSR issues (uses browser APIs)
const InfoPanel = dynamicImport(
  () => import('@/components/panels/InfoPanel').then((mod) => mod.InfoPanel),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="flex h-screen w-screen">
      {/* Map on left - takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <MapContainer>
          <LandmarkMarkersLayer />
        </MapContainer>
      </div>

      {/* Info panel on right - fixed width, persistent on desktop, responsive on mobile */}
      <div className="hidden lg:flex w-96 border-l bg-background flex-col overflow-hidden">
        <InfoPanel variant="persistent" />
      </div>

      {/* Mobile bottom sheet - shown on small screens when entity selected */}
      <div className="lg:hidden">
        <InfoPanel variant="mobile" />
      </div>
    </main>
  );
}
