# Developer Quick Start Guide
## Terra Incognita Linguae - MVP Development

**Version:** 1.0
**Date:** October 1, 2025
**For:** Developers joining the project or AI coding agents

---

## 🚀 Getting Started in 5 Minutes

### Prerequisites

- **Node.js:** 18.x or later
- **npm:** 9.x or later (or pnpm/yarn)
- **Git:** Latest version
- **VS Code:** Recommended IDE with extensions (ESLint, Prettier, Tailwind CSS IntelliSense)

### Quick Setup

```bash
# 1. Bootstrap Next.js 14 project
npx create-next-app@latest llm-map-explorer --typescript --tailwind --app --src-dir --import-alias "@/*"

# 2. Navigate to project
cd llm-map-explorer

# 3. Install core dependencies
npm install leaflet@1.9 react-leaflet@4.2 zustand@4.5 zod@3.23 fuse.js@7.0

# 4. Install dev dependencies
npm install -D @types/leaflet vitest @vitest/ui @testing-library/react @testing-library/jest-dom playwright @axe-core/playwright

# 5. Install shadcn/ui
npx shadcn-ui@latest init

# 6. Start development server
npm run dev
```

Visit `http://localhost:3000` - you should see the Next.js welcome page.

---

## 📁 Project Structure

Create this directory structure:

```
llm-map-explorer/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage (map viewer)
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── map/                # Map components
│   │   │   ├── MapContainer.tsx
│   │   │   ├── CapabilityPolygon.tsx
│   │   │   └── LandmarkMarker.tsx
│   │   ├── panels/             # UI panels
│   │   │   ├── InfoPanel.tsx
│   │   │   ├── TourPanel.tsx
│   │   │   └── LegendPanel.tsx
│   │   ├── search/             # Search components
│   │   │   └── SearchBar.tsx
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useDataLoader.ts
│   │   ├── useProgressiveDisclosure.ts
│   │   └── useLandmarkCulling.ts
│   ├── lib/                    # Utility functions
│   │   ├── store.ts            # Zustand store
│   │   ├── search.ts           # Fuse.js search
│   │   ├── schemas.ts          # Zod schemas
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
│       ├── data.ts             # Data model interfaces
│       └── index.ts            # Type exports
├── public/
│   ├── data/                   # Static JSON data
│   │   ├── capabilities.json
│   │   ├── landmarks.json
│   │   ├── organizations.json
│   │   └── tours.json
│   └── images/                 # Assets
│       └── map-base.png        # Base map image
├── tests/
│   ├── unit/                   # Vitest unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # Playwright E2E tests
├── scripts/                    # Build scripts
│   └── csv-to-json.py          # Data pipeline
└── docs/                       # Documentation
    ├── prd.md
    ├── architecture.md
    ├── front-end-spec.md
    └── sprint-planning.md
```

---

## 📋 Sprint 1 Checklist (Week 1-2)

Use this checklist to track Sprint 1 progress:

### Day 1-2: Project Setup
- [ ] Run `create-next-app` with TypeScript + App Router
- [ ] Install leaflet, react-leaflet, zustand, zod, fuse.js
- [ ] Install testing dependencies (vitest, playwright, axe-core)
- [ ] Initialize shadcn/ui with `npx shadcn-ui@latest init`
- [ ] Configure ESLint + Prettier
- [ ] Set up Git repository with `.gitignore`
- [ ] Create project structure (directories above)

### Day 3-4: Data Models & Validation
- [ ] Create `src/types/data.ts` with all TypeScript interfaces
  - Capability, Landmark, Organization, Tour, TourStage
  - LatLng, VisualStyle, ExternalLink, SearchResult
- [ ] Create `src/lib/schemas.ts` with Zod validation schemas
- [ ] Write unit tests for schema validation
- [ ] Export types from `src/types/index.ts`

### Day 5-7: Base Map Component
- [ ] Obtain/create base map image (4096×3072 PNG)
  - Option 1: Use Azgaar Fantasy Map Generator
  - Option 2: Use placeholder colored rectangles
  - Save to `public/images/map-base.png`
- [ ] Create `src/components/map/MapContainer.tsx`
- [ ] Configure Leaflet with CRS.Simple coordinate system
- [ ] Add ImageOverlay for base map
- [ ] Set map bounds based on image dimensions
- [ ] Implement pan/zoom controls
- [ ] Test in browser: map renders, pan/zoom works

