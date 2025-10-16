# Issue #5: Zod Validation Schemas

**Sprint:** Sprint 1 (Week 1-2)  
**Story Points:** 2  
**Priority:** P0 (Critical Path)  
**Assignee:** Dev 2 (Mid-Level Full-Stack Developer)  
**Status:** ✅ Ready for Review  
**Dependencies:** Issue #4 – Core Data Model TypeScript Interfaces  
**References:** docs/architecture.md Section 4

---

## 📖 User Story

**As a** developer loading map content,  
**I want** runtime validation schemas that mirror our TypeScript data models,  
**so that** invalid JSON never reaches the app and data issues fail fast during builds.

---

## 📋 Acceptance Criteria

- [x] `src/lib/schemas.ts` created with Zod schemas that mirror the core data interfaces
- [x] `capabilitySchema` validates Capability data structures
- [x] `landmarkSchema` validates Landmark data, including nested link metadata
- [x] `organizationSchema` validates Organization data
- [x] `tourSchema` validates Tour data, including nested TourStage objects
- [x] Schemas export TypeScript types with `z.infer<>`
- [x] Unit tests cover valid samples and failure cases for each schema

---

## 🔗 Context & Dependencies

- Zod validation depends on the TypeScript interfaces finalized in Issue #4; reuse those shapes to keep schemas and types aligned.  
- Data loading workflow calls `validateData` in the DataLoader before exposing JSON to the UI, so schema signatures must integrate cleanly with that utility.  
- Validation errors bubble up as `ValidationError`, so error messages should remain descriptive for build logs.

---

## 🧠 Previous Story Insights

- Type definitions, fixtures, and baseline type tests already exist (`src/types/*.ts`, `tests/fixtures/sampleData.ts`) and can be reused as schema fixtures. Refer to completion notes in Issue #4 for exact field names and sample objects. *(Source: llm-map-explorer/docs/stories/ISSUE-004-core-data-models.md)*

---

## 🧩 Dev Notes

### Data Models

