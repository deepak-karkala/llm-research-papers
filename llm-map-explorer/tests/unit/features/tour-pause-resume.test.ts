import { renderHook, act } from '@testing-library/react';
import { useMapStore } from '@/lib/store';
import type { Tour } from '@/types/data';

describe('Tour Pause/Resume Functionality', () => {
  const mockTour: Tour = {
    id: 'test-tour-1',
    name: 'Test Tour',
    title: 'Test Tour',
    description: 'A test tour for pause/resume',
    difficulty: 'beginner',
    estimatedDuration: 10,
    stages: [
      {
        id: 'stage-0',
        title: 'Stage 0',
        narration: 'First stage',
        description: 'Description of first stage',
        mapCenter: { lat: 1500, lng: 2000 },
        mapZoom: 0,
        landmarkIds: ['landmark-1', 'landmark-2'],
        capabilities: ['capability-1'],
      },
      {
        id: 'stage-1',
        title: 'Stage 1',
        narration: 'Second stage',
        description: 'Description of second stage',
        mapCenter: { lat: 1600, lng: 2100 },
        mapZoom: 0.5,
        landmarkIds: ['landmark-3', 'landmark-4'],
        capabilities: ['capability-2'],
      },
      {
        id: 'stage-2',
        title: 'Stage 2',
        narration: 'Third stage',
        description: 'Description of third stage',
        mapCenter: { lat: 1700, lng: 2200 },
        mapZoom: 1,
        landmarkIds: ['landmark-5'],
        capabilities: ['capability-3'],
      },
    ],
  };

  beforeEach(() => {
    // Reset store before each test
    useMapStore.setState({
      currentTour: null,
      currentTourStageIndex: 0,
      isTourPaused: false,
      tourPauseState: undefined,
    });
  });

  describe('pauseTour action', () => {
    it('should set isTourPaused to true when tour is active', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
      });

      expect(useMapStore.getState().isTourPaused).toBe(false);

      act(() => {
        result.current.pauseTour();
      });

      expect(useMapStore.getState().isTourPaused).toBe(true);
    });

    it('should save tour pause state with tourId and stageIndex', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.pauseTour();
      });

      const state = useMapStore.getState();
      expect(state.tourPauseState).toBeDefined();
      expect(state.tourPauseState?.tourId).toBe(mockTour.id);
      expect(state.tourPauseState?.stageIndex).toBe(1);
      expect(state.tourPauseState?.pausedAt).toBeInstanceOf(Date);
    });

    it('should not pause if no tour is active', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.pauseTour();
      });

      expect(useMapStore.getState().isTourPaused).toBe(false);
      expect(useMapStore.getState().tourPauseState).toBeUndefined();
    });

    it('should maintain current stage index when pausing', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.advanceTourStage('next');
        result.current.pauseTour();
      });

      expect(useMapStore.getState().currentTourStageIndex).toBe(2);
      expect(useMapStore.getState().tourPauseState?.stageIndex).toBe(2);
    });
  });

  describe('resumeTour action', () => {
    it('should restore tour to paused stage', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.pauseTour();
        // Manually change stage (should not happen in practice)
        result.current.setCurrentZoom(5); // Just to change something
        result.current.resumeTour();
      });

      const state = useMapStore.getState();
      expect(state.isTourPaused).toBe(false);
      expect(state.currentTourStageIndex).toBe(1);
      expect(state.tourPauseState).toBeUndefined();
    });

    it('should clear pause state on resume', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.pauseTour();
        result.current.resumeTour();
      });

      const state = useMapStore.getState();
      expect(state.tourPauseState).toBeUndefined();
      expect(state.isTourPaused).toBe(false);
    });

    it('should have no effect if no tour paused', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.resumeTour();
      });

      expect(useMapStore.getState().isTourPaused).toBe(false);
      expect(useMapStore.getState().currentTourStageIndex).toBe(0);
    });
  });

  describe('exitTour action', () => {
    it('should clear all tour state including pause state', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.pauseTour();
        result.current.exitTour();
      });

      const state = useMapStore.getState();
      expect(state.currentTour).toBeNull();
      expect(state.currentTourStageIndex).toBe(0);
      expect(state.isTourPaused).toBe(false);
      expect(state.tourPauseState).toBeUndefined();
    });
  });

  describe('clearTourPauseState action', () => {
    it('should clear pause state without affecting tour', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.pauseTour();
        result.current.clearTourPauseState();
      });

      const state = useMapStore.getState();
      expect(state.isTourPaused).toBe(false);
      expect(state.tourPauseState).toBeUndefined();
      expect(state.currentTour).toBe(mockTour);
    });
  });

  describe('pause/resume cycles', () => {
    it('should support multiple pause/resume cycles', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
      });

      // Cycle 1
      act(() => {
        result.current.pauseTour();
      });
      expect(useMapStore.getState().isTourPaused).toBe(true);

      act(() => {
        result.current.resumeTour();
      });
      expect(useMapStore.getState().isTourPaused).toBe(false);

      // Cycle 2
      act(() => {
        result.current.advanceTourStage('next');
        result.current.pauseTour();
      });
      expect(useMapStore.getState().isTourPaused).toBe(true);
      expect(useMapStore.getState().currentTourStageIndex).toBe(1);

      act(() => {
        result.current.resumeTour();
      });
      expect(useMapStore.getState().isTourPaused).toBe(false);
      expect(useMapStore.getState().currentTourStageIndex).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle pause at last stage', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.advanceTourStage('next');
        result.current.pauseTour();
      });

      const state = useMapStore.getState();
      expect(state.tourPauseState?.stageIndex).toBe(2);
      expect(state.isTourPaused).toBe(true);
    });

    it('should prevent advancement when paused', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.pauseTour();
        result.current.advanceTourStage('next');
      });

      // advanceTourStage returns early if paused, so stage should remain same
      expect(useMapStore.getState().currentTourStageIndex).toBe(1);
    });

    it('should restore correct stage when pause state holds older stage', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.pauseTour();
      });

      const pauseState = useMapStore.getState().tourPauseState;
      expect(pauseState?.stageIndex).toBe(1);

      act(() => {
        result.current.resumeTour();
      });

      expect(useMapStore.getState().currentTourStageIndex).toBe(1);
    });
  });

  describe('state persistence', () => {
    it('should preserve pause state across store updates', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.pauseTour();
      });

      const pauseStateBefore = useMapStore.getState().tourPauseState;

      act(() => {
        // Make some other store update
        result.current.setCurrentZoom(5);
      });

      const pauseStateAfter = useMapStore.getState().tourPauseState;
      expect(pauseStateAfter).toEqual(pauseStateBefore);
    });
  });
});
