# Issue #1: Project Bootstrap - Next.js 14 with TypeScript

**Sprint:** Sprint 1 (Week 1-2)
**Story Points:** 3
**Priority:** P0 (Critical Path)
**Assignee:** Dev 1 (Senior Full-Stack Developer)
**Status:** ✅ Ready for Review

---

## 📖 User Story

**As a** developer joining the project
**I want** a fully configured Next.js 14 project with TypeScript and App Router
**So that** I can begin implementing features immediately without setup friction

---

## 🎯 Goal

Initialize the Next.js 14 project with TypeScript, App Router architecture, and essential tooling (ESLint, Prettier) to establish the foundation for all future development work.

---

## 📋 Acceptance Criteria

### ✅ Project Initialization
- [ ] Next.js 14 project created using `create-next-app@latest`
- [ ] Project name: `llm-map-explorer`
- [ ] TypeScript enabled and configured
- [ ] App Router architecture selected (not Pages Router)
- [ ] `src/` directory structure enabled
- [ ] Import aliases configured (`@/*` pointing to `src/*`)

### ✅ TypeScript Configuration
- [ ] `tsconfig.json` exists with strict mode enabled
- [ ] Path aliases configured:
  - `@/*` → `./src/*`
  - `@/components/*` → `./src/components/*`
  - `@/lib/*` → `./src/lib/*`
  - `@/types/*` → `./src/types/*`
- [ ] `"strict": true` enabled
- [ ] `"noUnusedLocals": true` enabled
- [ ] `"noUnusedParameters": true` enabled

### ✅ Project Structure
- [ ] Directory structure matches specification:
  ```
  llm-map-explorer/
  ├── src/
  │   ├── app/
  │   │   ├── layout.tsx
  │   │   ├── page.tsx
  │   │   └── globals.css
  │   ├── components/
  │   ├── lib/
  │   ├── types/
  │   └── hooks/
  ├── public/
  ├── tests/
  ├── .gitignore
  ├── package.json
  ├── tsconfig.json
  ├── next.config.js
  └── README.md
  ```

### ✅ Code Quality Tools
- [ ] ESLint configured with Next.js recommended rules
- [ ] Prettier installed and configured
- [ ] `.prettierrc` file created with project standards:
  - Semi: true
  - Single quotes: true
  - Tab width: 2
  - Trailing comma: es5
  - Print width: 100
- [ ] `.eslintrc.json` extends Next.js config

### ✅ Git Configuration
- [ ] Git repository initialized (`git init`)
- [ ] `.gitignore` configured for Node.js/Next.js:
  - `node_modules/`
  - `.next/`
  - `out/`
  - `.env*.local`
  - `.DS_Store`
  - `*.log`
- [ ] Initial commit created with message: "feat: bootstrap Next.js 14 project with TypeScript"

### ✅ Package Scripts
- [ ] `package.json` includes all required scripts:
  - `dev`: Start development server
  - `build`: Build for production
  - `start`: Start production server
  - `lint`: Run ESLint
  - `lint:fix`: Run ESLint with auto-fix
  - `type-check`: Run TypeScript compiler check
  - `format`: Run Prettier on all files
  - `format:check`: Check Prettier formatting

### ✅ Verification
- [ ] `npm run dev` starts development server successfully
- [ ] Navigate to `http://localhost:3000` shows Next.js welcome page
- [ ] `npm run lint` executes without errors
- [ ] `npm run type-check` executes without errors
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors in VS Code

---

## 🛠️ Technical Implementation

### Step 1: Bootstrap Next.js Project

```bash
# Navigate to project root
cd /Users/deepak/Documents/work/projects/llm-research-papers/

# Create Next.js 14 project with all options
npx create-next-app@latest llm-map-explorer \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# Navigate into project
cd llm-map-explorer
```

