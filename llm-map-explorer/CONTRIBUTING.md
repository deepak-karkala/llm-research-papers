# Contributing to Terra Incognita Linguae

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and constructive. Treat all contributors with dignity. We are committed to providing a welcoming and inspiring community for all.

## Ways to Contribute

- **Bug Reports** - Found an issue? [Open a GitHub issue](https://github.com/anthropics/llm-research-papers/issues)
- **Features** - Have an idea? [Start a discussion](https://github.com/anthropics/llm-research-papers/discussions)
- **Code** - Fix bugs or add features (see below)
- **Documentation** - Improve guides and comments
- **Testing** - Write or improve tests
- **Design** - Enhance visual design or UX

## Development Workflow

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/llm-research-papers.git
cd llm-research-papers/llm-map-explorer
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-tour-pause-button`
- `fix/search-not-loading`
- `docs/update-setup-guide`

### 3. Development Setup

```bash
npm install
npm run dev
```

See [Setup Guide](./docs/setup.md) for detailed instructions.

### 4. Make Changes

Follow code standards:
- Use TypeScript for all code
- Follow ESLint rules
- Format with Prettier
- Add JSDoc comments
- Write tests for features

### 5. Test Your Changes

```bash
npm run lint
npm run type-check
npm run test:unit
npm run test:e2e
```

All tests must pass before submitting a PR.

### 6. Commit Changes

Write clear, descriptive commit messages:

```
feat: add tour pause/resume functionality

- Implement pause button in tour panel
- Resume returns to last active stage
- Add E2E test for pause/resume flow
```

**Commit Format:** `type(scope): description`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, missing semicolons)
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Build, CI, dependencies

### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create pull request on GitHub:
- Link related issues with `Closes #123`
- Describe changes clearly
- Reference any design documents
- Add screenshots if UI changes
- List testing performed

### 8. Code Review

- Be responsive to feedback
- Ask for clarification if needed
- Make requested changes
- React with 👍 when resolved

## Code Standards

### TypeScript

- Use strict mode
- Avoid `any` types
- Define interfaces for data
- Use generics when appropriate

### Components

```typescript
'use client';

import React, { FC } from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  /** Component description */
  title: string;
  /** Optional callback */
  onClick?: () => void;
}

/**
 * MyComponent - Does something useful
 *
 * @example
 * <MyComponent title="Hello" />
 */
export const MyComponent: FC<MyComponentProps> = ({ title, onClick }) => {
  return <div onClick={onClick}>{title}</div>;
};
```

### Functions

```typescript
/**
 * Searches landmarks using Fuse.js fuzzy matching
 *
 * @param query - Search query string
 * @param landmarks - Array of landmarks to search
 * @returns Array of matching landmarks sorted by score
 *
 * @example
 * const results = searchLandmarks('attention', landmarks);
 */
export const searchLandmarks = (
  query: string,
  landmarks: Landmark[]
): SearchResult[] => {
  // Implementation
};
```

### Testing

Write tests for:
- All user interactions
- All edge cases
- All error states

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<MyComponent title="Hello" onClick={onClick} />);

    screen.getByText('Hello').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Accessibility

- Use semantic HTML
- Add ARIA labels when appropriate
- Test with keyboard navigation
- Test with screen reader
- Meet WCAG 2.1 AA color contrast requirements (4.5:1 for text)
- Ensure focus indicators are visible

## Documentation

- Update README if API changes
- Add JSDoc comments for exported code
- Add inline comments for complex logic
- Update architecture docs for major changes
- Include examples for new features

## Pull Request Process

1. **Create PR** with clear title and description
2. **Update Documentation** - README, JSDoc, guides if needed
3. **Add Tests** - Unit tests, E2E tests, accessibility tests
4. **Ensure CI Passes** - All checks must be green
   - ESLint
   - TypeScript type-check
   - Unit tests
   - E2E tests (if applicable)
5. **Request Review** - From maintainers or active contributors
6. **Address Feedback** - Respond to review comments
7. **Merge** - When approved by maintainers

## Testing Requirements

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e
```

### Accessibility Tests
```bash
npm run test:a11y
```

## Code Review Guidelines

### For Authors
- Keep PRs focused on single feature/fix
- Provide context and examples
- Respond to feedback promptly
- Ask for help if stuck

### For Reviewers
- Review within 48 hours if possible
- Be constructive and respectful
- Suggest improvements clearly
- Approve when satisfied

## Common Tasks

### Adding a New Component

1. Create `src/components/category/MyComponent.tsx`
2. Add TypeScript interface for props
3. Add JSDoc comment block
4. Implement component with semantic HTML
5. Add accessibility features (ARIA, keyboard support)
6. Create `src/components/category/MyComponent.test.tsx`
7. Export from `src/components/index.ts`
8. Update [docs/components.md](./docs/components.md)

### Adding a New Hook

1. Create `src/hooks/useMyHook.ts`
2. Add JSDoc with description, params, returns
3. Export from `src/hooks/index.ts`
4. Add tests in `src/hooks/__tests__/useMyHook.test.ts`
5. Document in [docs/architecture.md](./docs/architecture.md)

### Adding a New Utility

1. Create `src/lib/myUtility.ts`
2. Add JSDoc comments
3. Write unit tests
4. Export from `src/lib/index.ts`
5. Document usage in code comments

## Getting Help

- [Setup Issues](./docs/setup.md)
- [Architecture Overview](./docs/architecture.md)
- [Component Documentation](./docs/components.md)
- [Design System](./docs/design-system.md)
- [GitHub Issues](https://github.com/anthropics/llm-research-papers/issues)
- [GitHub Discussions](https://github.com/anthropics/llm-research-papers/discussions)

## Questions?

Feel free to ask on GitHub Discussions or in the PR comments. No question is too basic!

---

Thank you for contributing to Terra Incognita Linguae! 🚀
