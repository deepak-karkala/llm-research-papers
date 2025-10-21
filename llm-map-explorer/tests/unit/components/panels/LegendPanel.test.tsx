import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LegendPanel } from '@/components/panels/LegendPanel';
import type { Capability } from '@/types/data';

// Mock the store
vi.mock('@/lib/store', () => ({
  useMapStore: vi.fn(),
}));

import * as storeModule from '@/lib/store';

describe('LegendPanel Component', () => {
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
      relatedLandmarks: [],
      zoomThreshold: -1,
    },
    {
      id: 'alignment-safety',
      name: 'Alignment & Safety',
      description: 'Model alignment and safety research',
      shortDescription: 'Safety research',
      level: 'continent',
      polygonCoordinates: [
        { lat: 600, lng: 1800 },
        { lat: 600, lng: 2600 },
        { lat: 1400, lng: 2600 },
        { lat: 1400, lng: 1800 },
      ],
      visualStyleHints: {
        fillColor: '#4caf50',
        fillOpacity: 0.45,
        strokeColor: '#388e3c',
        strokeWeight: 2,
        pattern: 'solid',
      },
      relatedLandmarks: [],
      zoomThreshold: -1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render legend panel', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);

      render(<LegendPanel />);

      expect(screen.getByText('Legend')).toBeInTheDocument();
    });

    it('should be positioned fixed at bottom-right', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);

      const { container } = render(<LegendPanel />);
      const legendContainer = container.querySelector('.fixed.bottom-4.right-4');

      expect(legendContainer).toBeInTheDocument();
    });

    it('should have region role', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);

      const { container } = render(<LegendPanel />);
      const region = container.querySelector('[role="region"]');

      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('aria-label', 'Map legend and zoom information');
    });

    it('should have aria-live for dynamic updates', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);

      const { container } = render(<LegendPanel />);
      const region = container.querySelector('[aria-live="polite"]');

      expect(region).toBeInTheDocument();
    });
  });

  describe('Icon Legend', () => {
    beforeEach(() => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);
    });

    it('should display all icon types', () => {
      render(<LegendPanel />);

      expect(screen.getByText('Paper')).toBeInTheDocument();
      expect(screen.getByText('Model')).toBeInTheDocument();
      expect(screen.getByText('Tool')).toBeInTheDocument();
      expect(screen.getByText('Benchmark')).toBeInTheDocument();
    });

    it('should display icon emojis', () => {
      const { container } = render(<LegendPanel />);

      expect(container.textContent).toContain('📄');
      expect(container.textContent).toContain('🤖');
      expect(container.textContent).toContain('🔧');
      expect(container.textContent).toContain('📊');
    });

    it('should have Icons heading', () => {
      render(<LegendPanel />);

      expect(screen.getByText('Icons')).toBeInTheDocument();
    });
  });

  describe('Zoom Level Indicator', () => {
    it('should display Continental level at zoom < 0', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: -1,
        capabilities: mockCapabilities,
      } as any);

      render(<LegendPanel />);

      expect(screen.getByText(/Continental/i)).toBeInTheDocument();
      expect(screen.getByText(/Level 0/i)).toBeInTheDocument();
    });

    it('should display Archipelago level at zoom 0', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);

      render(<LegendPanel />);

      expect(screen.getByText('Level 1: Archipelago')).toBeInTheDocument();
    });

    it('should display Island level at zoom >= 1', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1,
        capabilities: mockCapabilities,
      } as any);

      render(<LegendPanel />);

      expect(screen.getByText('Level 2: Island')).toBeInTheDocument();
    });

    it('should show visible layers', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);

      render(<LegendPanel />);

      expect(screen.getByText(/Visible:/i)).toBeInTheDocument();
      expect(screen.getByText(/Continents/i)).toBeInTheDocument();
      expect(screen.getByText(/Archipelagos/i)).toBeInTheDocument();
    });

    it('should have Zoom Level heading', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);

      render(<LegendPanel />);

      expect(screen.getByText('Zoom Level')).toBeInTheDocument();
    });
  });

  describe('Capability Color Legend', () => {
    beforeEach(() => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);
    });

    it('should not show capability colors when collapsed', () => {
      render(<LegendPanel />);

      // Capability Regions heading should not be visible when collapsed
      expect(screen.queryByText('Capability Regions')).not.toBeInTheDocument();
    });

    it('should show capability colors when expanded', async () => {
      const user = userEvent.setup();
      render(<LegendPanel />);

      // Click expand button
      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });
      await user.click(expandButton);

      expect(screen.getByText('Capability Regions')).toBeInTheDocument();
    });

    it('should display capability names when expanded', async () => {
      const user = userEvent.setup();
      render(<LegendPanel />);

      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });
      await user.click(expandButton);

      expect(screen.getByText('Attention & Architecture')).toBeInTheDocument();
      expect(screen.getByText('Alignment & Safety')).toBeInTheDocument();
    });

    it('should display color swatches when expanded', async () => {
      const user = userEvent.setup();
      const { container } = render(<LegendPanel />);

      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });
      await user.click(expandButton);

      // Check for color swatches with the correct colors
      const colorSwatches = container.querySelectorAll('[style*="background-color"]');
      expect(colorSwatches.length).toBeGreaterThan(0);
    });

    it('should show overflow message when more than 6 capabilities', async () => {
      const manyCapabilities = [
        ...mockCapabilities,
        ...Array.from({ length: 6 }, (_, i) => ({
          ...mockCapabilities[0],
          id: `cap-${i}`,
          name: `Capability ${i}`,
        })),
      ];

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: manyCapabilities,
      } as any);

      const user = userEvent.setup();
      render(<LegendPanel />);

      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });
      await user.click(expandButton);

      expect(screen.getByText(/\+\d+ more\.\.\./)).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    beforeEach(() => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);
    });

    it('should have expand button', () => {
      render(<LegendPanel />);

      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });
      expect(expandButton).toBeInTheDocument();
    });

    it('should toggle aria-expanded attribute', async () => {
      const user = userEvent.setup();
      render(<LegendPanel />);

      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });

      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(expandButton);

      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should change button label when expanded', async () => {
      const user = userEvent.setup();
      render(<LegendPanel />);

      let expandButton = screen.getByRole('button', { name: /Expand legend details/i });
      expect(expandButton).toBeInTheDocument();

      await user.click(expandButton);

      expandButton = screen.getByRole('button', { name: /Collapse legend details/i });
      expect(expandButton).toBeInTheDocument();
    });

    it('should toggle capability colors visibility', async () => {
      const user = userEvent.setup();
      render(<LegendPanel />);

      expect(screen.queryByText('Capability Regions')).not.toBeInTheDocument();

      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });
      await user.click(expandButton);

      expect(screen.getByText('Capability Regions')).toBeInTheDocument();

      await user.click(expandButton);

      expect(screen.queryByText('Capability Regions')).not.toBeInTheDocument();
    });

    it('should show chevron icon', () => {
      const { container } = render(<LegendPanel />);

      const chevron = container.querySelector('svg');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);
    });

    it('should have proper ARIA labels', () => {
      const { container } = render(<LegendPanel />);

      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-label', 'Map legend and zoom information');
    });

    it('should have aria-live for dynamic zoom updates', () => {
      const { container } = render(<LegendPanel />);

      const region = container.querySelector('[aria-live="polite"]');
      expect(region).toBeInTheDocument();
    });

    it('should have keyboard-accessible expand button', async () => {
      const user = userEvent.setup();
      render(<LegendPanel />);

      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });

      // Tab to button
      await user.tab();
      expect(document.activeElement).toBeTruthy();

      // Press Enter
      await user.keyboard('{Enter}');
      expect(screen.getByText('Capability Regions')).toBeInTheDocument();
    });

    it('should have descriptive labels for capability colors', async () => {
      const user = userEvent.setup();
      const { container } = render(<LegendPanel />);

      const expandButton = screen.getByRole('button', { name: /Expand legend details/i });
      await user.click(expandButton);

      const colorElements = container.querySelectorAll('[aria-label*="region"]');
      expect(colorElements.length).toBeGreaterThan(0);
    });
  });

  describe('Dynamic Updates', () => {
    it('should update zoom indicator when zoom changes', () => {
      const { rerender } = render(<LegendPanel />);

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: -1,
        capabilities: mockCapabilities,
      } as any);

      rerender(<LegendPanel />);
      expect(screen.getByText('Level 0: Continental')).toBeInTheDocument();

      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 1,
        capabilities: mockCapabilities,
      } as any);

      rerender(<LegendPanel />);
      expect(screen.getByText('Level 2: Island')).toBeInTheDocument();
    });

    it('should handle empty capabilities array', () => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: [],
      } as any);

      render(<LegendPanel />);

      // Should still render icon legend and zoom indicator
      expect(screen.getByText('Icons')).toBeInTheDocument();
      expect(screen.getByText('Zoom Level')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    beforeEach(() => {
      vi.mocked(storeModule.useMapStore).mockReturnValue({
        currentZoom: 0,
        capabilities: mockCapabilities,
      } as any);
    });

    it('should have z-index of 40', () => {
      const { container } = render(<LegendPanel />);
      const legendContainer = container.querySelector('.z-40');

      expect(legendContainer).toBeInTheDocument();
    });

    it('should have semi-transparent background', () => {
      const { container } = render(<LegendPanel />);
      const card = container.querySelector('.bg-background\\/95');

      expect(card).toBeInTheDocument();
    });

    it('should have backdrop blur', () => {
      const { container } = render(<LegendPanel />);
      const card = container.querySelector('.backdrop-blur-sm');

      expect(card).toBeInTheDocument();
    });

    it('should have compact width', () => {
      const { container } = render(<LegendPanel />);
      const card = container.querySelector('.w-64');

      expect(card).toBeInTheDocument();
    });
  });
});
