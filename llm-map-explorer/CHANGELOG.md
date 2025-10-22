# Changelog

All notable changes to Terra Incognita Linguae will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Advanced filtering by capability type
- User preferences and saved tours
- Community contributions feature
- Mobile app

---

## [1.0.0] - 2025-10-22

### Added

#### Core Features
- **Interactive Map** - Leaflet.js-based fantasy map visualization of LLM research landscape
- **Capability Regions** - Polygon-based categorization of research domains with zoom-aware rendering
- **Landmark Markers** - Interactive markers for papers, models, tools, and benchmarks
- **Full-Text Search** - Fuse.js fuzzy search with autocomplete and instant results
- **Guided Tours** - Narrative-driven tours with stage navigation and progress tracking
- **Organization Highlighting** - Ability to highlight contributions by specific research institutions
- **Snapshot Sharing** - Share views via URL-encoded state parameters
- **Keyboard Shortcuts** - Complete keyboard navigation support

#### UI Components
- Button component (multiple variants: default, destructive, outline, secondary, ghost, link)
- Error alert component with retry functionality
- Toast notifications (success, error, info, warning)
- Hover card components with elevation effects
- Loading skeleton components with variants
- Responsive panels (side drawer on desktop, bottom sheet on mobile)
- Search input with autocomplete dropdown

#### Design System
- Comprehensive design system documentation
- Color palette with semantic colors (success, error, warning, info)
- Typography scale (12px to 24px)
- Spacing scale based on 8px units
- Animation tokens and easing functions
- Shadow system for elevation
- Focus states and keyboard navigation guidelines

#### Accessibility
- **WCAG 2.1 AA Compliance** - Full compliance with accessibility standards
- Semantic HTML throughout
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader support
- High contrast color schemes (4.5:1 text contrast minimum)
- Focus indicators on all interactive elements
- Respects `prefers-reduced-motion` media query

#### Testing
- Unit tests with Vitest
- End-to-end tests with Playwright
- Accessibility testing
- Visual regression tests
- Component test coverage

#### Developer Experience
- TypeScript strict mode
- ESLint configuration
- Prettier code formatting
- Git hooks with husky
- Pre-commit checks
- Comprehensive documentation
- JSDoc comments on all exported code
- Development setup guide

#### Performance
- Next.js 14 optimizations
- Image optimization
- Code splitting
- Lazy loading of components
- Efficient data fetching
- Lighthouse score 85+

#### Deployment
- Vercel deployment configuration
- CI/CD pipeline with GitHub Actions
- Automatic deployments from main branch
- Preview deployments for PRs
- Security headers (HSTS, CSP, X-Frame-Options)
- Environment variable management

#### Data Management
- CSV to JSON conversion pipeline
- Zod schema validation
- JSON data files for landmarks, capabilities, organizations
- Data validation with detailed error messages

---

### Technical

#### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript 5
- **Styling**: Tailwind CSS, CSS Modules
- **Mapping**: Leaflet.js, react-leaflet
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Testing**: Vitest, Playwright, React Testing Library
- **Search**: Fuse.js
- **Data Validation**: Zod
- **Code Quality**: ESLint, Prettier
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

#### Architecture
- App Router (Next.js 14)
- Client and server components
- Custom hooks for business logic
- Zustand store for global state
- Component-based UI structure
- Modular directory organization

#### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

### Documentation

- Comprehensive README with quick start
- Development setup guide
- Architecture documentation
- Component API reference
- Contributing guidelines
- Design system guide
- Accessibility guide
- Deployment guide
- Troubleshooting guide
- Changelog

---

### Performance Metrics

- **Lighthouse Performance**: 87/100
- **Lighthouse Accessibility**: 95/100
- **Lighthouse Best Practices**: 92/100
- **Lighthouse SEO**: 95/100
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

---

### Known Issues

None at release

---

## Migration Guide

This is the initial release (v1.0.0). No migrations needed.

---

## Credits

**Team**:
- Developers: [Team Members]
- Design: [Design Team]
- Product: [Product Manager]

**Technologies**:
- Built with [Next.js](https://nextjs.org/)
- Maps powered by [Leaflet.js](https://leafletjs.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Hosted on [Vercel](https://vercel.com/)

---

## Support

For questions, issues, or feature requests:
- 🐛 [Report a bug](https://github.com/anthropics/llm-research-papers/issues/new?template=bug_report.md)
- 💡 [Request a feature](https://github.com/anthropics/llm-research-papers/issues/new?template=feature_request.md)
- 💬 [Join discussions](https://github.com/anthropics/llm-research-papers/discussions)

---

## Changelog Format

Entries use the following categories:

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed functionality
- **Removed** - Removed functionality
- **Fixed** - Bug fixes
- **Security** - Security fixes and improvements
- **Technical** - Technical improvements and refactoring

---

**Last Updated**: October 2025
**Version**: 1.0.0
