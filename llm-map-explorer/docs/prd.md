# Product Requirements Document (PRD)
# Terra Incognita Linguae: An LLM Research Explorer

**Version:** 1.0
**Last Updated:** 2025-10-01
**Document Owner:** Product Management
**Status:** Approved for MVP Development

---

## 1. Executive Summary

**Terra Incognita Linguae** is an interactive web application that transforms the complex landscape of Large Language Model (LLM) research into an engaging, visually-driven exploration experience. Using the analogy of geographic map exploration, the application represents LLM concepts, models, training pipelines, research papers, and organizations as continents, islands, landmarks, and voyages on a fantasy world map.

The MVP will deliver a core interactive map with key capabilities: information panels, timeline visualization, guided tours, search/filtering, and contextual highlighting—making LLM research accessible, discoverable, and memorable for students, researchers, developers, and enthusiasts.

**Key Differentiators:**
- Visual, spatial learning framework leveraging geographic analogy
- Interactive discovery replacing traditional text-heavy surveys
- Integrated view of papers, models, techniques, and organizations
- Progressive disclosure adapting to user expertise levels

---

## 2. Problem Statement

### Current Challenges

1. **Complexity Overload:** The LLM research field is dense, rapidly evolving, and interconnected, making it difficult for newcomers to grasp core concepts and relationships.

2. **Fragmented Information:** Research papers, model releases, and technical documentation are scattered across different platforms with no unified view of the ecosystem.

3. **Steep Learning Curve:** Traditional surveys and documentation are text-heavy and overwhelming, creating barriers to entry for students and developers.

4. **Lack of Context:** Understanding how different LLMs are built (training pipelines) and how the field has evolved (historical progression) requires extensive domain knowledge.

5. **Poor Discoverability:** Finding seminal papers, influential models, and key methodologies requires prior knowledge of what to search for.

### Opportunity

Create an intuitive, engaging platform that makes LLM research exploration feel like a journey of discovery rather than a daunting academic exercise.

---

## 3. Vision & Goals

### Vision Statement

To become the go-to resource for anyone looking to intuitively understand the LLM ecosystem—transforming the often dense and rapidly evolving field into an accessible, memorable, and discoverable journey.

### Product Goals

1. **Education & Understanding**
   Provide a strong mental framework for grasping core LLM concepts, their interconnections, and historical evolution through a relatable geographic analogy.

2. **Discoverability**
   Enable users to explore and discover seminal research papers, influential models, key organizations, and training methodologies in an intuitive, visual manner.

3. **Guidance**
   Illustrate common LLM training pipelines ("Sea Routes") and historical developments ("Age of Discovery Timeline"), helping users understand how different LLMs are built and how the field has progressed.

4. **Engagement**
   Make learning about LLMs a fun, interactive experience that leverages spatial memory and visual storytelling.

### Success Criteria

- **User Engagement:** Average session duration > 5 minutes; >60% of users interact with 3+ map features
- **Educational Impact:** Post-survey showing >70% of users report improved understanding of LLM concepts
- **Retention:** >30% of users return within 7 days
- **Discovery:** Users explore an average of 10+ landmarks/papers per session

---

## 4. Target Users

### Primary Personas

**1. CS Student (Sarah)**
- **Profile:** Undergraduate/graduate student studying AI/ML
- **Goals:** Understand LLM fundamentals for coursework or research
- **Needs:** Clear concept explanations, historical context, paper recommendations
- **Pain Points:** Overwhelmed by dense academic papers, unsure where to start

**2. Software Developer (Alex)**
- **Profile:** Developer exploring LLM integration into applications
- **Goals:** Learn practical training pipelines, identify suitable models for use cases
- **Needs:** Technical details, model comparisons, implementation guidance
- **Pain Points:** Fragmented documentation, unclear which models fit which tasks

**3. ML Researcher (Dr. Patel)**
- **Profile:** Researcher tracking LLM advancements
- **Goals:** Stay current with latest techniques, identify research gaps
- **Needs:** Comprehensive coverage, cross-referencing, organization-based filtering
- **Pain Points:** Information overload, difficulty tracking related work

**4. AI Enthusiast (Jordan)**
- **Profile:** Tech-savvy individual curious about AI developments
- **Goals:** Understand LLM landscape without deep technical background
- **Needs:** Accessible explanations, engaging visuals, clear progression paths
- **Pain Points:** Technical jargon, lack of contextual framing

