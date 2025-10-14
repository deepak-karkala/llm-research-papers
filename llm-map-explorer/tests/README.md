# Testing Guide

## Overview

This project uses a comprehensive testing strategy:
- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Accessibility Tests**: axe-core + Playwright

## Running Tests Locally

### Unit Tests

```bash
# Run unit tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### Accessibility Tests

```bash
# Run accessibility tests only
npm run test:a11y

# Or run all E2E tests (includes a11y)
npm run test:e2e
```

### Run All Tests

```bash
npm run test:all
```

## Writing Tests

### Unit Tests

Place unit tests next to the code they test or in `tests/unit/`:

```typescript
// tests/unit/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### E2E Tests

Place E2E tests in `tests/e2e/`:

```typescript
// tests/e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

### Accessibility Tests

Include accessibility checks in E2E tests:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## CI/CD

Tests run automatically on:
- Push to `main` branch
- Pull requests

CI will fail if:
- Any test fails
- Linting errors exist
- TypeScript errors exist
- Code coverage drops below 80%

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm run test -- path/to/test.spec.ts

# Run in watch mode
npm run test -- --watch

# Run with coverage for specific file
npm run test:coverage -- path/to/test.spec.ts
```

### Playwright

```bash
# Debug specific test
npx playwright test --debug path/to/test.spec.ts

# View test report
npx playwright show-report

# Run specific browser
npx playwright test --project=chromium
```

## Test Coverage

Coverage reports are generated in `coverage/` directory.

View coverage:

```bash
npm run test:coverage
open coverage/index.html
```

Target: >80% coverage for lines, functions, branches, statements.

## Directory Structure

```
tests/
├── unit/              # Unit tests
│   ├── components/    # Component tests
│   └── lib/          # Utility function tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
├── fixtures/         # Test data
├── helpers/          # Test utilities
├── setup.ts          # Global test setup
└── README.md         # This file
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it
2. **Use Testing Library queries**: Prefer `getByRole` over `getByTestId`
3. **Keep tests simple**: One assertion per test when possible
4. **Mock external dependencies**: Use Vitest's `vi.mock()` for external modules

### E2E Tests

1. **Test user flows**: Focus on complete user journeys
2. **Use proper selectors**: Prefer role-based selectors
3. **Wait for elements**: Use Playwright's auto-waiting features
4. **Keep tests independent**: Each test should run in isolation

### Accessibility Tests

1. **Test early**: Run a11y tests from the start
2. **Fix violations immediately**: Don't accumulate a11y debt
3. **Test interactions**: Verify keyboard navigation works
4. **Check color contrast**: Ensure text is readable

## Troubleshooting

### Common Issues

#### "Cannot find module '@/...'"

Ensure `tsconfig.json` and `vitest.config.ts` have matching path aliases.

#### Playwright browsers not installed

Run: `npx playwright install`

#### Tests timing out

Increase timeout in test file:

```typescript
test('long running test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

#### Coverage below threshold

Either:
1. Write more tests to increase coverage
2. Adjust thresholds in `vitest.config.ts` (not recommended)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
