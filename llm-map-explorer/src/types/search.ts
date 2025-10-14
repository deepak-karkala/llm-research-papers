/**
 * Search-related types for Fuse.js integration
 */

import { Capability, Landmark, Organization } from './data';

/**
 * Entity type for search
 */
export type SearchEntityType = 'landmark' | 'capability' | 'organization' | 'tour';

/**
 * Match information for search result highlighting
 */
export interface SearchMatch {
  /** Field that matched (e.g., "name", "description") */
  key: string;
  /** Matched text */
  value: string;
  /** Match positions (start, end pairs) */
  indices: [number, number][];
}

/**
 * Unified search result type
 */
export interface SearchResult {
  /** The matched entity */
  item: Capability | Landmark | Organization;
  /** Type of entity */
  entityType: SearchEntityType;
  /** Relevance score from Fuse.js (0-1, lower is better) */
  score: number;
  /** Highlighted match positions */
  matches?: SearchMatch[];
}

/**
 * Search filter options
 */
export interface SearchFilters {
  /** Filter by entity types */
  entityTypes?: SearchEntityType[];
  /** Filter by year range */
  yearRange?: {
    min: number;
    max: number;
  };
  /** Filter by organizations */
  organizations?: string[];
  /** Filter by tags */
  tags?: string[];
}

/**
 * Search query configuration
 */
export interface SearchQuery {
  /** Search term */
  query: string;
  /** Active filters */
  filters?: SearchFilters;
  /** Maximum number of results */
  limit?: number;
}

/**
 * Search index configuration for Fuse.js
 */
export interface SearchIndexConfig {
  /** Fields to search with weights */
  keys: {
    name: string;
    weight: number;
  }[];
  /** Fuzzy matching threshold (0-1) */
  threshold: number;
  /** Whether to include matches for highlighting */
  includeMatches: boolean;
  /** Whether to include score */
  includeScore: boolean;
}
