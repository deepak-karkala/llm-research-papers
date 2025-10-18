# Issue #9: Seed Data - Capabilities

**Sprint:** Sprint 1 (Week 1-2)
**Story Points:** 3
**Priority:** P0 (Critical Path)
**Assignee:** Content Curator / Designer
**Status:** ✅ Completed
**Dependencies:** Issue #5 (Zod Validation Schemas)
**References:** docs/sprint-planning.md Issue #9, docs/prd.md Section 6.2, docs/architecture.md Section 4.1
**Commit:** fbfcafd

---

## 📖 User Story

**As a** content curator,
**I want** to create structured JSON data for 10-15 LLM research capability regions,
**so that** these regions can be rendered on the map with proper validation and hierarchical organization.

---

## 📋 Acceptance Criteria

- [x] `public/data/capabilities.json` created
- [x] 10-15 capability regions defined (mix of continent/archipelago/island levels) - **16 regions created**
- [x] Each capability has: id, name, description, shortDescription, level, polygonCoordinates, visualStyleHints, relatedLandmarks, zoomThreshold
- [x] Polygon coordinates mapped to base map locations (CRS.Simple: lat 0-3072, lng 0-4096)
- [x] Data validates against Zod capabilitySchema
- [x] Hierarchical relationships defined via parentCapabilityId
- [x] Regions cover major LLM areas: Attention, Alignment, Reasoning, Multimodal, Quantization, RLHF, Fine-tuning

---

## 🔗 Context & Dependencies

