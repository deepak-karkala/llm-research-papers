# Issue #21: CSV-to-JSON Data Pipeline Script

**Sprint:** Sprint 3 (Week 5-6)

**Story Points:** 4

**Priority:** P1

**Labels:** tooling, data-pipeline

**Dependencies:** #5

**Reference:** [prd.md Section 7](../prd.md)

---

## Title

Create CSV-to-JSON data pipeline script

---

## Description

Automate conversion of Google Sheets CSV exports to validated JSON files. This enables content curators to maintain data in Google Sheets and quickly export to the application without manual JSON editing.

---

## Acceptance Criteria

- [ ] `scripts/csv-to-json.py` Python script created
- [ ] Script reads CSV files from `/csv/` directory
- [ ] Converts CSV data to JSON with proper type coercion
- [ ] Validates output against Zod schemas via Node.js subprocess
- [ ] Outputs validated JSON to `/public/data/` directory
- [ ] Script handles errors gracefully with clear messages
- [ ] README.md documents CSV-to-JSON workflow
- [ ] Sample CSV files created for testing (capabilities, landmarks, organizations)

---

## Workflow Overview

### User Flow

1. **Create/Update Data in Google Sheets**
   - Maintain data in Google Sheets with proper structure
   - Export sheets as CSV files
   - Place CSV files in `/csv/` directory

2. **Run Pipeline Script**
   ```bash
   python scripts/csv-to-json.py
   ```

3. **Validation**
   - Script validates CSV format
   - Converts to JSON with type coercion
   - Validates JSON against Zod schemas
   - Reports errors with clear messages

4. **Output**
   - Valid JSON written to `/public/data/`
   - Failures prevent file output

---

## Script Architecture

### Input: CSV Structure

#### capabilities.csv

```csv
id,name,description,level,polygonCoordinates,visualStyleHints,parentCapabilityId
cap-001,Attention Mechanisms,"Study of attention and self-attention patterns...",continent,"[[0,0],[100,50],[100,150],[0,150]]","{'fillColor': '#FF6B6B', 'fillOpacity': 0.4}",
cap-002,Transformers,"Foundation of modern LLMs...",archipelago,"[[0,0],[50,25],[50,75],[0,50]]","{'fillColor': '#4ECDC4', 'fillOpacity': 0.4}",cap-001
```

#### landmarks.csv

```csv
id,name,type,year,organization,description,abstract,externalLinks,coordinates,capabilityId,tags
lm-001,Attention Is All You Need,paper,2017,Google DeepMind,"Introduced the Transformer architecture...","The dominant sequence transduction models...","[{'url': 'https://arxiv.org/abs/1706.03762', 'label': 'arXiv'}]","[100, 50]",cap-001,"transformer,attention,sequence-to-sequence"
lm-002,GPT-2,model,2019,OpenAI,"Language model trained on WebText dataset...","We've trained a large-scale unsupervised...","[{'url': 'https://arxiv.org/abs/1902.10165', 'label': 'arXiv'}]","[120, 60]",cap-002,"language-model,generation"
```

#### organizations.csv

```csv
id,name,description,website,landmarkIds,color,logo
org-001,OpenAI,"AI research lab focused on LLMs...",https://openai.com,"lm-001,lm-002,lm-005",#10A37F,https://example.com/logo.png
org-002,Google DeepMind,"AI research division of Google...",https://deepmind.google,"lm-001,lm-003",#4285F4,
```

---

## Python Script Implementation

### Script Structure