---

## 5. Product Overview

### Core Concept

An interactive fantasy world map where:

- **Continents/Archipelagos/Islands** = LLM capabilities, techniques, and research areas (e.g., "Reasoning Continent," "RLHF Archipelago," "Quantization Quays")
- **Landmarks** = Iconic research papers, foundational models, key tools, benchmarks (e.g., "Attention Is All You Need Lighthouse," "GPT-3 Galleon")
- **Organizations** = Ship manufacturers/exploration companies (OpenAI, Google DeepMind, Meta AI, etc.)
- **Sea Routes** = Training pipelines showing stages from raw data to deployed models
- **Timeline** = "Age of Discovery" chronicling major LLM milestones and breakthroughs

### User Journey

1. User lands on a zoomable world map showing major continents (core LLM capabilities)
2. Zooming in reveals archipelagos and islands (specific techniques)
3. Clicking islands/landmarks opens information panels with paper abstracts, model details, links
4. Search finds specific papers, models, or capabilities
5. Guided tours walk through training pipelines step-by-step
6. Timeline shows historical evolution with cross-map highlighting
7. Organization filters highlight all contributions from specific research labs

---

## 6. Features & Requirements

### MVP Features (Priority: P0 = Must-Have, P1 = Should-Have, P2 = Nice-to-Have)

#### 6.1 Core Interactive Map (P0)

**Description:** Foundation of the application—a pannable, zoomable fantasy map

**Requirements:**
- Render 4K base map image using Leaflet with `ImageOverlay`
- Support pan, zoom (scroll/buttons), and drag interactions
- Responsive design filling viewport across desktop and tablet devices
- CRS.Simple coordinate system for pixel-based positioning
- Sensible min/max zoom bounds

**User Stories:**
- As a user, I can pan the map to explore different regions
- As a user, I can zoom in/out to see different levels of detail

**Technical Notes:**
- Use Azgaar FMG for base map PNG generation
- Leaflet.js for map rendering
- Bounds: Based on exported PNG dimensions

---

#### 6.2 Map Elements: Capability Regions (P0)

**Description:** Visual representation of LLM capabilities as geographic regions

**Requirements:**
- Render continents/islands as colored polygons from `capabilities.json`
- Style polygons based on `visualStyleHints` (fill color, opacity, patterns)
- Hover effects: outline highlighting
- Click to select: opens side information panel
- Display region name, description, and related concepts

**User Stories:**
- As a user, I can see major LLM capability areas represented as continents
- As a user, I can click a region to learn what it represents

**Data Fields:**
- `id`, `name`, `level` (continent/archipelago/island), `description`, `mapCoordinates` (polygon points), `visualStyleHints`, `parentRegionID`, `relatedConceptIDs`

---

#### 6.3 Map Elements: Landmarks (P0)

**Description:** Clickable markers representing papers, models, and tools

**Requirements:**
- Render markers at specified coordinates on map
- Custom icons by `kind` (lighthouse for papers, ship for models, anchor for tools, flag for benchmarks)
- Click marker → opens detailed side panel
- Display: name, type, short description, full details, external link, associated organization/model
- Only render markers visible at current zoom level (performance optimization)

**User Stories:**
- As a user, I can see important papers/models as landmarks on the map
- As a user, I can click a landmark to read its abstract/details and access the original paper

**Data Fields:**
- `id`, `name`, `kind`, `short`, `details`, `link`, `mapPoint`, `parentID`, `icon`, `tags`, `organizationIDs`, `modelIDs`

---

#### 6.4 Information Panels (P0)

**Description:** Persistent right panel (always visible, 384px wide) displaying contextual information for selected entities, default content, and tour interface

**Requirements:**
- Fixed right panel (not a slide-in drawer), always visible on desktop
- Three states:
  - **Default/Welcome State:** Shows "How to use" guide, feature overview, and guided tours list when nothing is selected
  - **Info Mode:** Displays entity details when user clicks on capabilities/landmarks
  - **Tour Mode:** Shows tour stepper UI when user activates a guided tour
- Layout: Flex layout with map taking remaining space (flex-1) and panel fixed at w-96 (384px)
- Mobile responsive: Panel hidden by default, shows as bottom sheet when entity selected
- Sections: Title, Type, Description, Details, Related Links, Associated Entities
- Deep links to organizations, models, related papers
- Accessible: focus management, ARIA labels, keyboard navigation

