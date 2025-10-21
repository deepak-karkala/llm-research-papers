import type { SelectedEntity } from '@/lib/store';

/**
 * State that can be encoded/decoded in the URL
 */
export interface URLState {
  lat?: number;
  lng?: number;
  zoom?: number;
  selectedEntity?: SelectedEntity;
  highlightedOrgId?: string;
}

/**
 * Serializes application state into URL search parameters
 * @param state - Partial state object to encode
 * @returns URLSearchParams containing the encoded state
 */
export function serializeState(state: {
  mapCenter?: [number, number];
  currentZoom?: number;
  selectedEntity?: SelectedEntity | null;
  highlightedOrgId?: string | null;
}): URLSearchParams {
  const params = new URLSearchParams();

  // Map position and zoom
  if (state.mapCenter && state.mapCenter.length === 2) {
    // Round to 2 decimal places for URL readability
    params.set('lat', state.mapCenter[0].toFixed(2));
    params.set('lng', state.mapCenter[1].toFixed(2));
  }

  if (state.currentZoom !== undefined && state.currentZoom !== null) {
    params.set('zoom', Math.round(state.currentZoom).toString());
  }

  // Selected entity
  if (state.selectedEntity) {
    params.set('entity', state.selectedEntity.id);
    params.set('entityType', state.selectedEntity.type);
  }

  // Organization highlighting
  if (state.highlightedOrgId) {
    params.set('org', state.highlightedOrgId);
  }

  return params;
}

/**
 * Parses URL search parameters into application state
 * @param search - URL search string (with or without leading ?)
 * @returns Partial state object with parsed values
 */
export function parseState(search: string): Partial<URLState> {
  const params = new URLSearchParams(search);
  const state: Partial<URLState> = {};

  // Parse map position
  const lat = params.get('lat');
  const lng = params.get('lng');
  if (lat && lng) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    // Validate parsed numbers
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      // Store for later use when restoring state
      state.lat = latNum;
      state.lng = lngNum;
    }
  }

  // Parse zoom
  const zoom = params.get('zoom');
  if (zoom) {
    const zoomNum = parseInt(zoom, 10);
    if (!isNaN(zoomNum)) {
      state.zoom = zoomNum;
    }
  }

  // Parse selected entity
  const entity = params.get('entity');
  const entityType = params.get('entityType');
  if (
    entity &&
    entityType &&
    (entityType === 'capability' || entityType === 'landmark' || entityType === 'organization')
  ) {
    state.selectedEntity = {
      id: entity,
      type: entityType as 'capability' | 'landmark' | 'organization',
    };
  }

  // Parse organization highlight
  const org = params.get('org');
  if (org) {
    state.highlightedOrgId = org;
  }

  return state;
}

/**
 * Generates a shareable URL with current application state
 * @param baseUrl - Base URL (e.g., "https://example.com")
 * @param state - State to encode
 * @returns Full URL with encoded state
 */
export function generateShareUrl(
  baseUrl: string,
  state: {
    mapCenter?: [number, number];
    currentZoom?: number;
    selectedEntity?: SelectedEntity | null;
    highlightedOrgId?: string | null;
  }
): string {
  const params = serializeState(state);
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
