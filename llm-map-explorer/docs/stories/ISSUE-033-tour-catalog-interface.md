# Issue #33: Tour Catalog Interface - Discovery & Selection

**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 2
**Priority:** P1
**Assignee:** Dev 2 (Mid-Level Full-Stack Developer)
**Status:** ✅ Ready for Review

---

## 📖 User Story

**As a** new user
**I want** to discover available guided tours and start one with a click
**So that** I can explore the map through structured, educational pathways

---

## 🎯 Goal

Implement a tour discovery and selection interface that displays available tours with metadata (title, description, difficulty, duration) and allows users to start tours from a centralized catalog.

---

## 📋 Acceptance Criteria

### ✅ Tour Catalog Display
- [ ] Tours catalog accessible from app header or welcome panel
- [ ] Lists all available tours from `tours.json`
- [ ] Each tour shown as a card with:
  - Tour title
  - Description (1-2 sentences)
  - Difficulty badge (Beginner/Intermediate/Advanced)
  - Estimated duration (e.g., "8-10 minutes")
  - "Start Tour" button

### ✅ Visual Design
- [ ] Tour cards have consistent styling
- [ ] Cards are responsive and grid-based
- [ ] Difficulty colors match design system:
  - Beginner: Green
  - Intermediate: Yellow
  - Advanced: Red
- [ ] Hover effects on cards (slight elevation, cursor change)
- [ ] Clean typography and spacing
- [ ] Icons for difficulty levels (optional)

### ✅ Tour Selection
- [ ] Clicking "Start Tour" button initiates tour
- [ ] Tour opens immediately in TourPanel
- [ ] Map flies to first stage location
- [ ] First stage content displays in panel
- [ ] Progress shows "Stage 1 of N"

### ✅ Catalog Access Points
- [ ] "Guided Tours" link in header or navigation
- [ ] Tours list in welcome/default InfoPanel state
- [ ] Search integration: tours searchable from main search bar
- [ ] Keyboard accessible (Tab navigation through tour cards)

### ✅ Catalog Component Structure
- [ ] Component file: `src/components/tours/TourCatalog.tsx`
- [ ] Separate component: `src/components/tours/TourCard.tsx`
- [ ] Uses shadcn/ui components (Card, Button, Badge)
- [ ] Integrates with Zustand store for tour state

### ✅ Search Integration
- [ ] Typing "tour" in search shows tour results
- [ ] Searching by tour name shows matching tours
- [ ] Clicking search result starts tour
- [ ] Tours appear in search results with type indicator

### ✅ Responsive Design
- [ ] Desktop (1024px+): Grid layout 2-3 columns
- [ ] Tablet (768px-1023px): Grid layout 2 columns
- [ ] Mobile (<768px): Single column, full-width cards
- [ ] Touch-friendly (cards tall enough for touch interaction)

### ✅ Accessibility
- [ ] All buttons keyboard accessible (Tab key)
- [ ] Tour cards focusable with visible focus states
- [ ] Descriptive aria-labels on buttons
- [ ] Screen readers announce tour information
- [ ] Color contrast meets WCAG AA
- [ ] No automated auto-play or popups

