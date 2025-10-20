import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProgressiveLandmarkDisclosure } from '@/hooks/useProgressiveLandmarkDisclosure';
import * as storeModule from '@/lib/store';
import type { Landmark } from '@/types/data';

// Mock the store
vi.mock('@/lib/store', () => ({
  useMapStore: vi.fn(),
}));

describe('useProgressiveLandmarkDisclosure', () => {
  const mockLandmark = (id: string, zoomThreshold: number): Landmark => ({
    id,
    name: `Landmark ${id}`,
    type: 'paper',
    year: 2020,
    organization: 'Test Org',
    description: 'Test description',
    externalLinks: [],
    coordinates: { lat: 0, lng: 0 },
    capabilityId: 'test-capability',
    relatedLandmarks: [],
    tags: [],
    zoomThreshold,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Z0 (Continental): zoom < 1', () => {
    it('should show only landmarks with zoomThreshold <= -1', () => {
      const landmarks = [
        mockLandmark('l1', -1), // Show in Z0
        mockLandmark('l2', 0),  // Hide in Z0
        mockLandmark('l3', 1),  // Hide in Z0
        mockLandmark('l4', -1), // Show in Z0
      ];

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
      } as any);

      const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));

      expect(result.current).toHaveLength(2);
      expect(result.current.map((l) => l.id)).toEqual(['l1', 'l4']);
    });

    it('should show 5 seminal papers at continental zoom', () => {
      const semnialPapers = [
        mockLandmark('attention', -1),  // Attention Is All You Need
        mockLandmark('bert', -1),       // BERT
        mockLandmark('gpt3', -1),       // GPT-3
        mockLandmark('instruct-gpt', -1), // InstructGPT
        mockLandmark('lora', -1),       // LoRA
      ];

      const otherLandmarks = [
        mockLandmark('gpt2', 0),
        mockLandmark('flan', 0),
        mockLandmark('llama', 0),
      ];

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0.5,
      } as any);

      const { result } = renderHook(() =>
        useProgressiveLandmarkDisclosure([...semnialPapers, ...otherLandmarks])
      );

      expect(result.current).toHaveLength(5);
      expect(result.current.every((l) => l.zoomThreshold === -1)).toBe(true);
    });
  });

  describe('Z1 (Archipelago): 1 <= zoom < 2', () => {
    it('should show landmarks with zoomThreshold <= 0', () => {
      const landmarks = [
        mockLandmark('l1', -1), // Show (Z0 papers)
        mockLandmark('l2', 0),  // Show (Z1 models)
        mockLandmark('l3', 1),  // Hide (Z2 only)
        mockLandmark('l4', -1), // Show (Z0 papers)
        mockLandmark('l5', 0),  // Show (Z1 models)
      ];

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1.5,
      } as any);

      const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));

      expect(result.current).toHaveLength(4);
      expect(result.current.map((l) => l.id)).toEqual(['l1', 'l2', 'l4', 'l5']);
    });

    it('should show approximately 12 landmarks at archipelago zoom', () => {
      const z0Landmarks = Array.from({ length: 5 }, (_, i) =>
        mockLandmark(`z0-${i}`, -1)
      );
      const z1Landmarks = Array.from({ length: 7 }, (_, i) =>
        mockLandmark(`z1-${i}`, 0)
      );
      const z2Landmarks = Array.from({ length: 14 }, (_, i) =>
        mockLandmark(`z2-${i}`, 1)
      );

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1,
      } as any);

      const { result } = renderHook(() =>
        useProgressiveLandmarkDisclosure([...z0Landmarks, ...z1Landmarks, ...z2Landmarks])
      );

      expect(result.current).toHaveLength(12);
    });
  });

  describe('Z2 (Island): 2 <= zoom <= 3', () => {
    it('should show all landmarks with zoomThreshold <= 1', () => {
      const landmarks = [
        mockLandmark('l1', -1), // Show
        mockLandmark('l2', 0),  // Show
        mockLandmark('l3', 1),  // Show
        mockLandmark('l4', 2),  // Hide (not in current threshold logic)
      ];

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 2.5,
      } as any);

      const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));

      expect(result.current).toHaveLength(3);
      expect(result.current.map((l) => l.id)).toEqual(['l1', 'l2', 'l3']);
    });

    it('should show all 26 landmarks at island zoom', () => {
      const allLandmarks = Array.from({ length: 26 }, (_, i) => {
        const threshold = i < 5 ? -1 : i < 17 ? 0 : 1;
        return mockLandmark(`landmark-${i + 1}`, threshold);
      });

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 3,
      } as any);

      const { result } = renderHook(() => useProgressiveLandmarkDisclosure(allLandmarks));

      expect(result.current).toHaveLength(26);
    });
  });

  describe('Zoom Level Thresholds', () => {
    it('should hide landmarks as user zooms out from Z2 to Z0', () => {
      const landmarks = [
        mockLandmark('z0', -1),
        mockLandmark('z1', 0),
        mockLandmark('z2', 1),
      ];

      const zoomLevels = [2.5, 1.5, 0.5];
      const expectedCounts = [3, 2, 1]; // Z2: all, Z1: z0+z1, Z0: z0 only

      zoomLevels.forEach((zoom, idx) => {
        vi.mocked(storeModule.useMapStore).mockReturnValue({
          currentZoom: zoom,
        } as any);

        const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));
        expect(result.current).toHaveLength(expectedCounts[idx]);
      });
    });

    it('should show landmarks as user zooms in from Z0 to Z2', () => {
      const landmarks = [
        mockLandmark('z0', -1),
        mockLandmark('z1', 0),
        mockLandmark('z2', 1),
      ];

      const zoomLevels = [0.5, 1.5, 2.5];
      const expectedCounts = [1, 2, 3]; // Z0: z0 only, Z1: z0+z1, Z2: all

      zoomLevels.forEach((zoom, idx) => {
        vi.mocked(storeModule.useMapStore).mockReturnValue({
          currentZoom: zoom,
        } as any);

        const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));
        expect(result.current).toHaveLength(expectedCounts[idx]);
      });
    });

    it('should handle edge cases at zoom boundaries', () => {
      const landmarks = [
        mockLandmark('z0', -1),
        mockLandmark('z1', 0),
        mockLandmark('z2', 1),
      ];

      // Test at exact boundary points
      const boundaryZooms = [
        { zoom: 0.99, expected: 1 }, // Just before Z1
        { zoom: 1.0, expected: 2 },  // Exactly Z1
        { zoom: 1.99, expected: 2 }, // Just before Z2
        { zoom: 2.0, expected: 3 },  // Exactly Z2
      ];

      boundaryZooms.forEach(({ zoom, expected }) => {
        vi.mocked(storeModule.useMapStore).mockReturnValue({
          currentZoom: zoom,
        } as any);

        const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));
        expect(result.current).toHaveLength(expected);
      });
    });
  });

  describe('Empty Arrays and Edge Cases', () => {
    it('should return empty array when no landmarks provided', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1.5,
      } as any);

      const { result } = renderHook(() => useProgressiveLandmarkDisclosure([]));
      expect(result.current).toEqual([]);
    });

    it('should handle landmarks with no matching zoom threshold', () => {
      const landmarks = [mockLandmark('l1', 1), mockLandmark('l2', 1)];

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0.5,
      } as any);

      const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));
      expect(result.current).toHaveLength(0);
    });

    it('should handle all landmarks with same zoom threshold', () => {
      const landmarks = Array.from({ length: 10 }, (_, i) =>
        mockLandmark(`l${i}`, 0)
      );

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0.5,
      } as any);

      const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));
      expect(result.current).toHaveLength(0);

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1.5,
      } as any);

      const { result: result2 } = renderHook(() =>
        useProgressiveLandmarkDisclosure(landmarks)
      );
      expect(result2.current).toHaveLength(10);
    });
  });

  describe('Performance and Stability', () => {
    it('should maintain order of landmarks when filtering', () => {
      const landmarks = [
        mockLandmark('a', 0),
        mockLandmark('b', -1),
        mockLandmark('c', 0),
        mockLandmark('d', -1),
      ];

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1.5,
      } as any);

      const { result } = renderHook(() => useProgressiveLandmarkDisclosure(landmarks));
      const ids = result.current.map((l) => l.id);

      expect(ids).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should be memoized and not recalculate on same inputs', () => {
      const landmarks = [
        mockLandmark('l1', -1),
        mockLandmark('l2', 0),
        mockLandmark('l3', 1),
      ];

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1.5,
      } as any);

      const { result: result1 } = renderHook(() =>
        useProgressiveLandmarkDisclosure(landmarks)
      );
      const { result: result2 } = renderHook(() =>
        useProgressiveLandmarkDisclosure(landmarks)
      );

      expect(result1.current).toEqual(result2.current);
    });

    it('should handle large landmark sets efficiently', () => {
      const largeLandmarkSet = Array.from({ length: 1000 }, (_, i) => {
        const threshold = i % 3 === 0 ? -1 : i % 3 === 1 ? 0 : 1;
        return mockLandmark(`landmark-${i}`, threshold);
      });

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1.5,
      } as any);

      const { result } = renderHook(() =>
        useProgressiveLandmarkDisclosure(largeLandmarkSet)
      );

      // Should filter correctly without performance issues
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current.every((l) => l.zoomThreshold <= 0)).toBe(true);
    });
  });
});
