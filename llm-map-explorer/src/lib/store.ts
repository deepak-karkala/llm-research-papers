
import { create } from 'zustand';
import type { Capability } from '@/types/data';

/**
 * Represents the state of the interactive map.
 */
interface MapState {
  /**
   * An array of all capability data points to be displayed on the map.
   */
  capabilities: Capability[];
  /**
   * The current zoom level of the map.
   */
  currentZoom: number;
  /**
   * Sets the capabilities data in the store.
   * @param capabilities - An array of capability objects.
   */
  setCapabilities: (capabilities: Capability[]) => void;
  /**
   * Sets the current zoom level of the map.
   * @param zoom - The new zoom level.
   */
  setCurrentZoom: (zoom: number) => void;
  /**
   * Returns a filtered list of capabilities that should be visible at the current zoom level.
   * @returns An array of visible capabilities.
   */
  getVisibleCapabilities: () => Capability[];
}

/**
 * A Zustand store for managing the state of the interactive map.
 */
export const useMapStore = create<MapState>((set, get) => ({
  capabilities: [],
  currentZoom: 0,
  setCapabilities: (capabilities) => set({ capabilities }),
  setCurrentZoom: (zoom) => set({ currentZoom: zoom }),
  getVisibleCapabilities: () => {
    const { capabilities, currentZoom } = get();
    // Z0 (Continental): 0 <= zoom < 1
    if (currentZoom < 1) {
      return capabilities.filter((c) => c.level === 'continent');
    }
    // Z1 (Archipelago): 1 <= zoom < 2
    if (currentZoom < 2) {
      return capabilities.filter((c) => c.level === 'continent' || c.level === 'archipelago');
    }
    // Z2 (Island): 2 <= zoom <= 3
    return capabilities;
  },
}));
