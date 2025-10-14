# Issue #2: Install Core Dependencies

**Sprint:** Sprint 1 (Week 1-2)
**Story Points:** 2
**Priority:** P0 (Critical Path)
**Assignee:** Dev 1 (Senior Full-Stack Developer)
**Status:** ✅ Completed

---

## 📖 User Story

**As a** developer working on the LLM Map Explorer
**I want** all core dependencies installed and configured
**So that** I can begin building map components, state management, and UI features without dependency issues

---

## 🎯 Goal

Install and configure all required dependencies for interactive mapping (Leaflet), state management (Zustand), UI components (shadcn/ui + Tailwind CSS), and data validation (Zod), ensuring the development environment is fully operational.

---

## 📋 Acceptance Criteria

### ✅ Map Dependencies
- [ ] `leaflet@1.9+` installed
- [ ] `react-leaflet@4.x` installed
- [ ] `@types/leaflet` installed (TypeScript definitions)
- [ ] Verify versions in `package.json`

### ✅ State Management
- [ ] `zustand@4.x` installed
- [ ] TypeScript definitions available (Zustand ships with built-in types)

### ✅ UI Framework
- [ ] `tailwindcss@3.4+` already installed ✓ (from Issue #1)
- [ ] `shadcn/ui` CLI installed: `npx shadcn-ui@latest init`
- [ ] shadcn/ui configuration completed (components.json created)
- [ ] Base shadcn/ui components installed: Button, Sheet, Card, Dialog, Progress

### ✅ Data Validation
- [ ] `zod@3.x` installed
- [ ] TypeScript integration verified

### ✅ Additional Utilities
- [ ] `clsx` or `class-variance-authority` installed (for conditional Tailwind classes)
- [ ] `lucide-react` installed (for icons used by shadcn/ui)

### ✅ Configuration Verification
- [ ] All peer dependencies resolved (no warnings)
- [ ] `npm install` completes without errors
- [ ] No TypeScript errors after installation
- [ ] `npm run dev` starts successfully
- [ ] `npm run build` completes successfully

### ✅ Package Scripts
- [ ] All scripts from Issue #1 still functional:
  - `dev`, `build`, `start`, `lint`, `lint:fix`, `type-check`, `format`, `format:check`

---

## 🛠️ Technical Implementation

### Step 1: Install Leaflet Dependencies

```bash
# Navigate to project root
cd llm-map-explorer

# Install Leaflet and React bindings
npm install leaflet@1.9.4 react-leaflet@4.2.1

# Install TypeScript definitions
npm install -D @types/leaflet
```

**Verification:**
```bash
# Check installed versions
npm list leaflet react-leaflet @types/leaflet
```

---

### Step 2: Install Zustand

```bash
# Install Zustand for state management
npm install zustand@4.5.2
```

**Verification:**
```typescript
// Test import in temporary file
import { create } from 'zustand';
// Should compile without errors
```

---

### Step 3: Install Zod

```bash
# Install Zod for schema validation
npm install zod@3.23.8
```

**Verification:**
```typescript
// Test import in temporary file
import { z } from 'zod';
// Should compile without errors
```

---

### Step 4: Initialize shadcn/ui

```bash
# Initialize shadcn/ui (interactive prompts)
npx shadcn-ui@latest init
```

**Expected Prompts:**
- ✓ Would you like to use TypeScript? → **Yes**
- ✓ Which style would you like to use? → **Default**
- ✓ Which color would you like to use as base color? → **Slate**
- ✓ Where is your global CSS file? → **src/app/globals.css**
- ✓ Would you like to use CSS variables for colors? → **Yes**
- ✓ Where is your tailwind.config.js located? → **tailwind.config.ts**
- ✓ Configure the import alias for components? → **@/components**
- ✓ Configure the import alias for utils? → **@/lib/utils**

**This will create:**
- `components.json` (shadcn/ui configuration)
- `src/lib/utils.ts` (utility functions including `cn()` for class merging)
- Update `tailwind.config.ts` with shadcn/ui theme configuration
- Update `src/app/globals.css` with CSS variables

---

### Step 5: Install Base shadcn/ui Components

```bash
# Install core components needed for MVP
npx shadcn-ui@latest add button
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add separator
```

**This creates:**
- `src/components/ui/button.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/separator.tsx`

---

### Step 6: Verify Installation

```bash
# 1. Check TypeScript compilation
npm run type-check
# Expected: No errors

# 2. Check linting
npm run lint
# Expected: No errors or warnings

# 3. Test development server
npm run dev
# Expected: Server starts on http://localhost:3000

# 4. Test production build
npm run build
# Expected: Build completes successfully

# 5. Verify all dependencies installed
npm list | grep -E "leaflet|zustand|zod|shadcn"
```

---

### Step 7: Create Verification Test Component

Create a simple test component to verify all dependencies work:

**File:** `src/components/DependencyTest.tsx`

```typescript
'use client';

import { create } from 'zustand';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Test Zustand store
const useTestStore = create<{ count: number; increment: () => void }>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Test Zod schema
const testSchema = z.object({
  name: z.string(),
  version: z.string(),
});

export function DependencyTest() {
  const { count, increment } = useTestStore();

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-2">Dependency Test</h2>
      <p>Zustand count: {count}</p>
      <Button onClick={increment}>Increment (Zustand + shadcn/ui)</Button>
      <p className="mt-2 text-sm text-muted-foreground">
        Zod validation: {testSchema.safeParse({ name: 'test', version: '1.0' }).success ? '✅' : '❌'}
      </p>
    </Card>
  );
}
```

**Temporary addition to** `src/app/page.tsx`:

```typescript
import { DependencyTest } from '@/components/DependencyTest';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <DependencyTest />
    </main>
  );
}
```

**Verification:**
- Run `npm run dev`
- Navigate to `http://localhost:3000`
- Verify:
  - Card component renders (shadcn/ui)
  - Button renders with Tailwind styling
  - Clicking button increments count (Zustand working)
  - Zod validation shows ✅

**Note:** Remove `DependencyTest.tsx` and revert `page.tsx` after verification.

---

## 🧪 Testing Checklist

### Dependency Verification
- [ ] `npm list` shows all dependencies installed
- [ ] No peer dependency warnings
- [ ] TypeScript finds all type definitions
- [ ] `npm audit` shows no critical vulnerabilities

### Build Verification
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes

### Import Verification
- [ ] Can import `leaflet` and `react-leaflet`
- [ ] Can import `zustand`
- [ ] Can import `zod`
- [ ] Can import shadcn/ui components from `@/components/ui/*`
- [ ] Can use `cn()` utility from `@/lib/utils`

---

## 📚 Reference Documentation

- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 1, Issue #2
- **Architecture:** [architecture.md](../architecture.md) Section 3 (Tech Stack)
- **Leaflet Docs:** https://leafletjs.com/
- **React-Leaflet Docs:** https://react-leaflet.js.org/
- **Zustand Docs:** https://docs.pmnd.rs/zustand/getting-started/introduction
- **Zod Docs:** https://zod.dev/
- **shadcn/ui Docs:** https://ui.shadcn.com/docs/installation/next

---

## 🔗 Dependencies

**Blocks:**
- Issue #3 (Testing Infrastructure Setup)
- Issue #4 (Core Data Model TypeScript Interfaces)
- Issue #7 (MapContainer Component with Leaflet)
- Issue #14 (InfoPanel Component)

**Depends On:**
- Issue #1 (Project Bootstrap) ✅ Complete

---

## 🚧 Known Issues & Gotchas

### Issue 1: Leaflet CSS Import
**Problem:** Leaflet requires CSS to be imported manually
**Solution:** Import in `src/app/layout.tsx`:
```typescript
import 'leaflet/dist/leaflet.css';
```

### Issue 2: Leaflet SSR Issues
**Problem:** Leaflet uses `window` object, causing Next.js SSR errors
**Solution:** Use dynamic imports with `ssr: false` for Leaflet components:
```typescript
import dynamic from 'next/dynamic';
const MapContainer = dynamic(() => import('./MapContainer'), { ssr: false });
```
**Note:** Full solution will be implemented in Issue #7

### Issue 3: shadcn/ui Component Conflicts
**Problem:** Some shadcn/ui components may have class name conflicts
**Solution:** Use `cn()` utility from `@/lib/utils` for class merging

### Issue 4: Zustand DevTools
**Problem:** Zustand DevTools not available by default
**Solution:** Optional for MVP; can add later with `zustand/middleware`

---

## ✅ Definition of Done

Before marking this issue complete, verify:

- [ ] ✅ All acceptance criteria checked
- [ ] ✅ All dependencies installed and versions verified
- [ ] ✅ shadcn/ui initialized with base components
- [ ] ✅ No TypeScript errors
- [ ] ✅ No ESLint errors
- [ ] ✅ `npm run dev` starts successfully
- [ ] ✅ `npm run build` completes successfully
- [ ] ✅ Verification test component works (then removed)
- [ ] ✅ `package.json` and `package-lock.json` updated
- [ ] ✅ Code committed to Git with descriptive message
- [ ] ✅ Peer review completed (if team process requires)

---

## 📝 Notes for Implementation

### Time Estimate
- **Installation:** 20 minutes
- **shadcn/ui Setup:** 15 minutes
- **Verification & Testing:** 15 minutes
- **Documentation & Commit:** 10 minutes
- **Total:** ~60 minutes (2 story points = 2-4 hours; this is on the faster end)

### Best Practices
1. **Lock Versions:** Use exact versions to avoid breaking changes
2. **Verify Imports:** Test each dependency after installation
3. **Document Issues:** Note any warnings or issues in commit message
4. **Clean Build:** Delete `node_modules` and `package-lock.json` if issues arise, then `npm install`

### Git Commit Message

```bash
git add .
git commit -m "feat: install core dependencies (Leaflet, Zustand, Zod, shadcn/ui)

- Install leaflet@1.9.4 and react-leaflet@4.2.1 for map rendering
- Install zustand@4.5.2 for state management
- Install zod@3.23.8 for schema validation
- Initialize shadcn/ui with base components (Button, Sheet, Card, etc.)
- Verify all dependencies compile without errors
- Test development and production builds

Story Points: 2
Issue: #2
Dependencies: #1 (complete)"
```

---

### Next Steps After Completion

Once this issue is complete and verified:
1. Move to Issue #3 (Testing Infrastructure Setup) or Issue #4 (Core Data Models)
2. Update Sprint 1 board (move card to "Done")
3. Begin Issue #7 (MapContainer Component) once dependencies are ready

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ A developer can:
1. Import and use Leaflet components
2. Create Zustand stores for state management
3. Define Zod schemas for validation
4. Use shadcn/ui components in React code
5. Run `npm run dev` and `npm run build` without dependency errors

✅ The codebase has:
1. All required dependencies in `package.json`
2. No peer dependency warnings
3. shadcn/ui properly configured
4. Zero TypeScript errors
5. All npm scripts still functional

---

**Ready to implement?** Follow the steps above in order. All installations should complete in under an hour.

**Estimated Completion:** Day 1-2 of Sprint 1 (immediately after Issue #1)

---

**Issue Metadata:**
- **Created:** 2025-10-14
- **Sprint:** Sprint 1
- **Milestone:** Milestone 1 - Core Map Foundation
- **Labels:** `P0`, `setup`, `dependencies`, `sprint-1`
- **Story Points:** 2
- **Assignee:** Dev 1

---

This issue sets the foundation for all future development by ensuring the core libraries are installed and configured correctly. It's a straightforward but critical task that unblocks several parallel workstreams in Sprint 1.

---

## 🤖 Dev Agent Record

**Implementation Date:** 2025-10-14
**Status:** ✅ Completed
**Developer:** James (Dev Agent)

### Implementation Summary

Successfully installed and configured all core dependencies for the LLM Map Explorer project. All acceptance criteria met and verified.

### Steps Completed

1. **Leaflet Dependencies Installed**
   - ✅ `leaflet@1.9.4` installed
   - ✅ `react-leaflet@4.2.1` installed
   - ✅ `@types/leaflet@1.9.21` installed
   - ✅ Verified with `npm list`

2. **Zustand State Management**
   - ✅ `zustand@4.5.2` installed
   - ✅ TypeScript definitions available (built-in)

3. **Zod Schema Validation**
   - ✅ `zod@3.23.8` installed
   - ✅ TypeScript integration verified

4. **shadcn/ui Configuration**
   - ✅ Created `components.json` configuration file
   - ✅ Created `src/lib/utils.ts` with `cn()` utility function
   - ✅ Updated `src/app/globals.css` with shadcn/ui CSS variables
   - ✅ Updated `tailwind.config.ts` with shadcn/ui theme configuration
   - ✅ Installed peer dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`

5. **Base shadcn/ui Components Installed**
   - ✅ Button (`src/components/ui/button.tsx`)
   - ✅ Card (`src/components/ui/card.tsx`)
   - ✅ Sheet (`src/components/ui/sheet.tsx`)
   - ✅ Dialog (`src/components/ui/dialog.tsx`)
   - ✅ Progress (`src/components/ui/progress.tsx`)
   - ✅ Scroll Area (`src/components/ui/scroll-area.tsx`)
   - ✅ Separator (`src/components/ui/separator.tsx`)

6. **Leaflet CSS Import**
   - ✅ Added `import 'leaflet/dist/leaflet.css';` to `src/app/layout.tsx`

7. **Verification Testing**
   - ✅ Created `DependencyTest` component to verify all dependencies work together
   - ✅ Tested Zustand store functionality
   - ✅ Tested Zod schema validation
   - ✅ Tested shadcn/ui Button and Card components
   - ✅ Dev server started successfully on port 3001
   - ✅ Removed test component after verification

8. **Build Verification**
   - ✅ `npm run type-check` passed with no errors
   - ✅ `npm run lint` passed with no warnings or errors
   - ✅ `npm run build` completed successfully
   - ✅ Final bundle size: 87.4 kB (optimized)

### Files Created/Modified

**Created:**
- `components.json` - shadcn/ui configuration
- `src/lib/utils.ts` - Utility functions for class merging
- `src/components/ui/button.tsx` - Button component
- `src/components/ui/card.tsx` - Card component
- `src/components/ui/sheet.tsx` - Sheet component
- `src/components/ui/dialog.tsx` - Dialog component
- `src/components/ui/progress.tsx` - Progress component
- `src/components/ui/scroll-area.tsx` - Scroll Area component
- `src/components/ui/separator.tsx` - Separator component

**Modified:**
- `package.json` - Added all dependencies
- `package-lock.json` - Updated with new dependency tree
- `src/app/globals.css` - Added shadcn/ui CSS variables
- `src/app/layout.tsx` - Added Leaflet CSS import
- `tailwind.config.ts` - Added shadcn/ui theme configuration

### Known Issues Addressed

1. **npm Cache Permissions**: Encountered npm cache permission issues. Resolved by using `--cache /tmp/.npm-cache` flag.
2. **shadcn CLI Timeout**: Initial `shadcn init` command timed out. Resolved by manually creating configuration files and using `shadcn add` for individual components.

### Dependencies Added

**Production Dependencies:**
- leaflet: ^1.9.4
- react-leaflet: ^4.2.1
- zustand: ^4.5.2
- zod: ^3.23.8
- class-variance-authority: ^0.7.1
- clsx: ^2.1.1
- tailwind-merge: ^3.3.1
- lucide-react: ^0.545.0
- @radix-ui/react-dialog: ^1.1.15
- @radix-ui/react-progress: ^1.1.7
- @radix-ui/react-scroll-area: ^1.2.10
- @radix-ui/react-separator: ^1.1.7
- @radix-ui/react-slot: ^1.2.3

**Dev Dependencies:**
- @types/leaflet: ^1.9.21

### Verification Results

All acceptance criteria verified:

✅ **Map Dependencies**
- Leaflet 1.9.4, React-Leaflet 4.2.1, @types/leaflet 1.9.21 installed and verified

✅ **State Management**
- Zustand 4.5.2 installed with built-in TypeScript support

✅ **UI Framework**
- Tailwind CSS 3.4.15 (from Issue #1)
- shadcn/ui initialized with all base components

✅ **Data Validation**
- Zod 3.23.8 installed with TypeScript integration

✅ **Configuration**
- No peer dependency warnings
- TypeScript compilation clean
- ESLint passed with no warnings
- Production build successful

✅ **Package Scripts**
- All scripts from Issue #1 functional and tested

### Next Steps

Ready for:
- Issue #3: Testing Infrastructure Setup
- Issue #4: Core Data Model TypeScript Interfaces
- Issue #7: MapContainer Component with Leaflet

### Notes

- Dev server automatically selected port 3001 (port 3000 was in use)
- All components use shadcn/ui's default slate theme
- CSS variables configured for easy theme customization
- Leaflet CSS imported globally for SSR compatibility
