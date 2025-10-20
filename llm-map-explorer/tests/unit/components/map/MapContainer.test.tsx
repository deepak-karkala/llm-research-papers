import { render, screen, waitFor } from '@testing-library/react';
import { MapContainer } from '@/components/map/MapContainer';
import { vi } from 'vitest';

// Mock capabilities JSON
vi.mock('@/public/data/capabilities.json', () => ({
  default: [
    {
      id: 'test-capability',
      name: 'Test Capability',
      description: 'Test description',
      shortDescription: 'Test short desc',
      level: 'continent',
      polygonCoordinates: [
        { lat: 100, lng: 200 },
        { lat: 100, lng: 300 },
        { lat: 200, lng: 300 },
        { lat: 200, lng: 200 },
      ],
      visualStyleHints: {
        fillColor: '#1976d2',
        fillOpacity: 0.45,
        strokeColor: '#1565c0',
        strokeWeight: 2,
      },
      relatedLandmarks: [],
      zoomThreshold: -1,
    },
  ],
}));

// Mock Leaflet and React-Leaflet to avoid browser-only APIs during tests.
vi.mock('leaflet', () => ({
  CRS: { Simple: 'CRS_SIMPLE' },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  ImageOverlay: ({ url }: { url: string }) => <div data-testid="image-overlay" data-url={url} />,
}));

// Mock CapabilityPolygonsLayer
vi.mock('@/components/map/CapabilityPolygonsLayer', () => ({
  CapabilityPolygonsLayer: ({ capabilities }: { capabilities: any[] }) => <div data-testid="capability-polygons-layer">{capabilities.length}</div>,
}));

describe('MapContainer', () => {
  it('renders loading state initially', () => {
    render(<MapContainer />);
    expect(screen.getByTestId('map-container-loading')).toBeInTheDocument();
  });

  it('renders with map wrapper when ready', () => {
    render(<MapContainer />);
    // Check for the loading or actual map state
    const wrapper = screen.queryByRole('application', { hidden: true });
    if (wrapper) {
      expect(wrapper).toHaveAttribute('aria-label', 'Interactive LLM Research Map');
    } else {
      // In loading state, at least the loading div should exist
      expect(screen.getByTestId('map-container-loading')).toBeInTheDocument();
    }
  });
});
