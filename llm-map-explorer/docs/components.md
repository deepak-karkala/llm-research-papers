# Component Documentation

This document describes the key UI components in Terra Incognita Linguae.

## Table of Contents

- [Map Components](#map-components)
- [Panel Components](#panel-components)
- [Search Components](#search-components)
- [Tour Components](#tour-components)
- [UI Components](#ui-components)

---

## Map Components

### MapContainer

The root map component that renders the Leaflet map and manages all map interactions.

**Location**: `src/components/map/MapContainer.tsx`

**Props**:
```typescript
interface MapContainerProps {
  width?: string | number;
  height?: string | number;
}
```

**Features**:
- Leaflet map initialization
- Zoom controls
- Attribution
- Gesture handling

**Usage**:
```typescript
import { MapContainer } from '@/components/map/MapContainer';

export function App() {
  return <MapContainer width="100%" height="100%" />;
}
```

**Accessibility**:
- Keyboard navigation with arrow keys
- Screen reader announcements for state changes

---

### LandmarkMarker

Renders a single landmark marker on the map.

**Location**: `src/components/map/LandmarkMarker.tsx`

**Props**:
```typescript
interface LandmarkMarkerProps {
  /** Landmark data */
  landmark: Landmark;
  /** Whether marker is highlighted */
  isHighlighted?: boolean;
  /** Click handler */
  onClick?: (id: string) => void;
}
```

**Features**:
- Custom marker styling
- Hover effects
- Click handling

**Usage**:
```typescript
<LandmarkMarker
  landmark={paper}
  isHighlighted={selectedId === paper.id}
  onClick={(id) => setSelectedId(id)}
/>
```

---

### CapabilityPolygon

Renders a capability region polygon on the map.

**Location**: `src/components/map/CapabilityPolygon.tsx`

**Props**:
```typescript
interface CapabilityPolygonProps {
  /** Capability region data */
  capability: Capability;
  /** Whether polygon is highlighted */
  isHighlighted?: boolean;
  /** Click handler */
  onClick?: (id: string) => void;
}
```

**Features**:
- GeoJSON polygon rendering
- Color coding by capability type
- Interactive hover
- Zoom-based opacity adjustment

**Usage**:
```typescript
<CapabilityPolygon
  capability={foundationalModels}
  isHighlighted={selectedCapability === foundationalModels.id}
/>
```

---

## Panel Components

### InfoPanel

Right-side panel showing information about selected landmarks or general info.

**Location**: `src/components/panels/InfoPanel.tsx`

**Props**:
```typescript
interface InfoPanelProps {
  isOpen?: boolean;
  landmark?: Landmark;
  onClose?: () => void;
}
```

**Features**:
- Welcome message when no selection
- Landmark details with links
- Organization highlighting
- Responsive design (side panel on desktop, sheet on mobile)

**Usage**:
```typescript
<InfoPanel
  landmark={selectedLandmark}
  onClose={() => setSelectedLandmark(null)}
/>
```

**Accessibility**:
- ARIA live region for updates
- Keyboard close with Escape
- Proper heading hierarchy

---

### TourPanel

Panel for displaying and controlling guided tours.

**Location**: `src/components/panels/TourPanel.tsx`

**Props**:
```typescript
interface TourPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}
```

**Features**:
- Tour list display
- Tour stage navigation
- Stage descriptions
- Progress indicator
- Start/continue/pause buttons

**Usage**:
```typescript
<TourPanel isOpen={showTours} onClose={() => setShowTours(false)} />
```

---

## Search Components

### SearchBar

Full-text search input with autocomplete dropdown.

**Location**: `src/components/search/SearchBar.tsx`

**Props**:
```typescript
interface SearchBarProps {
  onSelect?: (landmark: Landmark) => void;
  placeholder?: string;
}
```

**Features**:
- Fuzzy search with Fuse.js
- Real-time autocomplete
- Category filtering
- Keyboard navigation
- Search highlighting

**Usage**:
```typescript
<SearchBar
  onSelect={(landmark) => navigate(landmark)}
/>
```

**Keyboard Shortcuts**:
- `ArrowUp/Down` - Navigate results
- `Enter` - Select item
- `Escape` - Close dropdown

**Accessibility**:
- ARIA listbox for results
- Announces result count
- Keyboard accessible

---

## Tour Components

### TourCard

Card displaying a tour in the catalog or tours list.

**Location**: `src/components/tours/TourCard.tsx`

**Props**:
```typescript
interface TourCardProps {
  /** Tour data */
  tour: Tour;
  /** Click handler */
  onClick?: () => void;
}
```

**Features**:
- Tour metadata display
- Thumbnail/icon
- Duration/stage count
- Start button
- Hover effects

**Usage**:
```typescript
<TourCard
  tour={tour}
  onClick={() => startTour(tour.id)}
/>
```

---

### TourStage

Component displaying a single tour stage.

**Location**: `src/components/tours/TourStage.tsx`

**Props**:
```typescript
interface TourStageProps {
  /** Stage data */
  stage: TourStage;
  /** Current stage number */
  currentStage: number;
  /** Total stages */
  totalStages: number;
  /** Navigation callbacks */
  onNext?: () => void;
  onPrevious?: () => void;
  onClose?: () => void;
}
```

**Features**:
- Stage content display
- Map highlight synchronization
- Navigation buttons
- Progress indicator
- Keyboard shortcuts

**Keyboard Shortcuts**:
- `ArrowRight` - Next stage
- `ArrowLeft` - Previous stage
- `Escape` - Exit tour

---

## UI Components

### Button

Accessible button component from shadcn/ui.

**Location**: `src/components/ui/button.tsx`

**Props**:
```typescript
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}
```

**Variants**:
- `default` - Primary blue button
- `destructive` - Red button for destructive actions
- `outline` - Outlined button
- `secondary` - Secondary button
- `ghost` - No background
- `link` - Text-only link

**Usage**:
```typescript
<Button variant="default">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost">Cancel</Button>
```

---

### ErrorAlert

Alert component for displaying error messages.

**Location**: `src/components/ui/error-alert.tsx`

**Props**:
```typescript
interface ErrorAlertProps {
  /** Error title */
  title: string;
  /** Detailed error message */
  message: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Optional dismiss callback */
  onDismiss?: () => void;
  /** Color variant */
  variant?: 'default' | 'destructive' | 'warning';
}
```

**Variants**:
- `default` - Red error
- `destructive` - Dark red error
- `warning` - Yellow warning

**Usage**:
```typescript
<ErrorAlert
  title="Failed to load data"
  message="Check your connection and try again."
  onRetry={() => refetch()}
  onDismiss={() => setError(null)}
/>
```

**Accessibility**:
- `role="alert"` for screen readers
- High contrast colors
- Keyboard accessible buttons

---

### Toast

Temporary notification component that auto-dismisses.

**Location**: `src/components/ui/toast.tsx`

**Props**:
```typescript
interface ToastProps {
  /** Toast type determines styling */
  type: 'success' | 'error' | 'info' | 'warning';
  /** Message to display */
  message: string;
  /** Close callback */
  onClose: () => void;
  /** Auto-dismiss duration (0 = no auto-dismiss) */
  duration?: number;
}
```

**Usage**:
```typescript
<Toast
  type="success"
  message="Link copied to clipboard!"
  onClose={() => setShowToast(false)}
  duration={3000}
/>
```

**Features**:
- Auto-dismiss after duration
- Manual close button
- Respects `prefers-reduced-motion`
- Smooth slide-in animation

---

### HoverCard

Card component with hover and click effects.

**Location**: `src/components/ui/hover-card.tsx`

**Props**:
```typescript
interface HoverCardProps {
  children: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}
```

**Usage**:
```typescript
<HoverCard interactive onClick={() => selectItem()}>
  <HoverCardHeader>
    <h3>Title</h3>
  </HoverCardHeader>
  <HoverCardContent>
    <p>Content here</p>
  </HoverCardContent>
</HoverCard>
```

**Features**:
- Elevation on hover
- Click handling
- Keyboard accessible (Enter/Space)

---

### Skeleton

Loading skeleton component.

**Location**: `src/components/ui/skeleton.tsx`

**Props**:
```typescript
interface SkeletonProps {
  className?: string;
}
```

**Variants**:
- `Skeleton` - Base skeleton
- `InfoPanelSkeleton` - Info panel loading
- `TourPanelSkeleton` - Tour panel loading
- `SearchResultsSkeleton` - Search results loading

**Usage**:
```typescript
{isLoading ? <InfoPanelSkeleton /> : <InfoPanel landmark={landmark} />}
```

---

## Component Patterns

### Props Naming Convention

```typescript
interface ComponentProps {
  /** Required data prop */
  data: DataType;

  /** Optional display prop */
  isVisible?: boolean;

  /** Optional callback */
  onAction?: (value: string) => void;

  /** Optional styling */
  className?: string;
}
```

### JSDoc Format

```typescript
/**
 * Component description - what it does
 *
 * Longer description with details about behavior,
 * when to use it, and any special considerations.
 *
 * @example
 * <MyComponent data={data} onAction={handleAction} />
 */
export const MyComponent: FC<MyComponentProps> = ({ data, onAction }) => {
  // ...
};
```

### Accessibility Checklist

- [ ] Semantic HTML (buttons, links, headings)
- [ ] ARIA labels for screen readers
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Color contrast ≥4.5:1
- [ ] Text alternatives for images
- [ ] Proper heading hierarchy

---

## Finding Components

All components are organized by type:

```
src/components/
├── map/           # Map-specific components
├── panels/        # Panel components
├── search/        # Search interface
├── tours/         # Tour system
├── ui/            # Base UI components
└── index.ts       # Barrel export
```

Import components using the barrel export:

```typescript
import { MapContainer, InfoPanel, SearchBar } from '@/components';
```

---

## Testing Components

Each component has corresponding test file:

```bash
src/components/map/MapContainer.tsx
src/components/map/MapContainer.test.tsx
```

Run tests:

```bash
npm run test:unit                    # All tests
npm run test:unit:watch              # Watch mode
npm run test:unit -- MapContainer    # Specific component
```

---

## Performance Notes

- Components use React.memo where appropriate
- Event handlers are memoized to prevent re-renders
- Heavy computations are moved to custom hooks
- Images are optimized and lazy-loaded

---

## For More Information

- [Architecture Documentation](./architecture.md)
- [Design System](./design-system.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Component Storybook](./storybook.md) (if available)
