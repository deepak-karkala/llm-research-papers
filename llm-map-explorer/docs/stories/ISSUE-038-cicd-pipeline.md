# Issue #38: CI/CD Pipeline with Automated Tests

**Sprint:** Sprint 6 (Week 11-12)
**Story Points:** 3
**Priority:** P0
**Assignee:** Dev 2 (Mid-Level Full-Stack Developer)
**Status:** Ready for Review

---

## 📖 User Story

**As a** developer
**I want** automated testing and deployment on every push
**So that** bugs are caught early and deployments are safe and consistent

---

## 🎯 Goal

Set up comprehensive GitHub Actions CI/CD pipeline that runs linting, type checking, unit tests, integration tests, E2E tests, and accessibility tests. Automate deployment to Vercel with preview for PRs and production for main branch.

---

## 📋 Acceptance Criteria

### ✅ GitHub Actions Workflow
- [ ] `.github/workflows/ci.yml` created
- [ ] Workflow triggers on: push to main, pull requests
- [ ] Workflow name: "CI"
- [ ] Runs on: `ubuntu-latest`
- [ ] Node version: 18.x
- [ ] Clear, descriptive step names

### ✅ Linting & Type Checking
- [ ] `npm run lint` runs without errors
- [ ] `npm run type-check` runs without errors
- [ ] Prettier formatting checked
- [ ] Failure causes workflow to fail (stops PR merge)
- [ ] Output visible in GitHub PR checks

### ✅ Unit Tests
- [ ] `npm run test:unit` runs all unit tests
- [ ] Tests run in CI environment
- [ ] Coverage reported (optional)
- [ ] Failure prevents merge to main
- [ ] Test output visible in workflow logs

### ✅ Integration Tests
- [ ] `npm run test:integration` runs (if applicable)
- [ ] Integration tests pass
- [ ] Failure prevents merge
- [ ] Clear error messages on failure

### ✅ E2E Tests
- [ ] `npm run test:e2e` runs on built app
- [ ] Build created before E2E tests
- [ ] Playwright tests run
- [ ] Screenshots/videos captured on failure
- [ ] Failure prevents merge

### ✅ Accessibility Tests
- [ ] `npm run test:a11y` runs axe-core tests
- [ ] No critical violations
- [ ] No serious violations
- [ ] Failure prevents merge
- [ ] Reports generated

### ✅ Build Verification
- [ ] `npm run build` succeeds
- [ ] Build output checked
- [ ] No build warnings
- [ ] Bundle size checked (if configured)

### ✅ Preview Deployments
- [ ] Preview deployment created for PRs
- [ ] Preview URL posted in PR by bot
- [ ] Preview URL clickable and testable
- [ ] Preview environment same as production
- [ ] Preview survives branch updates

### ✅ Production Deployments
- [ ] Production deployment on merge to main
- [ ] Automatic deployment without manual trigger
- [ ] Deployment only runs if all tests pass
- [ ] Deployment status visible in GitHub
- [ ] Rollback possible if needed

### ✅ Artifact Management
- [ ] Build artifacts uploaded for inspection
- [ ] Test reports uploaded (if applicable)
- [ ] Screenshots/videos from failed tests uploaded
- [ ] Coverage reports uploaded (optional)
- [ ] Artifacts retained for 30 days

### ✅ Notifications & Status
- [ ] Workflow status shown in PR checks
- [ ] Red X (failed) or green ✓ (passed) visible
- [ ] Detailed logs accessible
- [ ] Status shown on main branch
- [ ] CI badge added to README.md

### ✅ Performance & Timing
- [ ] CI runs complete in <5 minutes (typical)
- [ ] Caching enabled for node_modules
- [ ] Caching enabled for build artifacts
- [ ] Build caching reduces subsequent runs
- [ ] No unnecessary steps

### ✅ Documentation
- [ ] README.md explains CI/CD
- [ ] Workflow documented
- [ ] How to run tests locally documented
- [ ] How to skip CI (if needed) documented
- [ ] Troubleshooting guide provided

---