**User Stories:**
- As a user, I see helpful welcome content and guided tours in the right panel when I first visit
- As a user, I see detailed information in the right panel when I click any map element
- As a user, I can navigate to related entities from the info panel
- As a user, the same panel transforms into a tour interface when I start a guided tour
- As a mobile user, I see entity details in a bottom sheet overlay when I tap on map elements

**Panel States:**
- **Default/Welcome State:** Welcome message, how-to-use guide, features overview, guided tours list
- **Capability panel:** Description, landmarks within region
- **Landmark panel:** Paper abstract, authors, publication date, links
- **Organization panel:** Overview, models, papers, highlight button
- **Model panel:** Parameters, release date, capabilities, training route
- **Tour panel:** Stage title, narration, progress indicator, Next/Previous buttons

---

#### 6.5 Progressive Disclosure (P0)

**Description:** Map complexity adapts to zoom level to avoid visual clutter

**Requirements:**
- Define zoom thresholds: Z1 (continents only), Z2 (+ archipelagos), Z3 (+ islands/landmarks)
- Automatically show/hide layers based on current zoom
- Smooth transitions when layers appear/disappear
- Legend explains zoom-based visibility

**User Stories:**
- As a new user, I see only high-level continents initially
- As a user, zooming in reveals more detailed islands and specific papers

**Technical Notes:**
- Store zoom state in Zustand
- Filter rendered elements by `level` and zoom thresholds

---

#### 6.6 Legend (P0)

**Description:** Explains map iconography and thematic elements

**Requirements:**
- Collapsible panel in top-right corner
- Sections: Icon meanings, Region types, Zoom levels
- Toggle button with keyboard accessibility
- Screen-reader compatible

**User Stories:**
- As a user, I can reference the legend to understand map symbols
- As a user, I know what different colors/icons represent

---

#### 6.7 Search & Filtering (P1)

**Description:** Client-side fuzzy search across all entities

**Requirements:**
- Search box in header with instant dropdown results
- Fuzzy matching on: papers, capabilities, organizations, models
- Filters: by entity type (checkboxes)
- Weighted search: name > tags > description
- Selecting result: pans/zooms to entity and opens panel
- Highlight search matches on map

**User Stories:**
- As a user, I can search for a specific paper by name
- As a user, I can filter results to show only models from a specific organization

**Technical Notes:**
- Use Fuse.js for client-side search
- Build search index from normalized entity list at app startup
- Helper: `focusEntity(id)` to center map

---

#### 6.8 Timeline: Age of Discovery (P2 - Post-MVP)

**Description:** Chronological view of major LLM milestones (deferred to post-MVP)

**Requirements:**
- Timeline data integrated into search and tour features for MVP
- Events accessible via search functionality
- Cross-highlighting: selecting event highlights relevant landmarks/models on map
- Dedicated timeline UI panel deferred to post-MVP phase

**User Stories:**
- As a user, I can search for timeline events and see them on the map
- As a user, clicking a timeline event shows me where it appears on the map

**Data Fields:**
- `id`, `eventName`, `date`, `type`, `description`, `modelIDs`, `organizationIDs`, `landmarkIDs`, `capabilityIDs`

**Examples:**
- Timeline of OpenAI's GPT series
- Timeline of open-source LLMs (Llama, Qwen, Gemma, Phi)

**Note:** Dedicated timeline panel with vertical event list and filters deferred to post-MVP. Timeline data will be leveraged through search and contextual highlighting in MVP.

---

#### 6.9 Guided Tours / Sea Routes (P1)

**Description:** Step-by-step walkthroughs of LLM training pipelines shown in the persistent right panel

**Requirements:**
- Right panel switches to tour mode with stepper UI (Next/Previous buttons)
- Tours accessible from welcome state (default panel content)
- Each stage: centers map on relevant island, highlights landmarks, displays stage info in panel
- Keyboard shortcuts: `[` previous, `]` next
- Progress indicator showing current stage
- Clicking non-tour landmark pauses tour, shows landmark details while maintaining tour context
- Resume tour button returns to active stage

**User Stories:**
- As a user, I can discover and start guided tours from the default panel state
- As a user, I can follow a guided tour showing how to build a reasoning model
- As a user, I see each training stage highlighted on the map with explanatory text in the right panel
- As a user, I can pause a tour to explore other landmarks and resume where I left off

