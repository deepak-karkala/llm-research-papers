import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { Map as LeafletMap } from 'leaflet';
import { useLandmarkCulling } from '../useLandmarkCulling';
import { useMapStore } from '@/lib/store';
import type { Landmark, LatLng } from '@/types/data';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  useMap: vi.fn(),
}));

import { useMap as useMapMock } from 'react-leaflet';

describe('useLandmarkCulling', () => {
  const createLandmark = (
    id: string,
    coordinates: LatLng,
    name = `Landmark ${id}`
  ): Landmark => ({
    id,
    name,
    type: 'paper',
    year: 2024,
    organization: 'Test Org',
    description: 'Test landmark',
    externalLinks: [],
    coordinates,
    capabilityId: 'test-cap',
    relatedLandmarks: [],
    tags: ['test'],
    zoomThreshold: 0,
  });

  const createMockMap = (
    north: number,
    south: number,
    east: number,
    west: number
  ): Partial<LeafletMap> => {
    const ne = { lat: north, lng: east };
    const sw = { lat: south, lng: west };
    const bounds = {
      getNorthEast: vi.fn(() => ne),
      getSouthWest: vi.fn(() => sw),
    };

    return {
      getBounds: vi.fn(() => bounds),
      on: vi.fn(),
      off: vi.fn(),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useMapStore.setState({
      landmarks: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return empty array when map is not initialized', () => {
      (useMapMock as any).mockReturnValue(null);
      useMapStore.setState({ landmarks: [] });

      const { result } = renderHook(() => useLandmarkCulling());

      expect(result.current).toEqual([]);
    });

    it('should return all landmarks when map is not ready', async () => {
      (useMapMock as any).mockReturnValue(null);

      const landmarks = [
        createLandmark('l1', { lat: 0, lng: 0 }),
        createLandmark('l2', { lat: 10, lng: 10 }),
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      // Wait for initial calculation to complete
      await waitFor(() => {
        expect(result.current).toHaveLength(landmarks.length);
      });
    });

    it('should return all landmarks when they are all within viewport', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks = [
        createLandmark('l1', { lat: 50, lng: 50 }),
        createLandmark('l2', { lat: 25, lng: 75 }),
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      act(() => {
        // Trigger initial calculation
      });

      expect(result.current).toHaveLength(2);
      expect(result.current.map(l => l.id)).toEqual(['l1', 'l2']);
    });

    it('should cull landmarks outside the viewport', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks = [
        createLandmark('l1', { lat: 50, lng: 50 }), // Inside
        createLandmark('l2', { lat: 150, lng: 150 }), // Outside
        createLandmark('l3', { lat: 25, lng: 25 }), // Inside
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      expect(result.current).toHaveLength(2);
      expect(result.current.map(l => l.id)).toEqual(['l1', 'l3']);
    });

    it('should include landmarks in the 20% buffer zone', () => {
      // Viewport: lat 0-100, lng 0-100
      // Buffer: lat -20 to 120, lng -20 to 120
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks = [
        createLandmark('l1', { lat: 50, lng: 50 }), // Inside viewport
        createLandmark('l2', { lat: -10, lng: 50 }), // In buffer (south)
        createLandmark('l3', { lat: 110, lng: 50 }), // In buffer (north)
        createLandmark('l4', { lat: 50, lng: -10 }), // In buffer (west)
        createLandmark('l5', { lat: 50, lng: 110 }), // In buffer (east)
        createLandmark('l6', { lat: -30, lng: 50 }), // Outside buffer
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      expect(result.current).toHaveLength(5);
      expect(result.current.map(l => l.id)).toEqual(['l1', 'l2', 'l3', 'l4', 'l5']);
    });
  });

  describe('Buffer Calculation', () => {
    it('should apply 20% buffer correctly', () => {
      // Viewport: 0-100 lat, 0-100 lng (100 unit range each)
      // 20% buffer: 20 units on each side
      // Expected buffer bounds: -20 to 120 for both lat and lng
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks = [
        createLandmark('edge', { lat: -20, lng: 0 }), // Exactly at buffer edge
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      // Should include landmarks at buffer edge
      expect(result.current).toHaveLength(1);
    });

    it('should handle negative coordinates in buffer calculation', async () => {
      // Viewport: -50 to 50 lat, -50 to 50 lng
      // 20% buffer: 40 units on each side
      // Expected buffer bounds: -90 to 90 for both
      const mockMap = createMockMap(50, -50, 50, -50);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks = [
        createLandmark('l1', { lat: 0, lng: 0 }), // Center
        createLandmark('l2', { lat: -75, lng: -75 }), // In buffer
        createLandmark('l3', { lat: -95, lng: 0 }), // Outside buffer
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      await waitFor(() => {
        expect(result.current).toHaveLength(2);
        expect(result.current.map(l => l.id)).toEqual(['l1', 'l2']);
      });
    });

    it('should handle small viewport areas', () => {
      // Very small viewport: 1x1 unit
      // 20% buffer: 0.2 units
      const mockMap = createMockMap(0.5, -0.5, 0.5, -0.5);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks = [
        createLandmark('l1', { lat: 0, lng: 0 }), // Center
        createLandmark('l2', { lat: 0.6, lng: 0 }), // Just inside buffer
        createLandmark('l3', { lat: 1, lng: 0 }), // Outside buffer
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      expect(result.current).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty landmarks array', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);
      useMapStore.setState({ landmarks: [] });

      const { result } = renderHook(() => useLandmarkCulling());

      expect(result.current).toEqual([]);
    });

    it('should handle landmarks with missing coordinates', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarkWithoutCoords: Landmark = {
        ...createLandmark('l1', { lat: 50, lng: 50 }),
        coordinates: undefined as any,
      };

      const landmarks = [
        createLandmark('l1', { lat: 50, lng: 50 }),
        landmarkWithoutCoords,
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      expect(result.current).toHaveLength(1);
      expect(result.current[0].id).toBe('l1');
    });

    it('should handle landmarks exactly on viewport boundaries', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks = [
        createLandmark('l1', { lat: 100, lng: 100 }), // NE corner
        createLandmark('l2', { lat: 0, lng: 0 }), // SW corner
        createLandmark('l3', { lat: 100, lng: 0 }), // NW corner
        createLandmark('l4', { lat: 0, lng: 100 }), // SE corner
      ];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      // All boundaries should be inclusive
      expect(result.current).toHaveLength(4);
    });

    it('should handle map getBounds error gracefully', () => {
      const mockMap = {
        getBounds: vi.fn(() => {
          throw new Error('getBounds failed');
        }),
        on: vi.fn(),
        off: vi.fn(),
      };
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks = [createLandmark('l1', { lat: 50, lng: 50 })];
      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      // Should return all landmarks if bounds calculation fails
      expect(result.current).toHaveLength(1);
    });
  });

  describe('Landmark Updates', () => {
    it('should update visible landmarks when new landmarks are added', async () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const initialLandmarks = [createLandmark('l1', { lat: 50, lng: 50 })];
      useMapStore.setState({ landmarks: initialLandmarks });

      const { result, rerender } = renderHook(() => useLandmarkCulling());

      expect(result.current).toHaveLength(1);

      // Add a new landmark
      const newLandmarks = [
        ...initialLandmarks,
        createLandmark('l2', { lat: 75, lng: 75 }),
      ];
      act(() => {
        useMapStore.setState({ landmarks: newLandmarks });
      });

      rerender();

      await waitFor(() => {
        expect(result.current).toHaveLength(2);
      });
    });

    it('should update visible landmarks when landmarks move out of viewport', async () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const initialLandmarks = [
        createLandmark('l1', { lat: 50, lng: 50 }),
        createLandmark('l2', { lat: 150, lng: 150 }),
      ];
      useMapStore.setState({ landmarks: initialLandmarks });

      const { result, rerender } = renderHook(() => useLandmarkCulling());

      expect(result.current).toHaveLength(1);

      // Simulate a new map bounds
      const newMockMap = createMockMap(200, 100, 200, 100);
      (useMapMock as any).mockReturnValue(newMockMap);

      rerender();

      // Should now show the second landmark
      await waitFor(() => {
        expect(result.current).toHaveLength(1);
      });
    });
  });

  describe('Map Events', () => {
    it('should setup moveend and zoomend listeners', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      const onSpy = vi.fn();
      mockMap.on = onSpy;
      (useMapMock as any).mockReturnValue(mockMap);

      useMapStore.setState({
        landmarks: [createLandmark('l1', { lat: 50, lng: 50 })],
      });

      renderHook(() => useLandmarkCulling());

      expect(onSpy).toHaveBeenCalledWith('moveend', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('zoomend', expect.any(Function));
    });

    it('should cleanup event listeners on unmount', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      const offSpy = vi.fn();
      mockMap.off = offSpy;
      (useMapMock as any).mockReturnValue(mockMap);

      useMapStore.setState({
        landmarks: [createLandmark('l1', { lat: 50, lng: 50 })],
      });

      const { unmount } = renderHook(() => useLandmarkCulling());

      unmount();

      expect(offSpy).toHaveBeenCalledWith('moveend', expect.any(Function));
      expect(offSpy).toHaveBeenCalledWith('zoomend', expect.any(Function));
    });
  });

  describe('Performance', () => {
    it('should handle large number of landmarks efficiently', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      // Create 200 landmarks
      const landmarks: Landmark[] = Array.from({ length: 200 }, (_, i) => {
        const lat = (i % 10) * 10;
        const lng = ((i / 10) | 0) * 10;
        return createLandmark(`l${i}`, { lat, lng });
      });

      useMapStore.setState({ landmarks });

      const startTime = performance.now();
      const { result } = renderHook(() => useLandmarkCulling());
      const endTime = performance.now();

      // Initial calculation should be fast (< 50ms for 200 landmarks)
      expect(endTime - startTime).toBeLessThan(50);

      // Should return a reasonable subset (some landmarks in viewport + buffer)
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current.length).toBeLessThan(200);
    });

    it('should maintain consistent performance with repeated culling', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks: Landmark[] = Array.from({ length: 150 }, (_, i) => {
        return createLandmark(`l${i}`, {
          lat: Math.random() * 100,
          lng: Math.random() * 100,
        });
      });

      useMapStore.setState({ landmarks });

      const timings: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        renderHook(() => useLandmarkCulling());
        const endTime = performance.now();
        timings.push(endTime - startTime);
      }

      // Each call should be consistently fast
      expect(timings.every(t => t < 50)).toBe(true);
    });
  });
});
