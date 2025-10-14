# Type Definitions

This directory contains all TypeScript type definitions for the LLM Map Explorer application.

## Files

- **`data.ts`** - Core data models (Capability, Landmark, Organization, Tour)
- **`map.ts`** - Map-specific types (MapViewState, MarkerConfig, PolygonConfig)
- **`search.ts`** - Search-related types (SearchResult, SearchQuery, SearchFilters)
- **`index.ts`** - Central export file

## Usage

Import types from the central export:

```typescript
import type { Capability, Landmark, Organization } from '@/types';
```

## Core Entities

### Capability

Represents LLM research areas as geographic regions on the map.

```typescript
const capability: Capability = {
  id: 'attention-mechanisms',
  name: 'Attention Mechanisms',
  level: 'archipelago',
  polygonCoordinates: [...],
  visualStyleHints: {...},
  // ...
};
```

**Fields:**
- `id` - Unique identifier (kebab-case)
- `name` - Display name
- `description` - Detailed explanation
- `shortDescription` - Brief summary for tooltips
- `level` - Hierarchy level: 'continent' | 'archipelago' | 'island' | 'strait'
- `polygonCoordinates` - Array of LatLng points defining the region
- `visualStyleHints` - Styling information (colors, opacity, stroke)
- `relatedLandmarks` - IDs of papers/models within this capability
- `parentCapabilityId` - Optional parent for nested regions
- `zoomThreshold` - Minimum zoom level to display

### Landmark

Represents papers, models, tools, and benchmarks as map markers.

```typescript
const landmark: Landmark = {
  id: 'attention-is-all-you-need',
  name: 'Attention Is All You Need',
  type: 'paper',
  year: 2017,
  organization: 'Google Brain',
  // ...
};
```

**Fields:**
- `id` - Unique identifier
- `name` - Display title
- `type` - 'paper' | 'model' | 'tool' | 'benchmark'
- `year` - Publication/release year
- `organization` - Primary institution
- `authors` - List of author names (optional, for papers)
- `description` - Short summary (1-2 sentences)
- `abstract` - Full abstract (optional)
- `externalLinks` - Array of links (arXiv, GitHub, etc.)
- `coordinates` - Map position (LatLng)
- `capabilityId` - Parent capability region
- `relatedLandmarks` - IDs of connected papers/models
- `tags` - Searchable keywords
- `icon` - Custom icon override (optional)
- `metadata` - Additional type-specific data (optional)

### ModelLandmark

Extended Landmark for models with additional metadata.

```typescript
const model: ModelLandmark = {
  ...landmark,
  type: 'model',
  metadata: {
    parameters: '175B',
    architecture: 'Transformer',
    trainingMethod: 'Unsupervised pre-training',
    capabilities: ['text-generation', 'few-shot-learning'],
    releaseDate: '2020-05-28',
    license: 'Proprietary',
    baseModel: 'gpt-2', // optional
  },
};
```

### Organization

Represents research institutions and companies.

```typescript
const org: Organization = {
  id: 'openai',
  name: 'OpenAI',
  description: 'AI research and deployment company',
  website: 'https://openai.com',
  landmarkIds: ['gpt-2', 'gpt-3', 'gpt-4'],
  color: '#10a37f',
  logo: 'https://openai.com/logo.png',
};
```

**Fields:**
- `id` - Unique identifier
- `name` - Display name
- `description` - Overview of the organization
- `website` - Official URL (optional)
- `landmarkIds` - IDs of papers and models from this org
- `color` - Highlight color for map filtering (hex format)
- `logo` - Logo URL (optional)

### Tour

Represents guided learning experiences.

```typescript
const tour: Tour = {
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
    // more stages...
  ],
  estimatedDuration: 15,
  difficulty: 'beginner',
  tags: ['gpt', 'openai', 'language-models'],
};
```

**TourStage Fields:**
- `index` - Stage number (0-indexed)
- `title` - Stage title
- `description` - Stage description
- `landmarkIds` - Landmarks to highlight
- `mapCenter` - Where to center the map
- `mapZoom` - Zoom level for this stage
- `narration` - Explanatory text

## Type Guards

Use type guards to narrow types safely:

