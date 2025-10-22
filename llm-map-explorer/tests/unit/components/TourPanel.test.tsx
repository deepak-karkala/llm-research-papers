import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TourPanel } from '@/components/panels/TourPanel';
import { useMapStore } from '@/lib/store';
import type { Tour, Landmark } from '@/types/data';

// Mock the Zustand store
jest.mock('@/lib/store', () => ({
  useMapStore: jest.fn(),
}));

const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

// Sample tour data for testing
const mockTour: Tour = {
  id: 'test-tour',
  title: 'Test Tour',
  description: 'A test tour for unit testing',
  difficulty: 'beginner',
  estimatedDuration: 10,
  tags: ['test'],
  stages: [
    {
      index: 0,
      title: 'Stage 1',
      description: 'First stage',
      narration: 'This is the first stage of the tour.',
      landmarkIds: ['landmark-001', 'landmark-002'],
      mapCenter: { lat: 100, lng: 100 },
      mapZoom: 3,
    },
    {
      index: 1,
      title: 'Stage 2',
      description: 'Second stage',
      narration: 'This is the second stage of the tour.',
      landmarkIds: ['landmark-003'],
      mapCenter: { lat: 200, lng: 200 },
      mapZoom: 4,
    },
    {
      index: 2,
      title: 'Stage 3',
      description: 'Third stage',
      narration: 'This is the third stage of the tour.',
      landmarkIds: [],
      mapCenter: { lat: 300, lng: 300 },
      mapZoom: 5,
    },
  ],
};

const mockLandmarks: Landmark[] = [
  {
    id: 'landmark-001',
    name: 'Attention Is All You Need',
    type: 'paper',
    year: 2017,
    organization: 'Google Brain',
    description: 'Test landmark 1',
    externalLinks: [],
    coordinates: { lat: 100, lng: 100 },
    capabilityId: 'test',
    relatedLandmarks: [],
    tags: ['test'],
  },
  {
    id: 'landmark-002',
    name: 'BERT',
    type: 'model',
    year: 2018,
    organization: 'Google',
    description: 'Test landmark 2',
    externalLinks: [],
    coordinates: { lat: 110, lng: 110 },
    capabilityId: 'test',
    relatedLandmarks: [],
    tags: ['test'],
  },
  {
    id: 'landmark-003',
    name: 'GPT-2',
    type: 'model',
    year: 2019,
    organization: 'OpenAI',
    description: 'Test landmark 3',
    externalLinks: [],
    coordinates: { lat: 120, lng: 120 },
    capabilityId: 'test',
    relatedLandmarks: [],
    tags: ['test'],
  },
];

