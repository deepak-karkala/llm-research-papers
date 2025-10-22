# Development Setup Guide

This guide walks you through setting up the Terra Incognita Linguae project for local development.

## System Requirements

- **Node.js**: 18.17 or higher
- **npm**: 9.0 or higher
- **Git**: Latest version
- **OS**: macOS, Linux, or Windows (with WSL2)

### Verify Your System

```bash
node --version      # Should be v18.17.0 or higher
npm --version       # Should be v9.0.0 or higher
git --version       # Should be latest
```

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/anthropics/llm-research-papers.git
cd llm-research-papers/llm-map-explorer
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 14 with React
- TypeScript
- Leaflet & react-leaflet
- Zustand for state management
- shadcn/ui components
- Tailwind CSS
- Testing libraries (Vitest, Playwright)
- Development tools (ESLint, Prettier)

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and update values if needed:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
VERCEL_ENV=development
```

**Note:** `.env.local` is git-ignored for security. Never commit secrets.

### 4. Start Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.5s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Verify Installation

You should see:
- Interactive map with capability regions
- Search bar at the top
- Info panel on the right
- Legend with categories
- No console errors

**Optional:** Run tests to ensure everything works:

```bash
npm run lint          # ESLint checking
npm run type-check    # TypeScript checking
npm run test:unit     # Unit tests
```

All should pass without errors.

## IDE Setup

### VS Code (Recommended)

#### Extensions

Install these recommended extensions:

1. **ESLint** - Microsoft
   - Linting support
   - Settings: Enable `eslint.autoFixOnSave`

2. **Prettier** - Prettier
   - Code formatting
   - Set as default formatter

3. **TypeScript Vue Plugin** - Vue
   - TypeScript support

4. **Tailwind CSS IntelliSense** - Tailwind Labs
   - Autocomplete for Tailwind classes

5. **REST Client** - Humao Chen
   - Test API endpoints (optional)

#### Settings

Create or update `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.rulers": [80, 120],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true
  }
}
```

#### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "skipFiles": ["<node_internals>/**"],
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"]
    }
  ]
}
```

## Running Tests

### Unit Tests

```bash
npm run test:unit         # Run once
npm run test:unit:watch   # Watch mode (re-run on changes)
npm run test:unit -- --ui # Visual UI mode
```

### E2E Tests

```bash
npm run test:e2e          # Run headless
npm run test:e2e:headed   # Visual mode (browser visible)
npm run test:e2e -- --debug  # Debug mode
```

### All Tests

```bash
npm run test              # Runs all tests
```

### Test Coverage

```bash
npm run test:unit -- --coverage
```

## Building for Production

### Local Production Build

```bash
npm run build             # Optimize and bundle
npm run start             # Serve production build
```

Open [http://localhost:3000](http://localhost:3000) to test production build.

### Production Checks

```bash
npm run lint              # Code quality
npm run type-check        # Type safety
npm run test:unit         # Unit tests
npm run test:e2e          # E2E tests
npm run lighthouse        # Performance audit (if configured)
```

All must pass before deploying.

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Serve production build |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run type-check` | Check TypeScript types |
| `npm run test:unit` | Run unit tests |
| `npm run test:unit:watch` | Unit tests in watch mode |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:headed` | E2E tests with browser |

## Project Structure

```
llm-map-explorer/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── map/              # Map components
│   │   ├── panels/           # Panel components
│   │   ├── search/           # Search components
│   │   ├── tours/            # Tour components
│   │   └── ui/               # UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities
│   ├── types/                # TypeScript types
│   └── styles/               # CSS modules
├── public/                   # Static files
├── tests/                    # Test files
├── docs/                     # Documentation
└── package.json
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Dependencies Outdated

```bash
npm update
npm run build
npm run test:unit
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
> TypeScript: Restart TS Server
```

### Build Fails

```bash
# Clean build
rm -rf .next
npm run build
```

### Tests Failing

```bash
# Clear test cache
npm run test:unit -- --clearCache

# Run specific test file
npm run test:unit -- src/components/map/MapContainer.test.tsx
```

### Next.js Cache Issues

```bash
# Clear all caches
npm run build -- --no-cache
rm -rf .next node_modules
npm install
npm run dev
```

## Environment Variables

### Local Development (`.env.local`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
VERCEL_ENV=development

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_TOURS=true
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_SHARING=true
```

### Never Commit

- `.env.local` - Local development secrets
- `.env.*.local` - Any local environment files
- `.env` with real secrets - Use `.env.example` instead

## Performance Tips

### Development Speed

- Use `npm run dev` for fast development (uses fast refresh)
- Use VSCode's debugger instead of `console.log`
- Close unused browser tabs
- Consider disabling extensions temporarily

### Build Optimization

- Only build when needed: `npm run build`
- Use `npm run type-check` to catch errors before building
- Check bundle size: `npm run build` shows size estimate

### Testing Performance

- Use `npm run test:unit:watch` during development
- Run full test suite before committing
- Use test selectors for stable E2E tests

## Next Steps

1. **Read the Architecture** - [docs/architecture.md](./architecture.md)
2. **Explore Components** - [docs/components.md](./components.md)
3. **Understand Contributing** - [CONTRIBUTING.md](../CONTRIBUTING.md)
4. **Check Design System** - [docs/design-system.md](./design-system.md)

## Getting Help

- **Setup Issues** - See troubleshooting section above
- **Architecture Questions** - See [docs/architecture.md](./architecture.md)
- **Component Questions** - See [docs/components.md](./components.md)
- **GitHub Issues** - [Report bugs](https://github.com/anthropics/llm-research-papers/issues)
- **GitHub Discussions** - [Ask questions](https://github.com/anthropics/llm-research-papers/discussions)

---

**You're all set!** Start building! 🚀
