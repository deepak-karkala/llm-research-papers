
import { create } from 'zustand';
import type { Capability, Landmark, Organization, Tour } from '@/types/data';
import type { Map as LeafletMap } from 'leaflet';
import { getOrganizationLandmarks } from '@/lib/organization-utils';

/**
 * Represents a selected entity on the map, which can be a capability, landmark, or organization.
 */
export type SelectedEntity = {
  type: 'capability' | 'landmark' | 'organization';
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
   * An array of all organization data points.
   */
  organizations: Organization[];
  /**
   * An array of all guided tours available to the user.
   */
  tours: Tour[];
  /**
   * The current zoom level of the map.
   */
  currentZoom: number;
  /**
   * The center position of the map as [latitude, longitude].
   */
  mapCenter: [number, number];
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
   * The ID of the organization currently being highlighted, or null if no highlighting is active.
   */
  highlightedOrgId: string | null;
  /**
   * An array of landmark IDs that belong to the currently highlighted organization.
   */
  highlightedLandmarkIds: string[];
  /**
   * The currently active guided tour, if any.
   */
  currentTour: Tour | null;
  /**
   * The index of the current stage in the active tour.
   */
  currentTourStageIndex: number;
  /**
   * Whether the current tour is paused.
   */
  isTourPaused: boolean;
  /**
   * Landmarks to highlight during the tour (by stage type).
   */
  tourHighlights: {
    current: string[];
    previous: string[];
    future: string[];
  };
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
   * Sets the organizations data in the store.
   * @param organizations - An array of organization objects.
   */
  setOrganizations: (organizations: Organization[]) => void;
  /**
   * Sets the current zoom level of the map.
   * @param zoom - The new zoom level.
   */
  setCurrentZoom: (zoom: number) => void;
  /**
   * Sets the center position of the map.
   * @param center - The center position as [latitude, longitude].
   */
  setMapCenter: (center: [number, number]) => void;
  /**
   * Sets the currently selected entity.
   * @param type - The type of the entity ('capability', 'landmark', or 'organization').
   * @param id - The ID of the entity.
   */
  selectEntity: (type: 'capability' | 'landmark' | 'organization', id: string) => void;
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
  /**
   * Highlights all landmarks belonging to a specific organization.
   * @param orgId - The ID of the organization to highlight.
   */
  highlightOrganization: (orgId: string) => void;
  /**
   * Clears the current highlighting, resetting the highlighted organization and landmarks.
   */
  clearHighlights: () => void;
  /**
   * Sets the tours data in the store.
   * @param tours - An array of tour objects.
   */
  setTours: (tours: Tour[]) => void;
  /**
   * Starts a new guided tour.
   * @param tour - The tour to start.
   */
  startTour: (tour: Tour) => void;
  /**
   * Advances the tour to the next or previous stage.
   * @param direction - Whether to go 'next' or 'previous'.
   */
  advanceTourStage: (direction: 'next' | 'previous') => void;
  /**
   * Exits the current tour.
   */
  exitTour: () => void;
  /**
   * Pauses the current tour.
   */
  pauseTour: () => void;
  /**
   * Resumes the paused tour.
   */
  resumeTour: () => void;
  /**
   * Updates the tour stage highlights.
   * @param current - Current stage landmark IDs.
   * @param previous - Previous stage landmark IDs.
   * @param future - Future stage landmark IDs.
   */
  updateTourHighlights: (current: string[], previous: string[], future: string[]) => void;
}

/**
 * A Zustand store for managing the state of the interactive map.
 */
export const useMapStore = create<MapState>((set, get) => ({
  capabilities: [],
  landmarks: [],
  organizations: [],
  tours: [],
  currentZoom: 0,
  mapCenter: [1536, 2048], // Default to center of map (MAP_HEIGHT/2, MAP_WIDTH/2)
  selectedEntity: null,
  infoPanelOpen: false,
  mapRef: null,
  highlightedOrgId: null,
  highlightedLandmarkIds: [],
  currentTour: null,
  currentTourStageIndex: 0,
  isTourPaused: false,
  tourHighlights: {
    current: [],
    previous: [],
    future: [],
  },
  setCapabilities: (capabilities) => set({ capabilities }),
  setLandmarks: (landmarks) => set({ landmarks }),
  setOrganizations: (organizations) => set({ organizations }),
  setCurrentZoom: (zoom) => set({ currentZoom: zoom }),
  setMapCenter: (center) => set({ mapCenter: center }),
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
  highlightOrganization: (orgId: string) => {
    const { organizations, landmarks } = get();
    const org = organizations.find((o) => o.id === orgId);
    if (!org) {
      return;
    }
    const matchedLandmarks = getOrganizationLandmarks(org, landmarks);
    set({
      highlightedOrgId: orgId,
      highlightedLandmarkIds: matchedLandmarks.map((landmark) => landmark.id),
    });
  },
  clearHighlights: () => {
    set({
      highlightedOrgId: null,
      highlightedLandmarkIds: [],
    });
  },
  setTours: (tours) => set({ tours }),
  startTour: (tour: Tour) => {
    set({
      currentTour: tour,
      currentTourStageIndex: 0,
      isTourPaused: false,
      infoPanelOpen: true,
    });
  },
  advanceTourStage: (direction: 'next' | 'previous') => {
    const { currentTour, currentTourStageIndex, isTourPaused } = get();
    if (!currentTour || isTourPaused) return;

    const totalStages = currentTour.stages.length;
    let newIndex = currentTourStageIndex;

    if (direction === 'next' && currentTourStageIndex < totalStages - 1) {
      newIndex = currentTourStageIndex + 1;
    } else if (direction === 'previous' && currentTourStageIndex > 0) {
      newIndex = currentTourStageIndex - 1;
    }

    set({ currentTourStageIndex: newIndex });
  },
  exitTour: () => {
    set({
      currentTour: null,
      currentTourStageIndex: 0,
      isTourPaused: false,
      tourHighlights: { current: [], previous: [], future: [] },
    });
  },
  pauseTour: () => {
    set({ isTourPaused: true });
  },
  resumeTour: () => {
    set({ isTourPaused: false });
  },
  updateTourHighlights: (current, previous, future) => {
    set({
      tourHighlights: {
        current,
        previous,
        future,
      },
    });
  },
}));
