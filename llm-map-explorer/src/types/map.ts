/**
 * Map-specific types for Leaflet integration
 */

import { LatLng } from './data';

/**
 * Map viewport bounds
 */
export interface MapBounds {
  /** Northwest corner */
  northWest: LatLng;
  /** Southeast corner */
  southEast: LatLng;
}

/**
 * Map view state
 */
export interface MapViewState {
  /** Current zoom level */
  zoom: number;
  /** Current center position */
  center: LatLng;
  /** Current bounds */
  bounds: MapBounds;
}

/**
 * Zoom threshold configuration for progressive disclosure
 */
export interface ZoomThresholds {
  /** Zoom level for continents */
  continents: number;
  /** Zoom level for archipelagos */
  archipelagos: number;
  /** Zoom level for islands */
  islands: number;
}

/**
 * Map interaction event
 */
export interface MapInteractionEvent {
  /** Event type */
  type: 'click' | 'hover' | 'zoom' | 'pan';
  /** Entity ID (if applicable) */
  entityId?: string;
  /** Entity type (if applicable) */
  entityType?: 'capability' | 'landmark';
  /** Coordinates of interaction */
  coordinates?: LatLng;
}

/**
 * Map marker configuration
 */
export interface MarkerConfig {
  /** Marker position */
  position: LatLng;
  /** Marker icon URL or identifier */
  icon: string;
  /** Marker size in pixels */
  size: number;
  /** Whether marker is currently highlighted */
  highlighted: boolean;
  /** Popup content (HTML string) */
  popup?: string;
  /** Tooltip content */
  tooltip?: string;
}

/**
 * Polygon configuration for capabilities
 */
export interface PolygonConfig {
  /** Polygon coordinates */
  coordinates: LatLng[];
  /** Fill color */
  fillColor: string;
  /** Fill opacity (0-1) */
  fillOpacity: number;
  /** Stroke color */
  strokeColor: string;
  /** Stroke width */
  strokeWeight: number;
  /** Whether polygon is selected */
  selected: boolean;
  /** Whether polygon is highlighted */
  highlighted: boolean;
}
