# LLM Map Explorer

Bootstrap of the Terra Incognita Linguae project. This repository contains a Next.js 14 application configured with TypeScript, TailwindCSS, ESLint, and Prettier so new contributors can start implementing features immediately.

## Prerequisites

- Node.js 18.17+
- npm 9+

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to confirm the app loads. The landing page lives at `src/app/page.tsx`.

## Available Scripts

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start the development server                |
| `npm run build`        | Build the production bundle                 |
| `npm run start`        | Serve the production build                  |
| `npm run lint`         | Run ESLint using the Next.js config         |
| `npm run lint:fix`     | Auto-fix ESLint issues when possible        |
| `npm run type-check`   | Run the TypeScript compiler in no-emit mode |
| `npm run format`       | Apply Prettier formatting                   |
| `npm run format:check` | Validate Prettier formatting                |
| `python scripts/csv-to-json.py` | Convert CSV files to JSON with validation |

## Data Pipeline

### CSV to JSON Conversion

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

**CSV Structure:**

- `capabilities.csv` - Research capability regions
- `landmarks.csv` - Papers, models, tools, benchmarks
- `organizations.csv` - Research institutions and companies

See `csv/README.md` for detailed column specifications and examples.

**Validation:**

All converted JSON files are validated against Zod schemas before output:
- Type validation (strings, numbers, enums)
- Required field validation
- URL and color format validation
- Nested object schema validation

**Error Handling:**

Validation errors prevent JSON output. Check console for specific issues:

```
❌ Validation failed for landmarks.json
   Row 2: Expected number for year, got 'invalid'
```

### Data Files

- **Input**: `csv/*.csv` - Google Sheets exports
- **Output**: `public/data/*.json` - Validated JSON data
- **Documentation**: `csv/README.md` - CSV column specs

## Project Structure

```
llm-map-explorer/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── public/
├── tests/
├── docs/
├── next.config.js
├── package.json
└── tsconfig.json
```

See `docs/dev-quickstart.md` for detailed onboarding instructions and sprint guidance.

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
