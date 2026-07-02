# Terra Incognita Linguae

An interactive, visual exploration of Large Language Model (LLM) research. Discover seminal papers, foundational models, research organizations, and key capability areas that shaped modern AI.

The application lives in [`llm-map-explorer/`](./llm-map-explorer).

## Features

- **Interactive map** - Explore LLM research as a fantasy landscape
- **Fuzzy search** - Find papers, models, organizations, and topics
- **Guided tours** - Learn through structured, narrative-driven tours
- **Organization highlighting** - See contributions by research lab or company
- **Keyboard navigation** - Use the experience without a mouse
- **Responsive interface** - Works across desktop, tablet, and mobile layouts

## Quick Start

### Prerequisites

- Node.js 18.17+
- npm
- Git

### Installation

```bash
git clone https://github.com/anthropics/llm-research-papers.git
cd llm-research-papers/llm-map-explorer
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000> in your browser.

## Documentation

- [App README](./llm-map-explorer/README.md)
- [Setup Guide](./llm-map-explorer/docs/setup.md)
- [Architecture](./llm-map-explorer/docs/architecture.md)
- [Components](./llm-map-explorer/docs/components.md)
- [Troubleshooting](./llm-map-explorer/docs/troubleshooting.md)
- [Design System](./llm-map-explorer/docs/design-system.md)
- [Contributing](./llm-map-explorer/CONTRIBUTING.md)

## Development

Run commands from [`llm-map-explorer/`](./llm-map-explorer).

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix lint issues where possible |
| `npm run format` | Format files with Prettier |
| `npm run format:check` | Check Prettier formatting |
| `npm run type-check` | Check TypeScript types |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:coverage` | Run unit tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:a11y` | Run accessibility E2E tests |
| `npm run test:all` | Run unit and E2E tests |

## Data Pipeline

Map data is maintained as CSV and converted to static JSON:

```bash
cd llm-map-explorer
python scripts/csv-to-json.py
```

CSV source files live in [`llm-map-explorer/csv/`](./llm-map-explorer/csv), and generated JSON files are written to [`llm-map-explorer/public/data/`](./llm-map-explorer/public/data).

Current CSV files:

- `capabilities.csv` - Research capability regions
- `landmarks.csv` - Papers, models, tools, and benchmarks
- `organizations.csv` - Research institutions and companies

See [`llm-map-explorer/csv/README.md`](./llm-map-explorer/csv/README.md) for column specifications.

## Project Structure

```text
llm-map-explorer/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities, schemas, search, and state
│   ├── styles/              # Additional styles
│   └── types/               # TypeScript type definitions
├── public/
│   ├── data/                # Static JSON data
│   ├── icons/               # Landmark icons
│   └── images/              # Map assets
├── tests/                   # Unit, E2E, accessibility, and visual tests
├── docs/                    # Product, architecture, and design docs
├── csv/                     # CSV source data
└── scripts/                 # Data conversion scripts
```

## Technology Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Mapping:** Leaflet, React Leaflet
- **State:** Zustand
- **UI:** shadcn/ui, Tailwind CSS
- **Search:** Fuse.js
- **Validation:** Zod
- **Testing:** Vitest, Playwright
- **Deployment:** Vercel

## Contributing

See [`llm-map-explorer/CONTRIBUTING.md`](./llm-map-explorer/CONTRIBUTING.md) for the contribution workflow, coding standards, and testing expectations.

