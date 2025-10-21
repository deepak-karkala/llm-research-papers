import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrganizationDetails } from '@/components/panels/OrganizationDetails';
import { useMapStore } from '@/lib/store';
import type { Organization, Landmark } from '@/types/data';

// Mock the store
vi.mock('@/lib/store', () => ({
  useMapStore: vi.fn(),
}));

const mockOrganization: Organization = {
  id: 'org-001',
  name: 'OpenAI',
  description: 'AI research lab focused on large language models',
  website: 'https://openai.com',
  color: '#10A37F',
  landmarkIds: ['lm-001', 'lm-002'],
};

const mockLandmarks: Landmark[] = [
  {
    id: 'lm-001',
    name: 'GPT-2',
    type: 'model',
    year: 2019,
    organization: 'OpenAI',
    coordinates: { lat: 0, lng: 0 },
    description: 'GPT-2 model',
    capabilityId: 'cap-001',
  },
  {
    id: 'lm-002',
    name: 'GPT-3',
    type: 'model',
    year: 2020,
    organization: 'OpenAI',
    coordinates: { lat: 1, lng: 1 },
    description: 'GPT-3 model',
    capabilityId: 'cap-002',
  },
  {
    id: 'lm-003',
    name: 'Other Paper',
    type: 'paper',
    year: 2021,
    organization: 'Other Org',
    coordinates: { lat: 2, lng: 2 },
    description: 'Other paper',
    capabilityId: 'cap-003',
  },
];