**Data Fields:**
- Route: `id`, `routeName`, `description`, `endPointCapabilityID`, `stages[]`
- Stage: `stageID`, `stageName`, `description`, `islandID`, `landmarkIDs`, `order`

**Example Tours:**
- "The Quest for a Reasoning Model" (RL training pipeline)
- "Journey to Test-Time Scaling"
- "PEFT Fine-Tuning Pathway"

**Technical Notes:**
- No separate `/tour/[routeId]` route needed - tours run in persistent right panel
- Panel state switches between 'default' (welcome), 'info' (entity details), and 'tour' (active tour)

---

#### 6.10 Contextual Highlighting by Organization (P1)

**Description:** Highlight all contributions from a specific research organization

**Requirements:**
- Organization panel includes "Highlight on Map" button
- Activating: dims non-related markers, pulses/outlines related ones
- Shows count of highlighted items
- Clear "Reset Highlights" action
- Visual feedback: highlighted state persists until cleared

**User Stories:**
- As a user, I can select OpenAI and see all their papers/models highlighted across the map
- As a user, I understand the breadth of an organization's research contributions

**Technical Notes:**
- Compute related IDs from `organization.modelIDs` + `organization.paperIDs`
- Apply CSS class to modify marker opacity/scale

---

#### 6.11 Snapshot Sharing (P2)

**Description:** Generate shareable links capturing current map state

**Requirements:**
- URL encoding: lat, lng, zoom, selected entity, filters, timeline filters, active tour/stage
- On load: parse URL params and restore map view, selections, filters
- "Copy Link" button in header
- Backward-compatible: ignore unknown params

**User Stories:**
- As a user, I can share my current map view with a colleague
- As a user, opening a shared link shows me exactly what the sender was viewing

**Technical Notes:**
- `serializeState(state): URLSearchParams`
- `parseState(search): Partial<State>`
- Use Next.js router for URL management

---

#### 6.12 Accessibility (P0)

**Description:** Ensure keyboard-only operation and screen-reader support

**Requirements:**
- All interactive controls keyboard accessible (Tab, Enter, Esc)
- ARIA attributes on panels, buttons, timeline items
- Visible focus states
- Color contrast ≥ WCAG AA
- Alternate patterns for colorblind users
- Axe audit: no critical violations

**User Stories:**
- As a keyboard-only user, I can navigate the entire map and access all features
- As a screen-reader user, I understand the structure and can access landmark information

**Technical Notes:**
- `role="dialog"` on panels
- Custom tabbable overlays for Leaflet markers
- `aria-labelledby` on headings

---

### Out of Scope (Post-MVP)

- **User Accounts & Personalization:** Saved favorites, custom annotations, learning paths
- **Collaborative Features:** Comments, community-contributed content, discussion threads
- **Advanced Analytics:** User behavior tracking, recommendation engine
- **AI-Powered Features:** Chatbot guide, automatic paper summarization
- **Multi-Language Support:** Internationalization beyond English
- **Mobile Native Apps:** iOS/Android applications (web-responsive only for MVP)
- **Real-Time Updates:** Live feeds from arXiv or conference proceedings
- **3D Map Visualization:** Elevation-based rendering or WebGL effects
- **Gamification:** Achievements, progress tracking, learning challenges

---

## 7. Data Model & Schema

### Entity Relationships

```
Organizations (1) ──< (M) Models
Organizations (1) ──< (M) Landmarks (papers)
Models (M) ──< (M) Capabilities
Capabilities (1) ──< (M) Landmarks (location)
SeaRoutes (1) ──< (M) Stages ──< (M) Landmarks
TimelineEvents (M) ──< (M) Models/Landmarks/Capabilities
```

### Core Entities

#### MapFeatures (Capabilities & Landmarks)

**Capabilities** (Islands/Continents)
```typescript
{
  id: string                    // "island_rlhf"
  name: string                  // "RLHF Archipelago"
  level: 'continent'|'archipelago'|'island'|'strait'
  description: string           // Brief explanation
  mapCoordinates: [number, number][]  // Polygon points
  visualStyleHints?: string     // "volcanic_islands_with_beacons"
  parentRegionID?: string       // Parent continent/archipelago
  relatedConceptIDs?: string[]  // Related capabilities
}
```

