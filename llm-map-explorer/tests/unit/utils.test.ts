/**
 * Unit tests for utility functions
 * Tests for focusEntity, calculateCentroid, and getEntityCoordinates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateCentroid, getEntityCoordinates, focusEntity } from '@/lib/utils';
import type { Capability, Landmark, LatLng } from '@/types/data';
import type L from 'leaflet';

describe('calculateCentroid', () => {
  it('should calculate centroid of a triangle correctly', () => {
    const coordinates: LatLng[] = [
      { lat: 0, lng: 0 },
      { lat: 3, lng: 0 },
      { lat: 0, lng: 3 },
    ];
    const centroid = calculateCentroid(coordinates);
    expect(centroid).toEqual({ lat: 1, lng: 1 });
  });

  it('should calculate centroid of a square correctly', () => {
    const coordinates: LatLng[] = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 2 },
      { lat: 2, lng: 2 },
      { lat: 2, lng: 0 },
    ];
    const centroid = calculateCentroid(coordinates);
    expect(centroid).toEqual({ lat: 1, lng: 1 });
  });

  it('should handle single point', () => {
    const coordinates: LatLng[] = [{ lat: 5, lng: 10 }];
    const centroid = calculateCentroid(coordinates);
    expect(centroid).toEqual({ lat: 5, lng: 10 });
  });

  it('should return null for empty array', () => {
    const coordinates: LatLng[] = [];
    const centroid = calculateCentroid(coordinates);
    expect(centroid).toBeNull();
  });

  it('should handle negative coordinates', () => {
    const coordinates: LatLng[] = [
      { lat: -1, lng: -1 },
      { lat: 1, lng: 1 },
    ];
    const centroid = calculateCentroid(coordinates);
    expect(centroid).toEqual({ lat: 0, lng: 0 });
  });
});

describe('getEntityCoordinates', () => {
  it('should return landmark coordinates', () => {
    const landmark: Landmark = {
      id: 'test-paper',
      name: 'Test Paper',
      type: 'paper',
      year: 2024,
      organization: 'Test Org',
      description: 'A test paper',
      coordinates: { lat: 50, lng: 100 },
      capabilityId: 'test-capability',
      relatedLandmarks: [],
      tags: [],
      externalLinks: [],
      zoomThreshold: 2,
    };

    const coords = getEntityCoordinates(landmark);
    expect(coords).toEqual([50, 100]);
  });

  it('should calculate centroid for capability coordinates', () => {
    const capability: Capability = {
      id: 'test-capability',
      name: 'Test Capability',
      description: 'A test capability',
      shortDescription: 'Test',
      level: 'island',
      polygonCoordinates: [
        { lat: 0, lng: 0 },
        { lat: 2, lng: 0 },
        { lat: 2, lng: 2 },
      ],
      visualStyleHints: {
        fillColor: '#ff0000',
        fillOpacity: 0.5,
        strokeColor: '#000000',
        strokeWeight: 2,
      },
      relatedLandmarks: [],
      zoomThreshold: 1,
    };

    const coords = getEntityCoordinates(capability);
    expect(coords).toBeDefined();
    expect(coords?.[0]).toBeCloseTo(1.333333, 5);
    expect(coords?.[1]).toBeCloseTo(0.666666, 5);
  });

  it('should return null for entity with no coordinates', () => {
    const invalidEntity = {
      id: 'invalid',
      name: 'Invalid Entity',
      polygonCoordinates: [],
    } as unknown as Capability;

    const coords = getEntityCoordinates(invalidEntity);
    expect(coords).toBeNull();
  });
});

describe('focusEntity', () => {
  let mockMap: Partial<L.Map>;

  beforeEach(() => {
    mockMap = {
      flyTo: vi.fn(),
      setView: vi.fn(),
      getZoom: vi.fn(() => 1),
    };
  });

  it('should warn when map ref is null', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const landmark: Landmark = {
      id: 'test-paper',
      name: 'Test Paper',
      type: 'paper',
      year: 2024,
      organization: 'Test Org',
      description: 'A test paper',
      coordinates: { lat: 50, lng: 100 },
      capabilityId: 'test-capability',
      relatedLandmarks: [],
      tags: [],
      externalLinks: [],
      zoomThreshold: 2,
    };

    focusEntity('test-paper', 'landmark', null, landmark);

    expect(consoleSpy).toHaveBeenCalledWith('focusEntity: Map reference is null');
    consoleSpy.mockRestore();
  });

  it('should warn when entity is null', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    focusEntity('test-paper', 'landmark', mockMap as L.Map, null);

    expect(consoleSpy).toHaveBeenCalledWith(
      'focusEntity: Entity with id "test-paper" and type "landmark" not found'
    );
    consoleSpy.mockRestore();
  });

  it('should call flyTo with correct parameters for landmark', () => {
    const landmark: Landmark = {
      id: 'test-paper',
      name: 'Test Paper',
      type: 'paper',
      year: 2024,
      organization: 'Test Org',
      description: 'A test paper',
      coordinates: { lat: 50, lng: 100 },
      capabilityId: 'test-capability',
      relatedLandmarks: [],
      tags: [],
      externalLinks: [],
      zoomThreshold: 2,
    };

    focusEntity('test-paper', 'landmark', mockMap as L.Map, landmark);

    expect(mockMap.flyTo).toHaveBeenCalledWith(
      [50, 100],
      2,
      expect.objectContaining({
        duration: 1,
        easeLinearity: 0.25,
      })
    );
  });

  it('should use correct zoom level for capability', () => {
    const capability: Capability = {
      id: 'test-capability',
      name: 'Test Capability',
      description: 'A test capability',
      shortDescription: 'Test',
      level: 'island',
      polygonCoordinates: [
        { lat: 0, lng: 0 },
        { lat: 2, lng: 0 },
        { lat: 2, lng: 2 },
      ],
      visualStyleHints: {
        fillColor: '#ff0000',
        fillOpacity: 0.5,
        strokeColor: '#000000',
        strokeWeight: 2,
      },
      relatedLandmarks: [],
      zoomThreshold: 1,
    };

    focusEntity('test-capability', 'capability', mockMap as L.Map, capability);

    expect(mockMap.flyTo).toHaveBeenCalledWith(
      expect.any(Array),
      1, // Zoom level for capability
      expect.any(Object)
    );
  });

  it('should fallback to setView on flyTo error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockMap.flyTo = vi.fn(() => {
      throw new Error('flyTo failed');
    });

    const landmark: Landmark = {
      id: 'test-paper',
      name: 'Test Paper',
      type: 'paper',
      year: 2024,
      organization: 'Test Org',
      description: 'A test paper',
      coordinates: { lat: 50, lng: 100 },
      capabilityId: 'test-capability',
      relatedLandmarks: [],
      tags: [],
      externalLinks: [],
      zoomThreshold: 2,
    };

    focusEntity('test-paper', 'landmark', mockMap as L.Map, landmark);

    expect(mockMap.setView).toHaveBeenCalledWith([50, 100], 2);
    consoleSpy.mockRestore();
  });
});
