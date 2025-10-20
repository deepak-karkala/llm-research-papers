import { render, screen, fireEvent } from '@testing-library/react';
import { CapabilityPolygon } from '@/components/map/CapabilityPolygon';
import { vi } from 'vitest';
import { Capability } from '@/types/data';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  Polygon: ({ positions, pathOptions, eventHandlers }: any) => (
    <div
      data-testid="polygon"
      data-positions={JSON.stringify(positions)}
      data-fill-color={pathOptions.fillColor}
      onClick={(e) => {
        // Mock the Leaflet event structure
        const mockEvent = {
          originalEvent: { stopPropagation: vi.fn() },
          target: { setStyle: vi.fn() },
        };
        eventHandlers?.click(mockEvent);
      }}
      onMouseOver={(e) => {
        const mockEvent = {
          target: { setStyle: vi.fn() },
        };
        eventHandlers?.mouseover(mockEvent);
      }}
      onMouseOut={(e) => {
        const mockEvent = {
          target: { setStyle: vi.fn() },
        };
        eventHandlers?.mouseout(mockEvent);
      }}
    />
  ),
}));

describe('CapabilityPolygon', () => {
  const mockCapability: Capability = {
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
  };

  it('renders without crashing', () => {
    render(
      <CapabilityPolygon
        capability={mockCapability}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByTestId('polygon')).toBeInTheDocument();
  });

  it('converts coordinates to tuples', () => {
    render(
      <CapabilityPolygon
        capability={mockCapability}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    const polygon = screen.getByTestId('polygon');
    const positions = JSON.parse(polygon.getAttribute('data-positions') || '[]');

    expect(positions).toEqual([
      [100, 200],
      [100, 300],
      [200, 300],
      [200, 200],
    ]);
  });

  it('applies correct fill color from visualStyleHints', () => {
    render(
      <CapabilityPolygon
        capability={mockCapability}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );
    const polygon = screen.getByTestId('polygon');
    expect(polygon).toHaveAttribute('data-fill-color', '#1976d2');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(
      <CapabilityPolygon
        capability={mockCapability}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByTestId('polygon'));
    expect(onSelect).toHaveBeenCalledWith('test-capability');
  });
});