import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Map as LeafletMap } from 'leaflet';
import type { Capability, Landmark, LatLng } from '@/types/data';
import { useMapStore } from '@/lib/store';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Zoom levels by entity type for optimal focus view
 */
const ZOOM_LEVEL_BY_TYPE: Record<'capability' | 'landmark' | 'organization', number> = {
  'capability': 1,    // Show entire capability region
  'landmark': 2,      // Show landmark with nearby context
  'organization': 0,  // Show full context of org's contributions
};

/**
 * Calculate the centroid of polygon coordinates
 * @param coordinates - Array of lat/lng points
 * @returns Centroid point as [lat, lng] or null if invalid
 */
export function calculateCentroid(coordinates: LatLng[]): LatLng | null {
  if (!coordinates || coordinates.length === 0) return null;

  const latSum = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
  const lngSum = coordinates.reduce((sum, coord) => sum + coord.lng, 0);

  return {
    lat: latSum / coordinates.length,
    lng: lngSum / coordinates.length,
  };
}

/**
 * Get the coordinates to focus on for a given entity
 * @param entity - The entity (Capability or Landmark)
 * @param _allLandmarks - Array of all landmarks (needed for organization calculations)
 * @returns Coordinates as [lat, lng] or null if not found
 */
export function getEntityCoordinates(
  entity: Capability | Landmark,
  _allLandmarks?: Landmark[]
): [number, number] | null {
  if ('coordinates' in entity) {
    // It's a Landmark
    const landmark = entity as Landmark;
    return [landmark.coordinates.lat, landmark.coordinates.lng];
  } else if ('polygonCoordinates' in entity) {
    // It's a Capability
    const capability = entity as Capability;
    const centroid = calculateCentroid(capability.polygonCoordinates);
    if (centroid) {
      return [centroid.lat, centroid.lng];
    }
  }

  return null;
}

/**
 * Focus on an entity on the map with smooth animation
 *
 * This function:
 * 1. Calculates appropriate zoom level for entity type
 * 2. Gets entity coordinates (centroid for capabilities, exact for landmarks)
 * 3. Pans and zooms map with smooth Leaflet animation
 * 4. Updates Zustand store with selected entity
 * 5. Triggers InfoPanel to open
 *
 * @param id - Entity ID
 * @param type - Entity type ('capability' | 'landmark' | 'organization')
 * @param mapRef - Reference to Leaflet map instance
 * @param entity - The actual entity object (Capability or Landmark)
 * @param allLandmarks - Array of all landmarks (for organization lookups)
 */
export function focusEntity(
  id: string,
  type: 'capability' | 'landmark' | 'organization',
  mapRef: LeafletMap | null,
  entity?: Capability | Landmark | null,
  allLandmarks?: Landmark[]
): void {
  if (!mapRef) {
    console.warn('focusEntity: Map reference is null');
    return;
  }

  if (!entity) {
    console.warn(`focusEntity: Entity with id "${id}" and type "${type}" not found`);
    return;
  }

  // Get zoom level based on entity type
  const zoomLevel = ZOOM_LEVEL_BY_TYPE[type === 'organization' ? 'organization' : type];

  // Get coordinates for the entity
  const coordinates = getEntityCoordinates(entity, allLandmarks);
  if (!coordinates) {
    console.warn(`focusEntity: Unable to calculate coordinates for entity "${id}"`);
    return;
  }

  // Pan and zoom to entity with smooth animation
  // flyTo() provides smooth easing, default duration is 1000ms
  try {
    mapRef.flyTo(coordinates as L.LatLngExpression, zoomLevel, {
      duration: 1, // 1 second animation
      easeLinearity: 0.25,
    });
  } catch (error) {
    console.error('focusEntity: Error calling flyTo', error);
    // Fallback to instant pan/zoom
    mapRef.setView(coordinates as L.LatLngExpression, zoomLevel);
  }

  // Update store to select the entity and open InfoPanel
  const store = useMapStore.getState();
  store.selectEntity(type as 'capability' | 'landmark', id);
}
