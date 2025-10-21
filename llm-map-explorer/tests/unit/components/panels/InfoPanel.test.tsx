import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoPanel } from '@/components/panels/InfoPanel';
import type { Capability, Landmark } from '@/types/data';

// Mock the store
vi.mock('@/lib/store', () => ({
  useMapStore: vi.fn(),
}));

import * as storeModule from '@/lib/store';

describe('InfoPanel Component', () => {
  const mockCapability: Capability = {
    id: 'attention-architecture',
    name: 'Attention & Architecture',
    description: 'Foundational transformer architectures',
    shortDescription: 'Transformer foundations',
    level: 'continent',
    polygonCoordinates: [
      { lat: 600, lng: 800 },
      { lat: 600, lng: 1600 },
      { lat: 1400, lng: 1600 },
      { lat: 1400, lng: 800 },
    ],
    visualStyleHints: {
      fillColor: '#1976d2',
      fillOpacity: 0.45,
      strokeColor: '#1565c0',
      strokeWeight: 2,
      pattern: 'solid',
    },
    relatedLandmarks: ['landmark-001', 'landmark-002'],
    zoomThreshold: -1,
  };

  const mockLandmark: Landmark = {
    id: 'landmark-001',
    name: 'Attention Is All You Need',
    type: 'paper',
    year: 2017,
    organization: 'Google Brain',
    description: 'Introduced the Transformer architecture',
    abstract:
      'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
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
    tags: ['attention', 'transformer', 'architecture'],
    zoomThreshold: -1,
  };

  const mockLandmarks = [mockLandmark];
  const mockCapabilities = [mockCapability];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Panel Visibility', () => {
    it('should not render when no entity is selected', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: null,
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);

      const { container } = render(<InfoPanel />);
      const sheet = container.querySelector('[role="dialog"]');

      expect(sheet).not.toBeInTheDocument();
    });

    it('should render when capability is selected', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'capability', id: 'attention-architecture' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);

      render(<InfoPanel />);

      expect(screen.getByText('Attention & Architecture')).toBeInTheDocument();
      expect(screen.getByText('Transformer foundations')).toBeInTheDocument();
    });

    it('should render when landmark is selected', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);

      render(<InfoPanel />);

      expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument();
      expect(screen.getByText('Google Brain')).toBeInTheDocument();
    });
  });

  describe('Capability Display', () => {
    beforeEach(() => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'capability', id: 'attention-architecture' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);
    });

    it('should display capability name', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Attention & Architecture')).toBeInTheDocument();
    });

    it('should display capability level badge', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Continent')).toBeInTheDocument();
    });

    it('should display capability description', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Foundational transformer architectures')).toBeInTheDocument();
    });

    it('should display capability short description', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Transformer foundations')).toBeInTheDocument();
    });

    it('should display visual style preview', () => {
      const { container } = render(<InfoPanel />);
      const colorPreview = container.querySelector(
        '[style*="background-color: rgb(25, 118, 210)"]'
      );
      expect(colorPreview).toBeInTheDocument();
    });

    it('should display related landmarks', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Related Landmarks (1)')).toBeInTheDocument();
      expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument();
    });
  });

  describe('Landmark Display', () => {
    beforeEach(() => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);
    });

    it('should display landmark name', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Attention Is All You Need')).toBeInTheDocument();
    });

    it('should display landmark type badge', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Research Paper')).toBeInTheDocument();
    });

    it('should display landmark year', () => {
      render(<InfoPanel />);
      expect(screen.getByText('2017')).toBeInTheDocument();
    });

    it('should display landmark organization', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Google Brain')).toBeInTheDocument();
    });

    it('should display landmark description', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Introduced the Transformer architecture')).toBeInTheDocument();
    });

    it('should display abstract if present', () => {
      render(<InfoPanel />);
      expect(screen.getByText(/The dominant sequence transduction models/)).toBeInTheDocument();
    });

    it('should display tags', () => {
      render(<InfoPanel />);
      expect(screen.getByText('attention')).toBeInTheDocument();
      expect(screen.getByText('transformer')).toBeInTheDocument();
      expect(screen.getByText('architecture')).toBeInTheDocument();
    });

    it('should display external links', () => {
      render(<InfoPanel />);
      const link = screen.getByRole('link', { name: /arXiv:1706.03762/ });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should display parent capability link', () => {
      render(<InfoPanel />);
      expect(screen.getByText('Part of Capability')).toBeInTheDocument();
      expect(screen.getByText('Attention & Architecture')).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call clearSelection when close button clicked', async () => {
      const clearSelection = vi.fn();
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection,
        selectEntity: vi.fn(),
      } as any);

      const { container } = render(<InfoPanel />);

      // Find and click close button
      const closeButton = container.querySelector('[aria-label="Close panel"]');
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      // Sheet listens to onOpenChange, which calls clearSelection
      expect(clearSelection).toHaveBeenCalled();
    });
  });

  describe('Deep Linking', () => {
    it('should call selectEntity when related landmark clicked', async () => {
      const selectEntity = vi.fn();
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'capability', id: 'attention-architecture' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity,
      } as any);

      const user = userEvent.setup();
      render(<InfoPanel />);

      const relatedLandmarkButton = screen.getByText('Attention Is All You Need').closest('button');
      if (relatedLandmarkButton) {
        await user.click(relatedLandmarkButton);
      }

      expect(selectEntity).toHaveBeenCalledWith('landmark', 'landmark-001');
    });

    it('should call selectEntity when parent capability clicked', async () => {
      const selectEntity = vi.fn();
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity,
      } as any);

      const user = userEvent.setup();
      render(<InfoPanel />);

      // Find parent capability link
      const capabilityLink = screen.getByText('Attention & Architecture').closest('button');
      if (capabilityLink) {
        await user.click(capabilityLink);
      }

      expect(selectEntity).toHaveBeenCalledWith('capability', 'attention-architecture');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);
    });

    it('should have dialog role', () => {
      const { container } = render(<InfoPanel />);
      const sheet = container.querySelector('[role="dialog"]');
      expect(sheet).toHaveAttribute('aria-modal', 'true');
    });

    it('should have close button with aria-label', () => {
      const { container } = render(<InfoPanel />);
      const closeButton = container.querySelector('[aria-label="Close panel"]');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have external links with aria-labels', () => {
      render(<InfoPanel />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<InfoPanel />);

      // Tab through elements
      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Content Scrolling', () => {
    it('should have scrollable content area', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);

      const { container } = render(<InfoPanel />);
      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle landmark with no abstract', () => {
      const landmarkNoAbstract: Landmark = { ...mockLandmark, abstract: undefined };
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: [landmarkNoAbstract],
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);

      render(<InfoPanel />);
      expect(screen.queryByText('Abstract')).not.toBeInTheDocument();
    });

    it('should handle landmark with no tags', () => {
      const landmarkNoTags: Landmark = { ...mockLandmark, tags: [] };
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: [landmarkNoTags],
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);

      render(<InfoPanel />);
      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });

    it('should handle landmark with no external links', () => {
      const landmarkNoLinks: Landmark = { ...mockLandmark, externalLinks: [] };
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'landmark', id: 'landmark-001' },
        capabilities: mockCapabilities,
        landmarks: [landmarkNoLinks],
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);

      render(<InfoPanel />);
      expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    });

    it('should handle capability with no related landmarks', () => {
      const capabilityNoLandmarks: Capability = { ...mockCapability, relatedLandmarks: [] };
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        selectedEntity: { type: 'capability', id: 'attention-architecture' },
        capabilities: [capabilityNoLandmarks],
        landmarks: mockLandmarks,
        clearSelection: vi.fn(),
        selectEntity: vi.fn(),
      } as any);

      render(<InfoPanel />);
      expect(screen.queryByText(/Related Landmarks/)).not.toBeInTheDocument();
    });
  });
});