**Landmarks** (Papers/Models/Tools)
```typescript
{
  id: string                    // "paper_attention"
  name: string                  // "Attention Is All You Need Lighthouse"
  kind: 'seminal_paper'|'foundational_model'|'key_tool'|'benchmark_site'
  short: string                 // Brief summary
  details?: string              // Full description, authors, findings
  link?: string                 // URL to paper/resource
  mapPoint: [number, number]    // Location coordinates
  parentID: string              // Parent island/continent
  icon?: string                 // "lighthouse", "ship_icon"
  tags?: string[]               // Keywords for search
  organizationIDs?: string[]    // Associated orgs
  modelIDs?: string[]           // Associated models
}
```

#### Organizations

```typescript
{
  id: string                    // "org_openai"
  name: string                  // "OpenAI"
  description: string           // Brief overview
  websiteURL?: string
  logoURL?: string
  paperIDs?: string[]           // Associated landmarks
  modelIDs?: string[]           // Models produced
}
```

#### Models (Ships)

```typescript
{
  id: string                    // "model_gpt4"
  name: string                  // "GPT-4"
  organizationID: string        // Creator org
  description: string           // Key features, parameters
  releaseDate?: string          // YYYY-MM-DD
  modelCardURL?: string
  capabilityIDs?: string[]      // Strong capability areas
  routeID?: string              // Associated training pipeline
  iconStyle?: string            // "galleon", "frigate"
}
```

#### SeaRoutes (Training Pipelines)

```typescript
{
  id: string                    // "route_aligned_chatbot"
  routeName: string             // "Journey to an Aligned Chatbot"
  description: string           // Pipeline overview
  endPointCapabilityID: string  // Target capability
  stages: [
    {
      stageID: number           // 1, 2, 3...
      stageName: string         // "Supervised Fine-Tuning"
      description: string       // Stage explanation
      islandID: string          // Related capability island
      landmarkIDs?: string[]    // Relevant papers/tools
    }
  ]
}
```

#### TimelineEvents

```typescript
{
  id: string                    // "event_gpt3_launch"
  eventName: string             // "Launch of GPT-3"
  date: string                  // "2020-05-28"
  type: 'model_launch'|'technique_paper'|'benchmark_result'
  description: string           // Impact and significance
  modelIDs?: string[]
  organizationIDs?: string[]
  landmarkIDs?: string[]
  capabilityIDs?: string[]
}
```

### Data Storage (MVP)

- **Format:** Static JSON files in `/data/` directory
- **Files:** `capabilities.json`, `landmarks.json`, `organizations.json`, `models.json`, `routes.json`, `timeline.json`
- **Validation:** Zod schemas enforce type safety at load time
- **Version Control:** JSON files committed to Git for traceability
- **Curation:** Google Sheets → CSV export → script generates validated JSON

**Rationale:** Simple, version-controlled, no database required for static MVP; suitable for Next.js SSG

---

## 8. Technical Architecture

### Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) + TypeScript | SSG/SSR, file-based routing, built-in optimization, TypeScript for type safety |
| **Map Rendering** | Leaflet.js | Lightweight, feature-rich, custom tile support, excellent performance |
| **State Management** | Zustand | Simple, minimal boilerplate, sufficient for MVP scope |
| **UI Components** | Tailwind CSS + shadcn/ui | Rapid prototyping, accessible components, consistent design |
| **Search** | Fuse.js | Client-side fuzzy search, no backend needed |
| **Data Validation** | Zod | Runtime schema validation, TypeScript integration |
| **Testing** | Vitest (unit), Playwright (E2E), Axe (a11y) | Comprehensive coverage, modern tooling |
| **Deployment** | Vercel | Seamless Next.js integration, CDN, zero-config |
| **PWA** | Workbox / next-pwa | Offline support, installable |

### Architecture Diagram

```
┌─────────────────────────────────────────────┐
│            Next.js App (SSG)                │
├─────────────────────────────────────────────┤
│  Components:                                │
│  - MapView (Leaflet)                        │
│  - InfoPanel (Right Drawer)                 │
│  - TourPanel (Right Drawer - Tour Mode)     │
│  - SearchBox (Fuse.js)                      │
│  - Legend                                   │
├─────────────────────────────────────────────┤
│  State (Zustand):                           │
│  - mapState (zoom, center, selection)       │
│  - uiState (panel mode: info/tour)          │
│  - tourState (activeRoute, stage, paused)   │
│  - searchState (query, results, filter)     │
├─────────────────────────────────────────────┤
│  Data Layer:                                │
│  - dataLoader.ts (fetch + validate JSON)    │
│  - schema.ts (Zod schemas)                  │
│  - types.ts (TypeScript interfaces)         │
├─────────────────────────────────────────────┤
│  Static Data:                               │
│  /data/*.json → Loaded at build time        │
│  /public/map/base.png → Leaflet overlay     │
└─────────────────────────────────────────────┘
```