describe('TourPanel', () => {
  const mockAdvanceTourStage = jest.fn();
  const mockExitTour = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMapStore.mockReturnValue({
      currentTour: mockTour,
      currentTourStageIndex: 0,
      landmarks: mockLandmarks,
      advanceTourStage: mockAdvanceTourStage,
      exitTour: mockExitTour,
      isTourPaused: false,
    } as any);
  });

  describe('Rendering', () => {
    it('should render tour title and difficulty badge', () => {
      render(<TourPanel />);
      expect(screen.getByText(mockTour.title)).toBeInTheDocument();
      expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    });

    it('should display estimated duration', () => {
      render(<TourPanel />);
      expect(screen.getByText(/10 min/)).toBeInTheDocument();
    });

    it('should display current stage content', () => {
      render(<TourPanel />);
      expect(screen.getByText(mockTour.stages[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockTour.stages[0].description)).toBeInTheDocument();
      expect(screen.getByText(mockTour.stages[0].narration)).toBeInTheDocument();
    });

    it('should show progress correctly', () => {
      render(<TourPanel />);
      expect(screen.getByText(/Stage 1 of 3/)).toBeInTheDocument();
    });

    it('should render landmark names in Key Landmarks section', () => {
      render(<TourPanel />);
      expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument();
      expect(screen.getByText('BERT')).toBeInTheDocument();
    });

    it('should not render Key Landmarks section when stage has no landmarks', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: mockTour,
        currentTourStageIndex: 2, // Stage 3 has no landmarks
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      render(<TourPanel />);
      expect(screen.queryByText('Key Landmarks')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Controls', () => {
    it('should disable previous button on first stage', () => {
      render(<TourPanel />);
      const previousButton = screen.getByLabelText(/previous/i);
      expect(previousButton).toBeDisabled();
    });

    it('should enable previous button on non-first stage', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: mockTour,
        currentTourStageIndex: 1,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      render(<TourPanel />);
      const previousButton = screen.getByLabelText(/previous/i);
      expect(previousButton).not.toBeDisabled();
    });

    it('should show "Next" on non-final stages', () => {
      render(<TourPanel />);
      expect(screen.getByText(/Next/)).toBeInTheDocument();
      expect(screen.queryByText(/Complete Tour/)).not.toBeInTheDocument();
    });

    it('should show "Complete Tour" on final stage', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: mockTour,
        currentTourStageIndex: 2, // Last stage
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      render(<TourPanel />);
      expect(screen.getByText(/Complete Tour/)).toBeInTheDocument();
    });

    it('should call advanceTourStage("next") when next button clicked', () => {
      render(<TourPanel />);
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      expect(mockAdvanceTourStage).toHaveBeenCalledWith('next');
    });

    it('should call advanceTourStage("previous") when previous button clicked', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: mockTour,
        currentTourStageIndex: 1,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      render(<TourPanel />);
      const previousButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(previousButton);
      expect(mockAdvanceTourStage).toHaveBeenCalledWith('previous');
    });

    it('should call exitTour() when exit button clicked', () => {
      render(<TourPanel />);
      const exitButton = screen.getByLabelText(/exit tour/i);
      fireEvent.click(exitButton);
      expect(mockExitTour).toHaveBeenCalled();
    });

    it('should call exitTour() when "Complete Tour" button clicked on final stage', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: mockTour,
        currentTourStageIndex: 2,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      render(<TourPanel />);
      const completeButton = screen.getByRole('button', { name: /complete tour/i });
      fireEvent.click(completeButton);
      expect(mockExitTour).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should advance to next stage with arrow right key', () => {
      render(<TourPanel />);
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(mockAdvanceTourStage).toHaveBeenCalledWith('next');
    });

    it('should go to previous stage with arrow left key', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: mockTour,
        currentTourStageIndex: 1,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      render(<TourPanel />);
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(mockAdvanceTourStage).toHaveBeenCalledWith('previous');
    });

    it('should advance with bracket key [', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: mockTour,
        currentTourStageIndex: 1,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      render(<TourPanel />);
      fireEvent.keyDown(window, { key: '[' });
      expect(mockAdvanceTourStage).toHaveBeenCalledWith('previous');
    });

    it('should advance with bracket key ]', () => {
      render(<TourPanel />);
      fireEvent.keyDown(window, { key: ']' });
      expect(mockAdvanceTourStage).toHaveBeenCalledWith('next');
    });

    it('should exit tour with Escape key', () => {
      render(<TourPanel />);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockExitTour).toHaveBeenCalled();
    });

    it('should not navigate if tour is paused', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: mockTour,
        currentTourStageIndex: 0,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: true,
      } as any);

      render(<TourPanel />);
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(mockAdvanceTourStage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-live region for screen reader announcements', () => {
      const { container } = render(<TourPanel />);
      const liveRegion = container.querySelector('[role="status"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have descriptive aria-labels on buttons', () => {
      render(<TourPanel />);
      expect(screen.getByLabelText(/exit tour/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/previous/i)).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<TourPanel />);
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');
      expect(h2).toBeInTheDocument(); // Tour title
      expect(h3).toBeInTheDocument(); // Stage title
    });
  });

  describe('Return null when no current tour', () => {
    it('should return null when currentTour is null', () => {
      mockUseMapStore.mockReturnValue({
        currentTour: null,
        currentTourStageIndex: 0,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      const { container } = render(<TourPanel />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Difficulty Colors', () => {
    it('should apply beginner color styling', () => {
      const { container } = render(<TourPanel />);
      const difficultyBadge = container.querySelector('[class*="bg-green"]');
      expect(difficultyBadge).toBeInTheDocument();
    });

    it('should apply intermediate color styling', () => {
      const intermediaryTour = { ...mockTour, difficulty: 'intermediate' as const };
      mockUseMapStore.mockReturnValue({
        currentTour: intermediaryTour,
        currentTourStageIndex: 0,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      const { container } = render(<TourPanel />);
      const difficultyBadge = container.querySelector('[class*="bg-yellow"]');
      expect(difficultyBadge).toBeInTheDocument();
    });

    it('should apply advanced color styling', () => {
      const advancedTour = { ...mockTour, difficulty: 'advanced' as const };
      mockUseMapStore.mockReturnValue({
        currentTour: advancedTour,
        currentTourStageIndex: 0,
        landmarks: mockLandmarks,
        advanceTourStage: mockAdvanceTourStage,
        exitTour: mockExitTour,
        isTourPaused: false,
      } as any);

      const { container } = render(<TourPanel />);
      const difficultyBadge = container.querySelector('[class*="bg-red"]');
      expect(difficultyBadge).toBeInTheDocument();
    });
  });
});
