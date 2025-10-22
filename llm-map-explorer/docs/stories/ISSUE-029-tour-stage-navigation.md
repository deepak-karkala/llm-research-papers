# Issue #29: Tour Stage Navigation - Next/Previous Controls

**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 4
**Priority:** P1
**Assignee:** Dev 1 (Senior Full-Stack Developer)
**Status:** 🔄 Ready for Implementation

---

## 📖 User Story

**As a** tour user
**I want** to navigate through tour stages using Previous and Next buttons
**So that** I can control the pace of learning and move through the guided tour at my own speed

---

## 🎯 Goal

Implement stage navigation controls that allow users to move forward and backward through tour stages, with proper state management and disabled state handling for boundary cases.

---

## 📋 Acceptance Criteria

### ✅ Navigation Buttons
- [ ] "Previous Stage" button visible on TourPanel
- [ ] "Next Stage" button visible on TourPanel
- [ ] Buttons are full-width for accessibility
- [ ] Buttons use shadcn/ui Button component
- [ ] Previous button disabled when on stage 0
- [ ] Next button disabled when on last stage (optional for UX)

### ✅ Button Labels & Text
- [ ] Previous button shows: "Previous" with back chevron icon
- [ ] Next button shows: "Next" with forward chevron icon
- [ ] On final stage, Next button text changes to "Complete Tour"
- [ ] Button text clearly indicates action
- [ ] aria-labels provide screen reader context

### ✅ State Management
- [ ] Zustand store action: `advanceTourStage('next' | 'previous')`
- [ ] Action updates `currentStageIndex` in store
- [ ] Action validates bounds (0 to stages.length - 1)
- [ ] Previous action decrements currentStageIndex
- [ ] Next action increments currentStageIndex
- [ ] State persists across component re-renders