### Directory Structure

```
/app
  /components
    /map
      MapView.tsx
      CapabilityPolygon.tsx
      LandmarkMarker.tsx
    /panels
      InfoPanel.tsx
      TourPanel.tsx
      LegendPanel.tsx
    /search
      SearchBar.tsx
    /ui
      (shadcn components)
  page.tsx
  layout.tsx
/hooks
  useDataLoader.ts
  useLandmarkCulling.ts
  useProgressiveDisclosure.ts
/data
  capabilities.json
  landmarks.json
  organizations.json
  models.json
  routes.json
  timeline.json
/lib
  store.ts (Zustand store)
  search.ts
  schema.ts
  types.ts
/public
  /map/base.png
/tools
  generate-json.ts
/csv
  capabilities.csv
  landmarks.csv
  ...
/tests
  /unit
  /integration
  /e2e
```

### Performance Strategy

- **Static Generation:** Pre-render at build time for fast initial load
- **Code Splitting:** Lazy-load timeline and tour components
- **Landmark Culling:** Only render markers within viewport + visible zoom layers
- **Memoization:** Cache expensive computations (Fuse index, filtered lists)
- **Image Optimization:** Next.js Image component for logos/icons
- **PWA Caching:** Service worker caches map, data, and assets for offline use

### Security & Privacy

- **No User Data Collection:** No authentication, no personal data stored
- **Static Content:** No server-side vulnerabilities (SSG deployment)
- **XSS Prevention:** React's built-in escaping; sanitize external links
- **HTTPS:** Enforced via Vercel deployment
- **Content Security Policy:** Restrict script sources in production

---

## 9. User Stories

### Epic: Map Exploration

- **US-1:** As a user, I want to view a beautiful fantasy map representing the LLM landscape so I can explore visually
- **US-2:** As a user, I want to zoom in/out to see different levels of detail without overwhelming complexity
- **US-3:** As a user, I want to click on continents/islands to learn what LLM capability they represent
- **US-4:** As a user, I want to see only high-level regions initially and discover finer details as I zoom in

### Epic: Discovery & Learning

- **US-5:** As a user, I want to click on landmarks (papers/models) to read their details and access original sources
- **US-6:** As a user, I want to search for a specific paper or model by name and jump to it on the map
- **US-7:** As a user, I want to filter by organization to see all contributions from OpenAI, DeepMind, etc.
- **US-8:** As a user, I want to search for timeline events and see them highlighted on the map

### Epic: Guided Learning

- **US-9:** As a user, I want to follow a guided tour showing how to build a chatbot step-by-step in the right panel
- **US-10:** As a user, I want each tour stage to highlight relevant islands and papers with explanations
- **US-11:** As a user, I want to navigate tours using Next/Previous buttons or keyboard shortcuts
- **US-12:** As a user, I want to pause a tour to explore other landmarks and resume where I left off

### Epic: Sharing & Accessibility

- **US-13:** As a user, I want to share my current map view via a link so colleagues can see what I'm viewing
- **US-14:** As a keyboard-only user, I want to navigate the entire map and access all features
- **US-15:** As a screen-reader user, I want to understand the map structure and access landmark information

---

## 10. Success Metrics

### Engagement Metrics

| Metric | Target (3 months post-launch) | Measurement |
|--------|-------------------------------|-------------|
| Average Session Duration | >5 minutes | Google Analytics |
| Features Used per Session | >3 (map, search, timeline, or tour) | Event tracking |
| Landmarks Explored per Session | >10 clicks | Click tracking |
| Return Visitors (7-day) | >30% | GA cohort analysis |
| Tour Completion Rate | >50% of users who start a tour | Event funnels |

### Educational Impact

- **Post-Use Survey:** >70% report improved understanding of LLM concepts
- **Perceived Value:** >4/5 rating on "How useful was this resource?"
- **Recommendation:** >60% would recommend to others (NPS)

### Technical Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Performance Score | ≥85 (desktop) | Lighthouse CI |
| First Contentful Paint | <1.5s | Web Vitals |
| Time to Interactive | <3s | Web Vitals |
| Axe Accessibility Violations | 0 critical | Automated testing |

