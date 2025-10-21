'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMap } from 'react-leaflet';
import { useMapStore } from '@/lib/store';
import { debounce, type BoundingBox } from '@/lib/utils';
import type { Landmark } from '@/types/data';

/**
 * Custom hook for viewport-based landmark culling
 *
 * This hook implements performance optimization by only rendering landmarks
 * that are within the visible viewport plus a 20% buffer. This approach:
 * - Reduces DOM nodes significantly (200+ → ~50-100 visible)
 * - Prevents landmarks from flickering during pan/zoom animations
 * - Maintains smooth 60fps performance with large datasets
 * - Updates efficiently on pan/zoom with 100ms debounce
 *
 * Usage:
 * ```tsx
 * const visibleLandmarks = useLandmarkCulling();
 * ```
 */
export function useLandmarkCulling(): Landmark[] {
  const mapRef = useMap();
  const allLandmarks = useMapStore(state => state.landmarks);
  const [visibleLandmarks, setVisibleLandmarks] = useState<Landmark[]>([]);

  /**
   * Calculate visible bounds with 20% buffer
   * Returns null if map is not yet initialized
   */
  const calculateVisibleBounds = useCallback((): BoundingBox | null => {
    if (!mapRef) return null;

    try {
      const bounds = mapRef.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      // Calculate 20% buffer on each side
      const latRange = ne.lat - sw.lat;
      const lngRange = ne.lng - sw.lng;
      const latBuffer = latRange * 0.2;
      const lngBuffer = lngRange * 0.2;

      return {
        north: ne.lat + latBuffer,
        south: sw.lat - latBuffer,
        east: ne.lng + lngBuffer,
        west: sw.lng - lngBuffer,
      };
    } catch (error) {
      console.warn('useLandmarkCulling: Error calculating bounds', error);
      return null;
    }
  }, [mapRef]);

  /**
   * Check if a landmark is within the bounding box
   */
  const isLandmarkVisible = useCallback(
    (landmark: Landmark, bounds: BoundingBox): boolean => {
      if (!landmark.coordinates) return false;

      const { lat, lng } = landmark.coordinates;
      return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      );
    },
    []
  );

  /**
   * Filter landmarks based on current viewport bounds
   * This is called after map pan/zoom events with debouncing
   */
  const handleMapChange = useCallback(() => {
    const bounds = calculateVisibleBounds();
    if (!bounds) {
      // Map not ready yet, show all landmarks for now
      setVisibleLandmarks(allLandmarks);
      return;
    }

    // Filter landmarks to only those in viewport + buffer
    const visible = allLandmarks.filter(landmark =>
      isLandmarkVisible(landmark, bounds)
    );

    setVisibleLandmarks(visible);
  }, [allLandmarks, calculateVisibleBounds, isLandmarkVisible]);

  /**
   * Create debounced handler to avoid excessive recalculations
   * Waits 100ms after last map event before filtering landmarks
   */
  const debouncedHandleMapChange = useMemo(
    () => debounce(handleMapChange, 100),
    [handleMapChange]
  );

  /**
   * Setup map event listeners for pan and zoom events
   * Cleanup is performed in the useEffect return function
   */
  useEffect(() => {
    if (!mapRef) return;

    // Attach event listeners to map
    mapRef.on('moveend', debouncedHandleMapChange);
    mapRef.on('zoomend', debouncedHandleMapChange);

    // Perform initial calculation
    handleMapChange();

    // Cleanup: remove event listeners to prevent memory leaks
    return () => {
      mapRef.off('moveend', debouncedHandleMapChange);
      mapRef.off('zoomend', debouncedHandleMapChange);
    };
  }, [mapRef, debouncedHandleMapChange, handleMapChange]);

  return visibleLandmarks;
}
