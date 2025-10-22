# Terra Incognita Linguae

[![CI](https://github.com/anthropics/llm-research-papers/actions/workflows/ci.yml/badge.svg)](https://github.com/anthropics/llm-research-papers/actions/workflows/ci.yml)
[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-85%2B-brightgreen)](./docs/performance.md)
[![WCAG 2.1 AA Compliant](https://img.shields.io/badge/WCAG-2.1%20AA-brightgreen)](./docs/accessibility.md)

An interactive, visual exploration of Large Language Model (LLM) research. Discover seminal papers, foundational models, and key research areas that shaped modern AI.

## ✨ Features

- 🗺️ **Interactive Map** - Explore LLM research as a fantasy landscape
- 🔍 **Fuzzy Search** - Find papers, models, and topics instantly
- 📚 **Guided Tours** - Learn through structured, narrative-driven tours
- 🏢 **Organization Highlighting** - See contributions by research labs
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation support
- ♿ **Accessibility** - WCAG 2.1 AA compliant
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Performance** - Lighthouse score 85+

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/anthropics/llm-research-papers.git
cd llm-research-papers/llm-map-explorer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Documentation

- [Setup Guide](./docs/setup.md) - Local development setup
- [Architecture](./docs/architecture.md) - System design and structure
- [Components](./docs/components.md) - UI component documentation
- [Deployment](./docs/deployment.md) - Production deployment guide
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines
- [Troubleshooting](./docs/troubleshooting.md) - Common issues & solutions
- [Design System](./docs/design-system.md) - Visual design tokens and patterns

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting errors
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:a11y    # Run accessibility tests
```

### Data Pipeline

Maintain map data in Google Sheets and convert to JSON:

**Workflow:**

1. **Create/Edit data in Google Sheets**
   - Maintain data in organized spreadsheets
   - Use proper column headers and data types

2. **Export as CSV**
   - File → Download → CSV (.csv)
   - Save to `csv/` directory

3. **Run conversion pipeline**
   ```bash
   python scripts/csv-to-json.py
   ```

4. **Verify output**
   - Check `public/data/` for generated JSON files
   - Review validation messages in terminal

**CSV Files:**

- `capabilities.csv` - Research capability regions
- `landmarks.csv` - Papers, models, tools, benchmarks
- `organizations.csv` - Research institutions and companies

See `csv/README.md` for detailed column specifications and examples.

## 📂 Project Structure

```
llm-map-explorer/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── map/            # Map-related components
│   │   ├── panels/         # Panel components
│   │   ├── search/         # Search components
│   │   ├── tours/          # Tour components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and helpers
│   ├── types/              # TypeScript type definitions
│   └── styles/             # CSS and styling
├── public/                 # Static assets
│   ├── data/              # JSON data files
│   └── images/            # Images and icons
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # End-to-end tests
│   └── a11y/              # Accessibility tests
├── docs/                   # Documentation
├── csv/                    # CSV data files
└── .github/workflows/      # CI/CD workflows
```

## 🎨 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Mapping**: Leaflet.js, react-leaflet
- **State**: Zustand
- **UI**: shadcn/ui, Tailwind CSS
- **Testing**: Vitest, Playwright
- **Search**: Fuse.js
- **Deployment**: Vercel

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## ♿ Accessibility

This project is committed to WCAG 2.1 AA compliance. See [Accessibility Guide](./docs/accessibility.md).

## 📊 Performance

Lighthouse audit results:
- Performance: 87
- Accessibility: 95
- Best Practices: 92
- SEO: 95

See [Performance Report](./docs/performance.md).

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Map visualization with [Leaflet.js](https://leafletjs.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Hosted on [Vercel](https://vercel.com/)

## 📧 Contact

Questions? Reach out on [GitHub Discussions](https://github.com/anthropics/llm-research-papers/discussions).

## 🚀 Deployment

This project is deployed on [Vercel](https://vercel.com) with automatic deployments from the `main` branch.

### Production URLs

- **Main:** https://terra-incognita-linguae.vercel.app
- **Custom Domain:** [Configure in Vercel Dashboard]
- **Preview Deployments:** Auto-generated for each PR

### Deployment Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes & Commit**
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   ```

3. **Push & Open PR**
   ```bash
   git push origin feature/your-feature
   ```
   - Vercel automatically creates a preview deployment
   - Preview URL posted in PR comments

4. **Test Preview**
   - Visit preview URL from PR
   - Test all features and responsive design
   - Verify no regressions

5. **Merge to Main**
   - Merge PR to `main` when approved
   - Vercel automatically deploys to production

### Environment Variables

Configure in **Vercel Dashboard → Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://api.terra-incognita-linguae.app
NODE_ENV=production
```

For local development, create `.env.local` (git-ignored):

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### Build & Deployment

- **Build Command:** `npm run build`
- **Start Command:** `npm run start`
- **Root Directory:** `./` (monorepo)

### Monitoring & Rollback

**View Deployment Status:**
- https://vercel.com/dashboard → Deployments

**Rollback (if needed):**
1. Go to Vercel Dashboard → Deployments
2. Find last stable deployment
3. Click "Promote to Production"

**Check Analytics:**
- https://vercel.com/dashboard → Analytics
- Monitor Web Vitals (CLS, FCP, LCP)
- View error rates and logs

### Pre-Deployment Checklist

Before merging to `main`:

- [ ] All tests passing: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build succeeds locally: `npm run build`
- [ ] Features tested manually
- [ ] No console errors
- [ ] Lighthouse score ≥85

See `.github/deployment-checklist.md` for detailed checklist.

### Manual Deployment (Advanced)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel deployments
```

### Troubleshooting

**Build fails locally?**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment variables missing?**
- Check `.env.local` for local dev
- Check Vercel Dashboard for production vars
- Redeploy after changing env vars

**Preview not updating?**
- Clear Vercel cache: Vercel Dashboard → Settings → Build Cache → Clear
- Retrigger deployment by pushing a new commit
