# CSV Data Files for LLM Map Explorer

This directory contains CSV files that are converted to JSON for use in the LLM Map Explorer application.

## Overview

CSV files in this directory are maintained in a spreadsheet-friendly format (compatible with Google Sheets, Excel, etc.) and can be converted to validated JSON using the `scripts/csv-to-json.py` pipeline script.

## Workflow

1. **Edit data in Google Sheets or spreadsheet application**
2. **Export as CSV**: File → Download → CSV (.csv)
3. **Place CSV file in this directory** (`csv/`)
4. **Run conversion**: `python scripts/csv-to-json.py`
5. **JSON files updated** in `public/data/`

## File Specifications

### capabilities.csv

**Purpose**: Define research capability regions on the map.

**Columns**:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | string | ✓ | Unique identifier (e.g., "cap-001") |
| name | string | ✓ | Display name (e.g., "Attention Mechanisms") |
| description | string | ✓ | Detailed explanation of the capability |
| shortDescription | string | ✓ | Brief summary for tooltips |
| level | enum | ✓ | Hierarchy level: `continent`, `archipelago`, `island`, `strait` |
| polygonCoordinates | JSON array | ✓ | Boundary coordinates: `[[lat, lng], [lat, lng], ...]` |
| visualStyleHints | JSON object | ✓ | Styling: `{"fillColor": "#FF0000", "fillOpacity": 0.5, "strokeColor": "#000000", "strokeWeight": 2}` |
| relatedLandmarks | array | ✓ | Comma-separated IDs: `lm-001,lm-002,lm-003` |
| parentCapabilityId | string | ✗ | Parent capability ID for nested regions (empty if root) |
| zoomThreshold | number | ✓ | Min zoom level to display: -1 (always show), 0 (zoom 0+), 1 (zoom 1+) |

**Example Row**:

```csv
cap-001,Attention Mechanisms,Study of attention...,Attention & self-attention,continent,"[[37.77, -122.42], [37.88, -122.42], [37.88, -122.31], [37.77, -122.31]]","{""fillColor"": ""#FF6B6B"", ""fillOpacity"": 0.4, ""strokeColor"": ""#FF0000"", ""strokeWeight"": 2}","lm-001,lm-002",,0
```

### landmarks.csv

**Purpose**: Define papers, models, tools, and benchmarks on the map.

**Columns**:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | string | ✓ | Unique identifier (e.g., "lm-001") |
| name | string | ✓ | Title of the paper/model/tool |
| type | enum | ✓ | Entity type: `paper`, `model`, `tool`, `benchmark` |
| year | number | ✓ | Publication/release year |
| organization | string | ✓ | Primary organization (e.g., "OpenAI") |
| authors | array | ✗ | Comma-separated author names |
| description | string | ✓ | Short summary (1-2 sentences) |
| abstract | string | ✗ | Full abstract or detailed description |
| externalLinks | JSON array | ✓ | Links: `[{"type": "arxiv", "url": "...", "label": "arXiv"}]` |
| coordinates | JSON object | ✓ | Map position: `[lat, lng]` |
| capabilityId | string | ✓ | Parent capability ID |
| relatedLandmarks | array | ✓ | Related landmark IDs: `lm-001,lm-002` |
| tags | array | ✓ | Searchable keywords: `transformer,attention,nlp` |
| icon | string | ✗ | Emoji or icon override (e.g., "📄", "🤖") |
| metadata | JSON object | ✗ | Type-specific metadata (e.g., model parameters) |
| zoomThreshold | number | ✓ | Min zoom level: 0 (show at all zooms), 1 (zoom 1+) |

**Example Row**:

```csv
lm-001,Attention Is All You Need,paper,2017,Google DeepMind,"Vaswani, A.; Shazeer, N.","Introduced the Transformer...","This paper presents...","[{""type"": ""arxiv"", ""url"": ""https://arxiv.org/abs/1706.03762"", ""label"": ""arXiv""}]","[37.78, -122.41]",cap-001,"lm-002,lm-003","transformer,attention,nlp",📄,"{}",0
```

**Metadata for Models** (when type = "model"):

```json
{
  "parameters": "1.5B",
  "architecture": "Transformer",
  "trainingMethod": "Unsupervised pre-training",
  "capabilities": ["text-generation", "few-shot-learning"],
  "releaseDate": "2019-02-14",
  "license": "MIT"
}
```

### organizations.csv

**Purpose**: Define organizations and research institutions.

**Columns**:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | string | ✓ | Unique identifier (e.g., "org-001") |
| name | string | ✓ | Organization name |
| description | string | ✓ | Mission and focus area |
| website | string | ✗ | Official website URL |
| landmarkIds | array | ✓ | Comma-separated landmark IDs: `lm-001,lm-002` |
| color | string | ✓ | Brand color in hex format (e.g., "#10A37F") |
| logo | string | ✗ | Logo image URL |

