# Issue #31: Tour Pause/Resume Functionality

**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 4
**Priority:** P1
**Assignee:** Dev 2 (Mid-Level Full-Stack Developer)
**Status:** 🔄 Ready for Implementation

---

## 📖 User Story

**As a** tour user
**I want** to pause the tour to explore other landmarks, then resume where I left off
**So that** I can satisfy my curiosity without losing my place in the learning journey

---

## 🎯 Goal

Implement pause and resume functionality that allows users to step out of the guided tour experience, explore the map freely, and return to the exact stage where they paused.

---

## 📋 Acceptance Criteria

### ✅ Pause Functionality
- [ ] Clicking a non-tour landmark pauses the current tour
- [ ] Tour panel collapses to a compact banner at top of right panel
- [ ] Banner shows: "Tour paused - [Resume Tour] button"
- [ ] InfoPanel opens with details of clicked landmark
- [ ] Tour state stored in memory (stage number, tour ID)
- [ ] Map remains at paused tour's location
- [ ] All map interactions allowed while paused

### ✅ Resume Functionality
- [ ] "Resume Tour" button visible in paused banner
- [ ] Clicking "Resume Tour" returns to TourPanel at paused stage
- [ ] Map flies back to paused stage location
- [ ] Landmark highlighting restored to paused stage
- [ ] All other tour functionality immediately available
- [ ] No data loss during pause/resume cycle

### ✅ Pause State Management
- [ ] Zustand store action: `pauseTour(landmarkId)`
- [ ] Store tracks `tourPauseState: { tourId: string; stageIndex: number; pausedAt: Date }`
- [ ] Store action: `resumeTour()`
- [ ] Paused state persists across component re-renders
- [ ] Paused state survives URL navigation (Issue #24)

### ✅ UI State Transitions
- [ ] **Active Tour:** TourPanel full height with navigation
- [ ] **Paused Tour:** Compact banner showing pause indicator
- [ ] **Info Mode:** Typical InfoPanel state
- [ ] Visual distinction between states clear
- [ ] Smooth transitions between states (no jarring changes)

### ✅ Pause Banner Design
- [ ] Banner positioned at top of right panel
- [ ] Background color: distinct from active tour (e.g., yellow/warning)
- [ ] Shows tour title and pause icon
- [ ] "Resume Tour" button prominent and accessible
- [ ] Option to exit tour completely ("Exit Tour" link)
- [ ] Compact height to preserve map visibility

### ✅ Multiple Landmark Clicks
- [ ] Pausing a tour then clicking another landmark changes InfoPanel
- [ ] Previous paused tour state still available
- [ ] Only one tour can be paused at a time
- [ ] Clicking tour landmark resumes that tour (replaces paused state)

### ✅ Integration
- [ ] Works with Issue #30 (map synchronization)
- [ ] Works with Issue #24 (URL state) - pause state persists
- [ ] Pause state clears on tour exit
- [ ] Pause state clears when new tour started
- [ ] Compatible with keyboard navigation

### ✅ Accessibility
- [ ] Pause state announced to screen readers
- [ ] "Resume Tour" button has clear aria-label
- [ ] Pause banner keyboard accessible
- [ ] Focus management: focus moves appropriately on pause/resume
- [ ] Color not only indicator of pause state

### ✅ Testing
- [ ] Unit tests verify pause/resume state management
- [ ] Unit tests verify edge cases (double pause, multiple landmarks)
- [ ] E2E tests demonstrate full pause/resume flow
- [ ] E2E tests verify map state restoration
- [ ] Accessibility tests pass (axe-core)

---

## 🛠️ Technical Implementation

### Step 1: Update Zustand Store

Modify `src/lib/store.ts` to add pause/resume state:

```typescript
interface TourPauseState {
  tourId: string;
  stageIndex: number;
  pausedAt: Date;
}

interface MapState {
  // ...existing state
  currentTour: Tour | null;
  currentStageIndex: number;
  tourPauseState?: TourPauseState;
  isPausedTour: boolean;

  // Actions
  pauseTour: (landmarkId: string) => void;
  resumeTour: () => void;
  exitTour: () => void;
}

const useMapStore = create<MapState>((set, get) => ({
  // ...existing state
  isPausedTour: false,

  pauseTour: (landmarkId: string) => {
    const { currentTour, currentStageIndex } = get();

    if (!currentTour) return;

    // Store pause state
    set({
      isPausedTour: true,
      tourPauseState: {
        tourId: currentTour.id,
        stageIndex: currentStageIndex,
        pausedAt: new Date(),
      },
    });

    // Note: Selecting landmark (opening InfoPanel) is handled separately
  },

  resumeTour: () => {
    const { tourPauseState } = get();

    if (!tourPauseState) return;

    // Restore paused tour to previous stage
    set({
      isPausedTour: false,
      currentStageIndex: tourPauseState.stageIndex,
      tourPauseState: undefined,
    });

    // Map will automatically sync to stage via useTourMapSync
  },

  exitTour: () => {
    set({
      currentTour: null,
      currentStageIndex: 0,
      tourPauseState: undefined,
      isPausedTour: false,
    });
  },
}));
```

---

### Step 2: Create TourPauseBanner Component

Create `src/components/panels/TourPauseBanner.tsx`:

```typescript
'use client';

import React from 'react';
import { useMapStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Pause, RotateCcw, X } from 'lucide-react';

interface TourPauseBannerProps {
  tourTitle: string;
  onResume: () => void;
  onExit: () => void;
}

export const TourPauseBanner: React.FC<TourPauseBannerProps> = ({
  tourTitle,
  onResume,
  onExit,
}) => {
  return (
    <div
      className="bg-yellow-50 border-b border-yellow-200 p-3"
      role="status"
      aria-label={`Tour paused: ${tourTitle}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pause size={16} className="text-yellow-700" />
          <span className="text-sm font-medium text-yellow-900">
            Paused: <em>{tourTitle}</em>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onResume}
            aria-label={`Resume ${tourTitle} tour`}
            className="text-xs"
          >
            <RotateCcw size={14} className="mr-1" />
            Resume
          </Button>
          <button
            onClick={onExit}
            className="p-1 hover:bg-yellow-100 rounded transition"
            aria-label="Exit tour"
          >
            <X size={16} className="text-yellow-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### Step 3: Update InfoPanel Component