- Capabilities include hierarchical metadata, style hints, and polygon coordinates; Zod schema should enforce enumerated `level` values, bounded opacity (0-1), and nested `VisualStyle`. *[Source: docs/architecture.md#4.1-capability]*
- Landmarks require typed categories (`paper`, `model`, `tool`, `benchmark`), coordinate pairs, related landmark lists, and optional `metadata` for models; external links must validate URL strings and allowed link types. *[Source: docs/architecture.md#4.2-landmark]*
- Organizations map IDs to highlight colors and related landmarks; website/logo remain optional. Ensure hex color validation accommodates `#RRGGBB`. *[Source: docs/architecture.md#4.3-organization]*
- Tours combine top-level details with ordered `TourStage` entries that include map focus, narration, and landmark references; difficulty is a constrained enum, and coordinates/zoom should align with lat/lng + numeric zoom rules. *[Source: docs/architecture.md#4.4-tour]*
- Model-specific metadata lives inside `Landmark.metadata` when `type === 'model'`; schema should refine metadata when present while keeping extensibility for other landmark categories. *[Source: docs/architecture.md#4.5-model-extended-landmark-data]*

### Data Loading Workflow

- DataLoader invokes `validateData(data, schema)` before caching and search indexing, so exported schemas must compose cleanly with that helper and return typed results when successful. *[Source: docs/architecture.md#5.7-dataloader]*

### Project Structure & File Layout

- Place schemas in `src/lib/schemas.ts` alongside `store.ts` and `search.ts`; this keeps all runtime data utilities co-located. *[Source: docs/architecture.md#7.1-component-organization]*
- Maintain the documented structure with tests under `tests/unit` and fixtures in `tests/fixtures` so CI remains consistent. *[Source: docs/architecture.md#8-unified-project-structure]*

### Testing Standards

- Use Vitest for unit tests validating both happy-path JSON and representative failure cases; keep coverage high enough to catch schema drift. *[Source: docs/architecture.md#12-testing-strategy]*
- Ensure schema failures surface deterministic error messages so the DataLoader can halt map initialization cleanly when validation fails. *[Source: docs/architecture.md#5.7-dataloader]*

### Error Handling & Diagnostics

- Throwing or returning detailed `ValidationError` instances enables the global error boundary and CI logs to flag malformed data early. *[Source: docs/architecture.md#14.1-error-types]*

### Additional Guidance

- No REST or external API touchpoints in this story; validation occurs on static JSON loaded at build time. *(No additional architecture guidance beyond data models.)*

---

## ✅ Tasks / Subtasks

- [x] Derive Zod schemas for Capability, Landmark, Organization, Tour, and support types in `src/lib/schemas.ts`, mirroring the existing TypeScript interfaces (AC 1-4). *[Source: docs/architecture.md#4-data-models]*
  - [x] Encode enumerations (`level`, `type`, `difficulty`) with `z.enum` and enforce numeric constraints for coordinates/opacity. *[Source: docs/architecture.md#4-data-models]*
  - [x] Support model landmarks by refining optional `metadata` into `ModelMetadata` when type is `model`, while keeping non-model metadata flexible. *[Source: docs/architecture.md#4.5-model-extended-landmark-data]*
- [x] Export `z.infer` types for each schema (e.g., `CapabilityInput`) and re-export them from `src/lib/schemas.ts` (AC 5). *[Source: docs/architecture.md#5.7-dataloader]*
- [x] Write Vitest unit tests in `tests/unit/lib/schemas.test.ts` that cover valid fixtures (reuse `tests/fixtures/sampleData.ts`) and representative invalid cases for each schema (AC 6-7). *[Source: docs/architecture.md#12-testing-strategy]*
  - [x] Assert that invalid payloads surface descriptive `ValidationError` instances, matching the documented error taxonomy. *[Source: docs/architecture.md#14.1-error-types]*
- [x] Update sample fixtures if needed to ensure parity between types and schemas without breaking downstream stories. *(Only if additional fields are required.)*

---

## 🧪 Testing Guidance

- **Framework:** Vitest with built-in assertions; leverage existing setup from Issue #3. *[Source: docs/architecture.md#12-testing-strategy]*
- **Test Location:** `tests/unit/lib/schemas.test.ts`, mirroring the TypeScript interface test placement. *[Source: docs/architecture.md#8-unified-project-structure]*
- **Coverage Expectations:** Happy path data from fixtures plus edge-case failures (missing required fields, invalid enums, malformed coordinates, negative zoom).  
- **CI Integration:** Ensure tests run via existing `npm run test` script; failures should emit actionable schema errors for build diagnostics.

---

## 🧭 Project Structure Notes

- Keep schema exports in `src/lib/schemas.ts` and update any central barrel file only if architecture later specifies one. *[Source: docs/architecture.md#7.1-component-organization]*
- Public JSON data remains under `public/data`; schemas validate the format but do not relocate files. *[Source: docs/architecture.md#8-unified-project-structure]*

---

## 🤖 Dev Agent Record

**Agent Model Used:** claude-sonnet-4-5-20250929

### Debug Log References
No debug log entries required.

### Completion Notes
- Fixed import path issue in test file (changed from `@/tests/fixtures/sampleData` to relative path `../../fixtures/sampleData`)
- All schemas properly implement Zod validation matching TypeScript interfaces
- Model metadata validation uses `superRefine` to enforce typed metadata when `type === 'model'`
- All 10 unit tests passing, covering both valid and invalid cases
- Test coverage includes: valid samples, invalid enums, invalid metadata, invalid colors

### File List
- `src/lib/schemas.ts` - Zod validation schemas and inferred types
- `tests/unit/lib/schemas.test.ts` - Comprehensive unit tests for all schemas

---

## 📄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-15 | 0.1 | Initial draft created from sprint planning and architecture references | Bob (Scrum Master) |
| 2025-10-16 | 1.0 | Completed implementation with all tests passing | James (Dev Agent) |
