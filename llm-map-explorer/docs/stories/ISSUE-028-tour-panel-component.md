# Issue #28: TourPanel Component - Guided Tour Interface

**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 6
**Priority:** P1
**Assignee:** Dev 1 (Senior Full-Stack Developer)
**Status:** 🔄 Ready for Implementation

---

## 📖 User Story

**As a** user exploring the map
**I want** to access guided tours through an interactive right panel that shows stages and progress
**So that** I can follow curated learning paths with narration and map synchronization

---

## 🎯 Goal

Implement the TourPanel component that displays in the right panel (alongside InfoPanel) when a tour is active, showing tour title, stage content, progress indicators, and navigation controls.

---

## 📋 Acceptance Criteria

### ✅ Component Structure
- [ ] `src/components/panels/TourPanel.tsx` created as a React component
- [ ] Component accepts `tour: Tour`, `currentStage: number`, `onNext: () => void`, `onPrevious: () => void`, `onExit: () => void` props
- [ ] Component integrates with Zustand store for tour state management
- [ ] Component follows shadcn/ui design patterns and styling

### ✅ Tour Header
- [ ] Display tour title at top of panel
- [ ] Show difficulty badge (Beginner/Intermediate/Advanced)
- [ ] Display estimated duration (e.g., "8-10 minutes")
- [ ] Include "Exit Tour" button in header (styled as close/X icon)
- [ ] Show progress indicator: "Stage 2 of 5"

### ✅ Progress Visualization
- [ ] Use shadcn/ui Progress component
- [ ] Calculate progress as: `(currentStage + 1) / totalStages * 100`
- [ ] Progress bar updates smoothly on stage transition
- [ ] Show percentage text below progress bar

### ✅ Stage Content Display
- [ ] Display current stage title prominently
- [ ] Show stage narration text (scrollable if long)
- [ ] Display stage description above narration
- [ ] Highlight key landmarks for this stage (optional visual list)
- [ ] Use responsive font sizing for readability

### ✅ Navigation Controls
- [ ] "Previous Stage" button (disabled on stage 0)
- [ ] "Next Stage" button
- [ ] On final stage, "Next Stage" text changes to "Complete Tour"
- [ ] Buttons styled using shadcn/ui Button component
- [ ] Buttons are full-width for mobile accessibility
- [ ] Smooth transitions between stages (no jarring changes)

### ✅ Keyboard Navigation
- [ ] Arrow keys (← / →) navigate stages (when tour panel focused)
- [ ] Escape key exits tour
- [ ] Tab navigation works through all interactive elements
- [ ] Focus states are visible and accessible

### ✅ Mobile Responsiveness
- [ ] On small screens (<768px), panel takes full width at bottom
- [ ] Panel height constrained to prevent covering entire screen
- [ ] Touch-friendly button sizes (min 44px)
- [ ] Content remains readable on small viewports
- [ ] Landscape orientation handled gracefully

### ✅ Accessibility
- [ ] All text has sufficient color contrast (WCAG AA)
- [ ] Buttons have descriptive aria-labels
- [ ] Progress bar has aria-valuenow, aria-valuemin, aria-valuemax
- [ ] Focus management: first interactive element receives focus when panel opens
- [ ] Screen readers announce current stage and progress
- [ ] aria-live region for stage content updates

### ✅ Styling & Animations
- [ ] Consistent with design system (colors, fonts, spacing from front-end-spec.md)
- [ ] Smooth transition when switching stages (fade or slide)
- [ ] Hover effects on buttons
- [ ] No layout shifts when content changes length
- [ ] Responsive padding and spacing on all screen sizes

### ✅ Integration
- [ ] Zustand store provides tour state (currentTour, currentStageIndex)
- [ ] Actions: `advanceTourStage('next' | 'previous')`, `exitTour()`
- [ ] Panel re-renders when tour state changes
- [ ] Integrates with MapContainer (receives map update callbacks)
- [ ] Works alongside InfoPanel without conflicts

