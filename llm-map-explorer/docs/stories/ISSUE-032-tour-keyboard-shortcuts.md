# Issue #32: Tour Keyboard Shortcuts - [ and ] Navigation

**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 2
**Priority:** P1
**Assignee:** Dev 1 (Senior Full-Stack Developer)
**Status:** 🔄 Ready for Implementation

---

## 📖 User Story

**As a** power user
**I want** to navigate tour stages using convenient keyboard shortcuts [ and ]
**So that** I can quickly step through stages hands-free while reading the content

---

## 🎯 Goal

Implement keyboard shortcuts for tour navigation that allow users to advance or go back through tour stages using the [ (previous) and ] (next) keys.

---

## 📋 Acceptance Criteria

### ✅ Keyboard Shortcuts
- [ ] [ key navigates to previous stage
- [ ] ] key navigates to next stage
- [ ] Shortcuts only active when tour is running (not paused)
- [ ] Shortcuts respect stage boundaries (no error on first/last stage)
- [ ] Shortcuts work on any part of the page (not just focused input)
- [ ] Shortcuts don't conflict with browser defaults

### ✅ Shortcut Behavior
- [ ] Pressing [ on first stage has no effect (silent, no error)
- [ ] Pressing ] on last stage has no effect (silent, no error)
- [ ] Pressing [ or ] rapidly navigates smoothly without skipping
- [ ] Stage transition happens immediately (no animation delay interferes)
- [ ] Works in combination with button clicks

### ✅ Visual Feedback
- [ ] Visual indicator in TourPanel showing shortcut instructions
- [ ] Text: "Use [ ] keys to navigate" or similar
- [ ] Indicator located near navigation buttons
- [ ] Not obtrusive or distracting
- [ ] Dismissible or hidden after first view (optional)

### ✅ Keyboard Focus Management
- [ ] Shortcuts work even if focus is on input fields (search bar)
- [ ] Shortcuts work if focus is on map
- [ ] Shortcuts don't interfere with typing in search/input fields
- [ ] Escape key still exits tour (existing functionality)

### ✅ Platform Compatibility
- [ ] Works on Windows (standard [ ] keys)
- [ ] Works on macOS (standard [ ] keys)
- [ ] Works on Linux (standard [ ] keys)
- [ ] Works on different keyboard layouts (if possible)
- [ ] Handles international keyboards appropriately

### ✅ Conflict Avoidance
- [ ] Doesn't conflict with browser shortcuts (F11, Ctrl+F, etc.)
- [ ] Doesn't interfere with text selection
- [ ] Doesn't conflict with shadcn/ui component shortcuts
- [ ] Doesn't conflict with other application shortcuts

### ✅ Accessibility
- [ ] Keyboard shortcut documented in help/tooltip
- [ ] aria-label or title attribute explains shortcut
- [ ] Help text accessible to screen readers
- [ ] Shortcut works for users with keyboard-only input
- [ ] Doesn't require mouse or touch

### ✅ State Management
- [ ] Keyboard event handler only attaches when tour active
- [ ] Event handler removed when tour exits
- [ ] No memory leaks from event listeners
- [ ] Multiple tour sessions don't cause duplicate handlers

### ✅ Testing
- [ ] Unit tests verify keyboard event handling
- [ ] Unit tests verify boundary conditions
- [ ] E2E tests demonstrate shortcut navigation
- [ ] E2E tests verify shortcuts don't work when paused
- [ ] Conflict testing with other keyboard inputs

---

## 🛠️ Technical Implementation

### Step 1: Create Keyboard Shortcut Hook

Create `src/hooks/useTourKeyboardShortcuts.ts`:

```typescript
import { useEffect } from 'react';
import { useMapStore } from '@/lib/store';

/**
 * Hook to enable keyboard shortcuts for tour navigation
 * [ = previous stage
 * ] = next stage
 * Esc = exit tour
 */
export const useTourKeyboardShortcuts = () => {
  const { currentTour, isPausedTour, advanceTourStage, exitTour } = useMapStore();

  useEffect(() => {
    if (!currentTour || isPausedTour) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // [ key = previous stage (BracketLeft key code)
      if (e.key === '[') {
        e.preventDefault();
        advanceTourStage('previous');
      }
      // ] key = next stage (BracketRight key code)
      else if (e.key === ']') {
        e.preventDefault();
        advanceTourStage('next');
      }
      // Escape = exit tour
      else if (e.key === 'Escape') {
        e.preventDefault();
        exitTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentTour, isPausedTour, advanceTourStage, exitTour]);
};
```