Modify `src/components/panels/InfoPanel.tsx` to handle pause/resume:

```typescript
'use client';

import React, { useState } from 'react';
import { useMapStore } from '@/lib/store';
import { TourPanel } from './TourPanel';
import { TourPauseBanner } from './TourPauseBanner';
import { WelcomeContent } from './WelcomeContent';

export const InfoPanel: React.FC = () => {
  const {
    currentTour,
    currentStageIndex,
    isPausedTour,
    selectedEntity,
    advanceTourStage,
    pauseTour,
    resumeTour,
    exitTour,
  } = useMapStore();

  const handleLandmarkClick = (landmarkId: string) => {
    // If tour is active, pause it
    if (currentTour && !isPausedTour) {
      pauseTour(landmarkId);
    }
  };

  const handleResume = () => {
    resumeTour();
  };

  const handleExitTour = () => {
    exitTour();
  };

  const handleNext = () => {
    advanceTourStage('next');
  };

  const handlePrevious = () => {
    advanceTourStage('previous');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Paused Tour Banner */}
      {isPausedTour && currentTour && (
        <TourPauseBanner
          tourTitle={currentTour.title}
          onResume={handleResume}
          onExit={handleExitTour}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Active Tour Panel */}
        {currentTour && !isPausedTour ? (
          <TourPanel
            tour={currentTour}
            currentStageIndex={currentStageIndex}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onExit={handleExitTour}
          />
        ) : selectedEntity && isPausedTour ? (
          /* Entity Details (while tour paused) */
          <EntityDetails entity={selectedEntity} />
        ) : (
          /* Welcome/Default State */
          <WelcomeContent onTourStart={handleTourStart} />
        )}
      </div>
    </div>
  );
};

const EntityDetails: React.FC<{ entity: any }> = ({ entity }) => {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <h2 className="text-xl font-bold mb-2">{entity.name}</h2>
      <p className="text-sm text-gray-600 mb-4">{entity.description}</p>
      {/* Additional entity details */}
    </div>
  );
};
```

---

### Step 4: Update LandmarkMarker Click Handler

Modify landmark click behavior in `src/components/map/LandmarkMarker.tsx`:

```typescript
const handleMarkerClick = () => {
  const { currentTour, pauseTour } = useMapStore.getState();

  // If tour is active, pause it
  if (currentTour) {
    pauseTour(landmark.id);
  }

  // Open entity details
  onClick?.(landmark);
};
```

---

