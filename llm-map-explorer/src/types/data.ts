/**
 * Core data model types for LLM Map Explorer
 * Based on architecture.md Section 4: Data Models
 */

/**
 * Geographic coordinate representation
 */
export interface LatLng {
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
}

/**
 * Visual styling hints for capability regions
 */
export interface VisualStyle {
  /** Fill color (hex format) */
  fillColor: string;
  /** Fill opacity (0-1) */
  fillOpacity: number;
  /** Stroke color (hex format) */
  strokeColor: string;
  /** Stroke width in pixels */
  strokeWeight: number;
  /** Optional pattern for the fill */
  pattern?: 'solid' | 'dots' | 'stripes';
}

/**
 * Hierarchy level for capabilities
 */
export type CapabilityLevel = 'continent' | 'archipelago' | 'island' | 'strait';

/**
 * Capability represents LLM research areas as geographic regions
 * Examples: "Attention Mechanisms", "Alignment & Safety"
 */
export interface Capability {
  /** Unique identifier (e.g., "attention-mechanisms") */
  id: string;
  /** Display name (e.g., "Attention Mechanisms") */
  name: string;
  /** Detailed explanation of the capability area */
  description: string;
  /** Brief summary for tooltips/previews */
  shortDescription: string;
  /** Hierarchy level in the map */
  level: CapabilityLevel;
  /** Array of lat/lng points defining the region boundary */
  polygonCoordinates: LatLng[];
  /** Styling information for rendering */
  visualStyleHints: VisualStyle;
  /** IDs of papers/models within this capability */
  relatedLandmarks: string[];
  /** Optional parent for nested regions */
  parentCapabilityId?: string;
  /** Minimum zoom level to display this region */
  zoomThreshold: number;
}

/**
 * Type of landmark on the map
 */
export type LandmarkType = 'paper' | 'model' | 'tool' | 'benchmark';

/**
 * External link with type and label
 */
export interface ExternalLink {
  /** Type of link */
  type: 'arxiv' | 'github' | 'paper' | 'model-card' | 'website' | 'other';
  /** URL of the resource */
  url: string;
  /** Display label for the link */
  label: string;
}

/**
 * Landmark represents papers, models, tools, and benchmarks as map markers
 * Examples: "Attention Is All You Need", "GPT-3"
 */
export interface Landmark {
  /** Unique identifier (e.g., "attention-is-all-you-need") */
  id: string;
  /** Display title (e.g., "Attention Is All You Need") */
  name: string;
  /** Category of landmark */
  type: LandmarkType;
  /** Publication/release year */
  year: number;
  /** Primary organization/institution */
  organization: string;
  /** List of author names (for papers) */
  authors?: string[];
  /** Short summary (1-2 sentences) */
  description: string;
  /** Full abstract or detailed description */
  abstract?: string;
  /** Array of external links */
  externalLinks: ExternalLink[];
  /** Map position */
  coordinates: LatLng;
  /** Parent capability region */
  capabilityId: string;
  /** IDs of connected papers/models */
  relatedLandmarks: string[];
  /** Searchable keywords */
  tags: string[];
  /** Custom icon override */
  icon?: string;
  /** Additional type-specific metadata (use specific interfaces like ModelMetadata when possible) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

/**
 * Organization represents research institutions and companies
 * Examples: "OpenAI", "Google DeepMind", "Meta AI"
 */
export interface Organization {
  /** Unique identifier (e.g., "openai") */
  id: string;
  /** Display name (e.g., "OpenAI") */
  name: string;
  /** Overview of the organization's focus */
  description: string;
  /** Official website URL */
  website?: string;
  /** IDs of papers and models from this org */
  landmarkIds: string[];
  /** Highlight color for map filtering (hex format) */
  color: string;
  /** Optional logo URL */
  logo?: string;
}

/**
 * Tour difficulty level
 */
export type TourDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Individual stage within a guided tour
 */
export interface TourStage {
  /** Stage number (0-indexed) */
  index: number;
  /** Stage title */
  title: string;
  /** Stage description */
  description: string;
  /** Landmarks to highlight in this stage */
  landmarkIds: string[];
  /** Where to center the map */
  mapCenter: LatLng;
  /** Zoom level for this stage */
  mapZoom: number;
  /** Explanatory text for this stage */
  narration: string;
}

/**
 * Tour represents guided learning experiences through related papers/models
 * Examples: "GPT Evolution", "RLHF Training Pipeline"
 */
export interface Tour {
  /** Unique identifier (e.g., "gpt-evolution") */
  id: string;
  /** Tour name (e.g., "GPT Evolution") */
  title: string;
  /** What users will learn */
  description: string;
  /** Ordered steps in the tour */
  stages: TourStage[];
  /** Minutes to complete */
  estimatedDuration: number;
  /** Difficulty level */
  difficulty: TourDifficulty;
  /** Searchable keywords */
  tags: string[];
}

/**
 * Model-specific metadata
 */
export interface ModelMetadata {
  /** Model size (e.g., "175B", "7B") */
  parameters: string;
  /** Architecture type (e.g., "Transformer", "GPT") */
  architecture: string;
  /** Training method (e.g., "Pre-training + RLHF") */
  trainingMethod: string;
  /** Model capabilities */
  capabilities: string[];
  /** Release date (ISO format) */
  releaseDate: string;
  /** License type (e.g., "MIT", "Proprietary") */
  license?: string;
  /** ID of base model if fine-tuned */
  baseModel?: string;
}

/**
 * Extended Landmark type for model landmarks
 */
export interface ModelLandmark extends Landmark {
  type: 'model';
  metadata: ModelMetadata;
}

/**
 * Type guard to check if a landmark is a model
 */
export function isModelLandmark(landmark: Landmark): landmark is ModelLandmark {
  return landmark.type === 'model';
}
