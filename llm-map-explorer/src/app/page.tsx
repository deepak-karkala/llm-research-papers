import dynamic from 'next/dynamic';

// Dynamically import MapContainer to avoid SSR issues with Leaflet
const MapContainer = dynamic(
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