### Growth Metrics (Post-MVP)

- Monthly Active Users (MAU): Track growth trajectory
- Referral Sources: Academic institutions, social media, developer communities
- Content Coverage: Number of papers, models, organizations cataloged

---

## 11. Implementation Roadmap

**Note:** Detailed sprint planning, task breakdown, and GitHub issues are documented in [sprint-planning.md](sprint-planning.md). The roadmap below provides a high-level overview of milestones.

### Milestone 1: Core Map Foundation - **Sprints 1-2 (Weeks 1-4)**

**Goal:** Functional interactive map with basic interactions

**Deliverables:**
- Project setup with Next.js 14 + TypeScript + Leaflet + testing infrastructure
- Base map rendering with pan/zoom controls
- Data models, TypeScript interfaces, and Zod schemas
- Capability polygons with progressive disclosure (zoom-based layers)
- Landmark markers with custom icons and info panels
- Legend panel

**Success Criteria:** Users can explore a basic map, click on islands/landmarks, and see information panels.

**Sprint Details:** See [sprint-planning.md](sprint-planning.md) Sprint 1 (Issues #1-8) and Sprint 2 (Issues #9-15)

---

### Milestone 2: Content & Discovery - **Sprints 3-4 (Weeks 5-8)**

**Goal:** Enable search, filtering, and contextual highlighting

**Deliverables:**
- Client-side fuzzy search with Fuse.js (papers, capabilities, organizations, models)
- Organization-based contextual highlighting
- Snapshot sharing via URL state encoding
- CSV-to-JSON data curation pipeline

**Success Criteria:** Users can find content easily, understand organizational contributions, and share map views.

**Sprint Details:** See [sprint-planning.md](sprint-planning.md) Sprint 3 (Issues #16-21) and Sprint 4 (Issues #22-26)

---

### Milestone 3: Guided Tours - **Sprint 5 (Weeks 9-10)**

**Goal:** Guided learning experiences with interactive tours

**Deliverables:**
- Tour panel in right drawer with stage stepper UI
- Tour pause/resume functionality
- Map synchronization with tour stages (flyTo, highlighting)
- Tour catalog and discovery interface
- Keyboard shortcuts for tour navigation
- 3-5 example tours

**Success Criteria:** Users can follow structured learning paths through the right panel tour interface.

**Note:** Timeline panel deferred to post-MVP; timeline data accessible via search.

**Sprint Details:** See [sprint-planning.md](sprint-planning.md) Sprint 5 (Issues #27-33)

---

### Milestone 4: Polish & Production - **Sprint 6 (Weeks 11-12)**

**Goal:** Production-ready application with accessibility and performance optimization

**Deliverables:**
- Comprehensive accessibility audit and fixes (WCAG 2.1 AA compliance)
- Performance optimizations (code splitting, memoization, landmark culling)
- Visual polish (animations, transitions, theming)
- Deployment to Vercel with CI/CD pipeline
- Complete documentation (README, setup guides, contribution guidelines)

**Success Criteria:** Lighthouse ≥85, Zero critical axe violations, Production deployment successful.

**Sprint Details:** See [sprint-planning.md](sprint-planning.md) Sprint 6 (Issues #34-39)

---

**Total Timeline:** 12 weeks (6 two-week sprints) from kickoff to MVP launch

**Implementation Resources:**
- **Sprint Planning:** [sprint-planning.md](sprint-planning.md) - Detailed task breakdown, story points, dependencies
- **Architecture:** [architecture.md](architecture.md) - Technical implementation guide
- **Design Specs:** [front-end-spec.md](front-end-spec.md) - UI/UX specifications

**Post-MVP Priorities:**
1. Timeline panel with vertical event list and filters
2. Content expansion (100+ papers, 50+ models, 10+ tours)
3. User feedback integration
4. Mobile optimization
5. Community contribution features

---

## 12. Out of Scope (Post-MVP)

### Deferred Features

1. **User Accounts & Personalization**
   - Saved favorites, bookmarks
   - Custom annotations and notes
   - Personalized learning paths

2. **Collaborative Features**
   - User comments and discussions
   - Community-contributed content
   - Peer reviews and ratings

3. **Advanced Analytics**
   - User behavior tracking dashboard
   - Recommendation engine based on browsing patterns
   - A/B testing framework

4. **AI-Powered Features**
   - Chatbot guide for Q&A
   - Automatic paper summarization
   - Personalized tour generation

5. **Multi-Language Support**
   - Internationalization (i18n)
   - Translated content for non-English speakers

6. **Mobile Native Apps**
   - iOS and Android applications
   - (MVP will be responsive web only)

7. **Real-Time Updates**
   - Live arXiv paper feeds
   - Automated conference proceeding integration
   - RSS/webhook integrations

8. **3D Visualization**
   - WebGL-based 3D map rendering
   - Elevation-based terrain
   - Animated transitions

9. **Gamification**
   - Achievement badges
   - Progress tracking
   - Learning challenges and quizzes

10. **Advanced Data Features**
    - Export to CSV/PDF
    - API for programmatic access
    - Bulk data downloads

### Technical Debt Accepted for MVP

- Manual data curation (no CMS)
- Client-side-only search (no backend indexing)
- Static map (no procedural generation)
- Limited mobile optimization

---

## 13. Risks & Mitigations

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Content Curation Overload** | High | High | Start with curated subset (30 papers, 10 models, 3 tours); crowd-source post-launch |
| **Map Complexity** | Medium | High | Progressive disclosure; user testing to validate information hierarchy |
| **Performance Degradation** | Medium | Medium | Landmark culling, virtualization, performance budget monitoring |
| **Accessibility Gaps** | Low | High | Automated Axe testing, manual screen-reader testing, keyboard nav checklist |
| **Outdated Content** | High | Medium | Clearly label data snapshot date; plan quarterly update cycles |
| **Low User Engagement** | Medium | High | User testing during development; iterate based on feedback; marketing plan |
| **Mobile Experience** | Medium | Medium | Responsive design priority; defer native apps; test on real devices |
| **Map Generation Complexity** | Low | Low | Use Azgaar FMG for base map; manually place polygons/markers with tooling scripts |

### Contingency Plans

- **Scope Reduction:** If timeline slips, defer P2 features (snapshot sharing, timeline filters)
- **Performance Issues:** Reduce initial landmark count; implement stricter zoom gates
- **Data Quality:** Establish review process; lean on survey papers for authoritative sources
- **User Adoption:** Partner with educational institutions; post on Reddit, Hacker News; create demo video

---

## 14. Dependencies & Assumptions

### External Dependencies

- **Azgaar Fantasy Map Generator:** For base map PNG (fallback: commission custom map art)
- **Open-source libraries:** Leaflet, Fuse.js, Zustand (all stable, widely adopted)
- **Vercel Platform:** For deployment (fallback: Netlify, GitHub Pages)

### Assumptions

- **User Familiarity:** Users understand basic map navigation (pan, zoom)
- **Content Availability:** Public papers and model documentation accessible via links
- **Static Data Acceptable:** MVP does not require real-time updates
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ support
- **Bandwidth:** Users have reasonable internet speeds to load 4K base map image (~2-5MB)

### Critical Success Factors

1. **High-Quality Data Curation:** Accuracy and comprehensiveness of curated content
2. **Intuitive UX:** Users immediately understand the map analogy and how to interact
3. **Visual Appeal:** Base map aesthetics and thematic consistency
4. **Performance:** Smooth interactions even with hundreds of landmarks
5. **Accessibility:** Inclusive design enabling all users to benefit

---

## 15. Appendices

### A. Glossary

- **Capability:** An LLM technique or skill area (e.g., reasoning, alignment)
- **Landmark:** An iconic paper, model, tool, or benchmark
- **Sea Route:** A guided tour representing an LLM training pipeline
- **Timeline Event:** A milestone in LLM research history
- **Progressive Disclosure:** Showing information incrementally based on user actions (zoom level)

### B. References

- Internal documents: `contexts/idea.md`, `contexts/implementation_plan.md`
- Survey papers: (to be cataloged in data curation phase)
- Leaflet documentation: https://leafletjs.com
- Azgaar FMG: https://azgaar.github.io/Fantasy-Map-Generator/

### C. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-01 | Initial PRD based on idea and implementation plan | Product Management |

---

**Approval Signatures**

- **Product Manager:** _[Pending]_
- **Engineering Lead:** _[Pending]_
- **Design Lead:** _[Pending]_

---

*This document represents the blueprint for the Terra Incognita Linguae MVP. All features and timelines are subject to refinement based on user feedback and technical constraints discovered during development.*
