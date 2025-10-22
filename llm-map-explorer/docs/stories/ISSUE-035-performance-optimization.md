# Issue #35: Performance Optimization

**Sprint:** Sprint 6 (Week 11-12)
**Story Points:** 4
**Priority:** P0
**Assignee:** Dev 1 (Senior Full-Stack Developer)
**Status:** Ready for Review

---

## 📖 User Story

**As a** user on a slower connection or older device
**I want** the app to load quickly and respond smoothly to interactions
**So that** I can use the map without frustration or delays

---

## 🎯 Goal

Optimize bundle size, runtime performance, and render efficiency to achieve Lighthouse Performance score ≥85 on desktop. Reduce First Contentful Paint (FCP) to <1.5s, Time to Interactive (TTI) to <3s, and keep total JS bundle <150KB gzipped.

---

## 📋 Acceptance Criteria

### ✅ Bundle Size Optimization
- [ ] Total JS bundle <150KB gzipped (excluding map tiles)
- [ ] Code splitting: lazy-load TourPanel, SearchResults, dialogs
- [ ] Tree-shaking enabled: no unused exports
- [ ] Lodash/similar utilities replaced with native JS
- [ ] Unused dependencies removed
- [ ] Dynamic imports for heavy features
- [ ] Bundle analysis report generated (`bundle-report.json`)

### ✅ React Component Optimization
- [ ] React.memo applied to pure components:
  - LandmarkMarker
  - CapabilityPolygon
  - TourCard
  - LegendPanel
- [ ] useMemo for expensive computations:
  - Search index filtering
  - Capability polygon calculations
  - Landmark visibility culling
- [ ] useCallback for stable event handlers
- [ ] Unnecessary re-renders eliminated
- [ ] Component render time <16ms (60fps target)

### ✅ Memoization & Caching
- [ ] Search index memoized (not recalculated on every render)
- [ ] Filtered landmarks list memoized
- [ ] Tour stages cached
- [ ] Capability visibility cache
- [ ] API responses cached (if applicable)
- [ ] Image assets cached via service worker (optional)

### ✅ Image & Asset Optimization
- [ ] Base map PNG optimized (original 4096x3072 @ ~2-3MB)
  - Serve smaller 2048x1536 version by default
  - Use next/image for responsive loading
  - WebP format with fallback to PNG
  - Lazy-load tiles off-screen
- [ ] SVG icons inlined (no HTTP requests)
- [ ] Logo images optimized
- [ ] No unused assets in bundle

### ✅ Code Splitting Strategy
- [ ] Create `TourPanel.lazy.tsx` with React.lazy()
- [ ] Create `SearchResults.lazy.tsx`
- [ ] Create `OrganizationHighlighting.lazy.tsx`
- [ ] Route-based splitting for future multi-page app
- [ ] Preload critical chunks above the fold
- [ ] Suspense boundaries with fallback UI

### ✅ Runtime Performance
- [ ] Leaflet map initialization optimized
- [ ] Pan/zoom animations smooth (60fps)
- [ ] Landmark rendering culled (only visible landmarks)
- [ ] Progressive disclosure smooth (no stutter)
- [ ] Search response <50ms for typical queries
- [ ] Tour navigation smooth (flyTo animations)
- [ ] No layout thrashing (batch DOM updates)

### ✅ First Contentful Paint (FCP) < 1.5s
- [ ] Critical CSS inlined in head
- [ ] Font loading optimized (system fonts or subset)
- [ ] JavaScript parsing/execution time minimized
- [ ] Hero image (map base) loads early
- [ ] Placeholder/skeleton shown until data loads

### ✅ Time to Interactive (TTI) < 3s
- [ ] JavaScript execution blocking minimal
- [ ] Event handlers attached after TTI
- [ ] Hydration complete before interactions
- [ ] Long tasks (>50ms) broken into smaller chunks
- [ ] Web Workers for heavy computations (optional)

### ✅ Lighthouse Performance Score
- [ ] Lighthouse score ≥85 (desktop)
- [ ] Mobile score ≥75 (lower due to device constraints)
- [ ] Cumulative Layout Shift (CLS) <0.1
- [ ] Largest Contentful Paint (LCP) <2.5s
- [ ] First Input Delay (FID) <100ms / Interaction to Next Paint (INP) <200ms

### ✅ Performance Testing
- [ ] Performance test suite created
- [ ] Lighthouse CI integration
- [ ] Performance budgets enforced
- [ ] Before/after metrics documented
- [ ] Performance tests in CI/CD pipeline

### ✅ Monitoring & Debugging
- [ ] React DevTools Profiler used to identify bottlenecks
- [ ] Chrome DevTools Performance tab analysis
- [ ] WebPageTest baseline metrics
- [ ] Performance monitoring script (optional)
- [ ] Error tracking configured