describe('OrganizationDetails Component', () => {
  let mockHighlightOrganization: ReturnType<typeof vi.fn>;
  let mockClearHighlights: ReturnType<typeof vi.fn>;
  let mockOnLandmarkClick: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHighlightOrganization = vi.fn();
    mockClearHighlights = vi.fn();
    mockOnLandmarkClick = vi.fn();

    (useMapStore as any).mockReturnValue({
      landmarks: mockLandmarks,
      highlightedOrgId: null,
      highlightOrganization: mockHighlightOrganization,
      clearHighlights: mockClearHighlights,
    });
  });

  describe('Organization Display', () => {
    it('should render organization name', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.getByText('OpenAI')).toBeInTheDocument();
    });

    it('should render organization description', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(
        screen.getByText(
          'AI research lab focused on large language models'
        )
      ).toBeInTheDocument();
    });

    it('should render organization color indicator', () => {
      const { container } = render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const colorDiv = container.querySelector('div[style*="background-color"]');
      expect(colorDiv).toBeInTheDocument();
      expect(colorDiv).toHaveStyle(`background-color: ${mockOrganization.color}`);
    });

    it('should display contribution count', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.getByText('2 contributions')).toBeInTheDocument();
    });

    it('should display singular "contribution" for single contribution', () => {
      const orgWithOne = {
        ...mockOrganization,
        landmarkIds: ['lm-001'],
      };

      render(
        <OrganizationDetails
          organization={orgWithOne}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.getByText('1 contribution')).toBeInTheDocument();
    });

    it('should render website link if available', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const link = screen.getByRole('link', { name: /Visit OpenAI website/ });
      expect(link).toHaveAttribute('href', mockOrganization.website);
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should not render website section if not available', () => {
      const orgWithoutWebsite = {
        ...mockOrganization,
        website: undefined,
      };

      render(
        <OrganizationDetails
          organization={orgWithoutWebsite}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.queryByText('Website')).not.toBeInTheDocument();
    });
  });

  describe('Highlight Button', () => {
    it('should render highlight button', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = screen.getByRole('button', { name: /Highlight on Map/ });
      expect(button).toBeInTheDocument();
    });

    it('should display "Highlight on Map" text when not highlighted', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(
        screen.getByRole('button', { name: /Highlight on Map/ })
      ).toBeInTheDocument();
    });

    it('should call highlightOrganization when button clicked', async () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = screen.getByRole('button', { name: /Highlight on Map/ });
      fireEvent.click(button);

      expect(mockHighlightOrganization).toHaveBeenCalledWith(
        mockOrganization.id
      );
    });

    it('should display "Clear Highlights" when organization is highlighted', () => {
      (useMapStore as any).mockReturnValue({
        landmarks: mockLandmarks,
        highlightedOrgId: mockOrganization.id,
        highlightOrganization: mockHighlightOrganization,
        clearHighlights: mockClearHighlights,
      });

      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(
        screen.getByRole('button', { name: /Clear Highlights/ })
      ).toBeInTheDocument();
    });

    it('should call clearHighlights when button clicked while highlighted', () => {
      (useMapStore as any).mockReturnValue({
        landmarks: mockLandmarks,
        highlightedOrgId: mockOrganization.id,
        highlightOrganization: mockHighlightOrganization,
        clearHighlights: mockClearHighlights,
      });

      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = screen.getByRole('button', { name: /Clear Highlights/ });
      fireEvent.click(button);

      expect(mockClearHighlights).toHaveBeenCalled();
    });

    it('should have correct aria-pressed state', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = screen.getByRole('button', { name: /Highlight on Map/ });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have correct aria-pressed when highlighted', () => {
      (useMapStore as any).mockReturnValue({
        landmarks: mockLandmarks,
        highlightedOrgId: mockOrganization.id,
        highlightOrganization: mockHighlightOrganization,
        clearHighlights: mockClearHighlights,
      });

      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = screen.getByRole('button', { name: /Clear Highlights/ });
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have descriptive aria-label when not highlighted', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Highlight all OpenAI contributions on the map'
      );
    });

    it('should have descriptive aria-label when highlighted', () => {
      (useMapStore as any).mockReturnValue({
        landmarks: mockLandmarks,
        highlightedOrgId: mockOrganization.id,
        highlightOrganization: mockHighlightOrganization,
        clearHighlights: mockClearHighlights,
      });

      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Clear highlights for OpenAI contributions'
      );
    });
  });

  describe('Related Landmarks Display', () => {
    it('should display organization landmarks', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.getByText('GPT-2')).toBeInTheDocument();
      expect(screen.getByText('GPT-3')).toBeInTheDocument();
    });

    it('should not display other organization landmarks', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.queryByText('Other Paper')).not.toBeInTheDocument();
    });

    it('should display landmark count', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.getByText('Contributions (2)')).toBeInTheDocument();
    });

    it('should display landmark year', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.getByText(/2019/)).toBeInTheDocument();
      expect(screen.getByText(/2020/)).toBeInTheDocument();
    });

    it('should display landmark type', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(screen.getByText(/model •/)).toBeInTheDocument();
    });

    it('should call onLandmarkClick when landmark clicked', () => {
      render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const landmarkButton = screen.getByText('GPT-2').closest('button');
      fireEvent.click(landmarkButton!);

      expect(mockOnLandmarkClick).toHaveBeenCalledWith('lm-001');
    });

    it('should display empty state when no landmarks', () => {
      const orgWithNoLandmarks = {
        ...mockOrganization,
        landmarkIds: [],
      };

      render(
        <OrganizationDetails
          organization={orgWithNoLandmarks}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      expect(
        screen.getByText('No contributions yet. Check back soon!')
      ).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('should apply highlight-button-active class when highlighted', () => {
      (useMapStore as any).mockReturnValue({
        landmarks: mockLandmarks,
        highlightedOrgId: mockOrganization.id,
        highlightOrganization: mockHighlightOrganization,
        clearHighlights: mockClearHighlights,
      });

      const { container } = render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = container.querySelector('.highlight-button-active');
      expect(button).toBeInTheDocument();
    });

    it('should apply organization color as background when highlighted', () => {
      (useMapStore as any).mockReturnValue({
        landmarks: mockLandmarks,
        highlightedOrgId: mockOrganization.id,
        highlightOrganization: mockHighlightOrganization,
        clearHighlights: mockClearHighlights,
      });

      const { container } = render(
        <OrganizationDetails
          organization={mockOrganization}
          onLandmarkClick={mockOnLandmarkClick}
        />
      );

      const button = container.querySelector('button[style*="background-color"]');
      expect(button).toHaveStyle(
        `background-color: ${mockOrganization.color}`
      );
      expect(button).toHaveStyle(
        `border-color: ${mockOrganization.color}`
      );
    });
  });
});