### ✅ Performance
- [ ] Catalog loads instantly (data already in memory from Issue #20)
- [ ] No network requests for tours
- [ ] Smooth card animations
- [ ] Grid layout optimized for rendering

### ✅ Testing
- [ ] Unit tests verify component rendering
- [ ] Unit tests verify tour start action
- [ ] E2E tests demonstrate tour discovery and start
- [ ] E2E tests verify search integration
- [ ] Accessibility tests pass (axe-core)

---

## 🛠️ Technical Implementation

### Step 1: Create TourCard Component

Create `src/components/tours/TourCard.tsx`:

```typescript
'use client';

import React from 'react';
import { Tour } from '@/types';
import { useMapStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';

interface TourCardProps {
  tour: Tour;
  onTourStart?: (tour: Tour) => void;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, onTourStart }) => {
  const { startTour } = useMapStore();

  const handleStartTour = () => {
    startTour(tour);
    onTourStart?.(tour);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '⭐';
      case 'intermediate':
        return '⭐⭐';
      case 'advanced':
        return '⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  return (
    <Card
      className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:border-blue-300"
      role="article"
    >
      <CardHeader>
        <CardTitle className="text-lg mb-2">{tour.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {tour.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3">
        {/* Metadata */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock size={14} />
            <span>{tour.estimatedDuration} min</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Zap size={14} />
            <span>{tour.stages.length} stages</span>
          </div>
        </div>

        {/* Difficulty Badge */}
        <Badge
          variant="outline"
          className={`w-fit ${getDifficultyColor(tour.difficulty)}`}
        >
          {getDifficultyIcon(tour.difficulty)} {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
        </Badge>

        {/* Start Button */}
        <Button
          onClick={handleStartTour}
          variant="default"
          className="w-full mt-auto"
          aria-label={`Start ${tour.title} tour`}
        >
          Start Tour
        </Button>
      </CardContent>
    </Card>
  );
};
```

---

### Step 2: Create TourCatalog Component

Create `src/components/tours/TourCatalog.tsx`:

```typescript
'use client';

import React, { useMemo } from 'react';
import { useMapStore } from '@/lib/store';
import { TourCard } from './TourCard';
import { Tour } from '@/types';

interface TourCatalogProps {
  tours: Tour[];
  columns?: 'auto' | 1 | 2 | 3;
  onTourStart?: (tour: Tour) => void;
}

export const TourCatalog: React.FC<TourCatalogProps> = ({
  tours,
  columns = 'auto',
  onTourStart,
}) => {
  // Sort tours by difficulty (beginner first)
  const sortedTours = useMemo(() => {
    const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    return [...tours].sort(
      (a, b) =>
        (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 99) -
        (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 99)
    );
  }, [tours]);

  if (tours.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No tours available</p>
      </div>
    );
  }

  const gridColsClass =
    columns === 'auto'
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : `grid-cols-${columns}`;

  return (
    <div className={`grid ${gridColsClass} gap-4 p-4`}>
      {sortedTours.map((tour) => (
        <TourCard
          key={tour.id}
          tour={tour}
          onTourStart={onTourStart}
        />
      ))}
    </div>
  );
};
```

---

### Step 3: Add Tours to Welcome Panel

Update `src/components/panels/WelcomeContent.tsx`:

```typescript
'use client';

import React from 'react';
import { useMapStore } from '@/lib/store';
import { TourCatalog } from '@/components/tours/TourCatalog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const WelcomeContent: React.FC = () => {
  const { tours } = useMapStore(); // Assuming tours loaded in store

  return (
    <Tabs defaultValue="welcome" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="welcome">Welcome</TabsTrigger>
        <TabsTrigger value="tours">Tours</TabsTrigger>
      </TabsList>

      <TabsContent value="welcome" className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <h2 className="text-2xl font-bold">Welcome to Terra Incognita Linguae</h2>
          <p className="text-gray-600">
            Explore the landscape of Large Language Model research. Discover
            seminal papers, foundational models, and key research areas that
            shaped modern AI.
          </p>

          <div className="space-y-2">
            <h3 className="font-semibold">How to Explore:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Click landmarks to learn about papers and models</li>
              <li>Use the search bar to find specific topics</li>
              <li>Zoom the map to see more detail</li>
              <li>Click capability regions for category info</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Keyboard Shortcuts:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <kbd>Ctrl+F</kbd> - Open search
              </li>
              <li>
                <kbd>Tab</kbd> - Navigate
              </li>
            </ul>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="tours" className="flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold p-4">Guided Tours</h2>
        {tours && tours.length > 0 ? (
          <TourCatalog tours={tours} />
        ) : (
          <div className="p-4 text-gray-500">Loading tours...</div>
        )}
      </TabsContent>
    </Tabs>
  );
};
```

---

### Step 4: Add Tours Header Button

Update app header to include "Guided Tours" button:

```typescript
// In header component
<Button
  variant="outline"
  onClick={() => setShowTourCatalog(true)}
  className="flex items-center gap-2"
>
  <BookOpen size={16} />
  Tours
</Button>

// Dialog with TourCatalog
<Dialog open={showTourCatalog} onOpenChange={setShowTourCatalog}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Guided Tours</DialogTitle>
      <DialogDescription>
        Choose a learning path to explore LLM research
      </DialogDescription>
    </DialogHeader>
    <TourCatalog tours={tours} onTourStart={() => setShowTourCatalog(false)} />
  </DialogContent>
</Dialog>
```

---

### Step 5: Update Search Integration

Modify search to include tours:

```typescript
// In src/lib/search.ts
export const initializeSearchIndex = (data: {
  capabilities: Capability[];
  landmarks: Landmark[];
  organizations: Organization[];
  tours: Tour[];
}) => {
  const searchableItems = [
    ...data.capabilities.map((c) => ({
      id: c.id,
      name: c.name,
      type: 'capability',
      description: c.description,
      tags: [c.level, 'capability'],
    })),
    ...data.landmarks.map((l) => ({
      id: l.id,
      name: l.name,
      type: 'landmark',
      description: l.description,
      tags: [l.type, l.year?.toString()],
    })),
    ...data.organizations.map((o) => ({
      id: o.id,
      name: o.name,
      type: 'organization',
      description: o.description,
      tags: ['organization'],
    })),
    ...data.tours.map((t) => ({
      id: t.id,
      name: t.title,
      type: 'tour',
      description: t.description,
      tags: [t.difficulty, 'tour', `${t.stages.length} stages`],
    })),
  ];

  return new Fuse(searchableItems, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'type', weight: 1.5 },
      { name: 'tags', weight: 1 },
      { name: 'description', weight: 0.5 },
    ],
  });
};
```

---

### Step 6: Create Unit Tests

Create `tests/unit/components/TourCard.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TourCard } from '@/components/tours/TourCard';
import { mockTour } from '@/tests/fixtures/tours';
import { useMapStore } from '@/lib/store';

describe('TourCard', () => {
  it('renders tour information', () => {
    render(<TourCard tour={mockTour} />);

    expect(screen.getByText(mockTour.title)).toBeInTheDocument();
    expect(screen.getByText(mockTour.description)).toBeInTheDocument();
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
  });

  it('displays difficulty badge', () => {
    render(<TourCard tour={mockTour} />);

    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
  });

  it('shows estimated duration', () => {
    render(<TourCard tour={mockTour} />);

    expect(screen.getByText(`${mockTour.estimatedDuration} min`)).toBeInTheDocument();
  });

  it('shows number of stages', () => {
    render(<TourCard tour={mockTour} />);

    expect(screen.getByText(`${mockTour.stages.length} stages`)).toBeInTheDocument();
  });

  it('calls startTour when start button clicked', () => {
    const spy = jest.spyOn(useMapStore.getState(), 'startTour');
    render(<TourCard tour={mockTour} />);

    fireEvent.click(screen.getByText(/Start Tour/i));

    expect(spy).toHaveBeenCalledWith(mockTour);
  });

  it('calls onTourStart callback', () => {
    const onTourStart = jest.fn();
    render(<TourCard tour={mockTour} onTourStart={onTourStart} />);

    fireEvent.click(screen.getByText(/Start Tour/i));

    expect(onTourStart).toHaveBeenCalledWith(mockTour);
  });
});

describe('TourCatalog', () => {
  it('renders all tours', () => {
    const tours = [mockTour, { ...mockTour, id: 'tour-2', title: 'Tour 2' }];
    render(<TourCatalog tours={tours} />);

    expect(screen.getByText(mockTour.title)).toBeInTheDocument();
    expect(screen.getByText('Tour 2')).toBeInTheDocument();
  });

  it('sorts tours by difficulty (beginner first)', () => {
    const tours = [
      { ...mockTour, id: 'tour-1', difficulty: 'advanced' },
      { ...mockTour, id: 'tour-2', difficulty: 'beginner' },
      { ...mockTour, id: 'tour-3', difficulty: 'intermediate' },
    ];

    const { container } = render(<TourCatalog tours={tours} />);
    const tourTitles = Array.from(container.querySelectorAll('h3')).map((el) => el.textContent);

    // Beginner should appear first
    expect(tourTitles.indexOf('Tour 2')).toBeLessThan(tourTitles.indexOf('Tour 1'));
  });

  it('shows empty state when no tours', () => {
    render(<TourCatalog tours={[]} />);

    expect(screen.getByText(/No tours available/i)).toBeInTheDocument();
  });
});
```

---

### Step 7: Create E2E Tests

Create `tests/e2e/tour-discovery.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tour Discovery & Catalog', () => {
  test('should display tour catalog from welcome panel', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Click Tours tab in welcome panel
    await page.click('[role="tab"]:has-text("Tours")');

    // Should see tour cards
    await expect(page.locator('text=Guided Tours')).toBeVisible();
    await expect(page.locator('[role="article"]')).toHaveCount(4); // 4 tours
  });

  test('should display tour cards with metadata', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[role="tab"]:has-text("Tours")');

    const tourCard = page.locator('[role="article"]').first();

    // Should have title, description, difficulty, duration
    await expect(tourCard.locator('h3')).toBeTruthy();
    await expect(tourCard.locator('text=/min/')).toBeTruthy();
    await expect(tourCard.locator('text=/beginner|intermediate|advanced/i')).toBeTruthy();
  });

  test('should start tour from catalog', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[role="tab"]:has-text("Tours")');

    // Click first tour's start button
    await page.click('[role="article"]:first-child button:has-text("Start Tour")');

    // Should show tour panel
    await expect(page.locator('text=Stage 1 of')).toBeVisible();
  });

  test('should find tours in search', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Search for tour
    await page.click('[placeholder="Search..."]');
    await page.keyboard.type('tour');

    // Should show tour results
    await expect(page.locator('text=/tour/i')).toBeTruthy();
  });

  test('should start tour from search result', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Search for "GPT Evolution"
    await page.click('[placeholder="Search..."]');
    await page.keyboard.type('GPT Evolution');

    // Click search result
    await page.click('text=GPT Evolution');

    // Should start tour
    await expect(page.locator('text=Stage 1 of')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[role="tab"]:has-text("Tours")');

    // Tab to first tour card
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should focus start button
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveText(/Start Tour/);

    // Press Enter to start
    await page.keyboard.press('Enter');

    // Should start tour
    await expect(page.locator('text=Stage 1 of')).toBeVisible();
  });

  test('should close catalog when tour starts', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Open tours from header button
    await page.click('button:has-text("Tours")');

    // Start first tour
    await page.click('[role="article"]:first-child button:has-text("Start Tour")');

    // Catalog dialog should close
    await expect(page.locator('text=Guided Tours')).not.toBeVisible();

    // Tour panel should be visible
    await expect(page.locator('text=Stage 1 of')).toBeVisible();
  });
});
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] TourCard renders all metadata
- [ ] TourCatalog displays all tours
- [ ] Tours sorted by difficulty
- [ ] Start button triggers startTour action
- [ ] Empty state displays when no tours

### E2E Tests
- [ ] Tour catalog displays from welcome/header
- [ ] Tour cards show complete information
- [ ] Starting tour opens TourPanel
- [ ] Tours searchable and launchable from search
- [ ] Keyboard navigation works
- [ ] Catalog closes on tour start

### Manual Testing
- [ ] Tour cards visually distinct
- [ ] Difficulty colors correct (green/yellow/red)
- [ ] Hover effects smooth
- [ ] Touch interaction smooth on mobile
- [ ] Search finds tours by name and description
- [ ] No broken images or icons
- [ ] Responsive on all screen sizes

---

## 📚 Reference Documentation

- **Architecture:** [architecture.md](../architecture.md) Section 5.3 (Tour Interface)
- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 5, Issue #33

---

## 🔗 Dependencies

**Depends On:**
- Issue #27 (Tours Data)
- Issue #28 (TourPanel Component)
- Issue #16 (Fuse.js Search)

**Blocks:**
- None (final feature in Sprint 5)

---

## ✅ Definition of Done

Before marking complete:

- [ ] ✅ Tour catalog component created
- [ ] ✅ Tour cards display all metadata
- [ ] ✅ Tours easily discoverable
- [ ] ✅ All acceptance criteria met
- [ ] ✅ Unit tests passing
- [ ] ✅ E2E tests passing
- [ ] ✅ Responsive design verified
- [ ] ✅ Accessibility verified (axe-core)
- [ ] ✅ Code reviewed and approved

---

## 📝 Notes for Implementation

### Time Estimate
- **Component Development:** 1-1.5 hours
- **Integration:** 30-45 minutes
- **Testing:** 45 minutes
- **Polish & Documentation:** 30 minutes
- **Total:** ~2 hours (2 story points)

### Best Practices
1. **Reuse shadcn/ui components** - Card, Badge, Button
2. **Sort tours meaningfully** - Difficulty helps users choose
3. **Test search integration early** - Critical UX
4. **Keep cards compact** - Mobile visibility
5. **Provide clear calls-to-action** - "Start Tour" button obvious

### Next Steps
1. Deploy Sprint 5 features
2. Conduct user testing
3. Iterate based on feedback
4. Move to Sprint 6 (Polish & Launch)

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ Users can discover available tours
✅ Tours display with complete metadata
✅ Users can start tours from catalog or search
✅ Interface is responsive and accessible
✅ Unit and E2E tests pass
✅ Search integration working

---

**Ready to implement?** Start with TourCard and TourCatalog components, then integrate with header and welcome panel.

**Estimated Completion:** Day 4-5 of Sprint 5

---

**Issue Metadata:**
- **Sprint:** Sprint 5
- **Milestone:** Milestone 3 - Guided Tours
- **Labels:** `P1`, `tour`, `discovery`, `UI`, `sprint-5`
- **Story Points:** 2

---

## 🤖 Dev Agent Record

**Agent Model Used:** GPT-5 Codex (dev)

### Completion Notes
- Reworked the welcome InfoPanel so new users see the full “how to use the map” guidance with tours presented as a lightweight, keyboard-friendly list that launches tours on click.
- Added the `TourList` component and rewired the catalog flow to load tour data from `tours.json` via `useInitializeMapData`, ensuring the list stays in sync with the source data.
- Hardened client-only Leaflet integrations (LandmarkMarker) and stabilized the tour start experience with deterministic selectors for Playwright and SSR-safe imports.
- Tuned `useTourMapSync` and `MapContainer` to stop in-flight animations, clamp zoom, and use quicker easing so the camera snaps crisply to each stage without over-zooming.

### Debug Log References
- N/A (no new debug log entries)

### Testing Results
- Unit/E2E: Not re-run (per request)
- Manual: Verified tour list renders, launches tours, and camera transitions smoothly between stages.

### File List
- `src/components/map/LandmarkMarker.tsx`
- `src/components/map/MapContainer.tsx`
- `src/components/panels/InfoPanel.tsx`
- `src/components/panels/TourPanel.tsx`
- `src/components/tours/TourList.tsx`
- `src/hooks/useInitializeMapData.ts`
- `src/hooks/useTourMapSync.ts`
- `tests/e2e/tour-catalog.spec.ts`

### 📄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-02-14 | 0.9 | Implemented tour list UI, Leaflet SSR guards, tour data loading, and stabilized tour camera sync. | GPT-5 Codex (Dev Agent) |
