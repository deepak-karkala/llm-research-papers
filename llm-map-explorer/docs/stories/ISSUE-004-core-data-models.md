# Issue #4: Core Data Model TypeScript Interfaces

**Sprint:** Sprint 1 (Week 1-2)
**Story Points:** 3
**Priority:** P0 (Critical Path)
**Assignee:** Dev 2 (Mid-Level Full-Stack Developer)
**Status:** 📋 Ready for Development

---

## 📖 User Story

**As a** developer working on the LLM Map Explorer
**I want** comprehensive TypeScript interfaces for all core data models
**So that** I have type safety, autocomplete, and a clear contract for data structures throughout the application

---

## 🎯 Goal

Define complete TypeScript interfaces and types for all core entities (Capability, Landmark, Organization, Tour, Model, SearchResult) as specified in the architecture document, ensuring type safety and consistency across the entire application.

---

## 📋 Acceptance Criteria

### ✅ Core Data Type Files
- [ ] `src/types/data.ts` created with all core interfaces
- [ ] `src/types/map.ts` created with map-specific types
- [ ] `src/types/search.ts` created with search types
- [ ] `src/types/index.ts` created exporting all types

### ✅ Capability Interface
- [ ] `Capability` interface defined with all required fields
- [ ] `VisualStyle` interface for polygon styling
- [ ] `LatLng` interface for coordinates
- [ ] `CapabilityLevel` type for hierarchy levels
- [ ] JSDoc comments explaining each field

### ✅ Landmark Interface
- [ ] `Landmark` interface defined with all required fields
- [ ] `LandmarkType` type for landmark categories
- [ ] `ExternalLink` interface for links
- [ ] Support for optional metadata
- [ ] Proper type for coordinates (LatLng)

### ✅ Organization Interface
- [ ] `Organization` interface defined
- [ ] References to landmark and model IDs
- [ ] Optional fields (logo, website)

### ✅ Tour Interface
- [ ] `Tour` interface defined
- [ ] `TourStage` interface for stages
- [ ] `TourDifficulty` type
- [ ] Proper ordering and navigation support

### ✅ Model Interface
- [ ] `ModelMetadata` interface for model-specific data
- [ ] Extends Landmark for model landmarks
- [ ] Proper typing for parameters, architecture, etc.

### ✅ Search Interface
- [ ] `SearchResult` union type
- [ ] `SearchMatch` interface for highlighting
- [ ] `SearchEntityType` type

### ✅ Type Safety
- [ ] No `any` types used
- [ ] All fields properly typed
- [ ] Optional vs required fields clearly marked
- [ ] Arrays and objects properly typed
- [ ] TypeScript compilation passes with strict mode

### ✅ Documentation
- [ ] JSDoc comments for all interfaces
- [ ] Examples provided in comments
- [ ] Field descriptions clear and concise
- [ ] Export documentation in index.ts

---

## 🛠️ Technical Implementation

### Step 1: Create Core Data Types

**File:** `src/types/data.ts`

```typescript
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
  /** Additional type-specific metadata */
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
```

---

### Step 2: Create Map-Specific Types

**File:** `src/types/map.ts`

```typescript
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
```

---

### Step 3: Create Search Types

**File:** `src/types/search.ts`

```typescript
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
```

---

### Step 4: Create Type Exports

**File:** `src/types/index.ts`

```typescript
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
```

---

### Step 5: Create Sample Data (for testing)

**File:** `tests/fixtures/sampleData.ts`

