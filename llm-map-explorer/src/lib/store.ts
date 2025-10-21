
import { create } from 'zustand';
import type { Capability, Landmark } from '@/types/data';

/**
 * Represents a selected entity on the map, which can be a capability or a landmark.
 */
export type SelectedEntity = {
  type: 'capability' | 'landmark';
  id: string;
};

/**
 * Represents the state of the interactive map.
 */
interface MapState {
  /**
   * An array of all capability data points to be displayed on the map.
   */
  capabilities: Capability[];
  /**
   * An array of all landmark data points to be displayed on the map.
   */
  landmarks: Landmark[];
  /**
   * The current zoom level of the map.
   */
  currentZoom: number;
  /**
   * The currently selected entity (capability or landmark) on the map.
   */
  selectedEntity: SelectedEntity | null;
  /**
   * Sets the capabilities data in the store.
   * @param capabilities - An array of capability objects.
   */
  setCapabilities: (capabilities: Capability[]) => void;
  /**
   * Sets the landmarks data in the store.
   * @param landmarks - An array of landmark objects.
   */
  setLandmarks: (landmarks: Landmark[]) => void;
  /**
   * Sets the current zoom level of the map.
   * @param zoom - The new zoom level.
   */
  setCurrentZoom: (zoom: number) => void;
  /**
   * Sets the currently selected entity.
   * @param type - The type of the entity ('capability' or 'landmark').
   * @param id - The ID of the entity.
   */
  selectEntity: (type: 'capability' | 'landmark', id: string) => void;
  /**
   * Clears the currently selected entity.
   */
  clearSelection: () => void;
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
  landmarks: [],
  currentZoom: 0,
  selectedEntity: null,
  setCapabilities: (capabilities) => set({ capabilities }),
  setLandmarks: (landmarks) => set({ landmarks }),
  setCurrentZoom: (zoom) => set({ currentZoom: zoom }),
  selectEntity: (type, id) => set({ selectedEntity: { type, id } }),
  clearSelection: () => set({ selectedEntity: null }),
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