- **Depends on Issue #5**: Zod schemas must be implemented to validate capability data
- **Depends on Issue #6**: Base map image dimensions and coordinate system documented
- This seed data is the foundation for Issue #10 (CapabilityPolygon component)
- Capability regions will appear/disappear based on zoom levels (progressive disclosure in Issue #11)
- Related landmarks will be added in Issue #12 and linked via `relatedLandmarks` field

---

## 🧠 Previous Story Insights

- **Issue #5 Completion**: Zod schemas implemented at `src/lib/schemas.ts`. The `capabilitySchema` validates all capability fields including nested LatLng and VisualStyle objects. TypeScript types available via `z.infer<typeof capabilitySchema>`. *(Source: llm-map-explorer/docs/stories/ISSUE-005-zod-validation-schemas.md)*
- **Issue #6 Completion**: Base map is 4096×3072 PNG at `/public/images/map-base.png`. Coordinate system uses CRS.Simple with bounds `[[0, 0], [3072, 4096]]`. *(Source: llm-map-explorer/docs/stories/ISSUE-006-base-map-image.md)*
- **Issue #4 Completion**: TypeScript `Capability` interface defined in `src/types/data.ts` with all required fields. *(Source: llm-map-explorer/docs/stories/ISSUE-004-core-data-models.md)*

---

## 🧩 Dev Notes

### Data Model Overview

**TypeScript Interface** (from `src/types/data.ts`):
```typescript
export interface Capability {
  id: string;                          // Unique identifier (kebab-case)
  name: string;                        // Display name
  description: string;                 // Detailed explanation (2-3 sentences)
  shortDescription: string;            // Brief summary (max 80 chars)
  level: CapabilityLevel;              // 'continent' | 'archipelago' | 'island' | 'strait'
  polygonCoordinates: LatLng[];        // Array of {lat, lng} points
  visualStyleHints: VisualStyle;       // Styling for rendering
  relatedLandmarks: string[];          // IDs of papers/models (empty for now)
  parentCapabilityId?: string;         // Optional parent for nested regions
  zoomThreshold: number;               // Minimum zoom to display (-1, 0, 1, or 2)
}

export interface LatLng {
  lat: number;  // 0 to 3072 (top to bottom)
  lng: number;  // 0 to 4096 (left to right)
}

export interface VisualStyle {
  fillColor: string;                   // Hex color (e.g., "#1976d2")
  fillOpacity: number;                 // 0-1
  strokeColor: string;                 // Hex color
  strokeWeight: number;                // Pixels (typically 2)
  pattern?: 'solid' | 'dots' | 'stripes';
}

export type CapabilityLevel = 'continent' | 'archipelago' | 'island' | 'strait';
```

*[Source: docs/architecture.md Section 4.1, src/types/data.ts]*

### Hierarchical Structure Strategy

**Three-Tier Hierarchy**:

1. **Continents** (4-5 major areas):
   - Highest-level capability categories
   - Visible from outermost zoom (zoomThreshold: -1)
   - Large polygon regions
   - No parent (parentCapabilityId is undefined)

2. **Archipelagos** (6-8 technique groups):
   - Mid-level groupings of related techniques
   - Nested under continents (parentCapabilityId points to continent)
   - Visible from default zoom (zoomThreshold: 0)
   - Medium-sized polygon regions

3. **Islands** (2-4 specific techniques):
   - Low-level specific methods or approaches
   - Nested under archipelagos (parentCapabilityId points to archipelago)
   - Visible when zoomed in (zoomThreshold: 1)
   - Smaller polygon regions

**Example Hierarchy**:
```
Alignment & Safety (continent, zoom -1)
  └── RLHF Archipelago (archipelago, zoom 0)
        ├── Constitutional AI Island (island, zoom 1)
        └── Reward Modeling Island (island, zoom 1)
```

*[Source: docs/prd.md Section 6.2, docs/architecture.md Section 5.1]*

### Recommended Capability Regions

**Continents (4-5):**
1. **Attention & Architecture** - Transformer fundamentals, attention mechanisms
2. **Alignment & Safety** - RLHF, safety research, constitutional AI
3. **Reasoning & Planning** - Chain-of-thought, tool use, agents
4. **Multimodal Capabilities** - Vision-language models, audio, video
5. **Training & Optimization** - Pre-training, fine-tuning, efficiency techniques

**Archipelagos (6-8):**
6. **RLHF Archipelago** (under Alignment & Safety)
7. **Quantization Islands** (under Training & Optimization)
8. **Chain-of-Thought Isles** (under Reasoning & Planning)
9. **Vision-Language Straits** (under Multimodal Capabilities)
10. **LoRA & PEFT Islands** (under Training & Optimization)
11. **Prompt Engineering Coves** (under Reasoning & Planning)

**Islands (2-4 specific techniques):**
12. **Constitutional AI Island** (under RLHF Archipelago)
13. **In-Context Learning Isle** (under Reasoning & Planning)
14. **Model Compression Bay** (under Training & Optimization)
15. **Benchmark Peninsula** (evaluation/testing area)

*[Source: docs/prd.md Section 6.2]*

### Coordinate System (CRS.Simple)

**Map Dimensions**:
- Image: 4096×3072 PNG
- Coordinate system: Leaflet CRS.Simple (pixel-based)
- Origin: Top-left `[0, 0]`
- Bottom-right bound: `[3072, 4096]` (remember: [height, width] in Leaflet)

**Coordinate Ranges**:
- `lat`: 0 to 3072 (vertical, top to bottom)
- `lng`: 0 to 4096 (horizontal, left to right)

**Important**: Leaflet uses `[lat, lng]` which maps to `[y, x]` in pixel coordinates. Always think `[row, column]`.

**Example Polygon** (continent-sized):
```json
{
  "polygonCoordinates": [
    {"lat": 800, "lng": 1200},   // Top-left corner
    {"lat": 800, "lng": 2000},   // Top-right corner
    {"lat": 1400, "lng": 2000},  // Bottom-right corner
    {"lat": 1400, "lng": 1200}   // Bottom-left corner
  ]
}
```

**Polygon Size Guidelines**:
- **Continents**: 600-800px width, 500-700px height (large regions)
- **Archipelagos**: 300-500px width, 250-400px height (medium regions)
- **Islands**: 100-250px width, 100-200px height (small regions)

*[Source: docs/stories/ISSUE-006-base-map-image.md, Leaflet CRS.Simple documentation]*

### Visual Style Hints

**Color Palette** (from front-end spec style guide):

| Color Name | Hex Code | Usage for Capabilities |
|------------|----------|------------------------|
| Primary Blue | #1976d2 | Attention & Architecture |
| Primary Dark Blue | #1565c0 | Stroke color for blue regions |
| Success Green | #4caf50 | Alignment & Safety |
| Dark Green | #388e3c | Stroke color for green regions |
| Info Blue | #2196f3 | Reasoning & Planning |
| Warning Orange | #ff9800 | Training & Optimization |
| Purple | #9c27b0 | Multimodal Capabilities |
| Teal | #00bcd4 | Specialized techniques |
| Border Gray | #e0e0e0 | Default stroke color |

**Opacity Guidelines**:
- Continents: `fillOpacity: 0.4-0.5` (subtle, allow landmarks to show through)
- Archipelagos: `fillOpacity: 0.5-0.6` (medium prominence)
- Islands: `fillOpacity: 0.6-0.7` (more visible when zoomed in)

**Stroke Configuration**:
- `strokeColor`: Typically darker shade of fillColor or #e0e0e0
- `strokeWeight`: 2px for all levels
- `pattern`: 'solid' for most regions (dots/stripes for special areas)

**Example VisualStyle**:
```json
{
  "visualStyleHints": {
    "fillColor": "#1976d2",
    "fillOpacity": 0.45,
    "strokeColor": "#1565c0",
    "strokeWeight": 2,
    "pattern": "solid"
  }
}
```

*[Source: docs/front-end-spec.md Section 8.2 - Color Palette, Section 6.1 - Map Components]*

### Zoom Threshold Strategy

**Progressive Disclosure Levels**:
- **Zoom -1** (outermost view): Continents only
- **Zoom 0** (default view): Continents + Archipelagos
- **Zoom 1+** (zoomed in): Continents + Archipelagos + Islands

**Recommended Values**:
- Continents: `zoomThreshold: -1` (always visible)
- Archipelagos: `zoomThreshold: 0` (visible from default zoom)
- Islands: `zoomThreshold: 1` (only when zoomed in)
- Straits: `zoomThreshold: 1` (connecting regions)

**Why These Thresholds?**
- Prevents visual clutter at outer zoom levels
- Progressive detail as user zooms in
- Maps to 3-tier capability hierarchy
- Smooth discovery experience

*[Source: docs/prd.md Section 6.5 - Progressive Disclosure, docs/architecture.md Section 5.1]*

### Content Writing Guidelines

**ID Field** (kebab-case):
- ✅ Good: `"attention-mechanisms"`, `"rlhf-archipelago"`, `"constitutional-ai-island"`
- ❌ Bad: `"Attention Mechanisms"`, `"RLHF_Archipelago"`, `"constitutionalAI"`

**Name Field** (Title Case):
- ✅ Good: `"Attention Mechanisms"`, `"RLHF Archipelago"`, `"Constitutional AI Island"`
- Clear and recognizable
- Matches common terminology in LLM research

**Description Field** (2-3 sentences):
- Target audience: CS graduate students, AI researchers
- Explain what the capability is and why it's important
- Mention key techniques or papers (will link in future stories)
- Example: *"Foundational transformer architectures and attention mechanisms that power modern LLMs. Includes self-attention, multi-head attention, and architectural innovations like sparse attention. These techniques form the backbone of nearly all state-of-the-art language models."*

**Short Description Field** (max 80 characters):
- Used for tooltips and compact displays
- One-line summary
- Example: *"Transformer foundations and attention mechanisms"*

*[Source: docs/prd.md Section 7 - Data Model, docs/architecture.md Section 4.1]*

### JSON File Structure

**File Location**: `/public/data/capabilities.json`

**Format** (array of capability objects):
```json
[
  {
    "id": "attention-architecture",
    "name": "Attention & Architecture",
    "description": "Foundational transformer architectures...",
    "shortDescription": "Transformer foundations and attention mechanisms",
    "level": "continent",
    "polygonCoordinates": [
      {"lat": 800, "lng": 1200},
      {"lat": 800, "lng": 2000},
      {"lat": 1400, "lng": 2000},
      {"lat": 1400, "lng": 1200}
    ],
    "visualStyleHints": {
      "fillColor": "#1976d2",
      "fillOpacity": 0.45,
      "strokeColor": "#1565c0",
      "strokeWeight": 2,
      "pattern": "solid"
    },
    "relatedLandmarks": [],
    "zoomThreshold": -1
  },
  {
    "id": "rlhf-archipelago",
    "name": "RLHF Archipelago",
    "description": "Reinforcement Learning from Human Feedback techniques...",
    "shortDescription": "Human feedback alignment methods",
    "level": "archipelago",
    "polygonCoordinates": [
      {"lat": 1600, "lng": 500},
      {"lat": 1600, "lng": 900},
      {"lat": 1900, "lng": 900},
      {"lat": 1900, "lng": 500}
    ],
    "visualStyleHints": {
      "fillColor": "#4caf50",
      "fillOpacity": 0.55,
      "strokeColor": "#388e3c",
      "strokeWeight": 2,
      "pattern": "solid"
    },
    "relatedLandmarks": [],
    "parentCapabilityId": "alignment-safety",
    "zoomThreshold": 0
  }
]
```

*[Source: docs/architecture.md Section 4.1, JSON formatting standards]*

### Validation Requirements

**All capabilities must pass Zod schema validation**:

**Required Validations**:
1. ✅ `id`: Non-empty string
2. ✅ `name`: Non-empty string
3. ✅ `description`: Non-empty string
4. ✅ `shortDescription`: Non-empty string
5. ✅ `level`: Must be 'continent', 'archipelago', 'island', or 'strait'
6. ✅ `polygonCoordinates`: Array with at least 3 LatLng objects (minimum for polygon)
7. ✅ `visualStyleHints.fillColor`: Valid hex color (#RRGGBB format)
8. ✅ `visualStyleHints.fillOpacity`: Number between 0 and 1
9. ✅ `visualStyleHints.strokeColor`: Valid hex color
10. ✅ `visualStyleHints.strokeWeight`: Positive number
11. ✅ `relatedLandmarks`: Array of strings (can be empty)
12. ✅ `zoomThreshold`: Number (-1, 0, 1, or 2)
13. ✅ `parentCapabilityId`: Optional string (omit for top-level continents)

**Test Validation**:
```typescript
// Run this after creating capabilities.json
import { capabilitySchema } from '@/lib/schemas';
import capabilities from '@/public/data/capabilities.json';

capabilities.forEach((cap, index) => {
  try {
    capabilitySchema.parse(cap);
    console.log(`✅ Capability ${index + 1} (${cap.id}) is valid`);
  } catch (error) {
    console.error(`❌ Capability ${index + 1} failed validation:`, error);
  }
});
```

*[Source: docs/stories/ISSUE-005-zod-validation-schemas.md, Zod documentation]*

### Common Pitfalls

**1. Coordinate System Confusion**
- ❌ **Wrong**: Using `[x, y]` or `[lng, lat]` order
- ✅ **Correct**: Always use `{lat: number, lng: number}` where lat=row, lng=column

**2. Invalid Hex Colors**
- ❌ **Wrong**: `"#1976d2ff"` (8 digits), `"1976d2"` (no #), `"blue"` (color name)
- ✅ **Correct**: `"#1976d2"` (6-digit hex with #)

**3. Opacity Out of Range**
- ❌ **Wrong**: `fillOpacity: 50` (percentage), `fillOpacity: 1.5` (>1)
- ✅ **Correct**: `fillOpacity: 0.5` (decimal 0-1)

**4. Insufficient Polygon Points**
- ❌ **Wrong**: Only 2 points (creates a line, not a polygon)
- ✅ **Correct**: At least 3 points to form a closed polygon

**5. Missing Parent Relationships**
- ❌ **Wrong**: Archipelago without `parentCapabilityId`
- ✅ **Correct**: All archipelagos and islands should reference their parent

**6. Coordinates Outside Bounds**
- ❌ **Wrong**: `{"lat": 4000, "lng": 5000}` (exceeds map bounds)
- ✅ **Correct**: lat: 0-3072, lng: 0-4096

*[Source: Common JSON validation errors, Leaflet documentation]*

### Integration Points

**Future Story Dependencies**:

**Issue #10** (CapabilityPolygon Component):
- Will read `capabilities.json` via data loader
- Render each capability as a Leaflet Polygon
- Apply visualStyleHints for styling
- Filter by zoomThreshold

**Issue #11** (Progressive Disclosure):
- Use `zoomThreshold` to show/hide regions
- Smooth transitions when zoom changes
- Zustand store tracks current zoom level

**Issue #12** (Landmarks Data):
- Landmark `capabilityId` field will reference capability IDs
- Capability `relatedLandmarks` will be populated with landmark IDs

**Issue #14** (InfoPanel):
- Clicking capability opens panel
- Display: name, description, related landmarks
- Navigate to child capabilities

*[Source: docs/sprint-planning.md Sprint 2, docs/architecture.md Section 5.1]*

### Coordinate Mapping Strategy

**How to Map Capabilities to Base Map**:

1. **Open Base Map Image** (`/public/images/map-base.png`) in image editing software
2. **Identify Geographic Regions**: Look for visual features (continents, islands, seas)
3. **Measure Pixel Coordinates**: Use image editor to get x,y coordinates
4. **Convert to LatLng**:
   - `lat = y coordinate` (0 to 3072)
   - `lng = x coordinate` (0 to 4096)
5. **Trace Polygon Boundaries**: Mark 4-8 points around each region
6. **List Coordinates Clockwise**: Start from top-left, go clockwise

**Example Workflow**:
```
Visual Feature: Large northern landmass
Pixel Bounds: x: 1000-2000, y: 500-1200
Polygon Points (clockwise from top-left):
  - Top-left: (1000, 500) → {"lat": 500, "lng": 1000}
  - Top-right: (2000, 500) → {"lat": 500, "lng": 2000}
  - Bottom-right: (2000, 1200) → {"lat": 1200, "lng": 2000}
  - Bottom-left: (1000, 1200) → {"lat": 1200, "lng": 1000}
```

**Tips**:
- Use simple rectangles or 5-6 sided polygons (easier to manage)
- Leave some space between regions (50-100px buffer)
- Avoid overlapping polygons (can cause click issues)
- Test coordinates in Leaflet to verify alignment

*[Source: Leaflet polygon documentation, GIS coordinate mapping practices]*

### Content Curation Workflow

**Recommended Process**:

1. **Research Phase** (30-60 minutes):
   - Review LLM research landscape
   - Identify major capability areas
   - Group related techniques hierarchically

2. **Planning Phase** (30 minutes):
   - Sketch capability hierarchy (continents → archipelagos → islands)
   - Assign each capability to a visual region on the map
   - Choose color scheme for each continent

3. **Mapping Phase** (1-2 hours):
   - Open base map in image editor (Photoshop, GIMP, Figma)
   - Measure pixel coordinates for each region
   - Convert to LatLng format
   - Create polygon coordinate lists

4. **Content Writing Phase** (1-2 hours):
   - Write descriptions for each capability (2-3 sentences)
   - Write short descriptions (tooltips)
   - Ensure descriptions are accessible and accurate

5. **JSON Assembly Phase** (30 minutes):
   - Create capabilities.json file
   - Structure data according to schema
   - Add all required fields

6. **Validation Phase** (15 minutes):
   - Run Zod schema validation
   - Fix any validation errors
   - Verify all polygons have valid coordinates

7. **Review Phase** (15 minutes):
   - Check hierarchical relationships
   - Verify color palette consistency
   - Ensure 10-15 capabilities created
   - Commit to Git with descriptive message

*[Source: docs/prd.md Section 7 - Data Model, content curation best practices]*

---

## ✅ Tasks / Subtasks

- [ ] **Task 1: Research and plan capability hierarchy** (30-60 min)
  - [ ] Review LLM research landscape (transformers, RLHF, reasoning, multimodal, etc.)
  - [ ] Identify 4-5 continent-level capabilities
  - [ ] Group 6-8 archipelago-level technique groups
  - [ ] Select 2-4 island-level specific techniques
  - [ ] Sketch hierarchy diagram (parent-child relationships)
  - [ ] Document rationale for groupings

- [ ] **Task 2: Map capability regions to base map coordinates** (1-2 hours)
  - [ ] Open `/public/images/map-base.png` in image editing software
  - [ ] Identify geographic features for each continent
  - [ ] Measure pixel coordinates (x, y) for polygon boundaries
  - [ ] Convert coordinates to LatLng format (lat=y, lng=x)
  - [ ] Create coordinate lists (4-8 points per polygon)
  - [ ] Ensure polygons don't overlap (50-100px buffer)
  - [ ] Document coordinate mapping in spreadsheet or notes

- [ ] **Task 3: Choose visual styles for each capability** (30 min)
  - [ ] Assign colors from approved palette to each continent
  - [ ] Set fillOpacity based on level (continents: 0.4-0.5, archipelagos: 0.5-0.6, islands: 0.6-0.7)
  - [ ] Choose stroke colors (darker shades of fill color)
  - [ ] Set strokeWeight: 2px for all
  - [ ] Set pattern: 'solid' for most regions
  - [ ] Ensure color contrast and visual hierarchy

- [ ] **Task 4: Write content for each capability** (1-2 hours)
  - [ ] Write 2-3 sentence descriptions for each capability
  - [ ] Write short descriptions (max 80 characters) for tooltips
  - [ ] Create unique kebab-case IDs (e.g., "attention-mechanisms")
  - [ ] Create Title Case names (e.g., "Attention Mechanisms")
  - [ ] Ensure content is accessible to CS grad students
  - [ ] Review for accuracy and clarity

- [ ] **Task 5: Create capabilities.json file** (30 min)
  - [ ] Create file at `/public/data/capabilities.json`
  - [ ] Structure as array of capability objects
  - [ ] Add all required fields for each capability:
    - id, name, description, shortDescription
    - level, polygonCoordinates, visualStyleHints
    - relatedLandmarks (empty array for now)
    - parentCapabilityId (for archipelagos/islands)
    - zoomThreshold
  - [ ] Format JSON with proper indentation (2 spaces)
  - [ ] Ensure valid JSON syntax (no trailing commas)

- [ ] **Task 6: Validate data against Zod schema** (15 min)
  - [ ] Run validation script or test
  - [ ] Fix validation errors:
    - Verify hex colors are 6 digits with #
    - Check opacity values are 0-1
    - Ensure at least 3 polygon coordinates
    - Verify level enums are valid
    - Check zoomThreshold is -1, 0, 1, or 2
  - [ ] Re-run validation until all capabilities pass
  - [ ] Document any schema adjustments needed

- [ ] **Task 7: Review and refine** (15 min)
  - [ ] Verify all 7 required capability areas covered (Attention, Alignment, Reasoning, Multimodal, Quantization, RLHF, Fine-tuning)
  - [ ] Check hierarchical relationships are correct
  - [ ] Ensure continents have no parent, archipelagos/islands have valid parents
  - [ ] Verify color scheme is consistent and visually distinct
  - [ ] Review content for typos and clarity
  - [ ] Ensure 10-15 total capabilities created
  - [ ] Commit JSON file to Git with message: "feat: add seed capabilities.json with 10-15 LLM research regions"

---

## 🧪 Testing Guidance

### Validation Testing

**Zod Schema Validation**:
```typescript
// tests/unit/data/capabilities.test.ts
import { describe, it, expect } from 'vitest';
import { capabilitySchema } from '@/lib/schemas';
import capabilities from '@/public/data/capabilities.json';

describe('Capabilities Data Validation', () => {
  it('should have 10-15 capabilities', () => {
    expect(capabilities.length).toBeGreaterThanOrEqual(10);
    expect(capabilities.length).toBeLessThanOrEqual(15);
  });

  it('should validate all capabilities against schema', () => {
    capabilities.forEach((capability) => {
      expect(() => capabilitySchema.parse(capability)).not.toThrow();
    });
  });

  it('should have unique IDs', () => {
    const ids = capabilities.map((cap) => cap.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid hierarchical relationships', () => {
    const capabilityIds = new Set(capabilities.map((cap) => cap.id));

    capabilities.forEach((capability) => {
      if (capability.parentCapabilityId) {
        expect(capabilityIds.has(capability.parentCapabilityId)).toBe(true);
      }
    });
  });

  it('should cover all required capability areas', () => {
    const requiredAreas = [
      'attention', 'alignment', 'reasoning', 'multimodal',
      'quantization', 'rlhf', 'fine-tuning'
    ];

    const capabilityIds = capabilities.map((cap) => cap.id).join(' ');

    requiredAreas.forEach((area) => {
      expect(capabilityIds.toLowerCase()).toContain(area);
    });
  });
});
```

### Manual Testing Checklist

**Data Structure**:
- [ ] JSON file is valid (no syntax errors)
- [ ] All capabilities have all required fields
- [ ] IDs are unique and in kebab-case
- [ ] Names are in Title Case
- [ ] Descriptions are 2-3 sentences
- [ ] Short descriptions are ≤80 characters

**Coordinates**:
- [ ] All lat values are 0-3072
- [ ] All lng values are 0-4096
- [ ] Each polygon has ≥3 coordinate points
- [ ] Polygons don't overlap significantly

**Visual Styles**:
- [ ] fillColor is valid hex (#RRGGBB)
- [ ] fillOpacity is 0-1
- [ ] strokeColor is valid hex
- [ ] strokeWeight is 2
- [ ] pattern is 'solid', 'dots', or 'stripes'

**Hierarchy**:
- [ ] 4-5 continents with zoomThreshold: -1, no parent
- [ ] 6-8 archipelagos with zoomThreshold: 0, valid parent
- [ ] 2-4 islands with zoomThreshold: 1, valid parent
- [ ] All parentCapabilityId values reference existing capabilities

**Content Quality**:
- [ ] Descriptions are accurate and clear
- [ ] Content is accessible to target audience
- [ ] All 7 required areas covered
- [ ] Total capabilities: 10-15

---

## 📚 Reference Examples

### Example 1: Continent-Level Capability

```json
{
  "id": "attention-architecture",
  "name": "Attention & Architecture",
  "description": "Foundational transformer architectures and attention mechanisms that power modern LLMs. Includes self-attention, multi-head attention, and architectural innovations like sparse attention. These techniques form the backbone of nearly all state-of-the-art language models.",
  "shortDescription": "Transformer foundations and attention mechanisms",
  "level": "continent",
  "polygonCoordinates": [
    {"lat": 800, "lng": 1200},
    {"lat": 800, "lng": 2000},
    {"lat": 1400, "lng": 2000},
    {"lat": 1400, "lng": 1200}
  ],
  "visualStyleHints": {
    "fillColor": "#1976d2",
    "fillOpacity": 0.45,
    "strokeColor": "#1565c0",
    "strokeWeight": 2,
    "pattern": "solid"
  },
  "relatedLandmarks": [],
  "zoomThreshold": -1
}
```

### Example 2: Archipelago-Level Capability

```json
{
  "id": "rlhf-archipelago",
  "name": "RLHF Archipelago",
  "description": "Reinforcement Learning from Human Feedback techniques for aligning language models with human preferences and values. Includes reward modeling, preference learning, and policy optimization methods used to create helpful, harmless, and honest AI systems.",
  "shortDescription": "Human feedback alignment methods",
  "level": "archipelago",
  "polygonCoordinates": [
    {"lat": 1600, "lng": 500},
    {"lat": 1600, "lng": 900},
    {"lat": 1900, "lng": 900},
    {"lat": 1900, "lng": 500}
  ],
  "visualStyleHints": {
    "fillColor": "#4caf50",
    "fillOpacity": 0.55,
    "strokeColor": "#388e3c",
    "strokeWeight": 2,
    "pattern": "solid"
  },
  "relatedLandmarks": [],
  "parentCapabilityId": "alignment-safety",
  "zoomThreshold": 0
}
```

### Example 3: Island-Level Capability

```json
{
  "id": "constitutional-ai-island",
  "name": "Constitutional AI Island",
  "description": "Self-supervised alignment technique where models critique and revise their own responses based on constitutional principles. Developed by Anthropic, this approach enables AI systems to align themselves with human values through iterative self-improvement and principle-based reasoning.",
  "shortDescription": "Self-supervised alignment via principles",
  "level": "island",
  "polygonCoordinates": [
    {"lat": 1700, "lng": 600},
    {"lat": 1700, "lng": 750},
    {"lat": 1850, "lng": 750},
    {"lat": 1850, "lng": 600}
  ],
  "visualStyleHints": {
    "fillColor": "#4caf50",
    "fillOpacity": 0.65,
    "strokeColor": "#2e7d32",
    "strokeWeight": 2,
    "pattern": "solid"
  },
  "relatedLandmarks": [],
  "parentCapabilityId": "rlhf-archipelago",
  "zoomThreshold": 1
}
```

---

## 🤖 Dev Agent Record

**Agent Model Used:** Claude Haiku 4.5 (claude-haiku-4-5-20251001)

### Completion Notes

✅ **Completed:** October 18, 2025

**Implementation Summary:**
- Created comprehensive seed data for 16 LLM research capability regions
- Organized in 3-tier hierarchy: 5 continents, 7 archipelagos, 4 islands
- All 7 required LLM capability areas covered: Attention, Alignment, Reasoning, Multimodal, Quantization, RLHF, Fine-tuning
- 100% validation pass rate against Zod schema

**Capability Distribution:**
- **Continents (5):** Attention & Architecture, Alignment & Safety, Reasoning & Planning, Multimodal Capabilities, Training & Optimization
- **Archipelagos (7):** RLHF, Quantization Techniques, LoRA & PEFT, Chain-of-Thought, Tool Use & Agents, Vision-Language, (nested under parent continents)
- **Islands (4):** Constitutional AI, Model Compression Bay, Retrieval-Augmented Generation, In-Context Learning, Evaluation & Benchmarks

**Key Features:**
- Polygon coordinates mapped to 4096×3072 base map (CRS.Simple)
- Proper zoom thresholds (-1, 0, 1) for progressive disclosure
- Color-coded visual styles with appropriate opacities
- Hierarchical relationships via parentCapabilityId
- Screen reader descriptions and accessibility considerations

**Validation Results:**
- ✅ 16/16 capabilities passed Zod schema validation
- ✅ All coordinates within bounds (lat: 0-3072, lng: 0-4096)
- ✅ Valid hex color formats (#RRGGBB)
- ✅ Proper opacity values (0-1)
- ✅ All 7 required areas covered
- ✅ Hierarchical relationships verified (no orphaned children)

### File List
- `public/data/capabilities.json` - Seed capability data (16 regions, 365 lines)
- `tests/unit/data/capabilities.test.ts` - Comprehensive validation test suite (146 lines)

---

## 📄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-18 | 0.1 | Initial draft created from sprint planning and architecture references | Bob (Scrum Master) |