### Day 8-10: Testing Infrastructure
- [ ] Create `vitest.config.ts`
- [ ] Create `playwright.config.ts`
- [ ] Set up test directories (`tests/unit`, `tests/e2e`)
- [ ] Write sample unit test (e.g., schema validation)
- [ ] Write sample E2E test (e.g., map loads)
- [ ] Set up GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- [ ] Verify CI runs on push/PR

**Sprint 1 Demo Goal:** Show working map with pan/zoom in browser

---

## 🧩 Key Implementation Patterns

### Pattern 1: Data Loading with Validation

```typescript
// src/hooks/useDataLoader.ts
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { capabilitySchema, landmarkSchema } from '@/lib/schemas';

export function useDataLoader() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [capabilitiesRes, landmarksRes] = await Promise.all([
          fetch('/data/capabilities.json'),
          fetch('/data/landmarks.json'),
        ]);

        const capabilities = z.array(capabilitySchema).parse(await capabilitiesRes.json());
        const landmarks = z.array(landmarkSchema).parse(await landmarksRes.json());

        setData({ capabilities, landmarks });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
```

### Pattern 2: Zustand Store Setup

```typescript
// src/lib/store.ts
import { create } from 'zustand';
import { Capability, Landmark, Tour } from '@/types';

interface AppState {
  mapState: {
    currentZoom: number;
    currentCenter: [number, number];
    selectedEntity: string | null;
  };
  uiState: {
    rightPanelOpen: boolean;
    rightPanelMode: 'info' | 'tour' | null;
  };
  tourState: {
    activeTour: Tour | null;
    currentStage: number;
    isPaused: boolean;
  };
  setMapZoom: (zoom: number) => void;
  selectEntity: (id: string, type: string) => void;
  startTour: (tourId: string) => void;
  exitTour: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mapState: {
    currentZoom: -1,
    currentCenter: [0, 0],
    selectedEntity: null,
  },
  uiState: {
    rightPanelOpen: false,
    rightPanelMode: null,
  },
  tourState: {
    activeTour: null,
    currentStage: 0,
    isPaused: false,
  },
  setMapZoom: (zoom) => set((state) => ({
    mapState: { ...state.mapState, currentZoom: zoom }
  })),
  selectEntity: (id, type) => set((state) => ({
    mapState: { ...state.mapState, selectedEntity: id },
    uiState: { rightPanelOpen: true, rightPanelMode: 'info' }
  })),
  startTour: (tourId) => set((state) => ({
    tourState: { ...state.tourState, activeTour: tourId, currentStage: 0 },
    uiState: { rightPanelOpen: true, rightPanelMode: 'tour' }
  })),
  exitTour: () => set((state) => ({
    tourState: { activeTour: null, currentStage: 0, isPaused: false },
    uiState: { ...state.uiState, rightPanelMode: 'info' }
  })),
}));
```

### Pattern 3: Leaflet MapContainer Component

```typescript
// src/components/map/MapContainer.tsx
'use client';

import { MapContainer as LeafletMap, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAP_WIDTH = 4096;
const MAP_HEIGHT = 3072;
const bounds = L.latLngBounds([[0, 0], [MAP_HEIGHT, MAP_WIDTH]]);

export function MapContainer() {
  return (
    <LeafletMap
      crs={L.CRS.Simple}
      bounds={bounds}
      maxBounds={bounds}
      minZoom={-1}
      maxZoom={2}
      zoom={-1}
      center={[MAP_HEIGHT / 2, MAP_WIDTH / 2]}
      style={{ height: '100vh', width: '100%' }}
    >
      <ImageOverlay url="/images/map-base.png" bounds={bounds} />
      {/* Capability polygons and landmark markers will be added here */}
    </LeafletMap>
  );
}
```

### Pattern 4: Progressive Disclosure Hook

```typescript
// src/hooks/useProgressiveDisclosure.ts
import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Capability } from '@/types';

const ZOOM_THRESHOLDS = {
  continent: -1,    // Visible at min zoom
  archipelago: 0,   // Visible at medium zoom
  island: 1,        // Visible at max zoom
};

export function useProgressiveDisclosure(capabilities: Capability[]) {
  const currentZoom = useAppStore((state) => state.mapState.currentZoom);

  const visibleCapabilities = useMemo(() => {
    return capabilities.filter((capability) => {
      const threshold = ZOOM_THRESHOLDS[capability.level];
      return currentZoom >= threshold;
    });
  }, [capabilities, currentZoom]);

  return visibleCapabilities;
}
```