## 🛠️ Technical Implementation

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      # Install dependencies
      - name: Install dependencies
        run: npm ci

      # Linting
      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

      # Type checking
      - name: Type check with TypeScript
        run: npm run type-check

      # Unit tests
      - name: Run unit tests
        run: npm run test:unit

      # Integration tests
      - name: Run integration tests
        run: npm run test:integration

      # Build
      - name: Build application
        run: npm run build

      # E2E tests (on built app)
      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      # Accessibility tests
      - name: Run accessibility tests
        run: npm run test:a11y

      # Upload artifacts on failure
      - name: Upload E2E test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload coverage reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
          retention-days: 30

      # Comment on PR with results
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ CI pipeline passed!\n\n- ✅ Linting\n- ✅ Type checking\n- ✅ Unit tests\n- ✅ E2E tests\n- ✅ Build'
            })

  # Preview deployment
  preview-deploy:
    needs: ci
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to Vercel (Preview)
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  # Production deployment
  production-deploy:
    needs: ci
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to Vercel (Production)
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          production: true

      - name: Notify deployment success
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.repos.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.sha,
              environment: 'production',
              required_contexts: [],
              auto_merge: false,
              description: 'Production deployment successful'
            })
```

---

### Step 2: Set Up GitHub Secrets

In GitHub repo → Settings → Secrets and variables → Actions:

```
VERCEL_TOKEN: [from Vercel account]
VERCEL_ORG_ID: [from Vercel project]
VERCEL_PROJECT_ID: [from Vercel project]
```

Get values from:
1. Vercel Dashboard → Settings → Tokens
2. Vercel Project → Settings

---

### Step 3: Add Test Scripts to package.json

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\"",
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:a11y": "playwright test tests/a11y"
  }
}
```

---

### Step 4: Create Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

### Step 5: Create Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['github'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

---

### Step 6: Create CI Badge for README

Add to `README.md`:

```markdown
# Terra Incognita Linguae

[![CI](https://github.com/your-org/llm-research-papers/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/llm-research-papers/actions/workflows/ci.yml)

...rest of README
```

---

### Step 7: Document CI/CD in README

Add to `README.md`:

```markdown
## Development & Testing

### Running Tests Locally

```bash
# Unit tests
npm run test:unit

# Unit tests (watch mode)
npm run test:unit:watch

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test
```

### Automated Testing (CI/CD)

Tests run automatically on:
- Push to any branch
- Pull requests to `main`

GitHub Actions workflow runs:
1. ESLint linting
2. Prettier formatting check
3. TypeScript type check
4. Unit tests
5. Integration tests
6. Build verification
7. E2E tests
8. Accessibility tests

See `.github/workflows/ci.yml` for details.

### Manual Deployment

Normally, deployment is automatic. To manually deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```
```

---

### Step 8: Create GitHub Status Checks

Configure in repo → Settings → Branches → Branch protection rules:

- Require status checks to pass:
  - ✅ CI
  - ✅ Vercel preview

---

### Step 9: Create Troubleshooting Guide

Create `docs/troubleshooting.md`:

```markdown
# Troubleshooting

## CI Pipeline Failures

### "npm ci" fails

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm ci
```

### "ESLint" fails

```bash
# Fix linting errors
npm run lint:fix

# Push changes
git add .
git commit -m "fix: lint errors"
git push
```

### "Type check" fails

```bash
# Fix TypeScript errors manually
npm run type-check

# Or let editor fix them automatically
```

### "Tests" fail

```bash
# Run tests locally to debug
npm run test:unit

# Fix issues
# Push changes
git add .
git commit -m "fix: test failures"
git push
```

### "Build" fails

```bash
# Debug build locally
npm run build

# Check for any errors
# Fix issues in code
git add .
git commit -m "fix: build error"
git push
```

### E2E Tests fail

```bash
# Run E2E tests locally
npm run test:e2e:headed

# Tests open in browser - debug interactively

# Fix issues
git add .
git commit -m "fix: E2E test"
git push
```

## Preview Deployment Issues

### Preview URL not working

1. Check Vercel project settings
2. Check GitHub secrets configured
3. Retrigger deployment by pushing new commit

### Preview different from main

Usually means:
- Environment variables different
- Build cache issue
- Branch out of date with main

Solution: Rebase branch on main, push again.

## Production Deployment Issues

### Deployment stuck

Go to Vercel Dashboard and check logs.

### Need to rollback

1. Vercel Dashboard → Deployments
2. Find last stable deployment
3. Click "Promote to Production"

### Performance degraded

1. Check Vercel Analytics
2. Review recent changes
3. Rollback if needed
4. Fix issue
5. Redeploy
```

