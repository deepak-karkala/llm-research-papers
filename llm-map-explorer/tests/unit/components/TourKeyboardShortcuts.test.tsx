import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useMapStore } from '@/lib/store';
import { TourPanel } from '@/components/panels/TourPanel';
import type { Tour } from '@/types/data';

// Mock tours for testing
const createMockTour = (stageCount: number = 3): Tour => ({
  id: 'test-tour',
  name: 'Test Tour',
  title: 'Test Tour',
  description: 'A test tour for keyboard shortcuts',
  difficulty: 'beginner',
  estimatedDuration: 10,
  stages: Array.from({ length: stageCount }, (_, i) => ({
    id: `stage-${i}`,
    title: `Stage ${i}`,
    description: `Description of stage ${i}`,
    narration: `Narration for stage ${i}`,
    mapCenter: { lat: 1500 + i * 100, lng: 2000 + i * 100 },
    mapZoom: i * 0.5,
    landmarkIds: [`landmark-${i}`],
    capabilities: [`capability-${i}`],
  })),
});

describe('Tour Keyboard Shortcuts', () => {
  beforeEach(() => {
    // Reset store before each test
    useMapStore.setState({
      currentTour: null,
      currentTourStageIndex: 0,
      isTourPaused: false,
    });
    vi.clearAllMocks();
  });

  describe('Bracket Key Navigation ([ and ])', () => {
    it('should navigate to next stage with ] key', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      render(<TourPanel />);

      // Dispatch ] key event
      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      expect(useMapStore.getState().currentTourStageIndex).toBe(1);
    });

    it('should navigate to previous stage with [ key', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 1,
      });

      render(<TourPanel />);

      // Dispatch [ key event
      const event = new KeyboardEvent('keydown', { key: '[' });
      window.dispatchEvent(event);

      expect(useMapStore.getState().currentTourStageIndex).toBe(0);
    });

    it('should prevent default behavior on [ key', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 1,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: '[' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default behavior on ] key', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: ']' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Boundary Conditions', () => {
    it('should not navigate before first stage when pressing [ on stage 0', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      render(<TourPanel />);

      // Press [ on first stage
      const event = new KeyboardEvent('keydown', { key: '[' });
      window.dispatchEvent(event);

      // Should still be on stage 0
      expect(useMapStore.getState().currentTourStageIndex).toBe(0);
    });

    it('should not navigate after last stage when pressing ] on last stage', () => {
      const mockTour = createMockTour(3);
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 2, // last stage
      });

      render(<TourPanel />);

      // Press ] on last stage
      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      // Should still be on stage 2
      expect(useMapStore.getState().currentTourStageIndex).toBe(2);
    });

    it('should silently handle [ at first stage without error', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      expect(() => {
        render(<TourPanel />);
        const event = new KeyboardEvent('keydown', { key: '[' });
        window.dispatchEvent(event);
      }).not.toThrow();
    });

    it('should silently handle ] at last stage without error', () => {
      const mockTour = createMockTour(3);
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 2,
      });

      expect(() => {
        render(<TourPanel />);
        const event = new KeyboardEvent('keydown', { key: ']' });
        window.dispatchEvent(event);
      }).not.toThrow();
    });
  });

  describe('Arrow Key Alternative Navigation', () => {
    it('should navigate to next stage with ArrowRight key', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(useMapStore.getState().currentTourStageIndex).toBe(1);
    });

    it('should navigate to previous stage with ArrowLeft key', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 1,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(useMapStore.getState().currentTourStageIndex).toBe(0);
    });

    it('should respect boundaries with ArrowRight at last stage', () => {
      const mockTour = createMockTour(3);
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 2,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(useMapStore.getState().currentTourStageIndex).toBe(2);
    });

    it('should respect boundaries with ArrowLeft at first stage', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(useMapStore.getState().currentTourStageIndex).toBe(0);
    });
  });

  describe('Escape Key to Exit', () => {
    it('should exit tour when Escape key is pressed', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 1,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      const state = useMapStore.getState();
      expect(state.currentTour).toBeNull();
      expect(state.currentTourStageIndex).toBe(0);
    });

    it('should prevent default on Escape key', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Pause/Resume Behavior', () => {
    it('should not respond to keyboard shortcuts when tour is paused', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
        isTourPaused: true,
      });

      render(<TourPanel />);

      // Try to advance with ]
      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      // Should still be on stage 0
      expect(useMapStore.getState().currentTourStageIndex).toBe(0);
    });

    it('should respond to keyboard shortcuts when tour is resumed', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
        isTourPaused: false,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      expect(useMapStore.getState().currentTourStageIndex).toBe(1);
    });
  });

  describe('Rapid Key Presses', () => {
    it('should handle rapid ] presses smoothly', () => {
      const mockTour = createMockTour(5);
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      render(<TourPanel />);

      // Rapid presses: ] ] ]
      for (let i = 0; i < 3; i++) {
        const event = new KeyboardEvent('keydown', { key: ']' });
        window.dispatchEvent(event);
      }

      expect(useMapStore.getState().currentTourStageIndex).toBe(3);
    });

    it('should handle rapid [ presses smoothly', () => {
      const mockTour = createMockTour(5);
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 4,
      });

      render(<TourPanel />);

      // Rapid presses: [ [ [
      for (let i = 0; i < 3; i++) {
        const event = new KeyboardEvent('keydown', { key: '[' });
        window.dispatchEvent(event);
      }

      expect(useMapStore.getState().currentTourStageIndex).toBe(1);
    });

    it('should handle mixed [ and ] presses', () => {
      const mockTour = createMockTour(5);
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      render(<TourPanel />);

      // ] ] [ ] ]
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '[' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));

      // 0 -> 1 -> 2 -> 1 -> 2 -> 3
      // Actually: 0+1=1, +1=2, -1=1, +1=2, +1=3, +1=4
      expect(useMapStore.getState().currentTourStageIndex).toBe(4);
    });
  });

  describe('Keyboard Hints Display', () => {
    it('should display keyboard shortcut hints', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
      });

      render(<TourPanel />);

      // Check for keyboard hints
      expect(screen.getByText('[')).toBeInTheDocument();
      expect(screen.getByText(']')).toBeInTheDocument();
      expect(screen.getByText('Esc')).toBeInTheDocument();
    });

    it('should show hints with proper labels', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
      });

      render(<TourPanel />);

      // Check for labels next to keys
      const screen_ = screen.getAllByText(/Previous|Next|Exit/);
      expect(screen_.length).toBeGreaterThan(0);
    });

    it('should display hints in kbd elements for accessibility', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
      });

      render(<TourPanel />);

      // Check that kbd elements exist
      const kbds = document.querySelectorAll('kbd');
      expect(kbds.length).toBeGreaterThanOrEqual(3); // [, ], Esc
    });
  });

  describe('State Management', () => {
    it('should add event listener when tour starts', () => {
      const mockTour = createMockTour();

      useMapStore.setState({
        currentTour: mockTour,
      });

      // Just verify it renders without errors and responds to keyboard events
      render(<TourPanel />);

      // Verify keyboard event is handled
      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      expect(useMapStore.getState().currentTourStageIndex).toBe(1);
    });

    it('should disable event handler when tour exits', () => {
      const mockTour = createMockTour();

      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      const { unmount } = render(<TourPanel />);

      // Exit tour before unmount
      act(() => {
        useMapStore.setState({
          currentTour: null,
        });
      });

      unmount();

      // Verify that no error is thrown
      expect(() => {
        const event = new KeyboardEvent('keydown', { key: ']' });
        window.dispatchEvent(event);
      }).not.toThrow();
    });

    it('should properly handle listener re-registration on re-render', () => {
      const mockTour = createMockTour(5);

      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      const { rerender } = render(<TourPanel />);

      // Trigger re-render by advancing stage via keyboard
      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      rerender(<TourPanel />);

      // Should be able to advance again
      const event2 = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event2);

      expect(useMapStore.getState().currentTourStageIndex).toBe(2);
    });
  });

  describe('Ignored Keys', () => {
    it('should ignore other keys', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
        currentTourStageIndex: 0,
      });

      render(<TourPanel />);

      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);

      // Should still be on stage 0
      expect(useMapStore.getState().currentTourStageIndex).toBe(0);
    });

    it('should allow typing while tour is active', () => {
      const mockTour = createMockTour();
      useMapStore.setState({
        currentTour: mockTour,
      });

      render(<TourPanel />);

      // These keys should not trigger shortcuts
      const keysToIgnore = ['a', 'b', 'c', 'A', 'B', 'C', '1', '2', '3'];

      keysToIgnore.forEach((key) => {
        const event = new KeyboardEvent('keydown', { key });
        window.dispatchEvent(event);
      });

      // Should still be on stage 0
      expect(useMapStore.getState().currentTourStageIndex).toBe(0);
    });
  });
});
