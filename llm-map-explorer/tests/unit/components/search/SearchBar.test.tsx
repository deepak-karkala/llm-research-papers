/**
 * Unit tests for SearchBar component
 * Tests search functionality, debouncing, result grouping, and accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/search/SearchBar';
import type { Capability, Landmark } from '@/types/data';

// Mock the store
vi.mock('@/lib/store', () => ({
  useMapStore: vi.fn(),
}));

// Mock the search library
vi.mock('@/lib/search', () => ({
  initializeSearchIndex: vi.fn(() => ({})),
  search: vi.fn(() => []),
}));

import * as storeModule from '@/lib/store';
import * as searchModule from '@/lib/search';

describe('SearchBar Component', () => {
  const mockCapabilities: Capability[] = [
    {
      id: 'attention-architecture',
      name: 'Attention & Architecture',
      description: 'Foundational transformer architectures',
      shortDescription: 'Transformer foundations',
      level: 'continent',
      polygonCoordinates: [
        { lat: 600, lng: 800 },
        { lat: 600, lng: 1600 },
      ],
      visualStyleHints: {
        fillColor: '#1976d2',
        fillOpacity: 0.45,
        strokeColor: '#1565c0',
        strokeWeight: 2,
      },
      relatedLandmarks: [],
      zoomThreshold: -1,
    },
  ];

  const mockLandmarks: Landmark[] = [
    {
      id: 'landmark-001',
      name: 'Attention Is All You Need',
      type: 'paper',
      year: 2017,
      organization: 'Google Brain',
      description: 'Introduced the Transformer architecture',
      externalLinks: [],
      coordinates: { lat: 800, lng: 1200 },
      capabilityId: 'attention-architecture',
      relatedLandmarks: [],
      tags: ['attention', 'transformer'],
      zoomThreshold: -1,
    },
    {
      id: 'landmark-002',
      name: 'GPT-3',
      type: 'model',
      year: 2020,
      organization: 'OpenAI',
      description: 'Large-scale language model with 175B parameters',
      externalLinks: [],
      coordinates: { lat: 900, lng: 1300 },
      capabilityId: 'language-models',
      relatedLandmarks: [],
      tags: ['gpt', 'language-model'],
      zoomThreshold: -1,
    },
  ];

  const mockSelectEntity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store mock
    vi.mocked(storeModule.useMapStore).mockImplementation((selector: any) => {
      const state = {
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        selectEntity: mockSelectEntity,
      };
      return selector(state);
    });

    // Reset search mock
    vi.mocked(searchModule.search).mockReturnValue([]);
  });

  afterEach(() => {
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  describe('Rendering', () => {
    it('should render search input with placeholder', () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/search papers, models, and capabilities/i);
      expect(input).toBeInTheDocument();
    });

    it('should render custom placeholder when provided', () => {
      render(<SearchBar placeholder="Custom search..." />);
      const input = screen.getByPlaceholderText('Custom search...');
      expect(input).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<SearchBar className="custom-class" />);
      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-controls'); // Controlled by Radix component
    });
  });

  describe('Search Functionality', () => {
    it('should initialize search index with data from store', () => {
      render(<SearchBar />);
      expect(searchModule.initializeSearchIndex).toHaveBeenCalledWith({
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        organizations: [],
      });
    });

    it('should debounce search queries', async () => {
      const user = userEvent.setup();
      render(<SearchBar />);

      const input = screen.getByRole('combobox');

      // Should not search immediately
      expect(searchModule.search).not.toHaveBeenCalled();

      await user.type(input, 'attention');

      // Wait for debounce to complete
      await waitFor(
        () => {
          expect(searchModule.search).toHaveBeenCalledWith('attention', {}, 10);
        },
        { timeout: 500 }
      );
    });
  });

  describe('Results Display', () => {
    it('should display search results with real timers', async () => {
      const mockResults = [
        {
          item: mockLandmarks[0],
          entityType: 'landmark' as const,
          score: 0.1,
        },
      ];

      vi.mocked(searchModule.search).mockReturnValue(mockResults);

      const user = userEvent.setup();
      render(<SearchBar />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'attention');

      // Wait for debounce
      await waitFor(
        () => {
          expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should group results by type', async () => {
      const mockResults = [
        {
          item: mockLandmarks[0],
          entityType: 'landmark' as const,
          score: 0.1,
        },
        {
          item: mockLandmarks[1],
          entityType: 'landmark' as const,
          score: 0.2,
        },
        {
          item: mockCapabilities[0],
          entityType: 'capability' as const,
          score: 0.15,
        },
      ];

      vi.mocked(searchModule.search).mockReturnValue(mockResults);

      const user = userEvent.setup();
      render(<SearchBar />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'attention');

      await waitFor(
        () => {
          expect(screen.getByText('Papers')).toBeInTheDocument();
          expect(screen.getByText('Models')).toBeInTheDocument();
          expect(screen.getByText('Capabilities')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should display result items with description', async () => {
      const mockResults = [
        {
          item: mockLandmarks[0],
          entityType: 'landmark' as const,
          score: 0.1,
        },
      ];

      vi.mocked(searchModule.search).mockReturnValue(mockResults);

      const user = userEvent.setup();
      render(<SearchBar />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'attention');

      await waitFor(
        () => {
          expect(screen.getByText(/Introduced the Transformer architecture/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should truncate long descriptions', async () => {
      const longDescription = 'A'.repeat(100);
      const mockResults = [
        {
          item: { ...mockLandmarks[0], description: longDescription },
          entityType: 'landmark' as const,
          score: 0.1,
        },
      ];

      vi.mocked(searchModule.search).mockReturnValue(mockResults);

      const user = userEvent.setup();
      render(<SearchBar />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'attention');

      await waitFor(
        () => {
          const text = screen.getByText((content) => content.includes('...'));
          expect(text).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Result Selection', () => {
    it('should call selectEntity when result is clicked', async () => {
      const mockResults = [
        {
          item: mockLandmarks[0],
          entityType: 'landmark' as const,
          score: 0.1,
        },
      ];

      vi.mocked(searchModule.search).mockReturnValue(mockResults);

      const user = userEvent.setup();
      render(<SearchBar />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'attention');

      await waitFor(
        () => {
          expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const result = screen.getByText('Attention Is All You Need');
      await user.click(result);

      await waitFor(() => {
        expect(mockSelectEntity).toHaveBeenCalledWith('landmark', 'landmark-001');
      });
    });

    it('should call onResultSelect callback when provided', async () => {
      const onResultSelect = vi.fn();
      const mockResults = [
        {
          item: mockLandmarks[0],
          entityType: 'landmark' as const,
          score: 0.1,
        },
      ];

      vi.mocked(searchModule.search).mockReturnValue(mockResults);

      const user = userEvent.setup();
      render(<SearchBar onResultSelect={onResultSelect} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'attention');

      await waitFor(
        () => {
          expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const result = screen.getByText('Attention Is All You Need');
      await user.click(result);

      await waitFor(() => {
        expect(onResultSelect).toHaveBeenCalledWith({
          item: mockLandmarks[0],
          entityType: 'landmark',
          score: 0.1,
        });
      });
    });

    it('should clear query after selection', async () => {
      const mockResults = [
        {
          item: mockLandmarks[0],
          entityType: 'landmark' as const,
          score: 0.1,
        },
      ];

      vi.mocked(searchModule.search).mockReturnValue(mockResults);

      const user = userEvent.setup();
      render(<SearchBar />);

      const input = screen.getByRole('combobox') as HTMLInputElement;
      await user.type(input, 'attention');

      await waitFor(
        () => {
          expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      const result = screen.getByText('Attention Is All You Need');
      await user.click(result);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on input', () => {
      render(<SearchBar />);
      const input = screen.getByLabelText('Search papers, models, and capabilities');
      expect(input).toBeInTheDocument();
    });

    it('should have role="listbox" on results container when results are present', async () => {
      const mockResults = [
        {
          item: mockLandmarks[0],
          entityType: 'landmark' as const,
          score: 0.1,
        },
      ];

      vi.mocked(searchModule.search).mockReturnValue(mockResults);

      const user = userEvent.setup();
      render(<SearchBar />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'attention');

      await waitFor(
        () => {
          const listboxes = screen.getAllByRole('listbox');
          expect(listboxes.length).toBeGreaterThan(0);
        },
        { timeout: 1000 }
      );
    });

    it('should have combobox role on input', () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });
  });
});