```typescript
/**
 * Sample data for testing type definitions
 */

import type {
  Capability,
  Landmark,
  Organization,
  Tour,
  ModelLandmark,
} from '@/types';

export const sampleCapability: Capability = {
  id: 'attention-mechanisms',
  name: 'Attention Mechanisms',
  description: 'Core techniques for modeling relationships in sequences',
  shortDescription: 'Sequence modeling techniques',
  level: 'archipelago',
  polygonCoordinates: [
    { lat: 100, lng: 200 },
    { lat: 150, lng: 200 },
    { lat: 150, lng: 250 },
    { lat: 100, lng: 250 },
  ],
  visualStyleHints: {
    fillColor: '#3b82f6',
    fillOpacity: 0.3,
    strokeColor: '#1e40af',
    strokeWeight: 2,
    pattern: 'solid',
  },
  relatedLandmarks: ['attention-is-all-you-need', 'bert'],
  zoomThreshold: 2,
};

export const sampleLandmark: Landmark = {
  id: 'attention-is-all-you-need',
  name: 'Attention Is All You Need',
  type: 'paper',
  year: 2017,
  organization: 'Google Brain',
  authors: ['Vaswani et al.'],
  description: 'Introduced the Transformer architecture',
  abstract: 'The dominant sequence transduction models...',
  externalLinks: [
    {
      type: 'arxiv',
      url: 'https://arxiv.org/abs/1706.03762',
      label: 'arXiv Paper',
    },
  ],
  coordinates: { lat: 125, lng: 225 },
  capabilityId: 'attention-mechanisms',
  relatedLandmarks: ['bert', 'gpt-2'],
  tags: ['transformer', 'attention', 'nlp'],
};

export const sampleModelLandmark: ModelLandmark = {
  id: 'gpt-3',
  name: 'GPT-3',
  type: 'model',
  year: 2020,
  organization: 'OpenAI',
  description: 'Large-scale language model with 175B parameters',
  externalLinks: [
    {
      type: 'paper',
      url: 'https://arxiv.org/abs/2005.14165',
      label: 'GPT-3 Paper',
    },
  ],
  coordinates: { lat: 200, lng: 300 },
  capabilityId: 'language-models',
  relatedLandmarks: ['gpt-2', 'instruct-gpt'],
  tags: ['gpt', 'language-model', 'few-shot'],
  metadata: {
    parameters: '175B',
    architecture: 'Transformer',
    trainingMethod: 'Unsupervised pre-training',
    capabilities: ['text-generation', 'few-shot-learning'],
    releaseDate: '2020-05-28',
    license: 'Proprietary',
  },
};

export const sampleOrganization: Organization = {
  id: 'openai',
  name: 'OpenAI',
  description: 'AI research and deployment company',
  website: 'https://openai.com',
  landmarkIds: ['gpt-2', 'gpt-3', 'gpt-4', 'instruct-gpt'],
  color: '#10a37f',
  logo: 'https://openai.com/logo.png',
};

export const sampleTour: Tour = {
  id: 'gpt-evolution',
  title: 'The Evolution of GPT',
  description: 'Journey through the GPT model series',
  stages: [
    {
      index: 0,
      title: 'GPT-1: The Beginning',
      description: 'First generative pre-trained transformer',
      landmarkIds: ['gpt-1'],
      mapCenter: { lat: 150, lng: 250 },
      mapZoom: 3,
      narration: 'In 2018, OpenAI introduced GPT-1...',
    },
    {
      index: 1,
      title: 'GPT-2: Scaling Up',
      description: 'Larger model with better performance',
      landmarkIds: ['gpt-2'],
      mapCenter: { lat: 175, lng: 275 },
      mapZoom: 3,
      narration: 'GPT-2 demonstrated the power of scale...',
    },
  ],
  estimatedDuration: 15,
  difficulty: 'beginner',
  tags: ['gpt', 'openai', 'language-models'],
};
```

---

### Step 6: Create Unit Tests for Types

