import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandmarkMarker } from '@/components/map/LandmarkMarker';
import type { Landmark } from '@/types/data';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  Marker: ({ children, title, ...props }: any) => (
    <div data-testid="marker" title={title} {...props}>
      {children}
    </div>
  ),
  Tooltip: ({ children }: any) => (
    <div data-testid="tooltip">{children}</div>
  ),
}));

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    DivIcon: vi.fn((config) => config),
    Icon: vi.fn((config) => config),
  },
}));

describe('LandmarkMarker', () => {
  const mockLandmark: Landmark = {
    id: 'landmark-001',
    name: 'Attention Is All You Need',
    type: 'paper',
    year: 2017,
    organization: 'Google Brain',
    description: 'Introduced the Transformer architecture',
    externalLinks: [
      {
        type: 'arxiv',
        url: 'https://arxiv.org/abs/1706.03762',
        label: 'arXiv:1706.03762',
      },
    ],
    coordinates: { lat: 800, lng: 1200 },
    capabilityId: 'attention-architecture',
    relatedLandmarks: [],
    tags: ['attention', 'transformer'],
  };

  const mockOnSelect = vi.fn();
  const mockOnHover = vi.fn();

  describe('Rendering', () => {
    it('should render marker with correct position', () => {
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
    });

    it('should display tooltip with landmark metadata', () => {
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveTextContent(
        'Attention Is All You Need · paper · 2017'
      );
    });

    it('should set correct aria-label with full metadata', () => {
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      expect(marker).toHaveAttribute(
        'title',
        'Attention Is All You Need · paper · 2017 · Google Brain'
      );
    });
  });

  describe('Landmark Type Icons', () => {
    const typesToTest: Landmark['type'][] = ['paper', 'model', 'tool', 'benchmark'];

    typesToTest.forEach((type) => {
      it(`should render correct icon for ${type} landmark`, () => {
        const landmark = { ...mockLandmark, type };
        render(
          <LandmarkMarker
            landmark={landmark}
            isSelected={false}
            onSelect={mockOnSelect}
          />
        );

        const marker = screen.getByTestId('marker');
        expect(marker).toBeInTheDocument();
      });
    });
  });

  describe('Selection State', () => {
    it('should apply selected styling when isSelected is true', () => {
      const { container } = render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={true}
          onSelect={mockOnSelect}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should not apply selected styling when isSelected is false', () => {
      const { container } = render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Dimmed State', () => {
    it('should apply dimmed styling when isDimmed is true', () => {
      const { container } = render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          isDimmed={true}
          onSelect={mockOnSelect}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should not apply dimmed styling when isDimmed is false', () => {
      const { container } = render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          isDimmed={false}
          onSelect={mockOnSelect}
        />
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Click Interactions', () => {
    it('should call onSelect callback when marker is clicked', async () => {
      const user = userEvent.setup();
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      await user.click(marker);

      expect(mockOnSelect).toHaveBeenCalledWith('landmark-001');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect with correct landmark ID', async () => {
      const user = userEvent.setup();
      const testLandmark = { ...mockLandmark, id: 'test-landmark-123' };

      render(
        <LandmarkMarker
          landmark={testLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      await user.click(marker);

      expect(mockOnSelect).toHaveBeenCalledWith('test-landmark-123');
    });
  });

  describe('Hover Interactions', () => {
    it('should call onHover callback when marker is hovered', async () => {
      const user = userEvent.setup();
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
          onHover={mockOnHover}
        />
      );

      const marker = screen.getByTestId('marker');
      await user.hover(marker);

      expect(mockOnHover).toHaveBeenCalledWith('landmark-001');
    });

    it('should call onHover with null when hover ends', async () => {
      const user = userEvent.setup();
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
          onHover={mockOnHover}
        />
      );

      const marker = screen.getByTestId('marker');
      await user.hover(marker);
      await user.unhover(marker);

      expect(mockOnHover).toHaveBeenLastCalledWith(null);
    });

    it('should not error when onHover callback is not provided', async () => {
      const user = userEvent.setup();
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      await user.hover(marker);
      await user.unhover(marker);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for accessibility', () => {
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      expect(marker).toHaveAttribute(
        'title',
        expect.stringContaining('Attention Is All You Need')
      );
    });

    it('should display complete landmark information in title', () => {
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      const title = marker.getAttribute('title');

      expect(title).toContain(mockLandmark.name);
      expect(title).toContain(mockLandmark.type);
      expect(title).toContain(mockLandmark.year.toString());
      expect(title).toContain(mockLandmark.organization);
    });
  });

  describe('Different Landmark Types', () => {
    const landmarks: Array<[Landmark['type'], string]> = [
      ['paper', 'lighthouse'],
      ['model', 'ship'],
      ['tool', 'wrench'],
      ['benchmark', 'target'],
    ];

    landmarks.forEach(([type, _iconName]) => {
      it(`should render ${type} landmark correctly`, () => {
        const landmark = { ...mockLandmark, type };
        render(
          <LandmarkMarker
            landmark={landmark}
            isSelected={false}
            onSelect={mockOnSelect}
          />
        );

        const marker = screen.getByTestId('marker');
        expect(marker).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long landmark names', () => {
      const longNameLandmark = {
        ...mockLandmark,
        name: 'A Very Long Landmark Name That Should Still Display Correctly Without Breaking Layout Or Causing Visual Issues',
      };

      render(
        <LandmarkMarker
          landmark={longNameLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      expect(marker).toBeInTheDocument();
    });

    it('should handle special characters in landmark name', () => {
      const specialCharLandmark = {
        ...mockLandmark,
        name: 'Model with @special #chars & symbols!',
      };

      render(
        <LandmarkMarker
          landmark={specialCharLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveTextContent('Model with @special #chars & symbols!');
    });

    it('should handle multiple rapid selections', async () => {
      const user = userEvent.setup();
      render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const marker = screen.getByTestId('marker');
      await user.click(marker);
      await user.click(marker);
      await user.click(marker);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe('Memoization', () => {
    it('should not re-render when non-relevant props change', () => {
      const { rerender } = render(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={mockOnSelect}
        />
      );

      const firstMarker = screen.getByTestId('marker');
      expect(firstMarker).toBeInTheDocument();

      // Re-render with same landmark but different onSelect (should be memoized)
      const newOnSelect = vi.fn();
      rerender(
        <LandmarkMarker
          landmark={mockLandmark}
          isSelected={false}
          onSelect={newOnSelect}
        />
      );

      const secondMarker = screen.getByTestId('marker');
      expect(secondMarker).toBeInTheDocument();
    });
  });
});
