import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TourCard } from '@/components/tours/TourCard';
import { useMapStore } from '@/lib/store';
import type { Tour } from '@/types/data';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Zustand store
vi.mock('@/lib/store', () => ({
  useMapStore: vi.fn(),
}));

// Create a mock tour object
const mockTour: Tour = {
  id: 'tour-1',
  title: 'Beginner Map Tour',
  description: 'Learn the basics of navigating the map',
  difficulty: 'beginner',
  estimatedDuration: 5,
  stages: [
    {
      id: 'stage-1',
      title: 'Introduction',
      description: 'Welcome to the tour',
      landmarks: [],
    },
    {
      id: 'stage-2',
      title: 'Basic Navigation',
      description: 'How to navigate the map',
      landmarks: [],
    },
  ],
};

const mockAdvancedTour: Tour = {
  id: 'tour-2',
  title: 'Advanced LLM Capabilities',
  description: 'Deep dive into advanced LLM capabilities',
  difficulty: 'advanced',
  estimatedDuration: 20,
  stages: [
    { id: 'stage-1', title: 'Stage 1', description: 'Stage 1', landmarks: [] },
    { id: 'stage-2', title: 'Stage 2', description: 'Stage 2', landmarks: [] },
    { id: 'stage-3', title: 'Stage 3', description: 'Stage 3', landmarks: [] },
  ],
};

describe('TourCard Component', () => {
  let mockStartTour: any;
  let mockOnTourStart: any;

  beforeEach(() => {
    mockStartTour = vi.fn();
    mockOnTourStart = vi.fn();
    (useMapStore as any).mockReturnValue({
      startTour: mockStartTour,
    });
  });

  it('should render tour card with title and description', () => {
    render(<TourCard tour={mockTour} />);

    expect(screen.getByText('Beginner Map Tour')).toBeInTheDocument();
    expect(screen.getByText('Learn the basics of navigating the map')).toBeInTheDocument();
  });

  it('should display tour duration correctly', () => {
    render(<TourCard tour={mockTour} />);

    expect(screen.getByTestId('tour-duration')).toHaveTextContent('5 min');
  });

  it('should display correct number of stages', () => {
    render(<TourCard tour={mockTour} />);

    expect(screen.getByTestId('tour-stages')).toHaveTextContent('2 stages');
  });

  it('should display difficulty badge with correct styling for beginner', () => {
    render(<TourCard tour={mockTour} />);

    const badge = screen.getByTestId('tour-difficulty');
    expect(badge).toHaveTextContent('Beginner');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('should display difficulty badge with correct styling for advanced', () => {
    render(<TourCard tour={mockAdvancedTour} />);

    const badge = screen.getByTestId('tour-difficulty');
    expect(badge).toHaveTextContent('Advanced');
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
  });

  it('should display difficulty icons correctly', () => {
    render(<TourCard tour={mockTour} />);
    const badge = screen.getByTestId('tour-difficulty');
    expect(badge.textContent).toContain('⭐');
  });

  it('should display Start Tour button', () => {
    render(<TourCard tour={mockTour} />);

    const button = screen.getByTestId('tour-start-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Start Tour');
  });

  it('should call startTour with correct tour when button is clicked', () => {
    render(<TourCard tour={mockTour} />);

    const button = screen.getByTestId('tour-start-button');
    fireEvent.click(button);

    expect(mockStartTour).toHaveBeenCalledWith(mockTour);
    expect(mockStartTour).toHaveBeenCalledTimes(1);
  });

  it('should call onTourStart callback when button is clicked', () => {
    render(<TourCard tour={mockTour} onTourStart={mockOnTourStart} />);

    const button = screen.getByTestId('tour-start-button');
    fireEvent.click(button);

    expect(mockOnTourStart).toHaveBeenCalledWith(mockTour);
    expect(mockOnTourStart).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', () => {
    render(<TourCard tour={mockTour} />);

    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();

    const startButton = screen.getByTestId('tour-start-button');
    expect(startButton).toHaveAttribute('aria-label', 'Start Beginner Map Tour tour');
  });

  it('should have proper test IDs for integration testing', () => {
    const { container } = render(<TourCard tour={mockTour} />);

    expect(screen.getByTestId(`tour-card-${mockTour.id}`)).toBeInTheDocument();
    expect(screen.getByTestId('tour-difficulty')).toBeInTheDocument();
    expect(screen.getByTestId('tour-duration')).toBeInTheDocument();
    expect(screen.getByTestId('tour-stages')).toBeInTheDocument();
    expect(screen.getByTestId('tour-start-button')).toBeInTheDocument();
  });

  it('should handle intermediate difficulty correctly', () => {
    const intermediateTour: Tour = {
      ...mockTour,
      difficulty: 'intermediate',
    };

    render(<TourCard tour={intermediateTour} />);

    const badge = screen.getByTestId('tour-difficulty');
    expect(badge).toHaveTextContent('Intermediate');
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-800');
  });

  it('should handle long tour titles with line clamping', () => {
    const longTitleTour: Tour = {
      ...mockTour,
      title: 'This is a very long tour title that should be clamped to two lines to prevent overflow in the card layout',
    };

    render(<TourCard tour={longTitleTour} />);

    const title = screen.getByText(longTitleTour.title);
    expect(title).toHaveClass('line-clamp-2');
  });

  it('should handle long descriptions with line clamping', () => {
    const longDescTour: Tour = {
      ...mockTour,
      description:
        'This is a very long description that should be clamped to two lines to prevent the card from becoming too tall in the catalog view',
    };

    render(<TourCard tour={longDescTour} />);

    const desc = screen.getByText(longDescTour.description);
    expect(desc).toHaveClass('line-clamp-2');
  });

  it('should display singular "stage" for single stage tour', () => {
    const singleStageTour: Tour = {
      ...mockTour,
      stages: [{ id: 'stage-1', title: 'Stage 1', description: 'Only stage', landmarks: [] }],
    };

    render(<TourCard tour={singleStageTour} />);

    expect(screen.getByTestId('tour-stages')).toHaveTextContent('1 stages');
  });

  it('should have hover effects applied', () => {
    const { container } = render(<TourCard tour={mockTour} />);

    const card = screen.getByTestId(`tour-card-${mockTour.id}`);
    expect(card).toHaveClass('hover:shadow-lg');
    expect(card).toHaveClass('hover:border-blue-300');
  });

  it('should be properly accessible via keyboard', () => {
    render(<TourCard tour={mockTour} />);

    const button = screen.getByTestId('tour-start-button');
    expect(button).toHaveClass('focus-visible:outline-none');
  });
});