---

## 🔧 Configuration Files

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test:unit

      - name: Build
        run: npm run build

      - name: E2E tests
        run: npm run test:e2e
```

---

## 📊 Sprint Progress Tracking

Use this template to track daily progress:

### Daily Standup Template

**Yesterday:**
- Completed Issue #X: [Task description]
- Blocked on: [Blocker if any]

**Today:**
- Working on Issue #Y: [Task description]
- Expected completion: [Today/Tomorrow]

**Blockers:**
- None / [Describe blocker and mitigation]

---

## 🐛 Common Pitfalls & Solutions

### Pitfall 1: Leaflet CRS.Simple Coordinate Confusion

**Problem:** Coordinates inverted or map doesn't render correctly

**Solution:**
- Leaflet uses `[y, x]` (latitude, longitude), NOT `[x, y]`
- For pixel maps: `[row, column]` or `[height, width]`
- Always use LatLng type: `type LatLng = [number, number];`

### Pitfall 2: React-Leaflet SSR Issues

**Problem:** "window is not defined" error during Next.js build

**Solution:**
```typescript
// Mark map component as client-only
'use client';

// Or use dynamic import with ssr: false
import dynamic from 'next/dynamic';
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
});
```

### Pitfall 3: Zustand Store Hydration Mismatch

**Problem:** Store state not persisting or hydration errors

**Solution:**
```typescript
// Wait for hydration before rendering
import { useEffect, useState } from 'react';

function MyComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Now safe to use store
}
```

### Pitfall 4: Zod Validation Performance

**Problem:** Slow data loading due to schema validation

**Solution:**
- Validate once at load time, not on every render
- Use `z.passthrough()` for optional fields
- Consider validating only in development:
```typescript
if (process.env.NODE_ENV === 'development') {
  data = schema.parse(data);
}
```

---

## 📚 Essential Reading

Before writing code, read these sections:

1. **Architecture Overview:** [architecture.md](architecture.md) Section 2
2. **Data Models:** [architecture.md](architecture.md) Section 4
3. **Component Design:** [architecture.md](architecture.md) Section 5
4. **State Management:** [architecture.md](architecture.md) Section 7
5. **Wireframes:** [front-end-spec.md](front-end-spec.md) Section 6
6. **Sprint 1 Tasks:** [sprint-planning.md](sprint-planning.md) Sprint 1

---

## 🎯 Definition of Done (DoD)

Before marking a task complete, verify:

- [ ] Code implemented and working in browser
- [ ] Unit tests written and passing
- [ ] TypeScript types correct (no `any`)
- [ ] No ESLint errors or warnings
- [ ] Component accessible (keyboard, ARIA labels)
- [ ] Code reviewed (self-review or peer review)
- [ ] Documentation updated (JSDoc comments)
- [ ] Git commit with clear message
- [ ] Issue updated with progress/completion

---

## 🚦 When You're Stuck

### Debug Checklist

1. **Check browser console:** Any errors?
2. **Check TypeScript errors:** Run `npm run type-check`
3. **Check Leaflet map:** Is map initialized? Check bounds, CRS, zoom
4. **Check data loading:** Use React DevTools to inspect state
5. **Check network tab:** Are JSON files loading?
6. **Check Zustand DevTools:** Install browser extension to inspect store

### Getting Help

1. **Search issues in sprint-planning.md:** Issue dependencies and notes
2. **Read architecture docs:** Likely already answered
3. **Ask team:** Daily standups or Slack
4. **Create issue:** Document blocker with reproduction steps

---

## 🎉 Success Criteria

You've successfully completed Sprint 1 when:

✅ Map renders with base image
✅ Pan and zoom controls work
✅ TypeScript types defined for all data models
✅ Zod schemas validate JSON data
✅ Unit tests pass
✅ CI pipeline green
✅ Code merged to main branch

**Next:** Move to Sprint 2 - Capability Polygons & Info Panels

---

## 📞 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test:unit        # Run Vitest unit tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:watch       # Watch mode for unit tests

# Code Quality
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run format           # Prettier format

# Utilities
npx shadcn-ui@latest add button  # Add shadcn/ui component
```

---

**Ready to start?** Begin with Issue #1: Project Bootstrap

See [sprint-planning.md](sprint-planning.md) for detailed task descriptions and acceptance criteria.

Good luck! 🚀
