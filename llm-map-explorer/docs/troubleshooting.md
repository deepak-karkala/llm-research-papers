# Troubleshooting Guide

Common issues and solutions for Terra Incognita Linguae development and deployment.

## Table of Contents

- [Setup Issues](#setup-issues)
- [Development Issues](#development-issues)
- [Testing Issues](#testing-issues)
- [Build & Deployment Issues](#build--deployment-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Setup Issues

### Node.js/npm Version Issues

**Problem**: `npm ERR! The engine "node" is incompatible`

**Solution**:
```bash
# Check your versions
node --version
npm --version

# Update Node.js if needed
# Visit https://nodejs.org/ and install LTS version

# Update npm
npm install -g npm@latest

# Or use nvm (Node Version Manager)
nvm install 18.17.0
nvm use 18.17.0
```

---

### npm Install Fails

**Problem**: `npm install` fails with error messages

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try
npm install --verbose
```

---

### Port 3000 Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
PORT=3002 npm run start
```

---

### Environment Variables Not Loaded

**Problem**: `Error: NEXT_PUBLIC_API_URL is undefined`

**Solution**:
```bash
# Check .env.local exists
ls -la .env.local

# Verify it has required variables
cat .env.local

# If missing, create it
cp .env.example .env.local

# Edit with your values
# Then restart dev server
npm run dev
```

---

### Git Clone Permission Denied

**Problem**: `fatal: could not read Username for 'https://github.com': ...`

**Solution**:
```bash
# Use SSH instead of HTTPS
git clone git@github.com:anthropics/llm-research-papers.git

# Or set up personal access token for HTTPS
# GitHub → Settings → Developer settings → Personal access tokens
```

---

## Development Issues

### TypeScript Errors But Code Runs

**Problem**: Type errors in IDE but `npm run dev` works

**Solution**:
```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
> TypeScript: Restart TS Server

# Or try from command line
npm run type-check

# Fix errors from output
```

---

### Module Not Found

**Problem**: `Module not found: Can't resolve '@/components/...'`

**Solution**:
```bash
# Check tsconfig.json paths are correct
cat tsconfig.json | grep -A 5 "paths"

# Should see:
# "@/*": ["./src/*"]

# Verify file actually exists
ls src/components/...

# If file exists but not found:
npm run dev -- --clean
rm -rf .next
npm run dev
```

---

### Hot Reload Not Working

**Problem**: Changes to code don't update in browser

**Solution**:
```bash
# Restart dev server
# Kill the process (Ctrl+C)
npm run dev

# Or check for syntax errors
npm run lint
npm run type-check

# If files very large, increase watch limit
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### Components Not Displaying

**Problem**: Component renders nothing or shows error

**Solution**:
1. Check browser console for errors
2. Verify component is exported: `export const MyComponent = ...`
3. Check imports: `import { MyComponent } from '@/components'`
4. Verify props are correct
5. Check for async issues (API calls, data loading)

```bash
# Run type check
npm run type-check

# Run linter
npm run lint
```

---

### Search Not Working

**Problem**: Search bar doesn't show results or crashes

**Solution**:
```bash
# Check data files exist
ls public/data/

# Should have: landmarks.json, capabilities.json, organizations.json

# Verify JSON is valid
npm run test:unit -- --testNamePattern="search"

# Check browser console for errors
# Look for failed fetch requests
```

---

### Map Not Loading

**Problem**: Map container empty or showing errors

**Solution**:
```bash
# Check Leaflet CSS is loaded
# In browser DevTools: Elements → find <link rel="stylesheet" href="leaflet.css">

# Verify map container has dimensions
# Check parent element has width/height

# Check for console errors
# Browser DevTools → Console

# Try hard refresh
# Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
```

---

## Testing Issues

### Tests Fail With Module Not Found

**Problem**: `Cannot find module '@/components/...'` in tests

**Solution**:
```bash
# Clear Jest cache
npm run test:unit -- --clearCache

# Verify test environment configuration
# Check jest.config.js or vitest.config.ts

# Run with verbose output
npm run test:unit -- --reporter=verbose
```

---

### E2E Tests Timeout

**Problem**: `Test timeout - Timeout of 30000ms exceeded`

**Solution**:
```bash
# Increase timeout
npm run test:e2e -- --timeout=60000

# Or run specific test with more time
npm run test:e2e -- tests/path/to/test.spec.ts --timeout=60000

# Ensure dev server is running
npm run dev

# Check application loads in browser
# http://localhost:3000
```

---

### Tests Pass Locally But Fail in CI

**Problem**: GitHub Actions tests fail but local tests pass

**Solution**:
```bash
# Make sure all changes committed
git add .
git commit -m "fix: issues"

# Run exact CI commands locally
npm run lint
npm run type-check
npm run test:unit
npm run test:e2e

# Check for environment-specific issues
# Use same Node version as CI
```

---

### Visual Regression Tests Fail

**Problem**: Screenshot tests fail with "image mismatch"

**Solution**:
```bash
# Update snapshots if intentional changes
npm run test:e2e -- --update-snapshots

# Or run specific test
npm run test:e2e -- tests/visual/visual-regression.spec.ts --update-snapshots

# Review changes before committing
git diff tests/visual/__screenshots__/
```

---

## Build & Deployment Issues

### Build Fails Locally

**Problem**: `npm run build` fails with errors

**Solution**:
```bash
# Check for TypeScript errors first
npm run type-check

# Check for lint errors
npm run lint

# Clean build
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Check build output for specific error
npm run build 2>&1 | head -50
```

---

### Build Succeeds But App Crashes

**Problem**: App works in dev but fails in production build

**Solution**:
```bash
# Test production build locally
npm run build
npm run start

# Check browser console in production
# http://localhost:3000

# Check Next.js production logs
npm run start 2>&1

# Look for:
# - Hydration errors
# - Missing components
# - API errors
```

---

### Deployment to Vercel Fails

**Problem**: `Vercel deployment fails during build`

**Solution**:
1. Check Vercel build logs: https://vercel.com/dashboard
2. Common causes:
   - Environment variables missing
   - Node version mismatch
   - Type errors not caught locally

```bash
# Verify environment variables set in Vercel
# https://vercel.com → Project Settings → Environment Variables

# Check Node version matches
# Vercel defaults to Node 18.x, verify in package.json

# Run pre-deployment checks
npm run lint
npm run type-check
npm run test:unit
npm run build
```

---

### Vercel Preview URL Shows Old Code

**Problem**: Preview URL shows outdated version

**Solution**:
```bash
# Clear Vercel cache
# https://vercel.com → Project → Settings → Build Cache → Clear

# Force redeploy
# https://vercel.com → Deployments → right-click deployment → Redeploy

# Or push new commit
git commit --allow-empty -m "chore: force rebuild"
git push origin your-branch
```

---

## Performance Issues

### Slow Development Server

**Problem**: Dev server takes long to start or respond

**Solution**:
```bash
# Check for resource-heavy operations
# Close other applications

# Check file count
find src -type f | wc -l

# Consider disabling some features temporarily
# Check .next folder size (should be < 500MB)
du -sh .next

# Upgrade Node.js to latest LTS
node --version
nvm install 18.17.0
```

---

### Large Bundle Size

**Problem**: Production bundle too large

**Solution**:
```bash
# Analyze bundle
npm run build
npm install -g @next/bundle-analyzer

# Check tree-shakeable imports
# Verify all imports are named imports, not default

# Check for unused dependencies
npm audit

# Monitor bundle size in CI
# Add bundle size check to GitHub Actions
```

---

### Slow Page Load

**Problem**: Page loads slowly in production

**Solution**:
```bash
# Run Lighthouse audit
# Chrome DevTools → Lighthouse

# Check performance metrics
npm run build
npm run start
# Open DevTools → Performance tab → Record

# Look for:
# - Large JavaScript bundles
# - Unused CSS
# - Missing image optimization
# - Slow API calls
```

---

### Memory Leak in Browser

**Problem**: App uses more memory over time

**Solution**:
```bash
# Check DevTools Memory tab
# Chrome DevTools → Memory → Take Heap Snapshot

# Look for:
# - Growing object counts
# - Detached DOM nodes
# - Unreleased event listeners

# Verify effect cleanup
// Wrong - memory leak
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Missing cleanup!
}, []);

// Right - no leak
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## Getting Help

### Before Asking for Help

1. **Check Documentation**
   - [Setup Guide](./setup.md)
   - [Architecture Guide](./architecture.md)
   - [Components Guide](./components.md)
   - This troubleshooting guide

2. **Check Error Messages**
   - Read error carefully
   - Search error text in documentation
   - Check related issues on GitHub

3. **Try Common Solutions**
   - Clear cache: `npm cache clean --force`
   - Restart: `npm run dev`
   - Rebuild: `rm -rf .next && npm run build`

### How to Ask for Help

Include when reporting issues:

1. **Environment Info**
   ```bash
   node --version
   npm --version
   git --version
   uname -a  # OS info
   ```

2. **Exact Error Message**
   - Full error text
   - Stack trace
   - Console output

3. **Steps to Reproduce**
   - What you did
   - What happened
   - What you expected

4. **What You've Tried**
   - Steps taken to fix
   - Results of each attempt

### Get Help From

- **GitHub Issues**: [Report bugs](https://github.com/anthropics/llm-research-papers/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/anthropics/llm-research-papers/discussions)
- **Documentation**: [Setup Guide](./setup.md), [Architecture](./architecture.md)
- **Contributing Guide**: [How to contribute](../CONTRIBUTING.md)

---

## Frequently Asked Questions

### Q: How do I change the port?
**A**: Use the PORT environment variable
```bash
PORT=3001 npm run dev
```

### Q: How do I disable animations?
**A**: CSS respects `prefers-reduced-motion`
```bash
# Or in code
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
```

### Q: How do I update dependencies?
**A**: Use npm update
```bash
npm update
npm run test:unit
npm run build
```

### Q: How do I format code?
**A**: Run Prettier
```bash
npm run format
```

### Q: How do I fix linting errors?
**A**: Run ESLint fix
```bash
npm run lint:fix
```

---

**Last Updated**: October 2025
**Questions?** See [Contributing Guide](../CONTRIBUTING.md) or [GitHub Discussions](https://github.com/anthropics/llm-research-papers/discussions)
