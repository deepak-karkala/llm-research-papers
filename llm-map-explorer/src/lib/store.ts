
import { create } from 'zustand';
import type { Capability, Landmark } from '@/types/data';
import type { Map as LeafletMap } from 'leaflet';

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
   * Whether the InfoPanel should be open and showing entity details.
   */
  infoPanelOpen: boolean;
  /**
   * Reference to the Leaflet map instance for programmatic control.
   */
  mapRef: LeafletMap | null;
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
   * Sets whether the InfoPanel should be open.
   * @param isOpen - Whether the panel should be open.
   */
  setInfoPanelOpen: (isOpen: boolean) => void;
  /**
   * Sets the map reference for programmatic control.
   * @param mapRef - The Leaflet map instance or null.
   */
  setMapRef: (mapRef: LeafletMap | null) => void;
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
  infoPanelOpen: false,
  mapRef: null,
  setCapabilities: (capabilities) => set({ capabilities }),
  setLandmarks: (landmarks) => set({ landmarks }),
  setCurrentZoom: (zoom) => set({ currentZoom: zoom }),
  selectEntity: (type, id) => set({ selectedEntity: { type, id }, infoPanelOpen: true }),
  clearSelection: () => set({ selectedEntity: null, infoPanelOpen: false }),
  setInfoPanelOpen: (isOpen) => set({ infoPanelOpen: isOpen }),
  setMapRef: (mapRef) => set({ mapRef }),
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
