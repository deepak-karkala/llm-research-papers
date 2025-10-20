
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProgressiveDisclosure } from '@/hooks/useProgressiveDisclosure';
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

describe('useProgressiveDisclosure', () => {
  beforeEach(() => {
    useMapStore.setState({
      capabilities: mockCapabilities,
      currentZoom: 0,
    });
  });

  it('should return only continents at zoom level 0', () => {
    useMapStore.getState().setCurrentZoom(0);
    const { result } = renderHook(() => useProgressiveDisclosure());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].level).toBe('continent');
  });

  it('should return continents and archipelagos at zoom level 1', () => {
    useMapStore.getState().setCurrentZoom(1);
    const { result } = renderHook(() => useProgressiveDisclosure());
    expect(result.current).toHaveLength(2);
    expect(result.current.every((c) => c.level === 'continent' || c.level === 'archipelago')).toBe(true);
  });

  it('should return all capabilities at zoom level 2', () => {
    useMapStore.getState().setCurrentZoom(2);
    const { result } = renderHook(() => useProgressiveDisclosure());
    expect(result.current).toHaveLength(3);
  });
});