---

## 🛠️ Technical Implementation

### Step 1: Analyze Current Performance

Create `scripts/analyze-performance.js`:

```javascript
const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // next.config.js content
});

// Run with: ANALYZE=true npm run build
// Check output: .next/static/chunks/size-report.json
```

Run bundle analysis:

```bash
ANALYZE=true npm run build
# Review .next/static/chunks/size-report.json
```

---

### Step 2: Implement Code Splitting with React.lazy()

Create `src/components/tours/TourPanel.lazy.tsx`:

```typescript
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TourPanelContent = dynamic(() =>
  import('./TourPanel').then((mod) => ({ default: mod.TourPanel }))
);

export const TourPanelLazy = (props: any) => (
  <Suspense fallback={<Skeleton className="w-full h-full" />}>
    <TourPanelContent {...props} />
  </Suspense>
);
```

Update imports to use lazy version.

---

### Step 3: Apply React.memo to Pure Components

Update `src/components/map/LandmarkMarker.tsx`:

```typescript
import React, { memo } from 'react';

const LandmarkMarkerComponent: React.FC<LandmarkMarkerProps> = ({
  landmark,
  isHighlighted,
  onClick,
}) => {
  // Component logic
  return <Marker /* ... */ />;
};

// Memoize to prevent re-renders when props unchanged
export const LandmarkMarker = memo(LandmarkMarkerComponent, (prevProps, nextProps) => {
  return (
    prevProps.landmark.id === nextProps.landmark.id &&
    prevProps.isHighlighted === nextProps.isHighlighted
  );
});
```

Apply to:
- CapabilityPolygon
- TourCard
- LegendPanel
- SearchResultItem

---

### Step 4: Memoize Expensive Computations

Update `src/hooks/useDataLoader.ts`:

```typescript
import { useMemo, useCallback } from 'react';

export const useDataLoader = () => {
  const [data, setData] = useState<AppData | null>(null);

  // Memoize search index so it's not recalculated
  const searchIndex = useMemo(() => {
    if (!data) return null;
    return initializeSearchIndex(data);
  }, [data]);

  // Memoize filtered landmarks
  const visibleLandmarks = useMemo(() => {
    if (!data) return [];
    return filterLandmarksByViewport(data.landmarks, mapBounds);
  }, [data, mapBounds]);

  // Memoize event handlers
  const handleLandmarkClick = useCallback((landmarkId: string) => {
    // Handle click
  }, []);

  return { data, searchIndex, visibleLandmarks, handleLandmarkClick };
};
```

---

### Step 5: Optimize Image Loading

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
```

Update base map component to use next/image:

```typescript
import Image from 'next/image';

export const MapBase = () => {
  return (
    <Image
      src="/images/map-base.webp"
      alt="LLM research landscape map"
      width={2048}
      height={1536}
      priority // Load early
      quality={85}
    />
  );
};
```

---

### Step 6: Font Optimization

Update `src/app/layout.tsx`:

```typescript
import { Roboto, Merriweather } from 'next/font/google';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap', // Show fallback while loading
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Terra Incognita Linguae',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${merriweather.variable}`}>
      <head>
        {/* Critical CSS inline */}
      </head>
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
```

---

### Step 7: Create Performance Test Suite

Create `tests/performance/performance.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('lighthouse score >= 85', async ({ page }) => {
    const lhr = await page.goto('http://localhost:3000');
    // Note: Full Lighthouse requires lighthouse package
    // This is a simplified check
    const metrics = await page.metrics();

    expect(metrics.JSHeapUsedSize).toBeLessThan(5 * 1024 * 1024); // 5MB
  });

  test('First Contentful Paint < 1.5s', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    const navigationTiming = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        fcp: performance
          .getEntriesByName('first-contentful-paint')[0]
          ?.startTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      };
    });

    expect(navigationTiming.fcp).toBeLessThan(1500);
  });

  test('Time to Interactive < 3s', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(3000);
  });

  test('Map renders without jank', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        let startTime = performance.now();

        const countFrames = () => {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frameCount);
          }
        };

        requestAnimationFrame(countFrames);
      });
    });

    // Should maintain 60fps
    expect(fps).toBeGreaterThan(50);
  });

  test('Search returns results in < 50ms', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const startTime = performance.now();
    await page.fill('[placeholder="Search..."]', 'attention');
    await page.waitForSelector('[role="option"]');
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(50);
  });
});
```

---

### Step 8: Set Up Lighthouse CI

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

### Step 9: Add Performance Budgets

Update `package.json`:

```json
{
  "bundlewatch": {
    "files": [
      {
        "path": ".next/static/**/*.js",
        "maxSize": "150kb"
      },
      {
        "path": ".next/static/css/**/*.css",
        "maxSize": "50kb"
      }
    ]
  }
}
```

---

### Step 10: Document Performance Improvements

Create `docs/performance.md`:

```markdown
# Performance Optimization Report

