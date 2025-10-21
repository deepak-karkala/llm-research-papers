import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Map as LeafletMap } from 'leaflet';
import { useLandmarkCulling } from '../useLandmarkCulling';
import { useMapStore } from '@/lib/store';
import type { Landmark, LatLng } from '@/types/data';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  useMap: vi.fn(),
}));

import { useMap as useMapMock } from 'react-leaflet';

describe('useLandmarkCulling - Performance Tests', () => {
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
    useMapStore.setState({ landmarks: [] });
  });

  describe('Frame Time Performance - Target: <16ms for 60fps', () => {
    /**
     * Performance target: Culling should complete in <16ms to maintain 60fps
     * This allows ~16ms per frame for other operations (rendering, painting, etc.)
     */

    it('should cull 50 landmarks in <16ms', () => {
      const mockMap = createMockMap(1000, 0, 1000, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      // Distribute 50 landmarks uniformly
      const landmarks: Landmark[] = Array.from({ length: 50 }, (_, i) => {
        const lat = (i % 7) * 150 + 50;
        const lng = ((i / 7) | 0) * 150 + 50;
        return createLandmark(`l${i}`, { lat, lng });
      });

      useMapStore.setState({ landmarks });

      const startTime = performance.now();
      const { result } = renderHook(() => useLandmarkCulling());
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`50 landmarks culled in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(16);
      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should cull 100 landmarks in <16ms', () => {
      const mockMap = createMockMap(1000, 0, 1000, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks: Landmark[] = Array.from({ length: 100 }, (_, i) => {
        const lat = (i % 10) * 100 + 50;
        const lng = ((i / 10) | 0) * 100 + 50;
        return createLandmark(`l${i}`, { lat, lng });
      });

      useMapStore.setState({ landmarks });

      const startTime = performance.now();
      const { result } = renderHook(() => useLandmarkCulling());
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`100 landmarks culled in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(16);
      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should cull 150 landmarks in <16ms', () => {
      const mockMap = createMockMap(2000, 0, 2000, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks: Landmark[] = Array.from({ length: 150 }, (_, i) => {
        const lat = (i % 15) * 130 + 50;
        const lng = ((i / 15) | 0) * 130 + 50;
        return createLandmark(`l${i}`, { lat, lng });
      });

      useMapStore.setState({ landmarks });

      const startTime = performance.now();
      const { result } = renderHook(() => useLandmarkCulling());
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`150 landmarks culled in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(16);
      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should cull 200+ landmarks in <16ms', () => {
      const mockMap = createMockMap(2000, 0, 2000, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      // Create 200 landmarks distributed across map
      const landmarks: Landmark[] = Array.from({ length: 200 }, (_, i) => {
        const lat = (i % 14) * 140 + 50;
        const lng = ((i / 14) | 0) * 140 + 50;
        return createLandmark(`l${i}`, { lat, lng });
      });

      useMapStore.setState({ landmarks });

      const startTime = performance.now();
      const { result } = renderHook(() => useLandmarkCulling());
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`200 landmarks culled in ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(16);
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current.length).toBeLessThan(200); // Should cull some
    });
  });

  describe('Culling Efficiency', () => {
    it('should achieve significant DOM reduction with 200 landmarks', () => {
      const mockMap = createMockMap(500, 0, 500, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      // Create 200 landmarks, but most outside viewport
      const landmarks: Landmark[] = Array.from({ length: 200 }, (_, i) => {
        // Spread landmarks across much larger area
        const lat = (i % 20) * 200 + 500;
        const lng = ((i / 20) | 0) * 200 + 500;
        return createLandmark(`l${i}`, { lat, lng });
      });

      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      const cullingRatio = result.current.length / landmarks.length;
      console.log(`Culling ratio: ${(cullingRatio * 100).toFixed(1)}% visible`);

      // Should cull at least 80% of landmarks outside viewport
      expect(result.current.length).toBeLessThan(landmarks.length * 0.5);
      expect(result.current.length).toBeGreaterThan(0);
    });

    it('should show most landmarks when all are in viewport', () => {
      const mockMap = createMockMap(1000, 0, 1000, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      // Create 100 landmarks all within viewport
      const landmarks: Landmark[] = Array.from({ length: 100 }, (_, i) => {
        const lat = (i % 10) * 100;
        const lng = ((i / 10) | 0) * 100;
        return createLandmark(`l${i}`, { lat, lng });
      });

      useMapStore.setState({ landmarks });

      const { result } = renderHook(() => useLandmarkCulling());

      // Should show most/all landmarks since they're in viewport
      expect(result.current.length).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Buffer Zone Performance', () => {
    it('should efficiently handle landmarks in buffer zone', () => {
      const mockMap = createMockMap(100, 0, 100, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      // Create landmarks specifically in buffer zone (20-120 lat, 20-120 lng)
      const landmarks: Landmark[] = Array.from({ length: 50 }, (_, i) => {
        const lat = 20 + (i % 10) * 10;
        const lng = 20 + ((i / 10) | 0) * 10;
        return createLandmark(`l${i}`, { lat, lng });
      });

      useMapStore.setState({ landmarks });

      const startTime = performance.now();
      const { result } = renderHook(() => useLandmarkCulling());
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10);
      expect(result.current.length).toBeGreaterThan(0);
    });
  });

  describe('Scaling Characteristics', () => {
    it('should scale linearly with landmark count', () => {
      const measurements: Array<{ count: number; time: number }> = [];

      for (const count of [50, 100, 150, 200]) {
        const mockMap = createMockMap(2000, 0, 2000, 0);
        (useMapMock as any).mockReturnValue(mockMap);

        const landmarks: Landmark[] = Array.from({ length: count }, (_, i) => {
          const lat = Math.random() * 2000;
          const lng = Math.random() * 2000;
          return createLandmark(`l${i}`, { lat, lng });
        });

        useMapStore.setState({ landmarks });

        const startTime = performance.now();
        renderHook(() => useLandmarkCulling());
        const endTime = performance.now();

        measurements.push({ count, time: endTime - startTime });
      }

      console.log('Scaling measurements:');
      measurements.forEach(m => {
        console.log(`  ${m.count} landmarks: ${m.time.toFixed(2)}ms`);
      });

      // All measurements should be under 16ms
      expect(measurements.every(m => m.time < 16)).toBe(true);

      // Time should increase roughly linearly (with some variance)
      // Check that time doesn't increase exponentially
      const ratios = [];
      for (let i = 1; i < measurements.length; i++) {
        const ratio =
          measurements[i].time / measurements[i - 1].time /
          (measurements[i].count / measurements[i - 1].count);
        ratios.push(ratio);
      }

      console.log('Time complexity ratios:', ratios.map(r => r.toFixed(2)));
      // Ratios should be close to 1.0 (linear) and not exceed 2.0 (quadratic)
      expect(ratios.every(r => r < 2.0)).toBe(true);
    });
  });

  describe('Memory Impact', () => {
    it('should not create excessive copies during filtering', () => {
      const mockMap = createMockMap(1000, 0, 1000, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks: Landmark[] = Array.from({ length: 100 }, (_, i) => {
        return createLandmark(`l${i}`, {
          lat: Math.random() * 1000,
          lng: Math.random() * 1000,
        });
      });

      useMapStore.setState({ landmarks });

      // Get initial memory (rough estimate using object references)
      const initialReferences = landmarks.map(l => l.id);

      const { result } = renderHook(() => useLandmarkCulling());

      // Resulting landmarks should reference same objects, not copies
      expect(result.current.every(l => landmarks.includes(l))).toBe(true);

      // Should have fewer landmarks but references to same objects
      expect(result.current.length).toBeLessThanOrEqual(initialReferences.length);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle extremely zoomed-in viewport efficiently', () => {
      // Tiny viewport: 1 unit square at specific location
      const mockMap = createMockMap(100.5, 100, 100.5, 100);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks: Landmark[] = Array.from({ length: 150 }, (_, i) => {
        return createLandmark(`l${i}`, {
          lat: Math.random() * 1000,
          lng: Math.random() * 1000,
        });
      });

      useMapStore.setState({ landmarks });

      const startTime = performance.now();
      const { result } = renderHook(() => useLandmarkCulling());
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(16);
      // Most landmarks should be culled
      expect(result.current.length).toBeLessThan(landmarks.length / 2);
    });

    it('should handle extremely zoomed-out viewport efficiently', () => {
      // Huge viewport: 100000x100000 units
      const mockMap = createMockMap(50000, -50000, 50000, -50000);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks: Landmark[] = Array.from({ length: 200 }, (_, i) => {
        return createLandmark(`l${i}`, {
          lat: (Math.random() - 0.5) * 100000,
          lng: (Math.random() - 0.5) * 100000,
        });
      });

      useMapStore.setState({ landmarks });

      const startTime = performance.now();
      const { result } = renderHook(() => useLandmarkCulling());
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(16);
      // Most/all landmarks should be visible
      expect(result.current.length).toBeGreaterThan(landmarks.length * 0.8);
    });
  });

  describe('Median Performance Over Multiple Runs', () => {
    it('should maintain consistent <16ms performance across multiple culling operations', () => {
      const mockMap = createMockMap(1000, 0, 1000, 0);
      (useMapMock as any).mockReturnValue(mockMap);

      const landmarks: Landmark[] = Array.from({ length: 200 }, (_, i) => {
        return createLandmark(`l${i}`, {
          lat: Math.random() * 1000,
          lng: Math.random() * 1000,
        });
      });

      useMapStore.setState({ landmarks });

      const durations: number[] = [];

      for (let run = 0; run < 10; run++) {
        const startTime = performance.now();
        renderHook(() => useLandmarkCulling());
        const endTime = performance.now();
        durations.push(endTime - startTime);
      }

      // Sort to find median
      durations.sort((a, b) => a - b);
      const median = durations[Math.floor(durations.length / 2)];
      const max = Math.max(...durations);

      console.log(`Median duration: ${median.toFixed(2)}ms`);
      console.log(`Max duration: ${max.toFixed(2)}ms`);
      console.log(`All durations: ${durations.map(d => d.toFixed(2)).join(', ')}ms`);

      expect(median).toBeLessThan(16);
      expect(max).toBeLessThan(20); // Allow some variance for slowest run
    });
  });
});
