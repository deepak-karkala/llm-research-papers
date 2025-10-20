import dynamicImport from 'next/dynamic';

// Skip static generation since MapContainer requires browser APIs
export const dynamic = 'force-dynamic';

// Dynamically import MapContainer to avoid SSR issues with Leaflet
const MapContainer = dynamicImport(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <MapContainer />
    </main>
  );
}
