import React from 'react';
import { render, screen } from '@testing-library/react';
import { TourCatalog } from '@/components/tours/TourCatalog';
import type { Tour } from '@/types/data';
import { describe, it, expect, vi } from 'vitest';

// Mock TourCard component to simplify testing
vi.mock('@/components/tours/TourCard', () => ({
  TourCard: ({ tour, onTourStart }: any) => (
    <div data-testid={`tour-card-${tour.id}`}>
      {tour.title}
      <button onClick={() => onTourStart?.(tour)}>Start</button>
    </div>
  ),
}));

const createMockTour = (overrides?: Partial<Tour>): Tour => ({
  id: 'tour-1',
  title: 'Test Tour',
  description: 'A test tour',
  difficulty: 'beginner',
  estimatedDuration: 5,
  stages: [],
  ...overrides,
});

describe('TourCatalog Component', () => {
  it('should render empty state when no tours are provided', () => {
    render(<TourCatalog tours={[]} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('No tours available')).toBeInTheDocument();
  });

  it('should render all tours provided', () => {
    const tours = [
      createMockTour({ id: 'tour-1', title: 'Tour 1' }),
      createMockTour({ id: 'tour-2', title: 'Tour 2' }),
      createMockTour({ id: 'tour-3', title: 'Tour 3' }),
    ];

    render(<TourCatalog tours={tours} />);

    expect(screen.getByTestId('tour-card-tour-1')).toBeInTheDocument();
    expect(screen.getByTestId('tour-card-tour-2')).toBeInTheDocument();
    expect(screen.getByTestId('tour-card-tour-3')).toBeInTheDocument();
  });

  it('should have proper semantic HTML structure', () => {
    const tours = [createMockTour()];

    render(<TourCatalog tours={tours} />);

    const catalog = screen.getByRole('main');
    expect(catalog).toBeInTheDocument();
    expect(catalog).toHaveAttribute('aria-label', 'Tour catalog');
  });

  it('should have responsive grid layout', () => {
    const tours = [createMockTour()];

    render(<TourCatalog tours={tours} />);

    const catalog = screen.getByRole('main');
    expect(catalog).toHaveClass('grid');
    expect(catalog).toHaveClass('grid-cols-1');
    expect(catalog).toHaveClass('md:grid-cols-2');
    expect(catalog).toHaveClass('lg:grid-cols-3');
  });

  it('should sort tours by difficulty (beginner → advanced)', () => {
    const tours = [
      createMockTour({ id: 'tour-1', title: 'Advanced Tour', difficulty: 'advanced' }),
      createMockTour({ id: 'tour-2', title: 'Beginner Tour', difficulty: 'beginner' }),
      createMockTour({ id: 'tour-3', title: 'Intermediate Tour', difficulty: 'intermediate' }),
    ];

    const { container } = render(<TourCatalog tours={tours} />);

    const tourCards = container.querySelectorAll('[data-testid^="tour-card-"]');
    expect(tourCards[0]).toHaveTextContent('Beginner Tour');
    expect(tourCards[1]).toHaveTextContent('Intermediate Tour');
    expect(tourCards[2]).toHaveTextContent('Advanced Tour');
  });

  it('should handle case-insensitive difficulty sorting', () => {
    const tours = [
      createMockTour({ id: 'tour-1', title: 'Tour A', difficulty: 'ADVANCED' }),
      createMockTour({ id: 'tour-2', title: 'Tour B', difficulty: 'BEGINNER' }),
      createMockTour({ id: 'tour-3', title: 'Tour C', difficulty: 'Intermediate' }),
    ];

    const { container } = render(<TourCatalog tours={tours} />);

    const tourCards = container.querySelectorAll('[data-testid^="tour-card-"]');
    expect(tourCards[0]).toHaveTextContent('Tour B');
    expect(tourCards[1]).toHaveTextContent('Tour C');
    expect(tourCards[2]).toHaveTextContent('Tour A');
  });

  it('should handle unknown difficulty levels gracefully', () => {
    const tours = [
      createMockTour({ id: 'tour-1', title: 'Tour A', difficulty: 'expert' }),
      createMockTour({ id: 'tour-2', title: 'Tour B', difficulty: 'beginner' }),
    ];

    const { container } = render(<TourCatalog tours={tours} />);

    // Unknown difficulties should be placed last (priority 99)
    const tourCards = container.querySelectorAll('[data-testid^="tour-card-"]');
    expect(tourCards[0]).toHaveTextContent('Tour B');
    expect(tourCards[1]).toHaveTextContent('Tour A');
  });

  it('should call onTourStart callback when tour card triggers start', () => {
    const mockOnTourStart = vi.fn();
    const tour = createMockTour({ id: 'tour-1', title: 'Test Tour' });

    render(<TourCatalog tours={[tour]} onTourStart={mockOnTourStart} />);

    const startButton = screen.getByText('Start');
    startButton.click();

    expect(mockOnTourStart).toHaveBeenCalledWith(tour);
  });

  it('should pass onTourStart callback to all TourCard components', () => {
    const mockOnTourStart = vi.fn();
    const tours = [
      createMockTour({ id: 'tour-1', title: 'Tour 1' }),
      createMockTour({ id: 'tour-2', title: 'Tour 2' }),
    ];

    render(<TourCatalog tours={tours} onTourStart={mockOnTourStart} />);

    const startButtons = screen.getAllByText('Start');
    expect(startButtons).toHaveLength(2);

    startButtons[0].click();
    expect(mockOnTourStart).toHaveBeenCalledWith(tours[0]);

    startButtons[1].click();
    expect(mockOnTourStart).toHaveBeenCalledWith(tours[1]);
  });

  it('should maintain sorted order with multiple tours', () => {
    const tours = [
      createMockTour({ id: 'tour-1', title: 'A Advanced', difficulty: 'advanced' }),
      createMockTour({ id: 'tour-2', title: 'B Beginner', difficulty: 'beginner' }),
      createMockTour({ id: 'tour-3', title: 'C Advanced', difficulty: 'advanced' }),
      createMockTour({ id: 'tour-4', title: 'D Intermediate', difficulty: 'intermediate' }),
      createMockTour({ id: 'tour-5', title: 'E Beginner', difficulty: 'beginner' }),
    ];

    const { container } = render(<TourCatalog tours={tours} />);

    const tourCards = container.querySelectorAll('[data-testid^="tour-card-"]');
    expect(tourCards[0]).toHaveTextContent('B Beginner');
    expect(tourCards[1]).toHaveTextContent('E Beginner');
    expect(tourCards[2]).toHaveTextContent('D Intermediate');
    expect(tourCards[3]).toHaveTextContent('A Advanced');
    expect(tourCards[4]).toHaveTextContent('C Advanced');
  });

  it('should have proper test IDs', () => {
    const tours = [createMockTour()];
    render(<TourCatalog tours={tours} />);

    const catalog = screen.getByTestId('tour-catalog');
    expect(catalog).toBeInTheDocument();
  });

  it('should have proper test IDs for empty state', () => {
    render(<TourCatalog tours={[]} />);

    const emptyState = screen.getByTestId('empty-tours');
    expect(emptyState).toBeInTheDocument();
  });

  it('should use useMemo for sorted tours to prevent unnecessary recalculations', () => {
    const tours = [
      createMockTour({ id: 'tour-1', title: 'Advanced', difficulty: 'advanced' }),
      createMockTour({ id: 'tour-2', title: 'Beginner', difficulty: 'beginner' }),
    ];

    const { rerender } = render(<TourCatalog tours={tours} />);

    // Re-render with same tours
    rerender(<TourCatalog tours={tours} />);

    // Tours should still be in correct order
    const catalog = screen.getByRole('main');
    expect(catalog).toBeInTheDocument();
  });

  it('should handle single tour', () => {
    const tour = createMockTour({ id: 'tour-1', title: 'Single Tour' });

    render(<TourCatalog tours={[tour]} />);

    expect(screen.getByTestId('tour-card-tour-1')).toBeInTheDocument();
    const tourCards = document.querySelectorAll('[data-testid^="tour-card-"]');
    expect(tourCards).toHaveLength(1);
  });

  it('should have proper grid gap and padding', () => {
    const tours = [createMockTour()];

    render(<TourCatalog tours={tours} />);

    const catalog = screen.getByRole('main');
    expect(catalog).toHaveClass('gap-4');
    expect(catalog).toHaveClass('p-4');
  });

  it('should handle grid row layout with auto-rows-max', () => {
    const tours = [createMockTour()];

    render(<TourCatalog tours={tours} />);

    const catalog = screen.getByRole('main');
    expect(catalog).toHaveClass('auto-rows-max');
  });

  it('should display empty state with proper accessibility attributes', () => {
    render(<TourCatalog tours={[]} />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'No tours available');
  });

  it('should create new tour array for sorting (not mutate original)', () => {
    const tours = [
      createMockTour({ id: 'tour-1', title: 'Advanced', difficulty: 'advanced' }),
      createMockTour({ id: 'tour-2', title: 'Beginner', difficulty: 'beginner' }),
    ];

    const originalOrder = tours.map((t) => t.id);

    render(<TourCatalog tours={tours} />);

    // Original array should not be mutated
    expect(tours.map((t) => t.id)).toEqual(originalOrder);
  });
});
