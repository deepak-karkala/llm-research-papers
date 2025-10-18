import { render, screen, waitFor } from '@testing-library/react';
import { MapContainer } from '@/components/map/MapContainer';
import { vi } from 'vitest';

// Mock Leaflet and React-Leaflet to avoid browser-only APIs during tests.
vi.mock('leaflet', () => ({
  CRS: { Simple: 'CRS_SIMPLE' },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  ImageOverlay: ({ url }: { url: string }) => <div data-testid="image-overlay" data-url={url} />,
}));

describe('MapContainer', () => {
  it('renders without crashing', async () => {
    render(<MapContainer />);
    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument());
    expect(screen.queryByTestId('map-container-loading')).not.toBeInTheDocument();
  });

  it('renders ImageOverlay with correct props', async () => {
    render(<MapContainer />);
    const overlay = await screen.findByTestId('image-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute('data-url', '/images/map-base.png');
  });
});
