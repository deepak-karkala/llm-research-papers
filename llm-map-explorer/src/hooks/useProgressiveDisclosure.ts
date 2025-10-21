
import { useMapStore } from '@/lib/store';
import type { Capability } from '@/types/data';

/**
 * A custom hook that determines which capabilities should be visible
 * based on the current zoom level, implementing progressive disclosure.
 *
 * This hook subscribes to the map store's visible capability selector so updates
 * to zoom level or capability data trigger a re-render automatically.
 *
 * @returns {Capability[]} An array of capabilities that are visible at the current zoom level.
 */
export function useProgressiveDisclosure(): Capability[] {
  return useMapStore((state) => state.getVisibleCapabilities());
}