### ✅ Testing
- [ ] Unit tests verify component rendering
- [ ] Unit tests verify button click handlers
- [ ] Unit tests verify progress calculation
- [ ] Snapshot tests for UI consistency
- [ ] E2E test: User can navigate through all stages of a tour
- [ ] E2E test: "Exit Tour" returns to info panel
- [ ] Accessibility test: axe-core passes with 0 violations

---

## 🛠️ Technical Implementation

### Step 1: Create TourPanel Component

Create `src/components/panels/TourPanel.tsx`:

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
  const progressPercent = ((currentStageIndex + 1) / totalStages) * 100;
  const isFirstStage = currentStageIndex === 0;
  const isLastStage = currentStageIndex === totalStages - 1;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLastStage) onNext();
      if (e.key === 'ArrowLeft' && !isFirstStage) onPrevious();
      if (e.key === 'Escape') onExit();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStageIndex, isFirstStage, isLastStage, onNext, onPrevious, onExit]);

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
          aria-label="Exit tour"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 pt-4">
        <Progress value={progressPercent} className="h-2 mb-2" aria-label={`Tour progress: ${Math.round(progressPercent)}%`} />
        <p className="text-xs text-gray-600 text-center">
          Stage {currentStageIndex + 1} of {totalStages}
        </p>
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStage.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{currentStage.description}</p>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{currentStage.narration}</p>
        </div>

        {/* Landmarks in this stage */}
        {currentStage.landmarkIds && currentStage.landmarkIds.length > 0 && (
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Key Landmarks</p>
            <ul className="text-xs text-blue-800 space-y-1">
              {currentStage.landmarkIds.map((id) => (
                <li key={id} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  {id}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStage}
            className="flex-1"
            aria-label="Go to previous stage"
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>
          <Button
            variant="default"
            onClick={onNext}
            className="flex-1"
            aria-label={isLastStage ? 'Complete tour' : 'Go to next stage'}
          >
            {isLastStage ? 'Complete Tour' : 'Next'}
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Use ← → keys or click buttons to navigate
        </p>
      </div>
    </div>
  );
};
```

---

### Step 2: Update InfoPanel to Handle Tour Mode

Modify `src/components/panels/InfoPanel.tsx`:

```typescript
// Inside InfoPanel component, add conditional rendering:

const [panelMode, setPanelMode] = React.useState<'info' | 'tour'>('info');
const { currentTour, currentStageIndex } = useMapStore();

// In JSX:
return (
  <div className="flex flex-col h-full">
    {panelMode === 'info' ? (
      // ...existing info panel content
    ) : currentTour ? (
      <TourPanel
        tour={currentTour}
        currentStageIndex={currentStageIndex}
        onNext={() => store.advanceTourStage('next')}
        onPrevious={() => store.advanceTourStage('previous')}
        onExit={() => {
          setPanelMode('info');
          store.exitTour();
        }}
      />
    ) : null}
  </div>
);
```

---

### Step 3: Update Zustand Store

Add to `src/lib/store.ts`:

```typescript
interface MapState {
  // ...existing state
  currentTour: Tour | null;
  currentStageIndex: number;

  // Actions
  startTour: (tour: Tour) => void;
  exitTour: () => void;
  advanceTourStage: (direction: 'next' | 'previous') => void;
  pauseTour: (landmarkId?: string) => void;
  resumeTour: () => void;
}

const useMapStore = create<MapState>((set, get) => ({
  currentTour: null,
  currentStageIndex: 0,

  startTour: (tour: Tour) => set({ currentTour: tour, currentStageIndex: 0 }),
  exitTour: () => set({ currentTour: null, currentStageIndex: 0 }),
  advanceTourStage: (direction: 'next' | 'previous') => {
    const { currentTour, currentStageIndex } = get();
    if (!currentTour) return;

    let newIndex = currentStageIndex;
    if (direction === 'next' && currentStageIndex < currentTour.stages.length - 1) {
      newIndex = currentStageIndex + 1;
    } else if (direction === 'previous' && currentStageIndex > 0) {
      newIndex = currentStageIndex - 1;
    }

    set({ currentStageIndex: newIndex });
  },
  pauseTour: (landmarkId?: string) => set({ /* handle pause state */ }),
  resumeTour: () => set({ /* handle resume state */ }),
}));
```

---

### Step 4: Create Unit Tests

Create `tests/unit/components/TourPanel.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TourPanel } from '@/components/panels/TourPanel';
import { mockTour } from '@/tests/fixtures/tours';

describe('TourPanel', () => {
  const mockProps = {
    tour: mockTour,
    currentStageIndex: 0,
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onExit: jest.fn(),
  };

  it('renders tour title and difficulty badge', () => {
    render(<TourPanel {...mockProps} />);
    expect(screen.getByText(mockTour.title)).toBeInTheDocument();
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
  });

  it('displays current stage content', () => {
    render(<TourPanel {...mockProps} />);
    expect(screen.getByText(mockTour.stages[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockTour.stages[0].narration)).toBeInTheDocument();
  });

  it('shows progress correctly', () => {
    render(<TourPanel {...mockProps} />);
    expect(screen.getByText(/Stage 1 of 4/)).toBeInTheDocument();
  });

  it('disables previous button on first stage', () => {
    render(<TourPanel {...mockProps} currentStageIndex={0} />);
    expect(screen.getByLabelText(/previous/i)).toBeDisabled();
  });

  it('shows "Complete Tour" on last stage', () => {
    const lastStageIndex = mockTour.stages.length - 1;
    render(<TourPanel {...mockProps} currentStageIndex={lastStageIndex} />);
    expect(screen.getByText(/Complete Tour/)).toBeInTheDocument();
  });

  it('calls onNext when next button clicked', () => {
    render(<TourPanel {...mockProps} />);
    fireEvent.click(screen.getByLabelText(/next/i));
    expect(mockProps.onNext).toHaveBeenCalled();
  });

  it('calls onExit when exit button clicked', () => {
    render(<TourPanel {...mockProps} />);
    fireEvent.click(screen.getByLabelText(/exit/i));
    expect(mockProps.onExit).toHaveBeenCalled();
  });

  it('handles keyboard navigation', () => {
    render(<TourPanel {...mockProps} currentStageIndex={1} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockProps.onNext).toHaveBeenCalled();
  });
});
```

---

### Step 5: Create E2E Tests

Create `tests/e2e/tours.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tour Panel', () => {
  test('should navigate through tour stages', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Start a tour
    await page.click('text=Guided Tours');
    await page.click('text=GPT Evolution');

    // Verify first stage
    expect(await page.textContent('h3')).toContain('Transformer Foundation');

    // Navigate to next stage
    await page.click('button:has-text("Next")');
    expect(await page.textContent('h3')).toContain('GPT & GPT-2');

    // Navigate back
    await page.click('button:has-text("Previous")');
    expect(await page.textContent('h3')).toContain('Transformer Foundation');
  });

  test('should exit tour correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Guided Tours');
    await page.click('text=RLHF Pipeline');

    // Exit tour
    await page.click('[aria-label="Exit tour"]');

    // Should return to info panel
    expect(await page.textContent('.panel')).not.toContain('RLHF Pipeline');
  });
});
```

---

### Step 6: Configure Styling

Update Tailwind configuration in `tailwind.config.ts` if needed for prose styling:

```typescript
module.exports = {
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

---

## 🧪 Testing Checklist

### Component Testing
- [ ] Component renders without errors
- [ ] Tour title, difficulty, and duration display correctly
- [ ] Progress bar shows correct progress
- [ ] Stage content displays (title, description, narration)
- [ ] Navigation buttons appear and are properly enabled/disabled
- [ ] Landmarks list displays when present

### Interaction Testing
- [ ] Click "Next Stage" advances to next stage
- [ ] Click "Previous Stage" goes back (when not on first)
- [ ] Click "Exit Tour" closes panel and exits tour mode
- [ ] Keyboard arrows navigate stages
- [ ] Escape key exits tour
- [ ] All buttons are keyboard accessible (Tab key)

### Responsive Testing
- [ ] Desktop (1024px+): Panel is fixed right side, 384px wide
- [ ] Tablet (768px-1023px): Panel adapts with appropriate padding
- [ ] Mobile (<768px): Panel is full-width at bottom
- [ ] Text is readable on all screen sizes
- [ ] Touch buttons are at least 44px (44px² minimum)

### Accessibility Testing
- [ ] Run axe-core: 0 violations
- [ ] Screen reader announces tour title and progress
- [ ] Focus is visible on all interactive elements
- [ ] All buttons have descriptive aria-labels
- [ ] Color contrast meets WCAG AA standard
- [ ] Keyboard navigation is complete

### Visual Testing
- [ ] Styling matches design system from front-end-spec.md
- [ ] Animations are smooth (no jarring transitions)
- [ ] Spacing is consistent with rest of application
- [ ] No layout shifts when content changes length
- [ ] Difficulty badge colors are distinct

---

## 📚 Reference Documentation

- **Architecture:** [architecture.md](../architecture.md) Section 5.2 (Panel Components)
- **Front-End Spec:** [front-end-spec.md](../front-end-spec.md) Section 6.4 (Tour Mode)
- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 5, Issue #28

---

## 🔗 Dependencies

**Blocks:**
- Issue #29 (Tour Stage Navigation)
- Issue #30 (Tour Map Synchronization)
- Issue #31 (Pause/Resume Functionality)
- Issue #32 (Keyboard Shortcuts)
- Issue #33 (Tour Catalog)

**Depends On:**
- Issue #14 (InfoPanel Component) - Parent component
- Issue #27 (Tours Data) - Data structure to render

---

## 🚧 Known Issues & Gotchas

### Issue 1: Panel Height on Mobile
**Problem:** Panel takes up too much screen space on mobile
**Solution:** Cap panel height to 60% of viewport on mobile

### Issue 2: Keyboard Navigation Conflicts
**Problem:** Keyboard shortcuts conflict with search input
**Solution:** Disable tour keyboard navigation when search input is focused

### Issue 3: Content Overflow
**Problem:** Long narration text causes layout shift
**Solution:** Use fixed height with scrollable content area

---

## ✅ Definition of Done

Before marking this issue complete, verify:

- [ ] ✅ TourPanel component created and integrated
- [ ] ✅ All acceptance criteria passed
- [ ] ✅ Unit tests passing (>80% coverage)
- [ ] ✅ E2E tests demonstrate full tour flow
- [ ] ✅ Accessibility audit: 0 violations
- [ ] ✅ Responsive on desktop, tablet, mobile
- [ ] ✅ Styling consistent with design system
- [ ] ✅ Code reviewed and approved
- [ ] ✅ Documentation updated

---

## 📝 Notes for Implementation

### Time Estimate
- **Component Development:** 2-3 hours
- **Store Integration:** 1 hour
- **Testing (Unit + E2E):** 1.5-2 hours
- **Accessibility & Polish:** 1 hour
- **Total:** ~6 hours (6 story points)

### Best Practices
1. **Use shadcn/ui components** - Progress, Button, etc.
2. **Keyboard-first** - Ensure all features work via keyboard
3. **Mobile-first styling** - Start with mobile, enhance for desktop
4. **Test accessibility early** - Don't leave for end
5. **Reuse shared styles** - Match InfoPanel design patterns

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ TourPanel renders correctly with tour data
✅ User can navigate through all stages
✅ Map synchronizes with stage changes (Issue #30)
✅ Component passes accessibility audit
✅ Responsive design works on all screen sizes
✅ Unit and E2E tests pass
✅ Integration with Zustand store confirmed

---

**Ready to build?** Start by setting up the component structure and integrating with the existing InfoPanel. Work alongside Issue #30 for map synchronization.

**Estimated Completion:** Days 2-3 of Sprint 5

---

**Issue Metadata:**
- **Created:** October 1, 2025
- **Sprint:** Sprint 5
- **Milestone:** Milestone 3 - Guided Tours
- **Labels:** `P1`, `component`, `tour`, `sprint-5`, `UI`
- **Story Points:** 6
