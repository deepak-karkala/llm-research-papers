
import { useMemo } from 'react';
import { useMapStore } from '@/lib/store';
import type { Capability } from '@/types/data';

/**
 * A custom hook that determines which capabilities should be visible
 * based on the current zoom level, implementing progressive disclosure.
 *
 * This hook subscribes to the map store's capabilities and currentZoom state,
 * then retrieves the filtered list of visible capabilities based on the zoom level.
 * The result is memoized to prevent unnecessary recalculations.
 *
 * @returns {Capability[]} An array of capabilities that are visible at the current zoom level.
 */
export function useProgressiveDisclosure(): Capability[] {
  // Subscribe to getVisibleCapabilities which internally depends on capabilities and currentZoom
  const getVisibleCapabilities = useMapStore((state) => state.getVisibleCapabilities);

  const visibleCapabilities = useMemo(() => {
    return getVisibleCapabilities();
  }, [getVisibleCapabilities]);

  return visibleCapabilities;
}
