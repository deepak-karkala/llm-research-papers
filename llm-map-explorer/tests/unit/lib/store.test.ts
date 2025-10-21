
import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '@/lib/store';
import type { Capability, Organization } from '@/types/data';

const mockCapabilities: Capability[] = [
  {
    id: '1',
    name: 'Continent',
    description: 'Continental region',
    shortDescription: 'Continent',
    level: 'continent',
    polygonCoordinates: [],
    visualStyleHints: {
      fillColor: '#1976d2',
      fillOpacity: 0.45,
      strokeColor: '#1565c0',
      strokeWeight: 2,
    },
    relatedLandmarks: [],
    zoomThreshold: 0,
  },
  {
    id: '2',
    name: 'Archipelago',
    description: 'Archipelago region',
    shortDescription: 'Archipelago',
    level: 'archipelago',
    polygonCoordinates: [],
    visualStyleHints: {
      fillColor: '#4caf50',
      fillOpacity: 0.45,
      strokeColor: '#388e3c',
      strokeWeight: 2,
    },
    relatedLandmarks: [],
    zoomThreshold: 1,
  },
  {
    id: '3',
    name: 'Island',
    description: 'Island region',
    shortDescription: 'Island',
    level: 'island',
    polygonCoordinates: [],
    visualStyleHints: {
      fillColor: '#ff9800',
      fillOpacity: 0.45,
      strokeColor: '#f57c00',
      strokeWeight: 2,
    },
    relatedLandmarks: [],
    zoomThreshold: 2,
  },
];

const mockOrganizations: Organization[] = [
  {
    id: 'org-001',
    name: 'OpenAI',
    description: 'OpenAI research organization',
    color: '#10A37F',
    landmarkIds: ['lm-001', 'lm-002', 'lm-005'],
  },
  {
    id: 'org-002',
    name: 'Google DeepMind',
    description: 'Google DeepMind research organization',
    color: '#4285F4',
    landmarkIds: ['lm-003', 'lm-004'],
  },
  {
    id: 'org-003',
    name: 'Anthropic',
    description: 'Anthropic research organization',
    color: '#8B5CF6',
    landmarkIds: [],
  },
];

describe('useMapStore', () => {
  beforeEach(() => {
    useMapStore.setState({
      capabilities: [],
      currentZoom: 0,
      highlightedOrgId: null,
      highlightedLandmarkIds: [],
      organizations: [],
    });
  });

  it('should set capabilities', () => {
    useMapStore.getState().setCapabilities(mockCapabilities);
    expect(useMapStore.getState().capabilities).toEqual(mockCapabilities);
  });

  it('should set current zoom', () => {
    useMapStore.getState().setCurrentZoom(2);
    expect(useMapStore.getState().currentZoom).toBe(2);
  });

  describe('getVisibleCapabilities', () => {
    beforeEach(() => {
      useMapStore.getState().setCapabilities(mockCapabilities);
    });

    it('should return only continents at zoom level 0', () => {
      useMapStore.getState().setCurrentZoom(0);
      const visible = useMapStore.getState().getVisibleCapabilities();
      expect(visible).toHaveLength(1);
      expect(visible[0].level).toBe('continent');
    });

    it('should return continents and archipelagos at zoom level 1', () => {
      useMapStore.getState().setCurrentZoom(1);
      const visible = useMapStore.getState().getVisibleCapabilities();
      expect(visible).toHaveLength(2);
      expect(visible.every((c) => c.level === 'continent' || c.level === 'archipelago')).toBe(true);
    });

    it('should return all capabilities at zoom level 2', () => {
      useMapStore.getState().setCurrentZoom(2);
      const visible = useMapStore.getState().getVisibleCapabilities();
      expect(visible).toHaveLength(3);
    });
  });

  describe('Organization Highlighting', () => {
    beforeEach(() => {
      useMapStore.getState().setOrganizations(mockOrganizations);
    });

    it('should highlight organization and set highlighted landmark IDs', () => {
      useMapStore.getState().highlightOrganization('org-001');
      const state = useMapStore.getState();
      expect(state.highlightedOrgId).toBe('org-001');
      expect(state.highlightedLandmarkIds).toEqual(['lm-001', 'lm-002', 'lm-005']);
    });

    it('should handle highlighting organization with no landmarks', () => {
      useMapStore.getState().highlightOrganization('org-003');
      const state = useMapStore.getState();
      expect(state.highlightedOrgId).toBe('org-003');
      expect(state.highlightedLandmarkIds).toEqual([]);
    });

    it('should replace previous highlighting when highlighting new organization', () => {
      useMapStore.getState().highlightOrganization('org-001');
      expect(useMapStore.getState().highlightedLandmarkIds).toHaveLength(3);

      useMapStore.getState().highlightOrganization('org-002');
      const state = useMapStore.getState();
      expect(state.highlightedOrgId).toBe('org-002');
      expect(state.highlightedLandmarkIds).toEqual(['lm-003', 'lm-004']);
    });

    it('should clear highlights', () => {
      useMapStore.getState().highlightOrganization('org-001');
      expect(useMapStore.getState().highlightedOrgId).toBe('org-001');

      useMapStore.getState().clearHighlights();
      const state = useMapStore.getState();
      expect(state.highlightedOrgId).toBeNull();
      expect(state.highlightedLandmarkIds).toEqual([]);
    });

    it('should handle highlighting non-existent organization gracefully', () => {
      useMapStore.getState().highlightOrganization('org-nonexistent');
      const state = useMapStore.getState();
      expect(state.highlightedOrgId).toBe('org-nonexistent');
      expect(state.highlightedLandmarkIds).toEqual([]);
    });

    it('should maintain other state when highlighting', () => {
      useMapStore.getState().setCurrentZoom(1);
      useMapStore.getState().selectEntity('capability', 'cap-001');

      useMapStore.getState().highlightOrganization('org-001');

      const state = useMapStore.getState();
      expect(state.currentZoom).toBe(1);
      expect(state.selectedEntity).toEqual({ type: 'capability', id: 'cap-001' });
      expect(state.highlightedOrgId).toBe('org-001');
    });

    it('should maintain other state when clearing highlights', () => {
      useMapStore.getState().setCurrentZoom(2);
      useMapStore.getState().selectEntity('landmark', 'lm-001');
      useMapStore.getState().highlightOrganization('org-001');

      useMapStore.getState().clearHighlights();

      const state = useMapStore.getState();
      expect(state.currentZoom).toBe(2);
      expect(state.selectedEntity).toEqual({ type: 'landmark', id: 'lm-001' });
      expect(state.highlightedOrgId).toBeNull();
    });
  });
});
