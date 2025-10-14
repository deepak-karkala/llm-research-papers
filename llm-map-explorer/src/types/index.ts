/**
 * Central export file for all TypeScript types
 * Import types from here: import { Capability, Landmark } from '@/types';
 */

// Core data models
export type {
  LatLng,
  VisualStyle,
  CapabilityLevel,
  Capability,
  LandmarkType,
  ExternalLink,
  Landmark,
  Organization,
  TourDifficulty,
  TourStage,
  Tour,
  ModelMetadata,
  ModelLandmark,
} from './data';

export { isModelLandmark } from './data';

// Map types
export type {
  MapBounds,
  MapViewState,
  ZoomThresholds,
  MapInteractionEvent,
  MarkerConfig,
  PolygonConfig,
} from './map';

// Search types
export type {
  SearchEntityType,
  SearchMatch,
  SearchResult,
  SearchFilters,
  SearchQuery,
  SearchIndexConfig,
} from './search';