**Example Row**:

```csv
org-001,OpenAI,AI research focused on safe AGI,https://openai.com,"lm-002,lm-005",#10A37F,https://openai.com/favicon.ico
```

## JSON Parsing Rules

### Strings

- **Regular strings**: Simply quoted if they contain commas or special characters
- **Example**: `"Machine Learning, AI"` → `"Machine Learning, AI"`

### Numbers

- **Integers**: No quotes → `2023` → `2023`
- **Floats**: No quotes → `0.5` → `0.5`
- **Parsing**: Empty strings → `0`, "invalid" → error

### JSON Arrays

- **Square brackets**: `[1, 2, 3]` or `["item1", "item2"]`
- **Comma-separated fallback**: `item1,item2,item3` → `["item1", "item2", "item3"]`

### JSON Objects

- **Must be valid JSON**: `{"key": "value", "nested": {"key2": "value2"}}`
- **Quotes in CSV**: Escape with double quotes: `""fillColor""`
- **Example**: `"{""fillColor"": ""#FF0000""}"`

### Special Values

- **Empty string**: Convert to `null` if optional field
- **Null**: Optional fields with empty values become `null`
- **Arrays**: Empty string → `[]`

## Data Validation

The pipeline validates all data against Zod schemas defined in `src/lib/schemas.ts`:

- ✅ All required fields present
- ✅ Correct data types
- ✅ Valid enum values (e.g., `level: "continent"`)
- ✅ URL format validation
- ✅ Hex color format validation
- ✅ Nested object schemas (e.g., model metadata)

**Validation errors** will prevent the JSON file from being created. Check console output for specific error messages.

## Running the Pipeline

```bash
# Convert all CSV files to JSON and validate
python scripts/csv-to-json.py
```

**Output**:
```
============================================================
CSV-to-JSON Data Pipeline
============================================================

Phase 1: Converting CSV files to JSON...

✓ CSV directory: ./csv
✓ Output directory: ./public/data
✓ Converted capabilities.csv (4 records)
✓ Converted landmarks.csv (5 records)
✓ Converted organizations.csv (4 records)

Phase 2: Validating 3 JSON file(s)...

✓ Validated capabilities.json
✓ Validated landmarks.json
✓ Validated organizations.json

============================================================
Pipeline Results
============================================================

Converted: 3/3
  ✓ capabilities.json
  ✓ landmarks.json
  ✓ organizations.json

Validated: 3/3
  ✓ capabilities.json
  ✓ landmarks.json
  ✓ organizations.json

✅ All files converted and validated successfully!
============================================================
```

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `JSON parse error` | Invalid JSON in cell | Check quotes and syntax |
| `Cannot parse as number` | Non-numeric value in number field | Use digits only or empty |
| `Expected array at root` | JSON not in array format | Wrap in `[...]` brackets |
| `Missing required field 'id'` | Required column empty | Fill in all required fields |
| `Invalid hex color` | Color format wrong | Use format `#RRGGBB` |
| `Unknown entity type` | File name not recognized | Use `capabilities`, `landmarks`, or `organizations` |

## Tips for Spreadsheet Editing

### Google Sheets

1. **CSV Export**: File → Download → Comma Separated Values
2. **Multi-line cells**: Use Ctrl+Enter to add line breaks
3. **JSON cells**: Use "Paste special" → "Unformatted text" to avoid quotes

### Excel

1. **CSV Export**: File → Save As → CSV (Comma delimited)
2. **Large cells**: Double-click column separator to auto-fit width
3. **Special characters**: Ensure file encoding is UTF-8

### Tips

- Keep cells narrow for easier editing
- Use data validation for enum fields (level, type, etc.)
- Test JSON values before pasting (use jsonformatter.org)
- Create backups of CSV files before conversion
- Use version control (git) for data file tracking

## Testing the Pipeline

### Sample Data

Sample CSV files are provided in this directory for testing:

```bash
# Run pipeline with samples
python scripts/csv-to-json.py

# Check generated JSON
cat public/data/capabilities.json | head -20
```

### Manual Validation

```bash
# Test specific CSV file
python scripts/csv-to-json.py

# View generated JSON
jq . public/data/landmarks.json
```

## Support

For issues or questions about the CSV format, refer to:

- **Zod Schemas**: `src/lib/schemas.ts`
- **Type Definitions**: `src/types/data.ts`
- **Conversion Script**: `scripts/csv-to-json.py`

---

**Last Updated**: 2024
**Format Version**: 1.0