### Step 5: Create Unit Tests

Create `tests/unit/features/tour-pause-resume.test.tsx`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMapStore } from '@/lib/store';
import { mockTour, mockLandmark } from '@/tests/fixtures';

describe('Tour Pause/Resume', () => {
  beforeEach(() => {
    // Reset store before each test
    useMapStore.setState({
      currentTour: null,
      currentStageIndex: 0,
      isPausedTour: false,
      tourPauseState: undefined,
    });
  });

  describe('Pause Tour', () => {
    it('should pause active tour and save state', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        // Start tour
        result.current.startTour(mockTour);
        // Advance to stage 2
        result.current.advanceTourStage('next');
        // Pause tour
        result.current.pauseTour(mockLandmark.id);
      });

      const state = useMapStore.getState();
      expect(state.isPausedTour).toBe(true);
      expect(state.tourPauseState).toBeDefined();
      expect(state.tourPauseState?.stageIndex).toBe(1);
      expect(state.tourPauseState?.tourId).toBe(mockTour.id);
    });

    it('should maintain current stage on pause', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.advanceTourStage('next');
        result.current.pauseTour(mockLandmark.id);
      });

      expect(useMapStore.getState().currentStageIndex).toBe(2);
    });

    it('should not pause if no tour is active', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.pauseTour(mockLandmark.id);
      });

      expect(useMapStore.getState().isPausedTour).toBe(false);
    });
  });

  describe('Resume Tour', () => {
    it('should restore tour to paused stage', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.pauseTour(mockLandmark.id);
        // Change stage while paused (shouldn't happen, but test robustness)
        result.current.advanceTourStage('next');
        // Resume
        result.current.resumeTour();
      });

      const state = useMapStore.getState();
      expect(state.isPausedTour).toBe(false);
      expect(state.currentStageIndex).toBe(1);
    });

    it('should clear pause state on resume', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.pauseTour(mockLandmark.id);
        result.current.resumeTour();
      });

      expect(useMapStore.getState().tourPauseState).toBeUndefined();
    });

    it('should have no effect if no tour paused', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.resumeTour();
      });

      expect(useMapStore.getState().isPausedTour).toBe(false);
    });
  });

  describe('Exit Tour', () => {
    it('should clear pause state on exit', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.pauseTour(mockLandmark.id);
        result.current.exitTour();
      });

      const state = useMapStore.getState();
      expect(state.currentTour).toBeNull();
      expect(state.isPausedTour).toBe(false);
      expect(state.tourPauseState).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle pause, advance attempt, resume', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);
        result.current.advanceTourStage('next');
        result.current.pauseTour(mockLandmark.id);
        // Try to advance (should not work if paused)
        result.current.advanceTourStage('next');
        result.current.resumeTour();
      });

      // Should still be at stage 1 after resume
      expect(useMapStore.getState().currentStageIndex).toBe(1);
    });

    it('should support multiple pause/resume cycles', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.startTour(mockTour);

        // Cycle 1
        result.current.pauseTour(mockLandmark.id);
        result.current.resumeTour();
        expect(useMapStore.getState().isPausedTour).toBe(false);

        // Cycle 2
        result.current.advanceTourStage('next');
        result.current.pauseTour(mockLandmark.id);
        result.current.resumeTour();
        expect(useMapStore.getState().currentStageIndex).toBe(1);
      });
    });
  });
});
```

---

### Step 6: Create E2E Tests

Create `tests/e2e/tour-pause-resume.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tour Pause/Resume', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Start a tour
    await page.click('text=Guided Tours');
    await page.click('text=GPT Evolution');
    // Advance to stage 2
    await page.click('button:has-text("Next")');
  });

  test('should pause tour when clicking landmark', async ({ page }) => {
    // Click a non-tour landmark
    await page.click('[data-testid="landmark-marker"]');

    // Tour panel should be replaced with pause banner
    await expect(page.locator('text=Tour paused')).toBeVisible();
    await expect(page.locator('button:has-text("Resume")')).toBeVisible();

    // Info panel should show landmark details
    await expect(page.locator('[data-testid="entity-details"]')).toBeVisible();
  });

  test('should resume tour at correct stage', async ({ page }) => {
    // Note stage number before pause
    const stageText = await page.locator('text=Stage 2 of 4').textContent();

    // Pause tour
    await page.click('[data-testid="landmark-marker"]');
    await expect(page.locator('text=Tour paused')).toBeVisible();

    // Resume tour
    await page.click('button:has-text("Resume")');

    // Should be back at stage 2
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();
  });

  test('should restore map location on resume', async ({ page }) => {
    // Get map bounds before pause
    const boundsBefore = await page.evaluate(() => {
      const bounds = (window as any).mapInstance.getBounds();
      return {
        neLat: bounds._northEast.lat,
        neLng: bounds._northEast.lng,
      };
    });

    // Pause tour (map may move when landmark selected)
    await page.click('[data-testid="landmark-marker"]');
    await page.waitForTimeout(300);

    // Resume tour
    await page.click('button:has-text("Resume")');
    await page.waitForTimeout(1200); // Wait for flyTo animation

    // Map should return to tour's location
    const boundsAfter = await page.evaluate(() => {
      const bounds = (window as any).mapInstance.getBounds();
      return {
        neLat: bounds._northEast.lat,
        neLng: bounds._northEast.lng,
      };
    });

    // Bounds should be approximately same
    expect(Math.abs(boundsBefore.neLat - boundsAfter.neLat)).toBeLessThan(0.1);
  });

  test('should exit tour from pause banner', async ({ page }) => {
    // Pause tour
    await page.click('[data-testid="landmark-marker"]');

    // Click exit button on pause banner
    await page.click('button[aria-label="Exit tour"]');

    // Tour panel should be gone
    await expect(page.locator('text=Tour paused')).not.toBeVisible();
    await expect(page.locator('text=GPT Evolution')).not.toBeVisible();
  });

  test('should handle multiple pause/resume cycles', async ({ page }) => {
    // Cycle 1
    await page.click('[data-testid="landmark-marker"]');
    await expect(page.locator('text=Tour paused')).toBeVisible();
    await page.click('button:has-text("Resume")');
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();

    // Cycle 2
    await page.click('[data-testid="landmark-marker"]');
    await expect(page.locator('text=Tour paused')).toBeVisible();
    await page.click('button:has-text("Resume")');
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();
  });

  test('should announce pause state to screen readers', async ({ page }) => {
    // Pause tour
    await page.click('[data-testid="landmark-marker"]');

    // Check for aria-label on pause banner
    const pauseBanner = page.locator('[role="status"]');
    await expect(pauseBanner).toHaveAttribute('aria-label', /Tour paused/);
  });
});
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Pause state saved correctly
- [ ] Resume restores to paused stage
- [ ] Pause state clears on exit
- [ ] Edge cases handled
- [ ] Multiple cycles supported