---

### Step 10: Create CI Configuration Documentation

Create `docs/ci-cd.md`:

```markdown
# CI/CD Pipeline Documentation

## Overview

The project uses GitHub Actions for continuous integration and Vercel for continuous deployment.

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions CI                       │
│                                                             │
│  Linting → Type Check → Unit Tests → Integration → E2E     │
│                                                             │
│  ✅ Pass                                                     │
│  │                                                          │
│  ├─→ Deploy Preview (if PR)                                │
│  └─→ Deploy Production (if main)                           │
│                                                             │
│  ❌ Fail → Block merge to main                             │
└─────────────────────────────────────────────────────────────┘
```

### Workflow File

Location: `.github/workflows/ci.yml`

### Secrets Required

- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Configuration

See `.github/workflows/ci.yml` for full configuration.

### Debugging Failures

1. Go to GitHub repo → Actions
2. Click on failed workflow
3. View logs for each step
4. Identify which step failed
5. See troubleshooting guide
```

---

## 🧪 Testing Checklist

### Workflow Validation
- [ ] Workflow syntax is valid (no YAML errors)
- [ ] All steps execute in correct order
- [ ] Caching works (node_modules)
- [ ] Build artifacts created

### Test Execution
- [ ] Unit tests run
- [ ] Integration tests run
- [ ] E2E tests run
- [ ] Accessibility tests run

### Deployment
- [ ] Preview deployment works on PR
- [ ] Production deployment works on main
- [ ] Preview URL shows in PR
- [ ] Production URL working

### Notifications
- [ ] GitHub status checks visible
- [ ] PR comments added
- [ ] Failure notifications clear

---

## 📚 Reference Documentation

- **GitHub Actions:** https://docs.github.com/en/actions
- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Vercel CI/CD:** https://vercel.com/docs/concepts/deployments/git

---

## 🔗 Dependencies

**Depends On:**
- Issue #3 (Testing Infrastructure)
- Issue #37 (Vercel Deployment)

**Blocks:**
- None (last infrastructure issue)

---

## ✅ Definition of Done

Before marking complete:

- [ ] ✅ GitHub Actions workflow created
- [ ] ✅ All test scripts working
- [ ] ✅ Linting runs in CI
- [ ] ✅ Type checking runs in CI
- [ ] ✅ Unit tests run in CI
- [ ] ✅ E2E tests run in CI
- [ ] ✅ Preview deployments work
- [ ] ✅ Production deployments work
- [ ] ✅ GitHub secrets configured
- [ ] ✅ Documentation complete

---

## 📝 Notes for Implementation

### Time Estimate
- **Workflow Setup:** 1 hour
- **Testing Config:** 45 minutes
- **Deployment Setup:** 45 minutes
- **Documentation:** 30 minutes
- **Total:** ~3 hours (3 story points)

### Best Practices
1. **Keep CI fast** - Cache dependencies
2. **Fail fast** - Run quick checks first
3. **Clear names** - Use descriptive step names
4. **Good logs** - Make it easy to debug
5. **Monitor regressions** - Keep CI green

### Common Issues
1. **Slow CI** - Enable caching
2. **Flaky tests** - Fix test issues, not CI
3. **Deployment failures** - Check secrets
4. **Missing artifacts** - Check upload paths
5. **Long runtime** - Parallelize where possible

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ CI runs on every push and PR
✅ All tests pass in CI
✅ Preview deployments functional
✅ Production deployments automatic
✅ GitHub status checks working
✅ Documentation complete

---

**Ready to implement?** Start with workflow creation, then add tests and deployment steps.

**Estimated Completion:** Day 3-4 of Sprint 6

---

**Issue Metadata:**
- **Sprint:** Sprint 6
- **Milestone:** Milestone 4 - Polish & Production
- **Labels:** `P0`, `CI/CD`, `infrastructure`, `testing`, `sprint-6`
- **Story Points:** 3