**File:** `tests/unit/types/data.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import type { Capability, Landmark, ModelLandmark } from '@/types';
import { isModelLandmark } from '@/types';
import {
  sampleCapability,
  sampleLandmark,
  sampleModelLandmark,
  sampleOrganization,
  sampleTour,
} from '../../fixtures/sampleData';

describe('Data Types', () => {
  describe('Capability', () => {
    it('should match Capability interface', () => {
      const capability: Capability = sampleCapability;

      expect(capability.id).toBe('attention-mechanisms');
      expect(capability.level).toBe('archipelago');
      expect(capability.polygonCoordinates).toHaveLength(4);
      expect(capability.visualStyleHints.fillColor).toBe('#3b82f6');
    });

    it('should have required fields', () => {
      expect(sampleCapability.id).toBeDefined();
      expect(sampleCapability.name).toBeDefined();
      expect(sampleCapability.description).toBeDefined();
      expect(sampleCapability.level).toBeDefined();
      expect(sampleCapability.polygonCoordinates).toBeDefined();
    });
  });

  describe('Landmark', () => {
    it('should match Landmark interface', () => {
      const landmark: Landmark = sampleLandmark;

      expect(landmark.id).toBe('attention-is-all-you-need');
      expect(landmark.type).toBe('paper');
      expect(landmark.year).toBe(2017);
      expect(landmark.externalLinks).toHaveLength(1);
    });

    it('should have coordinates', () => {
      expect(sampleLandmark.coordinates.lat).toBeDefined();
      expect(sampleLandmark.coordinates.lng).toBeDefined();
    });
  });

  describe('ModelLandmark', () => {
    it('should extend Landmark with metadata', () => {
      const model: ModelLandmark = sampleModelLandmark;

      expect(model.type).toBe('model');
      expect(model.metadata).toBeDefined();
      expect(model.metadata.parameters).toBe('175B');
      expect(model.metadata.architecture).toBe('Transformer');
    });

    it('should be identified by type guard', () => {
      expect(isModelLandmark(sampleModelLandmark)).toBe(true);
      expect(isModelLandmark(sampleLandmark)).toBe(false);
    });
  });

  describe('Organization', () => {
    it('should have required fields', () => {
      expect(sampleOrganization.id).toBe('openai');
      expect(sampleOrganization.name).toBe('OpenAI');
      expect(sampleOrganization.landmarkIds).toBeInstanceOf(Array);
      expect(sampleOrganization.color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('Tour', () => {
    it('should have stages with proper ordering', () => {
      expect(sampleTour.stages).toHaveLength(2);
      expect(sampleTour.stages[0].index).toBe(0);
      expect(sampleTour.stages[1].index).toBe(1);
    });

    it('should have difficulty level', () => {
      expect(['beginner', 'intermediate', 'advanced']).toContain(
        sampleTour.difficulty
      );
    });
  });
});
```

---

### Step 7: Create Type Documentation

**File:** `src/types/README.md`

```markdown
# Type Definitions

This directory contains all TypeScript type definitions for the LLM Map Explorer application.

## Files

- **`data.ts`** - Core data models (Capability, Landmark, Organization, Tour)
- **`map.ts`** - Map-specific types (MapViewState, MarkerConfig, PolygonConfig)
- **`search.ts`** - Search-related types (SearchResult, SearchQuery, SearchFilters)
- **`index.ts`** - Central export file

## Usage

Import types from the central export:

\`\`\`typescript
import type { Capability, Landmark, Organization } from '@/types';
\`\`\`

## Core Entities

### Capability
Represents LLM research areas as geographic regions on the map.

\`\`\`typescript
const capability: Capability = {
  id: 'attention-mechanisms',
  name: 'Attention Mechanisms',
  level: 'archipelago',
  // ...
};
\`\`\`

### Landmark
Represents papers, models, tools, and benchmarks as map markers.

\`\`\`typescript
const landmark: Landmark = {
  id: 'attention-is-all-you-need',
  name: 'Attention Is All You Need',
  type: 'paper',
  // ...
};
\`\`\`

### Organization
Represents research institutions and companies.

\`\`\`typescript
const org: Organization = {
  id: 'openai',
  name: 'OpenAI',
  // ...
};
\`\`\`

### Tour
Represents guided learning experiences.

\`\`\`typescript
const tour: Tour = {
  id: 'gpt-evolution',
  title: 'The Evolution of GPT',
  stages: [...],
  // ...
};
\`\`\`

## Type Guards

Use type guards to narrow types safely:

\`\`\`typescript
import { isModelLandmark } from '@/types';

if (isModelLandmark(landmark)) {
  // TypeScript knows landmark.metadata exists
  console.log(landmark.metadata.parameters);
}
\`\`\`

## Testing

Sample data for testing is available in \`tests/fixtures/sampleData.ts\`.

## Reference

Based on [architecture.md](../../docs/architecture.md) Section 4: Data Models.
\`\`\`

---

### Step 8: Update tsconfig.json (if needed)

Verify path aliases are configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Step 9: Verification Checklist

```bash
# 1. Verify TypeScript compilation
npm run type-check