### ✅ Stage Transitions
- [ ] Smooth transition when advancing to next stage
- [ ] TourPanel content updates when stage changes
- [ ] Progress bar updates smoothly
- [ ] Stage title and narration update immediately
- [ ] No flickering or layout shifts during transition
- [ ] Map updates (flyTo) happens on stage change (Issue #30)

### ✅ Boundary Handling
- [ ] Previous button disabled on stage 0 (first stage)
- [ ] Clicking disabled Previous button has no effect
- [ ] Next button on last stage shows "Complete Tour" text
- [ ] Completing tour triggers exitTour() action
- [ ] Cannot navigate beyond bounds

### ✅ User Feedback
- [ ] Button hover states provide visual feedback
- [ ] Button active/pressed states are clear
- [ ] Progress indicator updates on stage change
- [ ] Stage counter shows "Stage X of Y" accurately
- [ ] Current stage is clearly highlighted

### ✅ Keyboard Navigation
- [ ] Arrow Right (→) key advances to next stage
- [ ] Arrow Left (←) key goes to previous stage
- [ ] Keyboard navigation respects stage boundaries
- [ ] Keyboard shortcuts don't trigger outside tour context
- [ ] Keyboard events are properly handled and prevented

### ✅ Accessibility
- [ ] All buttons keyboard focusable (Tab key)
- [ ] Focus states are clearly visible
- [ ] aria-labels on all buttons
- [ ] aria-current or aria-label indicates active stage
- [ ] Screen reader announces stage changes
- [ ] No keyboard traps
- [ ] Proper focus management on stage transition

### ✅ Testing
- [ ] Unit tests verify navigation logic
- [ ] Unit tests verify state updates
- [ ] Unit tests verify boundary conditions
- [ ] Unit tests verify disabled states
- [ ] E2E tests demonstrate full tour progression
- [ ] Keyboard navigation tested in E2E
- [ ] Accessibility tests pass (axe-core)

---

## 🛠️ Technical Implementation

### Step 1: Update Zustand Store

Modify `src/lib/store.ts` to add navigation logic:

```typescript
interface MapState {
  // ...existing state
  currentTour: Tour | null;
  currentStageIndex: number;
  tourPausedAt?: number; // For pause/resume feature (Issue #31)

  // Actions
  startTour: (tour: Tour) => void;
  exitTour: () => void;
  advanceTourStage: (direction: 'next' | 'previous') => void;
}

const useMapStore = create<MapState>((set, get) => ({
  currentTour: null,
  currentStageIndex: 0,

  startTour: (tour: Tour) => {
    set({ currentTour: tour, currentStageIndex: 0 });
  },

  exitTour: () => {
    set({ currentTour: null, currentStageIndex: 0, tourPausedAt: undefined });
  },

  advanceTourStage: (direction: 'next' | 'previous') => {
    const { currentTour, currentStageIndex } = get();

    // Validate tour exists
    if (!currentTour || !currentTour.stages) {
      console.warn('No active tour to navigate');
      return;
    }

    const totalStages = currentTour.stages.length;

    // Validate bounds
    if (direction === 'previous') {
      if (currentStageIndex > 0) {
        set({ currentStageIndex: currentStageIndex - 1 });
      } else {
        console.warn('Already on first stage');
      }
    } else if (direction === 'next') {
      if (currentStageIndex < totalStages - 1) {
        set({ currentStageIndex: currentStageIndex + 1 });
      } else {
        console.warn('Already on last stage');
        // Note: exitTour() should be called explicitly by UI (Issue #28)
      }
    }
  },
}));

export { useMapStore };
```

---

### Step 2: Implement Navigation Handlers in TourPanel

Update `src/components/panels/TourPanel.tsx`:

```typescript
'use client';

import React, { useEffect } from 'react';
import { Tour } from '@/types';
import { useMapStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TourPanelProps {
  tour: Tour;
  currentStageIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onExit: () => void;
}

export const TourPanel: React.FC<TourPanelProps> = ({
  tour,
  currentStageIndex,
  onNext,
  onPrevious,
  onExit,
}) => {
  const currentStage = tour.stages[currentStageIndex];
  const totalStages = tour.stages.length;
  const isFirstStage = currentStageIndex === 0;
  const isLastStage = currentStageIndex === totalStages - 1;

  // Handle button clicks
  const handlePreviousClick = () => {
    if (!isFirstStage) {
      onPrevious();
    }
  };

  const handleNextClick = () => {
    if (isLastStage) {
      onExit(); // Complete tour
    } else {
      onNext();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when tour is active
      if (e.key === 'ArrowRight' && !isLastStage) {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft' && !isFirstStage) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStageIndex, isFirstStage, isLastStage, onNext, onPrevious, onExit]);

  // Announce stage change to screen readers
  useEffect(() => {
    const announcement = `Stage ${currentStageIndex + 1} of ${totalStages}: ${currentStage.title}`;
    // Use aria-live region for announcement (see JSX below)
  }, [currentStageIndex, currentStage.title, totalStages]);

  const progressPercent = ((currentStageIndex + 1) / totalStages) * 100;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* aria-live region for stage announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Stage {currentStageIndex + 1} of {totalStages}: {currentStage.title}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{tour.title}</h2>
        </div>
        <button
          onClick={onExit}
          className="p-1 hover:bg-gray-100 rounded-lg transition"
          aria-label="Exit tour"
        >
          <X size={20} />
        </button>
      </div>

      {/* Progress & Stage Counter */}
      <div className="px-4 pt-4">
        <Progress
          value={progressPercent}
          className="h-2 mb-2"
          aria-label={`Tour progress: ${Math.round(progressPercent)}%`}
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <p className="text-xs text-gray-600 text-center">
          Stage {currentStageIndex + 1} of {totalStages}
        </p>
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {currentStage.title}
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {currentStage.narration}
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousClick}
            disabled={isFirstStage}
            className="flex-1 h-10"
            aria-label="Go to previous stage"
            aria-disabled={isFirstStage}
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>
          <Button
            variant="default"
            onClick={handleNextClick}
            className="flex-1 h-10"
            aria-label={isLastStage ? 'Complete tour' : 'Go to next stage'}
          >
            {isLastStage ? 'Complete Tour' : 'Next'}
            {!isLastStage && <ChevronRight size={16} className="ml-2" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Use ← → keys to navigate
        </p>
      </div>
    </div>
  );
};
```

---

### Step 3: Integration with Map Updates

Ensure that when stage changes, map also updates (Issue #30 handles this, but here's the hook):

```typescript
// In TourPanel or a parent component that calls onNext/onPrevious
useEffect(() => {
  const { flyToStage } = useMapStore();

  if (currentTour && currentStage) {
    // Map will fly to new stage coordinates
    flyToStage({
      center: currentStage.mapCenter,
      zoom: currentStage.mapZoom,
      highlights: currentStage.highlights || currentStage.landmarkIds,
    });
  }
}, [currentStageIndex, currentTour, currentStage]);
```

---

### Step 4: Create Unit Tests

Create `tests/unit/components/TourStageNavigation.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TourPanel } from '@/components/panels/TourPanel';
import { mockTour } from '@/tests/fixtures/tours';

describe('Tour Stage Navigation', () => {
  const createProps = (currentStageIndex = 0) => ({
    tour: mockTour,
    currentStageIndex,
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onExit: jest.fn(),
  });

  describe('Navigation Button States', () => {
    it('disables previous button on first stage', () => {
      const { getByLabelText } = render(
        <TourPanel {...createProps(0)} />
      );
      expect(getByLabelText(/previous/i)).toBeDisabled();
    });

    it('enables previous button on non-first stage', () => {
      const { getByLabelText } = render(
        <TourPanel {...createProps(1)} />
      );
      expect(getByLabelText(/previous/i)).not.toBeDisabled();
    });

    it('shows "Complete Tour" button on last stage', () => {
      const lastStageIndex = mockTour.stages.length - 1;
      const { getByText } = render(
        <TourPanel {...createProps(lastStageIndex)} />
      );
      expect(getByText(/Complete Tour/)).toBeInTheDocument();
    });

    it('shows "Next" button on non-final stage', () => {
      const { getByText } = render(
        <TourPanel {...createProps(0)} />
      );
      expect(getByText(/^Next/)).toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    it('calls onNext when next button clicked', () => {
      const props = createProps(0);
      const { getByLabelText } = render(<TourPanel {...props} />);

      fireEvent.click(getByLabelText(/go to next/i));
      expect(props.onNext).toHaveBeenCalledTimes(1);
    });

    it('calls onPrevious when previous button clicked', () => {
      const props = createProps(2);
      const { getByLabelText } = render(<TourPanel {...props} />);

      fireEvent.click(getByLabelText(/previous/i));
      expect(props.onPrevious).toHaveBeenCalledTimes(1);
    });

    it('does not call onPrevious when disabled', () => {
      const props = createProps(0);
      const { getByLabelText } = render(<TourPanel {...props} />);

      fireEvent.click(getByLabelText(/previous/i));
      expect(props.onPrevious).not.toHaveBeenCalled();
    });

    it('calls onExit when "Complete Tour" clicked', () => {
      const lastStageIndex = mockTour.stages.length - 1;
      const props = createProps(lastStageIndex);
      const { getByText } = render(<TourPanel {...props} />);

      fireEvent.click(getByText(/Complete Tour/));
      expect(props.onExit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('calls onNext on arrow right key', () => {
      const props = createProps(0);
      render(<TourPanel {...props} />);

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(props.onNext).toHaveBeenCalled();
    });

    it('calls onPrevious on arrow left key', () => {
      const props = createProps(1);
      render(<TourPanel {...props} />);

      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(props.onPrevious).toHaveBeenCalled();
    });

    it('calls onExit on escape key', () => {
      const props = createProps(0);
      render(<TourPanel {...props} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(props.onExit).toHaveBeenCalled();
    });

    it('does not advance on arrow right when on last stage', () => {
      const lastStageIndex = mockTour.stages.length - 1;
      const props = createProps(lastStageIndex);
      render(<TourPanel {...props} />);

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      expect(props.onNext).not.toHaveBeenCalled();
    });

    it('does not go back on arrow left when on first stage', () => {
      const props = createProps(0);
      render(<TourPanel {...props} />);

      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(props.onPrevious).not.toHaveBeenCalled();
    });
  });

  describe('Stage Information Display', () => {
    it('displays correct stage counter', () => {
      const { getByText } = render(
        <TourPanel {...createProps(1)} />
      );
      expect(getByText(/Stage 2 of 4/)).toBeInTheDocument();
    });

    it('updates stage display on new stage index', () => {
      const { getByText, rerender } = render(
        <TourPanel {...createProps(0)} />
      );
      expect(getByText(/Stage 1 of 4/)).toBeInTheDocument();

      rerender(<TourPanel {...createProps(1)} />);
      expect(getByText(/Stage 2 of 4/)).toBeInTheDocument();
    });

    it('displays current stage title', () => {
      const { getByText } = render(
        <TourPanel {...createProps(0)} />
      );
      expect(getByText(mockTour.stages[0].title)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('announces stage changes to screen readers', () => {
      const { getByRole } = render(
        <TourPanel {...createProps(0)} />
      );
      const liveRegion = getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('provides aria-label for previous button', () => {
      const { getByLabelText } = render(
        <TourPanel {...createProps(1)} />
      );
      expect(getByLabelText(/previous/i)).toBeInTheDocument();
    });

    it('provides aria-label for next button', () => {
      const { getByLabelText } = render(
        <TourPanel {...createProps(0)} />
      );
      expect(getByLabelText(/next/i)).toBeInTheDocument();
    });

    it('marks disabled button with aria-disabled', () => {
      const { getByLabelText } = render(
        <TourPanel {...createProps(0)} />
      );
      expect(getByLabelText(/previous/i)).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
```

---

### Step 5: Create E2E Tests

Create `tests/e2e/tour-navigation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tour Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Start a tour
    await page.click('text=Guided Tours');
    await page.click('text=GPT Evolution');
  });

  test('should navigate forward through all stages', async ({ page }) => {
    // Stage 1
    await expect(page.locator('h3')).toContainText('Transformer Foundation');
    await expect(page.locator('text=Stage 1 of 4')).toBeVisible();

    // Navigate to Stage 2
    await page.click('button:has-text("Next")');
    await expect(page.locator('h3')).toContainText('GPT & GPT-2');
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();

    // Navigate to Stage 3
    await page.click('button:has-text("Next")');
    await expect(page.locator('h3')).toContainText('GPT-3');
    await expect(page.locator('text=Stage 3 of 4')).toBeVisible();

    // Navigate to Stage 4
    await page.click('button:has-text("Next")');
    await expect(page.locator('h3')).toContainText('InstructGPT');
    await expect(page.locator('text=Stage 4 of 4')).toBeVisible();

    // Next button should show "Complete Tour"
    await expect(page.locator('button:has-text("Complete Tour")')).toBeVisible();
  });

  test('should navigate backward through stages', async ({ page }) => {
    // Navigate forward to stage 3
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Stage 3 of 4')).toBeVisible();

    // Navigate back to stage 2
    await page.click('button:has-text("Previous")');
    await expect(page.locator('h3')).toContainText('GPT & GPT-2');
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();

    // Navigate back to stage 1
    await page.click('button:has-text("Previous")');
    await expect(page.locator('h3')).toContainText('Transformer Foundation');
    await expect(page.locator('text=Stage 1 of 4')).toBeVisible();

    // Previous button should be disabled
    const prevButton = page.locator('button:has-text("Previous")');
    await expect(prevButton).toBeDisabled();
  });

  test('should navigate using keyboard arrows', async ({ page }) => {
    // Initial stage 1
    await expect(page.locator('text=Stage 1 of 4')).toBeVisible();

    // Press arrow right
    await page.press('body', 'ArrowRight');
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();

    // Press arrow right again
    await page.press('body', 'ArrowRight');
    await expect(page.locator('text=Stage 3 of 4')).toBeVisible();

    // Press arrow left
    await page.press('body', 'ArrowLeft');
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();
  });

  test('should complete tour and exit', async ({ page }) => {
    // Navigate to last stage
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Stage 4 of 4')).toBeVisible();

    // Click "Complete Tour"
    await page.click('button:has-text("Complete Tour")');

    // Should exit tour panel
    await expect(page.locator('button:has-text("Complete Tour")')).not.toBeVisible();
  });

  test('should handle escape key to exit', async ({ page }) => {
    await page.press('body', 'Escape');

    // Tour panel should close
    await expect(page.locator('h2:has-text("GPT Evolution")')).not.toBeVisible();
  });
});
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Button states (enabled/disabled) correct
- [ ] onNext/onPrevious called appropriately
- [ ] Boundary conditions handled
- [ ] Keyboard events processed correctly
- [ ] Stage counter displays correctly
- [ ] aria-live announcements work

### E2E Tests
- [ ] Full tour progression works
- [ ] Backward navigation works
- [ ] Keyboard navigation functional
- [ ] Tour completion exits correctly
- [ ] Escape key works

### Manual Testing
- [ ] Click Previous on first stage → no change
- [ ] Click Next on stages 1-3 → advances
- [ ] Click Next on final stage → completes/exits
- [ ] Keyboard ← → keys navigate smoothly
- [ ] Escape exits tour
- [ ] Progress bar updates
- [ ] Stage counter accurate

---

## 📚 Reference Documentation

- **Architecture:** [architecture.md](../architecture.md) Section 5.2, 6.3
- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 5, Issue #29

---

## 🔗 Dependencies

**Blocks:**
- Issue #30 (Tour Map Synchronization)
- Issue #31 (Pause/Resume)
- Issue #32 (Keyboard Shortcuts)

**Depends On:**
- Issue #28 (TourPanel Component)
- Issue #27 (Tours Data)

---

## ✅ Definition of Done

Before marking complete:

- [ ] ✅ Navigation logic implemented
- [ ] ✅ All acceptance criteria passed
- [ ] ✅ Unit tests >90% passing
- [ ] ✅ E2E tests demonstrate full navigation
- [ ] ✅ Keyboard navigation tested
- [ ] ✅ Boundary conditions handled
- [ ] ✅ Accessibility verified (axe-core 0 violations)
- [ ] ✅ Code reviewed and approved

---

**Ready to implement?** Focus on state management first, then wire up button handlers. Test boundaries carefully.

**Estimated Completion:** Day 3 of Sprint 5

---

**Issue Metadata:**
- **Sprint:** Sprint 5
- **Milestone:** Milestone 3 - Guided Tours
- **Labels:** `P1`, `tour`, `navigation`, `sprint-5`
- **Story Points:** 4