---

### Step 2: Integrate Hook into TourPanel

Update `src/components/panels/TourPanel.tsx`:

```typescript
'use client';

import React from 'react';
import { Tour } from '@/types';
import { useMapStore } from '@/lib/store';
import { useTourKeyboardShortcuts } from '@/hooks/useTourKeyboardShortcuts';
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
  // Enable keyboard shortcuts
  useTourKeyboardShortcuts();

  const currentStage = tour.stages[currentStageIndex];
  const totalStages = tour.stages.length;
  const progressPercent = ((currentStageIndex + 1) / totalStages) * 100;
  const isFirstStage = currentStageIndex === 0;
  const isLastStage = currentStageIndex === totalStages - 1;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{tour.title}</h2>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(tour.difficulty)}`}>
              {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
            </span>
            <span className="text-sm text-gray-600">{tour.estimatedDuration} min</span>
          </div>
        </div>
        <button
          onClick={onExit}
          className="p-1 hover:bg-gray-100 rounded-lg transition"
          aria-label="Exit tour (press Escape)"
          title="Exit tour (press Escape)"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 pt-4">
        <Progress value={progressPercent} className="h-2 mb-2" />
        <p className="text-xs text-gray-600 text-center">
          Stage {currentStageIndex + 1} of {totalStages}
        </p>
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {currentStage.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{currentStage.description}</p>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {currentStage.narration}
        </p>
      </div>

      {/* Navigation Controls with Keyboard Hint */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStage}
            className="flex-1 h-10"
            aria-label="Go to previous stage (press [ key)"
            title="Go to previous stage (press [ key)"
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>
          <Button
            variant="default"
            onClick={onNext}
            className="flex-1 h-10"
            aria-label={isLastStage ? 'Complete tour' : 'Go to next stage (press ] key)'}
            title={isLastStage ? 'Complete tour' : 'Go to next stage (press ] key)'}
          >
            {isLastStage ? 'Complete Tour' : 'Next'}
            {!isLastStage && <ChevronRight size={16} className="ml-2" />}
          </Button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="bg-blue-50 rounded p-2 mt-2">
          <p className="text-xs text-blue-800 text-center">
            <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono">[</kbd>
            {' '}<span>Previous</span>{' '}
            <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono">]</kbd>
            {' '}<span>Next</span>{' '}
            <kbd className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-mono">Esc</kbd>
            {' '}<span>Exit</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
```

---

### Step 3: Create Keyboard Handler Tests

Create `tests/unit/hooks/useTourKeyboardShortcuts.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTourKeyboardShortcuts } from '@/hooks/useTourKeyboardShortcuts';
import { useMapStore } from '@/lib/store';
import { mockTour } from '@/tests/fixtures/tours';

describe('useTourKeyboardShortcuts', () => {
  beforeEach(() => {
    // Reset store and clear event listeners
    useMapStore.setState({
      currentTour: mockTour,
      currentStageIndex: 1,
      isPausedTour: false,
    });
  });

  afterEach(() => {
    // Clean up listeners
    jest.clearAllMocks();
  });

  describe('Keyboard Event Handling', () => {
    it('should call advanceTourStage("next") on ] key', () => {
      const spy = jest.spyOn(useMapStore.getState(), 'advanceTourStage');
      renderHook(() => useTourKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      expect(spy).toHaveBeenCalledWith('next');
    });

    it('should call advanceTourStage("previous") on [ key', () => {
      const spy = jest.spyOn(useMapStore.getState(), 'advanceTourStage');
      renderHook(() => useTourKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: '[' });
      window.dispatchEvent(event);

      expect(spy).toHaveBeenCalledWith('previous');
    });

    it('should call exitTour() on Escape key', () => {
      const spy = jest.spyOn(useMapStore.getState(), 'exitTour');
      renderHook(() => useTourKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(spy).toHaveBeenCalled();
    });

    it('should prevent default behavior for [ key', () => {
      renderHook(() => useTourKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: '[' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent default behavior for ] key', () => {
      renderHook(() => useTourKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: ']' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Tour State Conditions', () => {
    it('should not register handlers if no active tour', () => {
      const spy = jest.spyOn(useMapStore.getState(), 'advanceTourStage');
      useMapStore.setState({ currentTour: null });

      renderHook(() => useTourKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not register handlers if tour is paused', () => {
      const spy = jest.spyOn(useMapStore.getState(), 'advanceTourStage');
      useMapStore.setState({ isPausedTour: true });

      renderHook(() => useTourKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should re-register handlers when tour resumes', () => {
      const { rerender } = renderHook(() => useTourKeyboardShortcuts());

      // Pause tour
      act(() => {
        useMapStore.setState({ isPausedTour: true });
      });

      // Resume tour
      act(() => {
        useMapStore.setState({ isPausedTour: false });
      });

      rerender();

      const spy = jest.spyOn(useMapStore.getState(), 'advanceTourStage');
      const event = new KeyboardEvent('keydown', { key: ']' });
      window.dispatchEvent(event);

      expect(spy).toHaveBeenCalledWith('next');
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useTourKeyboardShortcuts());

      unmount();

      expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should not have duplicate listeners after re-render', () => {
      const addListenerSpy = jest.spyOn(window, 'addEventListener');
      const { rerender } = renderHook(() => useTourKeyboardShortcuts());

      addListenerSpy.mockClear();

      act(() => {
        useMapStore.setState({ currentStageIndex: 2 });
      });
      rerender();

      // Should remove old and add new listener (not accumulate)
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle rapid key presses', () => {
      const spy = jest.spyOn(useMapStore.getState(), 'advanceTourStage');
      renderHook(() => useTourKeyboardShortcuts());

      // Rapid ] presses
      for (let i = 0; i < 5; i++) {
        const event = new KeyboardEvent('keydown', { key: ']' });
        window.dispatchEvent(event);
      }

      expect(spy).toHaveBeenCalledTimes(5);
    });

    it('should ignore other keys', () => {
      const spy = jest.spyOn(useMapStore.getState(), 'advanceTourStage');
      renderHook(() => useTourKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
```

---

### Step 4: Create E2E Tests

Create `tests/e2e/tour-keyboard-shortcuts.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tour Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Start a tour
    await page.click('text=Guided Tours');
    await page.click('text=GPT Evolution');
  });

  test('should navigate next with ] key', async ({ page }) => {
    await expect(page.locator('text=Stage 1 of 4')).toBeVisible();

    // Press ] key
    await page.press('body', ']');

    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();
  });

  test('should navigate previous with [ key', async ({ page }) => {
    // Navigate to stage 2
    await page.press('body', ']');
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();

    // Press [ key
    await page.press('body', '[');

    await expect(page.locator('text=Stage 1 of 4')).toBeVisible();
  });

  test('should exit tour with Escape key', async ({ page }) => {
    await page.press('body', 'Escape');

    // Tour panel should be gone
    await expect(page.locator('text=GPT Evolution')).not.toBeVisible();
  });

  test('should navigate smoothly with rapid key presses', async ({ page }) => {
    // Rapid ] presses (forward 3 stages)
    await page.press('body', ']');
    await page.press('body', ']');
    await page.press('body', ']');

    await expect(page.locator('text=Stage 4 of 4')).toBeVisible();

    // Rapid [ presses (back 2 stages)
    await page.press('body', '[');
    await page.press('body', '[');

    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();
  });

  test('should show keyboard shortcut hints', async ({ page }) => {
    // Verify keyboard hint text is visible
    await expect(page.locator('text=Previous')).toBeVisible();
    await expect(page.locator('text=Next')).toBeVisible();
    await expect(page.locator('text=Exit')).toBeVisible();

    // Verify [ and ] key symbols are shown
    await expect(page.locator('kbd:has-text("[")')).toBeVisible();
    await expect(page.locator('kbd:has-text("]")')).toBeVisible();
  });

  test('should not activate shortcuts when tour is paused', async ({ page }) => {
    // Pause tour by clicking a landmark
    await page.click('[data-testid="landmark-marker"]');
    await expect(page.locator('text=Tour paused')).toBeVisible();

    // Press ] - should not advance (if paused, next stage not in paused state)
    const stageText = await page.locator('text=Stage').textContent();
    await page.press('body', ']');
    const stageTextAfter = await page.locator('text=Tour paused').textContent();

    // Should still show paused state (not in active tour)
    await expect(page.locator('text=Tour paused')).toBeVisible();
  });

  test('should work with button clicks', async ({ page }) => {
    // Stage 1
    await expect(page.locator('text=Stage 1 of 4')).toBeVisible();

    // Click button
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Stage 2 of 4')).toBeVisible();

    // Press ] key
    await page.press('body', ']');
    await expect(page.locator('text=Stage 3 of 4')).toBeVisible();

    // Click button again
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Stage 4 of 4')).toBeVisible();
  });

  test('should have accessible keyboard hints with titles', async ({ page }) => {
    // Check aria-labels on buttons
    const nextButton = page.locator('button:has-text("Next")');
    const prevButton = page.locator('button:has-text("Previous")');

    await expect(nextButton).toHaveAttribute('aria-label', /Next|key/i);
    await expect(prevButton).toHaveAttribute('aria-label', /Previous|key/i);
  });
});
```

---

### Step 5: Update Help/Documentation

Create or update `src/components/HelpPanel.tsx`:

```typescript
export const KeyboardShortcutsHelp = () => {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm text-gray-900">
        Keyboard Shortcuts
      </div>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>
            <kbd className="px-2 py-0.5 bg-gray-100 border rounded text-xs">[</kbd>
          </dt>
          <dd className="text-gray-600">Previous stage</dd>
        </div>
        <div className="flex justify-between">
          <dt>
            <kbd className="px-2 py-0.5 bg-gray-100 border rounded text-xs">]</kbd>
          </dt>
          <dd className="text-gray-600">Next stage</dd>
        </div>
        <div className="flex justify-between">
          <dt>
            <kbd className="px-2 py-0.5 bg-gray-100 border rounded text-xs">Esc</kbd>
          </dt>
          <dd className="text-gray-600">Exit tour</dd>
        </div>
        <div className="flex justify-between">
          <dt>
            <kbd className="px-2 py-0.5 bg-gray-100 border rounded text-xs">Tab</kbd>
          </dt>
          <dd className="text-gray-600">Navigate buttons</dd>
        </div>
      </dl>
    </div>
  );
};
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] [ key triggers previous stage
- [ ] ] key triggers next stage
- [ ] Escape key exits tour
- [ ] Shortcuts disabled when no tour active
- [ ] Shortcuts disabled when tour paused
- [ ] Event listeners properly cleaned up
- [ ] No memory leaks

### E2E Tests
- [ ] ] key advances stages
- [ ] [ key goes back
- [ ] Escape exits
- [ ] Rapid key presses handled
- [ ] Keyboard hints display
- [ ] Shortcuts don't work when paused
- [ ] Shortcuts work with button clicks
- [ ] Accessibility verified

### Manual Testing
- [ ] Press ] while on stage 1 → advances to stage 2
- [ ] Press [ while on stage 2 → goes back to stage 1
- [ ] Press [ on stage 1 → no change (silent)
- [ ] Press ] on last stage → no change (silent)
- [ ] Press Escape → exits tour
- [ ] Rapid ] presses navigate smoothly
- [ ] Pause tour, press ] → no effect
- [ ] Resume tour, press ] → works again
- [ ] Type in search box, press [ → no conflict
- [ ] Keyboard hints visible below buttons

---

## 📚 Reference Documentation

- **Architecture:** [architecture.md](../architecture.md) Section 5.2 (Tour Navigation)
- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 5, Issue #32

---

## 🔗 Dependencies

**Depends On:**
- Issue #28 (TourPanel Component)
- Issue #29 (Tour Navigation)

**Blocks:**
- Issue #33 (Tour Catalog)

---

## ✅ Definition of Done

Before marking complete:

- [ ] ✅ [ and ] keys navigate stages
- [ ] ✅ Keyboard hints displayed
- [ ] ✅ All acceptance criteria met
- [ ] ✅ Unit tests passing
- [ ] ✅ E2E tests passing
- [ ] ✅ No conflicts with other shortcuts
- [ ] ✅ Accessibility verified
- [ ] ✅ Code reviewed

---

**Ready to implement?** Focus on hook implementation first, then add visual hints. Test thoroughly for conflicts.

**Estimated Completion:** Day 3-4 of Sprint 5

---

**Issue Metadata:**
- **Sprint:** Sprint 5
- **Milestone:** Milestone 3 - Guided Tours
- **Labels:** `P1`, `tour`, `accessibility`, `sprint-5`
- **Story Points:** 2