# 2. Verify no linting errors
npm run lint

# 3. Run type tests
npm run test tests/unit/types

# 4. Verify imports work
# Create a temporary test file and try importing all types
```

---

## 🧪 Testing Checklist

### Type Definition Files
- [ ] `src/types/data.ts` created with all interfaces
- [ ] `src/types/map.ts` created with map types
- [ ] `src/types/search.ts` created with search types
- [ ] `src/types/index.ts` exports all types
- [ ] `src/types/README.md` documentation created

### Capability Interface
- [ ] All required fields defined
- [ ] VisualStyle interface complete
- [ ] LatLng interface defined
- [ ] CapabilityLevel type defined
- [ ] JSDoc comments added

### Landmark Interface
- [ ] All required fields defined
- [ ] LandmarkType union type defined
- [ ] ExternalLink interface defined
- [ ] Optional metadata supported
- [ ] JSDoc comments added

### Model Interface
- [ ] ModelMetadata interface defined
- [ ] ModelLandmark extends Landmark
- [ ] Type guard isModelLandmark() works
- [ ] JSDoc comments added

### Other Interfaces
- [ ] Organization interface complete
- [ ] Tour and TourStage interfaces complete
- [ ] SearchResult and related types complete
- [ ] Map types complete

### Type Safety
- [ ] No `any` types used
- [ ] All fields properly typed
- [ ] Optional fields marked with `?`
- [ ] TypeScript strict mode passes
- [ ] Path aliases work (`@/types`)

### Testing
- [ ] Sample data fixtures created
- [ ] Unit tests for types pass
- [ ] Type guards tested
- [ ] All sample data validates

### Documentation
- [ ] JSDoc comments on all interfaces
- [ ] README.md explains usage
- [ ] Examples provided
- [ ] Type guard usage documented

---

## 📚 Reference Documentation

- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 1, Issue #4
- **Architecture:** [architecture.md](../architecture.md) Section 4 (Data Models)
- **TypeScript Docs:** https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/intro.html

---

## 🔗 Dependencies

**Blocks:**
- Issue #5 (Zod Validation Schemas) - needs types to create schemas
- Issue #9 (Seed Data - Capabilities) - needs types for data structure
- Issue #12 (Seed Data - Landmarks) - needs types for data structure
- All future components - need type definitions

**Depends On:**
- Issue #1 (Project Bootstrap) ✅ Complete

**Works in Parallel With:**
- Issue #2 (Install Core Dependencies) ✅ Complete
- Issue #3 (Testing Infrastructure Setup) - can work in parallel

---

## 🚧 Known Issues & Gotchas

### Issue 1: Path Alias Resolution
**Problem:** TypeScript may not resolve `@/types` imports
**Solution:** Ensure `tsconfig.json` has correct `paths` configuration (already included in Issue #1)

### Issue 2: Circular Dependencies
**Problem:** Types importing from each other can create circular dependencies
**Solution:** Keep types in separate files by domain, use index.ts for exports

### Issue 3: Type vs Interface
**Problem:** Confusion about when to use `type` vs `interface`
**Solution:** Use `interface` for objects, `type` for unions/primitives

### Issue 4: Optional Metadata
**Problem:** `metadata?: Record<string, any>` uses `any`
**Solution:** This is acceptable for extensibility; specific metadata (like ModelMetadata) is properly typed

---

## ✅ Definition of Done

Before marking this issue complete, verify:

- [ ] ✅ All acceptance criteria checked
- [ ] ✅ All type definition files created
- [ ] ✅ No TypeScript errors with strict mode
- [ ] ✅ No ESLint errors
- [ ] ✅ Sample data fixtures created
- [ ] ✅ Unit tests for types pass
- [ ] ✅ JSDoc comments on all interfaces
- [ ] ✅ Type documentation complete
- [ ] ✅ Code committed to Git with descriptive message
- [ ] ✅ Peer review completed (if team process requires)

---

## 📝 Notes for Implementation

### Time Estimate
- **Core Types (data.ts):** 60 minutes
- **Map Types (map.ts):** 30 minutes
- **Search Types (search.ts):** 30 minutes
- **Sample Data:** 30 minutes
- **Tests:** 30 minutes
- **Documentation:** 20 minutes
- **Total:** ~3.5 hours (3 story points = 4-8 hours)

### Best Practices
1. **Consistency:** Use consistent naming conventions (PascalCase for types/interfaces)
2. **Documentation:** JSDoc comments for all public interfaces
3. **Simplicity:** Keep types simple and focused
4. **Reusability:** Share common types (like LatLng) across interfaces
5. **Validation:** Create corresponding Zod schemas in Issue #5

### Git Commit Message Template

```bash
git add .
git commit -m "feat: define core TypeScript interfaces for data models

