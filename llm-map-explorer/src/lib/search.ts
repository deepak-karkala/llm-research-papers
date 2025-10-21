/**
 * Search functionality using Fuse.js
 * Enables fast, client-side fuzzy search across capabilities, landmarks, and organizations
 * Based on architecture.md Section 5.4 and prd.md Section 6.7
 */

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Capability, Landmark, Organization } from '@/types/data';
import type { SearchResult, SearchEntityType } from '@/types/search';

/**
 * Searchable entity combining all searchable types
 */
type SearchableEntity = (Capability | Landmark | Organization) & {
  __entityType: SearchEntityType;
};

/**
 * Fuse.js configuration
 * - name: weight 2 (highest priority)
 * - tags: weight 1.5 (medium-high priority)
 * - description: weight 1 (standard priority)
 * - threshold: 0.4 (allows fuzzy matching)
 */
const FUSE_OPTIONS: IFuseOptions<SearchableEntity> = {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'description', weight: 1 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  // Use extended search for more powerful queries
  useExtendedSearch: false,
};

/**
 * Search index data structure
 */
export interface SearchIndexData {
  capabilities: Capability[];
  landmarks: Landmark[];
  organizations: Organization[];
}

/**
 * Adds entity type metadata to entities for search
 */
function tagEntity<T extends Capability | Landmark | Organization>(
  entity: T,
  entityType: SearchEntityType
): SearchableEntity {
  return {
    ...entity,
    __entityType: entityType,
  };
}

/**
 * Initializes the Fuse.js search index with all searchable data
 *
 * @param data - Object containing capabilities, landmarks, and organizations
 * @returns Configured Fuse.js instance ready for searching
 *
 * @example
 * ```typescript
 * const index = initializeSearchIndex({
 *   capabilities: [...],
 *   landmarks: [...],
 *   organizations: [...]
 * });
 * ```
 */
export function initializeSearchIndex(data: SearchIndexData): Fuse<SearchableEntity> {
  // Combine all entities into a single searchable array with type tags
  const searchableEntities: SearchableEntity[] = [
    ...data.capabilities.map((c) => tagEntity(c, 'capability')),
    ...data.landmarks.map((l) => tagEntity(l, 'landmark')),
    ...data.organizations.map((o) => tagEntity(o, 'organization')),
  ];

  return new Fuse(searchableEntities, FUSE_OPTIONS);
}

/**
 * Performs a search query against the index
 *
 * @param query - Search string (e.g., "attention", "transformer")
 * @param index - Initialized Fuse.js instance
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Array of search results sorted by relevance
 *
 * @example
 * ```typescript
 * const results = search("attention", index);
 * // Results are sorted by relevance score
 * results.forEach(result => {
 *   console.log(`${result.item.name} (score: ${result.score})`);
 * });
 * ```
 */
export function search(
  query: string,
  index: Fuse<SearchableEntity>,
  limit: number = 10
): SearchResult[] {
  // Return empty array for empty queries
  if (!query || query.trim().length === 0) {
    return [];
  }

  // Perform the search
  const fuseResults = index.search(query, { limit });

  // Transform Fuse.js results to our SearchResult format
  return fuseResults.map((result) => {
    const { item, score, matches } = result;
    const { __entityType, ...entityData } = item;

    return {
      item: entityData as Capability | Landmark | Organization,
      entityType: __entityType,
      score: score ?? 1, // Lower score is better in Fuse.js
      matches: matches?.map((match) => ({
        key: match.key ?? '',
        value: match.value ?? '',
        indices: match.indices as [number, number][],
      })),
    };
  });
}

/**
 * Filters search results by entity type
 *
 * @param results - Array of search results
 * @param types - Entity types to include
 * @returns Filtered search results
 *
 * @example
 * ```typescript
 * const landmarksOnly = filterByEntityType(results, ['landmark']);
 * ```
 */
export function filterByEntityType(
  results: SearchResult[],
  types: SearchEntityType[]
): SearchResult[] {
  return results.filter((result) => types.includes(result.entityType));
}

/**
 * Filters search results by minimum score threshold
 *
 * @param results - Array of search results
 * @param maxScore - Maximum score threshold (lower is better, 0-1)
 * @returns Filtered search results
 *
 * @example
 * ```typescript
 * // Only keep highly relevant results (score < 0.3)
 * const topResults = filterByScore(results, 0.3);
 * ```
 */
export function filterByScore(results: SearchResult[], maxScore: number): SearchResult[] {
  return results.filter((result) => result.score <= maxScore);
}