**Expected Prompts:**
- ✓ Would you like to use TypeScript? → **Yes**
- ✓ Would you like to use ESLint? → **Yes**
- ✓ Would you like to use Tailwind CSS? → **Yes**
- ✓ Would you like to use `src/` directory? → **Yes**
- ✓ Would you like to use App Router? → **Yes**
- ✓ Would you like to customize the default import alias? → **No** (use @/*)

---

### Step 2: Create Directory Structure

```bash
# Create component directories
mkdir -p src/components/map
mkdir -p src/components/panels
mkdir -p src/components/search
mkdir -p src/components/ui

# Create other directories
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/hooks
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e
mkdir -p public/data
mkdir -p public/images

# Verify structure
tree -L 3 -d src/
```

---

### Step 3: Install Prettier

```bash
npm install -D prettier eslint-config-prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

Create `.prettierignore`:

```
node_modules
.next
out
build
dist
*.log
```

---

### Step 4: Update ESLint Configuration

Update `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

---

### Step 5: Update TypeScript Configuration

Update `tsconfig.json` to add strict checks:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### Step 6: Update Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

---

### Step 7: Initialize Git Repository

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: bootstrap Next.js 14 project with TypeScript

- Initialize Next.js 14 with App Router
- Configure TypeScript with strict mode
- Set up ESLint and Prettier
- Create project directory structure
- Add npm scripts for development

Story Points: 3
Issue: #1"
```

---

### Step 8: Verification

Run all verification commands:

```bash
# 1. Check TypeScript compilation
npm run type-check
# Expected: No errors

# 2. Check linting
npm run lint
# Expected: No errors or warnings

# 3. Check Prettier formatting
npm run format:check
# Expected: All files properly formatted

# 4. Test development server
npm run dev
# Expected: Server starts on http://localhost:3000

# 5. Test production build
npm run build
# Expected: Build completes successfully

# 6. Verify directory structure
tree -L 2 src/
# Expected: All directories created
```

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Open `http://localhost:3000` in browser
- [ ] Verify Next.js welcome page displays
- [ ] Check browser console for errors (should be none)
- [ ] Verify hot reload works (edit `src/app/page.tsx`, see changes)

### Code Quality Checks
- [ ] Run `npm run lint` → No errors
- [ ] Run `npm run type-check` → No errors
- [ ] Run `npm run format:check` → All files formatted
- [ ] Open VS Code → No TypeScript errors in editor

### Build Verification
- [ ] Run `npm run build` → Build succeeds
- [ ] Check `.next/` directory created
- [ ] Run `npm start` → Production server starts
- [ ] Verify production build at `http://localhost:3000`

---

## 📚 Reference Documentation

- **Architecture:** [architecture.md](../architecture.md) Section 1 (Introduction)
- **Dev Guide:** [dev-quickstart.md](../dev-quickstart.md) Section "Quick Setup"
- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 1, Issue #1
- **Next.js Docs:** https://nextjs.org/docs/getting-started/installation

---

## 🔗 Dependencies

**Blocks:**
- Issue #2 (Install Core Dependencies)
- Issue #3 (Testing Infrastructure Setup)
- Issue #4 (Core Data Model TypeScript Interfaces)
- All subsequent Sprint 1 tasks

**Depends On:**
- None (first task in sprint)

---

## 🚧 Known Issues & Gotchas

### Issue 1: Node.js Version
**Problem:** Next.js 14 requires Node.js 18.17 or later
**Solution:** Verify Node version: `node --version`. Upgrade if needed using nvm:
```bash
nvm install 18
nvm use 18
```

### Issue 2: Create-Next-App Cache
**Problem:** `create-next-app` may use cached version
**Solution:** Clear npx cache:
```bash
npx clear-npx-cache
npx create-next-app@latest llm-map-explorer
```

### Issue 3: Import Alias Not Working
**Problem:** VS Code doesn't recognize `@/*` imports
**Solution:** Restart TypeScript server in VS Code:
- Cmd+Shift+P → "TypeScript: Restart TS Server"

### Issue 4: ESLint Conflicts with Prettier
**Problem:** ESLint and Prettier rules conflict
**Solution:** Ensure `eslint-config-prettier` is last in extends array

---

## ✅ Definition of Done

Before marking this issue complete, verify:

- [ ] ✅ All acceptance criteria checked
- [ ] ✅ All verification steps pass
- [ ] ✅ Code committed to Git with descriptive message
- [ ] ✅ No TypeScript errors
- [ ] ✅ No ESLint errors
- [ ] ✅ All files properly formatted (Prettier)
- [ ] ✅ Development server starts successfully
- [ ] ✅ Production build completes successfully
- [ ] ✅ Peer review completed (if team process requires)
- [ ] ✅ Documentation updated (README.md)

---

## 📝 Notes for Implementation

### Time Estimate
- **Setup & Installation:** 30 minutes
- **Configuration:** 30 minutes
- **Verification & Testing:** 15 minutes
- **Documentation & Commit:** 15 minutes
- **Total:** ~90 minutes (3 story points = 4-8 hours, this is on the faster end)

### Best Practices
1. **Don't skip verification steps** - Catch issues early
2. **Use exact versions** - Run `npm install` not `npm update`
3. **Commit frequently** - If issues arise, can revert
4. **Test before moving on** - Ensure dev server works

### Next Steps After Completion
Once this issue is complete and verified:
1. Move to Issue #2 (Install Core Dependencies)
2. Update Sprint 1 board (move card to "Done")
3. Document any deviations or learnings in sprint retro notes

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ A developer can:
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. See Next.js app at http://localhost:3000
5. Make a code change and see hot reload
6. Run `npm run build` successfully

✅ The codebase has:
1. Zero TypeScript errors
2. Zero ESLint errors
3. Proper formatting (Prettier)
4. Organized directory structure
5. Clear Git history with initial commit

---

**Ready to implement?** Follow the steps above in order. If you encounter blockers, refer to "Known Issues & Gotchas" or ask for help in daily standup.

**Estimated Completion:** Day 1-2 of Sprint 1

---

**Issue Metadata:**
- **Created:** October 1, 2025
- **Sprint:** Sprint 1
- **Milestone:** Milestone 1 - Core Map Foundation
- **Labels:** `P0`, `setup`, `infrastructure`, `sprint-1`
- **Story Points:** 3

---

## Tasks
- [x] Bootstrap Next.js 14 project with App Router and TypeScript
- [x] Configure linting, formatting, and project tooling
- [x] Run quality checks (lint, type-check, build) and document results

## Dev Agent Record

### Agent Model Used
- GPT-5 Codex (CLI)

### Debug Log References
- No additional debug log entries beyond automated command outputs.

### Completion Notes
- Established Next.js 14.2.33 + TypeScript scaffold with App Router and `src/` layout.
- Added TailwindCSS 3.x toolchain, Prettier (per project standards), and Next.js ESLint config extending Prettier.
- Verified `npm run lint`, `npm run type-check`, `npm run format:check`, and `npm run build` locally. Development server start was validated by the user screenshot due to sandbox port restrictions.
- Reviewed `docs/dev-quickstart.md`; deferred optional dependency installs (Leaflet, Zustand, etc.) as they belong to follow-on issues per sprint plan.

### File List
- llm-map-explorer/.eslintrc.json
- llm-map-explorer/.gitignore
- llm-map-explorer/.prettierignore
- llm-map-explorer/.prettierrc
- llm-map-explorer/README.md
- llm-map-explorer/next.config.js
- llm-map-explorer/package-lock.json
- llm-map-explorer/package.json
- llm-map-explorer/postcss.config.js
- llm-map-explorer/public/
- llm-map-explorer/src/app/globals.css
- llm-map-explorer/src/app/layout.tsx
- llm-map-explorer/src/app/page.tsx
- llm-map-explorer/tailwind.config.ts
- llm-map-explorer/tests/.gitkeep
- llm-map-explorer/tsconfig.json

### Change Log
- Bootstrap codebase from scratch with Next.js 14 + TypeScript scaffold, tooling, and documentation updates to satisfy ISSUE-001 acceptance criteria.
