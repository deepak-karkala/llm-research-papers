# Issue #12: Seed Data - Landmarks

**Status:** Draft
**Story Points:** 3
**Priority:** P0
**Epic:** Sprint 2: Progressive Disclosure & Info Panels
**Sprint:** Sprint 2 (Week 3-4)

---

## Story Statement

**As a** content curator
**I want** to create a comprehensive landmarks.json file with 20-30 seminal papers and foundational models
**So that** the map has meaningful LLM research content that users can explore and learn from

---

## Acceptance Criteria

- [ ] `public/data/landmarks.json` created
- [ ] 20-30 landmarks defined (mix of papers, models, tools, benchmarks)
- [ ] Each landmark has: id, name, type, year, organization, description, abstract, externalLinks, coordinates, capabilityId, tags
- [ ] Coordinates mapped to base map within capability regions
- [ ] Data validates against Zod schema (Issue #5)
- [ ] Include seminal works: "Attention Is All You Need", GPT-2, GPT-3, BERT, InstructGPT, Llama, etc.
- [ ] External links to arXiv, GitHub, model cards included
- [ ] Landmarks distributed across all capability regions from Issue #9

---

## Dependencies

**Previous Stories (Must be Complete):**
- ✅ Issue #5: Zod Validation Schemas
- ✅ Issue #9: Seed Data - Capabilities (to know coordinate ranges for each capability)

**Blocks:**
- Issue #13: LandmarkMarker Component
- Issue #20: useDataLoader Hook

---

## Dev Notes

### Previous Story Insights

From Issue #9 (Capabilities Seed Data), we have 10-15 capability regions with polygon coordinates. This story creates 20-30 landmark points distributed within those capability polygons. Understanding the capability layout is critical for realistic landmark placement.

### Data Models

**Landmark Type Definition** [Source: architecture.md Section 4.2]
```typescript
interface Landmark {
  id: string;                  // Unique identifier (e.g., "landmark-001")
  name: string;                // Full name (e.g., "Attention Is All You Need")
  type: "paper" | "model" | "tool" | "benchmark";  // Landmark classification
  year: number;                // Publication/release year
  organization: string;         // Organization/author (e.g., "Google Brain")
  description: string;         // Short description (1-2 sentences)
  abstract?: string;           // Full abstract (for papers)
  coordinates: LatLng;         // Map position [lat, lng]
  capabilityId: string;        // Reference to parent capability
  externalLinks: ExternalLink[];  // Links to arXiv, GitHub, etc.
  tags: string[];              // Topic tags (e.g., ["attention", "transformer"])
}

interface LatLng {
  lat: number;
  lng: number;
}

interface ExternalLink {
  title: string;
  url: string;
  type: "arxiv" | "github" | "model-card" | "website" | "paper";
}
```

[Source: architecture.md Section 4.2]

### Landmark Distribution Strategy

**Capability Region Mapping** [Source: prd.md Section 6.3, 6.2]

The 20-30 landmarks should distribute across research areas:
1. **Attention & Transformers** (Capability: Attention)
   - "Attention Is All You Need" (2017, Google)
   - Transformer-XL, RoBERTa, etc.

2. **Foundation Models & Scaling** (Capability: Reasoning)
   - GPT-2, GPT-3, GPT-4
   - BERT, T5, LLaMA

3. **Instruction Tuning & RLHF** (Capability: Alignment)
   - InstructGPT, ChatGPT
   - FLAN, Alpaca

4. **Quantization & Efficiency** (Capability: Quantization)
   - QLoRA, GPTQ
   - Distillation papers

5. **Fine-tuning & Adaptation** (Capability: Fine-tuning)
   - LoRA, Adapters
   - PEFT papers

6. **Multimodal** (Capability: Multimodal)
   - CLIP, DALL-E
   - Flamingo, GPT-4V

### Coordinate System

**Base Map Dimensions** [Source: front-end-spec.md Section 8]
- Map size: 4096×3072 pixels
- Coordinate range: `[0, 0]` to `[4096, 3072]`
- Landmarks should be placed **within** capability polygon bounds
- Use relative positioning: distribute landmarks evenly within each capability region

**Placement Guidelines:**
- Don't place landmarks on exact polygon edges
- Space landmarks 100+ pixels apart to avoid overlap
- Use logical geographic distribution within capability "continent"

### Data Validation

**Zod Schema Requirements** [Source: Issue #5]
The landmarks.json file must validate against Zod schema defined in `src/lib/schemas.ts`. Critical validations:
- All required fields present
- `year` is a valid number (1950-2030)
- `coordinates` have valid lat/lng (0-4096 for x, 0-3072 for y in CRS.Simple)
- `capabilityId` references existing capability from Issue #9
- `externalLinks` have valid URLs
- `tags` are lowercase, alphanumeric

### File Locations

Based on project structure [Source: architecture.md Section 5]:
- Data file: `public/data/landmarks.json`
- Reference capabilities from: `public/data/capabilities.json` (Issue #9)
- Validation script can reference: `src/lib/schemas.ts` (Issue #5)

### Recommended Landmark List (Curated)

**Essential Papers & Models (20-30 total):**

1. Attention Is All You Need (2017, Google, Paper)
2. BERT (2018, Google, Model)
3. GPT-2 (2019, OpenAI, Model)
4. GPT-3 (2020, OpenAI, Model)
5. FLAN (2021, Google, Model)
6. InstructGPT (2022, OpenAI, Paper)
7. ChatGPT (2022, OpenAI, Model)
8. LLaMA (2023, Meta, Model)
9. Alpaca (2023, Stanford, Model)
10. LoRA (2021, Microsoft, Paper)
11. QLoRA (2023, UW, Paper)
12. GPTQ (2023, IST, Paper)
13. CLIP (2021, OpenAI, Model)
14. DALL-E (2021, OpenAI, Model)
15. Flamingo (2022, DeepMind, Paper)
16. RoBERTa (2019, Facebook, Model)
17. T5 (2019, Google, Model)
18. GPT-4 (2023, OpenAI, Model)
19. Mistral-7B (2023, Mistral AI, Model)
20. CodeLLaMA (2023, Meta, Model)
21. PEFT (2023, Hugging Face, Tool)
22. Transformer-XL (2019, Google, Paper)
23. BLIP (2022, Salesforce, Model)
24. Falcon (2023, TII, Model)
25. DPO (2023, Stanford, Paper)
26. SFT - Supervised Fine-Tuning (2021, Various, Tool)

### Testing & Validation

**Validation Checklist:**
- Run `npm run validate:data` or similar to verify against Zod schema
- No duplicate IDs or names
- All capabilities referenced exist in capabilities.json
- All URLs are valid (at least syntactically)
- Coordinates are within map bounds (0-4096 x, 0-3072 y)
- No TypeScript errors when importing landmarks.json

---

## Tasks / Subtasks

### Task 1: Set Up Landmark Data Structure (AC: 1-3)

1. Review `src/lib/schemas.ts` to understand Zod landmark schema
2. Create new file: `public/data/landmarks.json`
3. Set up JSON structure with empty arrays for validation testing
4. Define coordinate mapping strategy (capability region → landmark distribution)
5. Create comment section documenting landmark categories and coordinate assignments

**Reference:** [Source: architecture.md Section 4.2]

### Task 2: Curate and Document Landmark Metadata (AC: 2-7)

1. Collect metadata for 20-30 landmarks:
   - Name, type, year, organization
   - Description (1-2 sentences)
   - Abstract (for papers)
   - External links (arXiv, GitHub, model cards, papers)
   - Tags (relevant research areas)

2. Create spreadsheet or document mapping each landmark to:
   - Capability region (Attention, Alignment, Reasoning, etc.)
   - Approximate coordinates within that region
   - Source URLs

3. Ensure diverse representation across:
   - Different years (2017-2023)
   - Different types (papers, models, tools)
   - Different organizations (OpenAI, Google, Meta, etc.)

**Reference:** [Source: prd.md Section 6.3]

### Task 3: Generate Landmark Coordinates (AC: 4)

1. Reference capability.json to identify polygon bounds for each capability region
2. For each landmark, assign coordinates:
   - Pick a capability region based on research area
   - Generate lat/lng within that region's bounds
   - Ensure 100+ pixel spacing between landmarks
   - Avoid polygon edges

3. Document coordinate assignments (for future reference)
4. Verify all coordinates within map bounds: `0-4096 x, 0-3072 y`

**Reference:** [Source: front-end-spec.md Section 8]

### Task 4: Populate landmarks.json File (AC: 1-7)

1. Add all 20-30 landmarks to `public/data/landmarks.json`
2. Each landmark must include:
   - `id`: Unique identifier (e.g., "landmark-001")
   - `name`: Full name
   - `type`: One of "paper", "model", "tool", "benchmark"
   - `year`: Publication/release year
   - `organization`: Organization/author name
   - `description`: Short description
   - `abstract`: Optional, for papers
   - `coordinates`: `{lat: number, lng: number}`
   - `capabilityId`: Reference to capability
   - `externalLinks`: Array with title, url, type
   - `tags`: Array of lowercase strings

3. Verify JSON is valid (no syntax errors)
4. Ensure all required fields populated

**Reference:** [Source: architecture.md Section 4.2]

### Task 5: Validate Data Against Schema (AC: 3, 7)

1. Load `src/lib/schemas.ts` landmarkSchema
2. Write validation script or use Node REPL to test:
   ```
   const schema = landmarkSchema.array();
   const data = JSON.parse(fs.readFileSync('public/data/landmarks.json'));
   schema.parse(data);
   ```
3. Fix any validation errors:
   - Missing fields
   - Invalid coordinate values
   - Invalid capabilityId references
   - Malformed URLs

4. Verify all validation errors resolved

**Reference:** [Source: Issue #5]

### Task 6: Cross-Reference Capability IDs (AC: 4)

1. Load `public/data/capabilities.json`
2. Extract all capability IDs
3. For each landmark in landmarks.json, verify `capabilityId`:
   - Matches an existing capability
   - Is semantically correct (e.g., "Attention Is All You Need" → Attention capability)
4. Fix any broken references
5. Document capability-to-landmark mapping (optional)

**Reference:** [Source: Issue #9, architecture.md Section 4.1-4.2]

### Task 7: Create Summary Documentation (AC: All)

1. Create `docs/data/landmarks-manifest.md` documenting:
   - Landmark count and distribution by type
   - Capability region assignments
   - Data sources and external links
   - Coordinate mapping strategy
   - Validation results

2. Include statistics:
   - Total landmarks: X
   - By type: X papers, Y models, Z tools, W benchmarks
   - By organization: OpenAI (X), Google (Y), Meta (Z), etc.
   - By year: Earliest (2017), Latest (2023)

3. Add quality notes and any caveats

**Reference:** [Source: architecture.md Section 6.1]

### Task 8: Code Review & Finalization (AC: All)

1. Peer review of landmarks.json:
   - Spot-check data accuracy (names, years, organizations)
   - Verify coordinate distribution looks reasonable
   - Check external links are accessible

2. Run full validation suite:
   - Zod schema validation
   - TypeScript type checking (if imported)
   - No duplicate IDs

3. Commit landmarks.json to git
4. Verify landmarks load correctly in app (visual inspection via debug console)

**Reference:** [Source: architecture.md Section 3.1]

---

## Project Structure Notes

- Data file follows established pattern: `public/data/*.json`
- Validation uses existing Zod schemas from `src/lib/schemas.ts`
- Coordinates use CRS.Simple system (pixel-based, not lat/lng in geographic sense)
- Documentation added to `docs/data/` folder

---

## Technical Constraints

1. **JSON File Size:** 20-30 landmarks ~50KB JSON (uncompressed); acceptable
2. **Coordinate System:** Must use CRS.Simple pixel coordinates (0-4096 x, 0-3072 y)
3. **Validation:** Must pass Zod schema validation from Issue #5
4. **External URLs:** All URLs must be valid HTTPS or HTTP (can be tested programmatically)
5. **Capability References:** All capabilityIds must exist in capabilities.json

---

## Completion Checklist

- [ ] landmarks.json created with 20-30 landmarks
- [ ] All required fields populated for each landmark
- [ ] JSON validates against Zod schema (0 validation errors)
- [ ] All capabilityIds reference existing capabilities
- [ ] Coordinates distributed across all capability regions
- [ ] Landmarks spaced 100+ pixels apart (no overlap)
- [ ] External links verified (syntactically valid)
- [ ] Tags are lowercase and semantically meaningful
- [ ] Documentation created (landmarks-manifest.md)
- [ ] Peer reviewed
- [ ] Committed to git
- [ ] Story status updated to "Done"

---

## Notes for Content Curator

This is a critical content task that populates the map with meaningful LLM research history. Quality matters here:

1. **Accuracy:** Verify publication years, organization affiliations, and descriptions are correct
2. **Diversity:** Ensure good mix of seminal papers, latest models, and tools
3. **Distribution:** Landmarks should spread across all research areas (Attention, Alignment, Reasoning, etc.)
4. **Links:** External links are your "citations" - make sure they point to real resources

The coordinate placement is less critical than having good metadata. The visual distribution can be adjusted later if needed.

---

**Created:** 2025-10-20
**Epic:** Sprint 2
**Story:** #12 of Sprint 2 (Issue #12)
