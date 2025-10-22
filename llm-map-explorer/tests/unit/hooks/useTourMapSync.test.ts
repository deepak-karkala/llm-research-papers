import { renderHook } from '@testing-library/react';
import { useTourMapSync } from '@/hooks/useTourMapSync';
import { useMapStore } from '@/lib/store';
import type { Tour } from '@/types/data';

// Mock the map store
vi.mock('@/lib/store', () => ({
  useMapStore: vi.fn(),
}));

describe('useTourMapSync', () => {
  const mockMapRef = {
    flyTo: vi.fn(),
  };

  const mockUpdateTourHighlights = vi.fn();

  const createMockTour = (stageCount = 3): Tour => ({
    id: 'test-tour',
    name: 'Test Tour',
    description: 'A test tour',
    difficulty: 'beginner',
    estimatedDuration: 5,
    stages: Array.from({ length: stageCount }, (_, i) => ({
      id: `stage-${i}`,
      title: `Stage ${i}`,
      narration: `This is stage ${i}`,
      mapCenter: { lat: 1500 + i * 100, lng: 2000 + i * 100 },
      mapZoom: -1 + i * 0.5,
      landmarkIds: [`landmark-${i}a`, `landmark-${i}b`],
      capabilities: [`capability-${i}`],
    })),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockMapRef.flyTo.mockClear();
    mockUpdateTourHighlights.mockClear();
  });

  describe('initialization and state management', () => {
    it('should not call flyTo or updateTourHighlights when tour is not active', () => {
      (useMapStore as any).mockReturnValue({
        currentTour: null,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockMapRef.flyTo).not.toHaveBeenCalled();
      expect(mockUpdateTourHighlights).not.toHaveBeenCalled();
    });

    it('should not call flyTo or updateTourHighlights when mapRef is not available', () => {
      (useMapStore as any).mockReturnValue({
        currentTour: createMockTour(),
        currentTourStageIndex: 0,
        mapRef: null,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockMapRef.flyTo).not.toHaveBeenCalled();
      expect(mockUpdateTourHighlights).not.toHaveBeenCalled();
    });

    it('should not call flyTo when stage index is out of bounds', () => {
      (useMapStore as any).mockReturnValue({
        currentTour: createMockTour(2),
        currentTourStageIndex: 5,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockMapRef.flyTo).not.toHaveBeenCalled();
      expect(mockUpdateTourHighlights).not.toHaveBeenCalled();
    });
  });

  describe('map flyTo animation', () => {
    it('should call flyTo with stage coordinates and default options', () => {
      const tour = createMockTour();
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      const stage = tour.stages[0];
      expect(mockMapRef.flyTo).toHaveBeenCalledWith(
        [stage.mapCenter.lat, stage.mapCenter.lng],
        stage.mapZoom,
        {
          duration: 1000,
          easeLinearity: 0.25,
        }
      );
    });

    it('should call flyTo with custom options when provided', () => {
      const tour = createMockTour();
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 1,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() =>
        useTourMapSync({
          duration: 2000,
          easeLinearity: 0.5,
        })
      );

      const stage = tour.stages[1];
      expect(mockMapRef.flyTo).toHaveBeenCalledWith(
        [stage.mapCenter.lat, stage.mapCenter.lng],
        stage.mapZoom,
        {
          duration: 2000,
          easeLinearity: 0.5,
        }
      );
    });

    it('should update flyTo coordinates when stage index changes', () => {
      const tour = createMockTour();
      const { rerender } = renderHook(
        ({ stageIndex }) =>
          useTourMapSync({
            duration: 1000,
            easeLinearity: 0.25,
          }),
        {
          initialProps: { stageIndex: 0 },
        }
      );

      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 1,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      rerender({ stageIndex: 1 });

      const stage = tour.stages[1];
      expect(mockMapRef.flyTo).toHaveBeenCalledWith(
        [stage.mapCenter.lat, stage.mapCenter.lng],
        stage.mapZoom,
        expect.any(Object)
      );
    });

    it('should handle flyTo errors gracefully', () => {
      const tour = createMockTour();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
      const flyToError = new Error('flyTo failed');

      mockMapRef.flyTo.mockImplementation(() => {
        throw flyToError;
      });

      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Map flyTo failed:',
        flyToError
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('landmark highlighting', () => {
    it('should highlight current stage landmarks', () => {
      const tour = createMockTour(3);
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 1,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockUpdateTourHighlights).toHaveBeenCalledWith(
        ['landmark-1a', 'landmark-1b'], // current stage
        ['landmark-0a', 'landmark-0b'], // previous stage
        expect.any(Array) // future stages
      );
    });

    it('should include all future landmark IDs in highlights', () => {
      const tour = createMockTour(4);
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      const futureIds = [
        'landmark-1a',
        'landmark-1b',
        'landmark-2a',
        'landmark-2b',
        'landmark-3a',
        'landmark-3b',
      ];

      expect(mockUpdateTourHighlights).toHaveBeenCalledWith(
        expect.any(Array), // current
        expect.any(Array), // previous
        expect.arrayContaining(futureIds)
      );
    });

    it('should handle first stage with no previous landmarks', () => {
      const tour = createMockTour(2);
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockUpdateTourHighlights).toHaveBeenCalledWith(
        ['landmark-0a', 'landmark-0b'], // current
        [], // previous (empty for first stage)
        expect.any(Array) // future
      );
    });

    it('should handle last stage with no future landmarks', () => {
      const tour = createMockTour(2);
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 1,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockUpdateTourHighlights).toHaveBeenCalledWith(
        ['landmark-1a', 'landmark-1b'], // current
        ['landmark-0a', 'landmark-0b'], // previous
        [] // future (empty for last stage)
      );
    });

    it('should handle stages with empty landmark IDs', () => {
      const tour: Tour = {
        id: 'test-tour',
        name: 'Test Tour',
        description: 'A test tour',
        difficulty: 'beginner',
        estimatedDuration: 5,
        stages: [
          {
            id: 'stage-0',
            title: 'Stage 0',
            narration: 'Stage 0',
            mapCenter: { lat: 1500, lng: 2000 },
            mapZoom: -1,
            landmarkIds: [],
            capabilities: [],
          },
          {
            id: 'stage-1',
            title: 'Stage 1',
            narration: 'Stage 1',
            mapCenter: { lat: 1600, lng: 2100 },
            mapZoom: -0.5,
            landmarkIds: ['landmark-1a'],
            capabilities: [],
          },
        ],
      };

      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 1,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockUpdateTourHighlights).toHaveBeenCalledWith(
        ['landmark-1a'],
        [], // previous stage has no landmarks
        [] // no future stages
      );
    });

    it('should update highlights when stage index changes', () => {
      const tour = createMockTour(3);
      const { rerender } = renderHook(
        ({ stageIndex }) => useTourMapSync(),
        {
          initialProps: { stageIndex: 0 },
        }
      );

      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 1,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      rerender({ stageIndex: 1 });

      // Should have been called twice: initial render and on rerender
      expect(mockUpdateTourHighlights).toHaveBeenCalledTimes(2);
      expect(mockUpdateTourHighlights).toHaveBeenLastCalledWith(
        ['landmark-1a', 'landmark-1b'],
        ['landmark-0a', 'landmark-0b'],
        expect.any(Array)
      );
    });

    it('should update highlights when tour changes', () => {
      const tour1 = createMockTour(2);
      const tour2 = createMockTour(3);

      (useMapStore as any).mockReturnValue({
        currentTour: tour1,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      const { rerender } = renderHook(() => useTourMapSync());

      (useMapStore as any).mockReturnValue({
        currentTour: tour2,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      rerender();

      // Should be called twice
      expect(mockUpdateTourHighlights).toHaveBeenCalledTimes(2);
    });
  });

  describe('coordinate conversion', () => {
    it('should convert stage coordinates to [lat, lng] array format', () => {
      const tour: Tour = {
        id: 'test-tour',
        name: 'Test Tour',
        description: 'A test tour',
        difficulty: 'beginner',
        estimatedDuration: 5,
        stages: [
          {
            id: 'stage-0',
            title: 'Stage 0',
            narration: 'Stage 0',
            mapCenter: { lat: 1234.5678, lng: 2345.6789 },
            mapZoom: -0.75,
            landmarkIds: ['landmark-0'],
            capabilities: [],
          },
        ],
      };

      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockMapRef.flyTo).toHaveBeenCalledWith(
        [1234.5678, 2345.6789],
        -0.75,
        expect.any(Object)
      );
    });

    it('should preserve floating point precision in coordinates', () => {
      const tour: Tour = {
        id: 'test-tour',
        name: 'Test Tour',
        description: 'A test tour',
        difficulty: 'beginner',
        estimatedDuration: 5,
        stages: [
          {
            id: 'stage-0',
            title: 'Stage 0',
            narration: 'Stage 0',
            mapCenter: { lat: 1500.123456789, lng: 2000.987654321 },
            mapZoom: -0.123456,
            landmarkIds: [],
            capabilities: [],
          },
        ],
      };

      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      const [lat, lng] = (mockMapRef.flyTo as any).mock.calls[0][0];
      expect(lat).toBeCloseTo(1500.123456789, 6);
      expect(lng).toBeCloseTo(2000.987654321, 6);
    });
  });

  describe('animation options', () => {
    it('should use default options when none provided', () => {
      const tour = createMockTour();
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      expect(mockMapRef.flyTo).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Number),
        {
          duration: 1000,
          easeLinearity: 0.25,
        }
      );
    });

    it('should allow partial option overrides', () => {
      const tour = createMockTour();
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() =>
        useTourMapSync({
          duration: 1500,
        })
      );

      expect(mockMapRef.flyTo).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Number),
        {
          duration: 1500,
          easeLinearity: 0.25,
        }
      );
    });

    it('should support zero duration for instant transitions', () => {
      const tour = createMockTour();
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() =>
        useTourMapSync({
          duration: 0,
        })
      );

      expect(mockMapRef.flyTo).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Number),
        {
          duration: 0,
          easeLinearity: 0.25,
        }
      );
    });

    it('should support high duration values for slow animations', () => {
      const tour = createMockTour();
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 0,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() =>
        useTourMapSync({
          duration: 5000,
        })
      );

      expect(mockMapRef.flyTo).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Number),
        {
          duration: 5000,
          easeLinearity: 0.25,
        }
      );
    });
  });

  describe('integration scenarios', () => {
    it('should synchronize all tour state simultaneously', () => {
      const tour = createMockTour(3);
      (useMapStore as any).mockReturnValue({
        currentTour: tour,
        currentTourStageIndex: 1,
        mapRef: mockMapRef,
        updateTourHighlights: mockUpdateTourHighlights,
      });

      renderHook(() => useTourMapSync());

      // Both flyTo and updateTourHighlights should be called
      expect(mockMapRef.flyTo).toHaveBeenCalledTimes(1);
      expect(mockUpdateTourHighlights).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid stage navigation', () => {
      const tour = createMockTour(5);
      const { rerender } = renderHook(
        ({ stageIndex }) => useTourMapSync(),
        {
          initialProps: { stageIndex: 0 },
        }
      );

      // Simulate rapid navigation through stages
      for (let i = 1; i < 5; i++) {
        (useMapStore as any).mockReturnValue({
          currentTour: tour,
          currentTourStageIndex: i,
          mapRef: mockMapRef,
          updateTourHighlights: mockUpdateTourHighlights,
        });

        rerender({ stageIndex: i });
      }

      expect(mockMapRef.flyTo).toHaveBeenCalledTimes(5);
      expect(mockUpdateTourHighlights).toHaveBeenCalledTimes(5);
    });
  });
});
