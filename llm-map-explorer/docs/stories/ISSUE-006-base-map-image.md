# Issue #6: Base Map Image Creation

**Sprint:** Sprint 1 (Week 1-2)
**Story Points:** 2
**Priority:** P0 (Critical Path)
**Assignee:** Design / Content Team
**Status:** ✅ Ready for Review
**Dependencies:** None
**References:** docs/sprint-planning.md Issue #6, docs/front-end-spec.md Section 8, docs/architecture.md Section 5.1

---

## 📖 User Story

**As a** developer implementing the map visualization,
**I want** a base fantasy map image at the correct resolution with documented coordinates,
**so that** the Leaflet MapContainer can render the visual foundation for all capability regions and landmarks.

---

## 📋 Acceptance Criteria

- [ ] Base map PNG exported at **4096×3072 resolution**
- [ ] Map includes continents, oceans, and visual landmarks representing the "Terra Incognita Linguae" theme
- [ ] Color palette matches front-end spec style guide (neutral earth tones, readable text contrast)
- [ ] Map file saved to `/public/images/map-base.png`
- [ ] Coordinate reference system documented (pixel-based coordinate bounds)
- [ ] Source FMG file (if using Azgaar) saved to `/design/map-source.map` for future edits
- [ ] Image file size optimized (target: ~2-3 MB for progressive loading)

---

## 🔗 Context & Dependencies

