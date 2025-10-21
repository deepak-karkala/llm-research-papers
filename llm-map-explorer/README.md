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
