// src/app/page.tsx
import MapViewer from '@/components/map/MapViewer'; // Adjust path if necessary

export default function HomePage() {
  return (
    <main style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      <MapViewer />
    </main>
  );
}