```python
#!/usr/bin/env python3
# scripts/csv-to-json.py

import csv
import json
import os
import sys
import subprocess
from pathlib import Path
from typing import List, Dict, Any

class CSVToJSONConverter:
    def __init__(self):
        self.csv_dir = Path('./csv')
        self.output_dir = Path('./public/data')
        self.errors = []

    def run(self):
        """Execute full pipeline"""
        print("Starting CSV-to-JSON conversion...")

        # Convert each CSV file
        for csv_file in self.csv_dir.glob('*.csv'):
            self.convert_file(csv_file)

        # Validate JSON files
        self.validate_json_files()

        # Report results
        self.report_results()

    def convert_file(self, csv_path: Path) -> None:
        """Convert single CSV to JSON"""
        try:
            data = self.read_csv(csv_path)
            data = self.coerce_types(csv_path.stem, data)

            output_path = self.output_dir / f"{csv_path.stem}.json"
            with open(output_path, 'w') as f:
                json.dump(data, f, indent=2)

            print(f"✓ Converted {csv_path.name}")
        except Exception as e:
            self.errors.append(f"Failed to convert {csv_path.name}: {str(e)}")

    def read_csv(self, csv_path: Path) -> List[Dict[str, Any]]:
        """Read CSV file and return list of dictionaries"""
        data = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Skip empty rows
                if any(v.strip() for v in row.values()):
                    data.append(row)
        return data

    def coerce_types(self, entity_type: str, data: List[Dict]) -> List[Dict]:
        """Type coercion based on entity type"""
        coerced = []
        for record in data:
            coerced_record = self.coerce_record(entity_type, record)
            coerced.append(coerced_record)
        return coerced

    def coerce_record(self, entity_type: str, record: Dict) -> Dict:
        """Type coerce single record"""
        if entity_type == 'capabilities':
            return {
                'id': record['id'].strip(),
                'name': record['name'].strip(),
                'description': record['description'].strip(),
                'level': record['level'].strip(),
                'polygonCoordinates': json.loads(record['polygonCoordinates']),
                'visualStyleHints': json.loads(record['visualStyleHints']),
                'parentCapabilityId': record['parentCapabilityId'].strip() or None
            }
        elif entity_type == 'landmarks':
            return {
                'id': record['id'].strip(),
                'name': record['name'].strip(),
                'type': record['type'].strip(),
                'year': int(record['year']) if record['year'].strip() else None,
                'organization': record['organization'].strip() or None,
                'description': record['description'].strip(),
                'abstract': record['abstract'].strip() or None,
                'externalLinks': json.loads(record['externalLinks']),
                'coordinates': json.loads(record['coordinates']),
                'capabilityId': record['capabilityId'].strip(),
                'tags': record['tags'].split(',')
            }
        elif entity_type == 'organizations':
            return {
                'id': record['id'].strip(),
                'name': record['name'].strip(),
                'description': record['description'].strip(),
                'website': record['website'].strip(),
                'landmarkIds': [id.strip() for id in record['landmarkIds'].split(',')],
                'color': record['color'].strip(),
                'logo': record['logo'].strip() or None
            }
        return record

    def validate_json_files(self) -> None:
        """Validate JSON files against Zod schemas"""
        print("\nValidating JSON files...")

        for json_file in self.output_dir.glob('*.json'):
            try:
                # Call Node.js validation script
                result = subprocess.run(
                    [
                        'node',
                        'scripts/validate-json.js',
                        str(json_file)
                    ],
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                if result.returncode != 0:
                    self.errors.append(f"Validation failed for {json_file.name}: {result.stderr}")
                else:
                    print(f"✓ Validated {json_file.name}")
            except subprocess.TimeoutExpired:
                self.errors.append(f"Validation timeout for {json_file.name}")
            except Exception as e:
                self.errors.append(f"Validation error for {json_file.name}: {str(e)}")

    def report_results(self) -> None:
        """Report conversion results"""
        print("\n" + "="*50)
        if not self.errors:
            print("✓ All files converted and validated successfully!")
            sys.exit(0)
        else:
            print(f"✗ Conversion completed with {len(self.errors)} error(s):")
            for error in self.errors:
                print(f"  - {error}")
            sys.exit(1)

if __name__ == '__main__':
    converter = CSVToJSONConverter()
    converter.run()
```

---

## Validation Script

### Node.js Validation Script

```typescript
// scripts/validate-json.js
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Import schemas
import {
  capabilitySchema,
  landmarkSchema,
  organizationSchema
} from '../src/lib/schemas.js';

const schemas = {
  capabilities: z.array(capabilitySchema),
  landmarks: z.array(landmarkSchema),
  organizations: z.array(organizationSchema)
};

const jsonFile = process.argv[2];

try {
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  const filename = path.basename(jsonFile, '.json');
  const schema = schemas[filename];

  if (!schema) {
    console.error(`Unknown schema for ${filename}`);
    process.exit(1);
  }

  schema.parse(data);
  console.log(`✓ ${filename} is valid`);
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
```

---

## Sample CSV Files

### Sample Directory Structure

```
csv/
  ├── capabilities.csv
  ├── landmarks.csv
  └── organizations.csv
```

### Create sample files with 2-3 records each for testing

---

## Documentation

### README Update

Add section to project README:

```markdown
## Data Pipeline

### CSV to JSON Conversion

Maintain map data in Google Sheets and export as CSV files:

1. **Export from Google Sheets:**
   - File → Download → CSV (.csv)
   - Save to `csv/` directory

2. **Run Pipeline:**
   ```bash
   python scripts/csv-to-json.py
   ```

3. **Verify Output:**
   - Check `public/data/` for updated JSON files
   - Review validation messages in terminal

### CSV Column Requirements

See `csv/README.md` for detailed column specifications for each entity type.
```

---

## Error Handling

### Common Errors

| Error | Solution |
|---|---|
| CSV file not found | Ensure file in `/csv/` directory |
| JSON parse error | Check JSON syntax in CSV columns |
| Type coercion failed | Verify data types match schema |
| Validation failed | Check Zod schema requirements |

### Error Messages

```
✗ Conversion completed with 1 error(s):
  - Failed to convert landmarks.csv: Expected number for year, got 'invalid'

✗ Conversion completed with 1 error(s):
  - Validation failed for landmarks.json: externalLinks is not an array
```

---

## Testing Requirements

### Unit Tests

- Test CSV reading and parsing
- Test type coercion for each entity type
- Test JSON file output
- Test error handling for invalid CSV

### Integration Tests

- Test full pipeline: CSV → JSON → Validation
- Test sample CSV files convert successfully
- Test validation catches schema mismatches

### Manual Testing

- Create test CSV files
- Run pipeline
- Verify JSON output is valid and usable in app
- Test with app's useDataLoader hook (#20)

---

## Dependencies

- Depends on: Issue #5 (Zod schemas)
- Required for: Efficient data maintenance workflow

---

## Technology Stack

- **Language:** Python 3.8+
- **Validation:** Node.js with Zod (existing validation)
- **Format:** CSV (standard spreadsheet export) → JSON

---

## File Locations

```
Pipeline script: scripts/csv-to-json.py
Validation script: scripts/validate-json.js
Input CSV files: csv/
Output JSON files: public/data/
Documentation: csv/README.md
Sample data: csv/*.csv (for testing)
```

---

## Performance Notes

- Pipeline should complete in <5 seconds for typical datasets
- CSV files should not exceed 10MB
- JSON output should be <5MB gzipped

---

## Future Enhancements

- Watch mode: automatically convert on CSV file changes
- Google Sheets integration: direct API sync
- Data versioning: track changes over time
- Spreadsheet templates: pre-formatted for curators
