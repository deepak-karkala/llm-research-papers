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