- Create core data types (Capability, Landmark, Organization, Tour)
- Create map-specific types (MapViewState, MarkerConfig, PolygonConfig)
- Create search types (SearchResult, SearchQuery, SearchFilters)
- Add ModelMetadata interface for model landmarks
- Create type guard isModelLandmark()
- Add comprehensive JSDoc documentation
- Create sample data fixtures for testing
- Add unit tests for type validation
- Create type usage documentation

Story Points: 3
Issue: #4
Dependencies: #1 (complete)
Sprint: Sprint 1

Type System Complete:
✅ 30+ interfaces and types defined
✅ No 'any' types (except extensible metadata)
✅ TypeScript strict mode passes
✅ JSDoc comments on all interfaces
✅ Sample data validates against types
✅ Unit tests verify type structure

Ready for Issue #5 (Zod schemas) and data creation"
```

---

### Next Steps After Completion

Once this issue is complete and verified:
1. Move to Issue #5 (Zod Validation Schemas) - create runtime validation
2. Use these types throughout the application
3. Reference types when creating seed data (Issues #9, #12, #19, #27)
4. Import types in all components: `import type { Capability } from '@/types';`

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ A developer can:
1. Import any type from `@/types`
2. Get full TypeScript autocomplete for all fields
3. Catch type errors at compile time
4. Reference JSDoc comments in IDE
5. Use type guards to narrow types safely

✅ The codebase has:
1. Zero TypeScript errors in strict mode
2. Zero ESLint errors
3. Complete type coverage (no `any` except metadata)
4. Comprehensive documentation
5. Sample data that validates

✅ The type system includes:
1. All core entities (Capability, Landmark, Organization, Tour)
2. Map-specific types
3. Search types
4. Type guards where needed
5. Proper use of optional vs required fields

---

**Ready to implement?** Follow the steps above in order. Type definition creation should take 3-4 hours.

**Estimated Completion:** Day 2-3 of Sprint 1 (parallel with Issue #3)

---

**Issue Metadata:**
- **Created:** 2025-10-14
- **Sprint:** Sprint 1
- **Milestone:** Milestone 1 - Core Map Foundation
- **Labels:** `P0`, `types`, `data-model`, `sprint-1`
- **Story Points:** 3
- **Assignee:** Dev 2

---

This issue establishes the type foundation that ensures type safety throughout the application. Every component, function, and data structure will reference these types for compile-time safety and IDE autocomplete support.
