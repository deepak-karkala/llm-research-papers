
import { describe, it, expect, beforeEach } from 'vitest';
import { useMapStore } from '@/lib/store';
import type { Capability } from '@/types/data';

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

describe('useMapStore', () => {
  beforeEach(() => {
    useMapStore.setState({
      capabilities: [],
      currentZoom: 0,
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
});