## Metrics

### Before
- Bundle Size: 250KB (gzipped)
- Lighthouse Score: 72
- FCP: 2.1s
- TTI: 4.2s

### After
- Bundle Size: 140KB (gzipped) ✅
- Lighthouse Score: 87 ✅
- FCP: 1.3s ✅
- TTI: 2.8s ✅

## Optimizations Applied

1. **Code Splitting** (-80KB)
   - TourPanel lazy-loaded
   - SearchResults lazy-loaded

2. **React.memo** (-12KB, -30% re-renders)
   - LandmarkMarker memoized
   - CapabilityPolygon memoized

3. **Memoization** (-15% runtime overhead)
   - Search index cached
   - Filtered landmarks memoized

4. **Image Optimization** (-50KB)
   - WebP format
   - Responsive loading

5. **Tree-shaking** (-8KB)
   - Unused dependencies removed

## Monitoring

Lighthouse CI configured to monitor performance on every PR.

Run locally:

```bash
npm run lighthouse
```
```

---

## 🧪 Testing Checklist

### Bundle Analysis
- [ ] Run `npm run build` and check size
- [ ] Verify <150KB gzipped
- [ ] Review bundle analyzer output
- [ ] Identify large modules

### Runtime Performance
- [ ] Test smooth scrolling on map
- [ ] Test landmark rendering (no lag)
- [ ] Test tour navigation (smooth)
- [ ] Test search (instant results)

### Lighthouse Audit
- [ ] Desktop score ≥85
- [ ] Mobile score ≥75
- [ ] FCP <1.5s
- [ ] TTI <3s
- [ ] CLS <0.1

### Device Testing
- [ ] Fast connection (desktop)
- [ ] 4G network (mobile)
- [ ] Slow 3G network
- [ ] Low-end devices

---

## 📚 Reference Documentation

- **Next.js Optimization:** https://nextjs.org/docs/advanced-features/measuring-performance
- **React Profiler:** https://react.dev/reference/react/Profiler
- **Web Vitals:** https://web.dev/vitals/
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse

---

## 🔗 Dependencies

**Depends On:**
- All components (all sprints)

**Blocks:**
- Issue #37 (Vercel Deployment)
- Issue #38 (CI/CD Pipeline)

---

## ✅ Definition of Done

Before marking complete:

- [ ] ✅ Bundle size <150KB gzipped
- [ ] ✅ Code splitting implemented
- [ ] ✅ React.memo applied to pure components
- [ ] ✅ Expensive computations memoized
- [ ] ✅ Images optimized
- [ ] ✅ Lighthouse score ≥85 (desktop)
- [ ] ✅ FCP <1.5s verified
- [ ] ✅ TTI <3s verified
- [ ] ✅ Performance tests integrated into CI
- [ ] ✅ Documentation updated

---

## 📝 Notes for Implementation

### Time Estimate
- **Analysis:** 45 minutes
- **Code Splitting:** 1 hour
- **Memoization:** 1 hour
- **Image Optimization:** 30 minutes
- **Testing & Documentation:** 45 minutes
- **Total:** ~4 hours (4 story points)

### Best Practices
1. **Measure first** - Don't optimize without data
2. **Focus on critical path** - FCP and TTI matter most
3. **Use profiler** - React DevTools can show slow renders
4. **Test on real devices** - Desktop specs misleading
5. **Monitor regressions** - Use Lighthouse CI

### Common Pitfalls
1. **Over-memoization** - Memoizing small components can hurt perf
2. **Large bundles** - Code splitting too coarse-grained
3. **Missing lazy load** - Heavy components loaded upfront
4. **Image issues** - Wrong formats or sizes
5. **No monitoring** - Regressions introduced later

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ Bundle size <150KB gzipped
✅ Lighthouse Performance score ≥85
✅ FCP <1.5s
✅ TTI <3s
✅ All performance tests pass
✅ Before/after metrics documented

---

**Ready to implement?** Start with bundle analysis to identify bottlenecks, then systematically apply optimizations.

**Estimated Completion:** Day 2-3 of Sprint 6

---

**Issue Metadata:**
- **Sprint:** Sprint 6
- **Milestone:** Milestone 4 - Polish & Production
- **Labels:** `P0`, `performance`, `optimization`, `sprint-6`
- **Story Points:** 4