```typescript
import { isModelLandmark } from '@/types';

if (isModelLandmark(landmark)) {
  // TypeScript knows landmark.metadata exists
  console.log(landmark.metadata.parameters);
}
```

## Map Types

### MapViewState

Current state of the map view.

```typescript
const viewState: MapViewState = {
  zoom: 3,
  center: { lat: 150, lng: 250 },
  bounds: {
    northWest: { lat: 200, lng: 200 },
    southEast: { lat: 100, lng: 300 },
  },
};
```

### MarkerConfig

Configuration for map markers.

```typescript
const markerConfig: MarkerConfig = {
  position: { lat: 125, lng: 225 },
  icon: 'lighthouse',
  size: 32,
  highlighted: false,
  popup: '<h3>Attention Is All You Need</h3>',
  tooltip: 'Transformer paper',
};
```

### PolygonConfig

Configuration for capability polygons.

```typescript
const polygonConfig: PolygonConfig = {
  coordinates: [...],
  fillColor: '#3b82f6',
  fillOpacity: 0.3,
  strokeColor: '#1e40af',
  strokeWeight: 2,
  selected: false,
  highlighted: false,
};
```

## Search Types

### SearchResult

Unified search result type.

```typescript
const result: SearchResult = {
  item: capability, // or landmark, or organization
  entityType: 'capability',
  score: 0.15,
  matches: [
    {
      key: 'name',
      value: 'Attention Mechanisms',
      indices: [[0, 9]],
    },
  ],
};
```

### SearchQuery

Search query configuration.

```typescript
const query: SearchQuery = {
  query: 'attention',
  filters: {
    entityTypes: ['landmark', 'capability'],
    yearRange: { min: 2017, max: 2023 },
    organizations: ['openai', 'google'],
    tags: ['transformer', 'nlp'],
  },
  limit: 10,
};
```

## Common Patterns

### Creating a New Capability

```typescript
import type { Capability } from '@/types';

const newCapability: Capability = {
  id: 'my-capability',
  name: 'My Capability',
  description: 'Detailed description',
  shortDescription: 'Brief summary',
  level: 'island',
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
  },
  relatedLandmarks: [],
  zoomThreshold: 3,
};
```

### Creating a New Landmark

```typescript
import type { Landmark } from '@/types';

const newLandmark: Landmark = {
  id: 'my-paper',
  name: 'My Paper',
  type: 'paper',
  year: 2023,
  organization: 'My Lab',
  authors: ['Author 1', 'Author 2'],
  description: 'Short summary',
  abstract: 'Full abstract...',
  externalLinks: [
    {
      type: 'arxiv',
      url: 'https://arxiv.org/abs/...',
      label: 'arXiv',
    },
  ],
  coordinates: { lat: 125, lng: 225 },
  capabilityId: 'my-capability',
  relatedLandmarks: [],
  tags: ['tag1', 'tag2'],
};
```

### Type-Safe Data Manipulation

```typescript
import type { Landmark, Organization } from '@/types';

// Type-safe filtering
const papers = landmarks.filter((l): l is Landmark => l.type === 'paper');

// Type-safe mapping
const landmarkIds: string[] = landmarks.map(l => l.id);

// Type-safe reduce
const landmarksByOrg = landmarks.reduce((acc, landmark) => {
  if (!acc[landmark.organization]) {
    acc[landmark.organization] = [];
  }
  acc[landmark.organization].push(landmark);
  return acc;
}, {} as Record<string, Landmark[]>);
```

## Testing

Sample data for testing is available in `tests/fixtures/sampleData.ts`.

```typescript
import { sampleCapability, sampleLandmark } from '@/tests/fixtures/sampleData';

// Use in tests
expect(sampleCapability.id).toBe('attention-mechanisms');
```

## Best Practices

1. **Always use type imports**: Use `import type { ... }` for type-only imports
2. **Avoid `any`**: Use proper types or `unknown` when type is truly unknown
3. **Use type guards**: Narrow types safely with type guard functions
4. **Document complex types**: Add JSDoc comments for clarity
5. **Keep types DRY**: Reuse common types like `LatLng`

## Reference

Based on [architecture.md](../../docs/architecture.md) Section 4: Data Models.