### E2E Tests
- [ ] Pause triggered by landmark click
- [ ] Pause banner displays
- [ ] Resume button works
- [ ] Map state restored
- [ ] Tour exits correctly

### Manual Testing
- [ ] Click non-tour landmark while in tour → tour pauses
- [ ] Pause banner shows correct tour name
- [ ] InfoPanel shows landmark details
- [ ] Click "Resume" → returns to exact stage
- [ ] Map flies back to tour location
- [ ] Exit from pause banner works
- [ ] Can pause/resume multiple times
- [ ] Accessibility features work (screen reader, keyboard)

---

## 📚 Reference Documentation

- **Architecture:** [architecture.md](../architecture.md) Section 5.2 (Panel Components)
- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 5, Issue #31

---

## 🔗 Dependencies

**Depends On:**
- Issue #28 (TourPanel Component)
- Issue #29 (Tour Navigation)
- Issue #30 (Map Synchronization)

**Blocks:**
- Issue #32 (Keyboard Shortcuts) - should consider paused state
- Issue #33 (Tour Catalog)

---

## ✅ Definition of Done

Before marking complete:

- [ ] ✅ Pause/resume state management working
- [ ] ✅ Pause banner displays correctly
- [ ] ✅ All acceptance criteria met
- [ ] ✅ Unit tests passing (>90%)
- [ ] ✅ E2E tests demonstrate flow
- [ ] ✅ Map state restored on resume
- [ ] ✅ Accessibility verified
- [ ] ✅ Code reviewed and approved

---

**Ready to implement?** Start with state management, then UI components, then integration with landmark clicks.

**Estimated Completion:** Day 4 of Sprint 5

---

**Issue Metadata:**
- **Sprint:** Sprint 5
- **Milestone:** Milestone 3 - Guided Tours
- **Labels:** `P1`, `tour`, `interaction`, `sprint-5`
- **Story Points:** 4