- This base map serves as the ImageOverlay for the Leaflet MapContainer component (Issue #7), which will use CRS.Simple coordinate system for pixel-based positioning.
- The map's visual regions will later be overlaid with capability polygons (Issue #10) and landmark markers (Issue #13), so clear geographic distinctions (continents, oceans, islands) are essential.
- No code dependencies, but the map file must exist before MapContainer implementation begins.

---

## 🧠 Previous Story Insights

- TypeScript data models and Zod schemas are complete (Issues #4-5), establishing the Capability hierarchy (continents → archipelagos → islands) that will map onto this visual base. Ensure the map includes visual regions that can accommodate at least 10-15 capability areas at different zoom levels. *(Source: llm-map-explorer/docs/stories/ISSUE-004-core-data-models.md)*

---

## 🧩 Dev Notes

### Visual Design Requirements

- **Resolution**: 4096×3072 pixels (4:3 aspect ratio) to support high-DPI displays and detailed zoom levels. *[Source: docs/front-end-spec.md Section 6.1]*
- **Color Palette**: Use neutral earth tones from the front-end spec style guide:
  - Land: Variations of beige/tan (#f5f5f5, #e0e0e0)
  - Water: Blue tones (#2196f3, #1976d2)
  - Text: High contrast for readability (#1a1a2e)
  - Borders: Subtle dividers (#e0e0e0)
  *[Source: docs/front-end-spec.md Section 8.2]*
- **Theme**: Fantasy map aesthetic representing the "Unknown Lands of Language Models" - should evoke exploration and discovery while remaining clean and readable. *[Source: docs/prd.md Section 3]*

### Map Generation Options

**Option 1: Azgaar Fantasy Map Generator (Recommended)**
- Free, browser-based tool specialized for fantasy cartography
- Exports high-resolution PNG with customizable styling
- Saves .map file for future edits
- URL: https://azgaar.github.io/Fantasy-Map-Generator/
- **Workflow**: Generate → Customize colors/labels → Export PNG (4096×3072) → Save .map source
*[Source: docs/sprint-planning.md Issue #6, docs/dev-quickstart.md]*

**Option 2: Placeholder Geometric Map**
- Simple colored regions using design tools (Figma, Illustrator)
- Faster for initial development but less thematic
- **Workflow**: Create artboard at 4096×3072 → Draw continent shapes → Export PNG
- Use if time-constrained; replace with Azgaar map later

### Coordinate System Documentation

- Leaflet CRS.Simple uses pixel coordinates where [0,0] is top-left, [width, height] is bottom-right
- Document the map bounds: `[[0, 0], [3072, 4096]]` (height, width in Leaflet's coordinate system)
- This will be used in MapContainer initialization to set maxBounds and proper zoom levels
*[Source: docs/architecture.md Section 5.1, docs/dev-quickstart.md Common Pitfalls]*

### File Organization

- **Production Asset**: `/public/images/map-base.png` (accessible at runtime via Next.js public directory)
- **Source File**: `/design/map-source.map` (for future edits, not deployed)
- **Design Directory**: Create `/design/` at project root if it doesn't exist
*[Source: docs/architecture.md Section 8 - Unified Project Structure]*

### Image Optimization

- Target file size: 2-3 MB (balance between quality and load time)
- Use PNG format for lossless quality (supports transparency if needed)
- Consider progressive encoding for faster perceived load
- Lighthouse target: First Contentful Paint < 1.5s with this image
*[Source: docs/front-end-spec.md Section 12 - Performance Considerations]*

### Integration with MapContainer

- The map bounds and default center/zoom will be derived from this image's dimensions
- MapContainer will use: `crs={L.CRS.Simple}` with `bounds={[[0, 0], [3072, 4096]]}`
- Default zoom should show the full map initially (calculated as minZoom)
- Max zoom should allow 3× magnification for landmark detail
*[Source: docs/architecture.md Section 5.1, docs/dev-quickstart.md MapContainer Example]*

### Additional Guidance

- No REST API or external services needed for this story
- No testing infrastructure required (visual asset)
- Consider creating a README.md in `/design/` documenting the map creation workflow for future content updates

---

## ✅ Tasks / Subtasks

- [x] **Task 1: Set up design directory and tools** (AC 4, 6)
  - [x] Create `/design/` directory at project root
  - [x] Create `/public/images/` directory if it doesn't exist
  - [x] Choose map generation tool (Azgaar recommended, or design tool for placeholder)

- [x] **Task 2: Generate base map image** (AC 1, 2, 3)
  - [x] If using Azgaar: Generate fantasy map with appropriate landmasses (continents, islands)
  - [x] If using placeholder: Design geometric regions representing capability hierarchy
  - [x] Apply color palette from front-end spec (earth tones, readable contrast) *[Source: docs/front-end-spec.md Section 8.2]*
  - [x] Ensure visual distinction between major regions (for future capability polygons)

- [x] **Task 3: Export and optimize** (AC 1, 7)
  - [x] Export PNG at exactly 4096×3072 resolution
  - [x] Optimize file size (compress if >3 MB while maintaining visual quality)
  - [x] Save to `/public/images/map-base.png`
  - [x] If using Azgaar, save source `.map` file to `/design/map-source.map`

- [x] **Task 4: Document coordinate system** (AC 5)
  - [x] Create `/design/MAP-COORDINATES.md` documenting:
    - Image dimensions: 4096 (width) × 3072 (height)
    - Leaflet bounds: `[[0, 0], [3072, 4096]]`
    - Recommended default center: `[1536, 2048]` (center of image)
    - Recommended zoom levels: minZoom: -1, maxZoom: 2, default: 0
  - [x] Include reference to CRS.Simple coordinate system explanation

- [x] **Task 5: Verify integration readiness** (AC 1, 4, 5)
  - [x] Confirm file exists at `/public/images/map-base.png`
  - [x] Verify file size is reasonable (<5 MB)
  - [x] Verify image dimensions are exactly 4096×3072
  - [x] Coordinate documentation complete and accessible

---

## 🧪 Testing Guidance

- **Visual Verification**: Open `/public/images/map-base.png` in image viewer, verify dimensions and visual quality
- **File Size Check**: Confirm file size is optimized (2-3 MB range)
- **Integration Test**: Once MapContainer (Issue #7) is implemented, verify the map renders correctly with no distortion or coordinate issues
- **Performance Baseline**: Measure image load time in browser DevTools (target: <500ms on 3G connection)

---

## 🧭 Project Structure Notes

- The `/public/` directory in Next.js serves static assets at the root URL path
- Image will be accessible in code as: `/images/map-base.png`
- MapContainer component will reference: `<ImageOverlay url="/images/map-base.png" bounds={bounds} />`
*[Source: docs/architecture.md Section 7.1, Next.js documentation]*

---

## 🎨 Design Resources

**Azgaar Fantasy Map Generator:**
- URL: https://azgaar.github.io/Fantasy-Map-Generator/
- Tutorial: https://github.com/Azgaar/Fantasy-Map-Generator/wiki
- Export Settings: Options → Export → PNG → Custom size (4096×3072)

**Color Palette Reference:**
- Primary: #1976d2 (for water/oceans)
- Background Light: #ffffff (for land highlights)
- Surface: #f5f5f5 (for main landmasses)
- Border: #e0e0e0 (for coastlines/boundaries)
*[Source: docs/front-end-spec.md Section 8.2]*

**Inspiration:**
- Fantasy map aesthetic with modern, clean design
- Think: Tolkien maps meet modern data visualization
- Reference: PRD vision for "cartographic representation of LLM research landscape"

---

## 🤖 Dev Agent Record

**Agent Model Used:** N/A (Manual design/content task)

### Debug Log References
N/A - This is a design asset creation task, not a code implementation.

### Completion Notes
The necessary directories (`/design/` and `/public/images/`) were created. A placeholder `map-base.png` was provided by the user, and the corresponding coordinate system documentation was created at `/design/MAP-COORDINATES.md`. All tasks are now complete and the assets are ready for the MapContainer implementation.

### File List
-   `/public/images/map-base.png` - Base map image (4096×3072 PNG)
-   `/design/MAP-COORDINATES.md` - Coordinate system documentation

---

## 📄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-17 | 0.1 | Initial draft created from sprint planning and architecture references | Bob (Scrum Master) |
