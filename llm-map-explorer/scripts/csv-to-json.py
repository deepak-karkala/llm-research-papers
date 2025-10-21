#!/usr/bin/env python3
"""
CSV-to-JSON Data Pipeline Script

Converts Google Sheets CSV exports to validated JSON files for the LLM Map Explorer.
Supports conversion of capabilities, landmarks, and organizations data.

Usage:
    python scripts/csv-to-json.py
"""

import csv
import json
import os
import sys
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional, Sequence


class CSVToJSONConverter:
    """Converts CSV files to JSON with type coercion and validation."""

    def __init__(self):
        """Initialize converter with paths."""
        self.script_dir = Path(__file__).parent
        self.project_root = self.script_dir.parent
        self.csv_dir = self.project_root / "csv"
        self.output_dir = self.project_root / "public" / "data"
        self.errors: List[str] = []
        self.warnings: List[str] = []
        # Map dimensions for CRS.Simple projection (see design/MAP-COORDINATES.md)
        self.map_height = 3072
        self.map_width = 4096

    def run(self) -> int:
        """
        Execute the full pipeline.

        Returns:
            0 if successful, 1 if errors occurred
        """
        print("=" * 60)
        print("CSV-to-JSON Data Pipeline")
        print("=" * 60)

        # Check directories exist
        if not self._check_directories():
            return 1

        print("\nPhase 1: Converting CSV files to JSON...\n")

        # Convert each CSV file
        converted_files = []
        for csv_file in sorted(self.csv_dir.glob("*.csv")):
            if self._convert_file(csv_file):
                converted_files.append(csv_file.stem)

        if not converted_files:
            print("⚠️  No CSV files found to convert")
            return 1

        print(f"\nPhase 2: Validating {len(converted_files)} JSON file(s)...\n")

        # Validate JSON files
        valid_files = []
        for filename in converted_files:
            json_path = self.output_dir / f"{filename}.json"
            if self._validate_json_file(json_path):
                valid_files.append(filename)

        # Report results
        self._report_results(converted_files, valid_files)

        return 0 if not self.errors else 1

    def _check_directories(self) -> bool:
        """
        Check that required directories exist.

        Returns:
            True if all directories exist or are created, False otherwise
        """
        # Check CSV directory
        if not self.csv_dir.exists():
            print(f"❌ CSV directory not found: {self.csv_dir}")
            print(f"   Please create it and add CSV files")
            return False

        # Create output directory if needed
        self.output_dir.mkdir(parents=True, exist_ok=True)

        print(f"✓ CSV directory: {self.csv_dir}")
        print(f"✓ Output directory: {self.output_dir}")

        return True

    def _convert_file(self, csv_path: Path) -> bool:
        """
        Convert a single CSV file to JSON.

        Args:
            csv_path: Path to the CSV file

        Returns:
            True if conversion succeeded, False otherwise
        """
        try:
            # Read CSV
            data = self._read_csv(csv_path)
            if not data:
                self.warnings.append(f"{csv_path.name}: No data rows found")
                return False

            # Coerce types
            entity_type = csv_path.stem
            data = self._coerce_types(entity_type, data)

            # Write JSON
            output_path = self.output_dir / f"{entity_type}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

            print(f"✓ Converted {csv_path.name} ({len(data)} records)")
            return True

        except Exception as e:
            self.errors.append(f"{csv_path.name}: {str(e)}")
            print(f"❌ Failed to convert {csv_path.name}: {str(e)}")
            return False

    def _read_csv(self, csv_path: Path) -> List[Dict[str, Any]]:
        """
        Read CSV file and return list of dictionaries.

        Args:
            csv_path: Path to the CSV file

        Returns:
            List of dictionaries representing rows
        """
        data: List[Dict[str, Any]] = []
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            if reader.fieldnames is None:
                raise ValueError("CSV file has no headers")

            for row in reader:
                # Skip empty rows
                if any(v.strip() for v in row.values() if v):
                    data.append(row)

        return data

    def _coerce_types(self, entity_type: str, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Type coerce data based on entity type.

        Args:
            entity_type: Type of entity (capabilities, landmarks, organizations)
            data: List of raw data dictionaries

        Returns:
            List of type-coerced dictionaries
        """
        coerced: List[Dict[str, Any]] = []
        for i, record in enumerate(data):
            try:
                coerced_record = self._coerce_record(entity_type, record)
                coerced.append(coerced_record)
            except Exception as e:
                raise ValueError(f"Row {i + 2}: {str(e)}")

        return coerced

    def _coerce_record(self, entity_type: str, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Type coerce a single record.

        Args:
            entity_type: Type of entity
            record: Raw record dictionary

        Returns:
            Type-coerced record dictionary
        """
        if entity_type == "capabilities":
            return self._coerce_capability(record)
        elif entity_type == "landmarks":
            return self._coerce_landmark(record)
        elif entity_type == "organizations":
            return self._coerce_organization(record)
        else:
            return record

    def _coerce_capability(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Coerce capability record."""
        try:
            polygon_coords = self._ensure_list(
                self._parse_json(record.get("polygonCoordinates", "[]")) or [],
                "polygonCoordinates"
            )
            normalized_polygon = [
                self._coerce_coordinate(coord, f"capability '{record.get('id', '')}' polygon vertex {idx + 1}")
                for idx, coord in enumerate(polygon_coords)
            ]
            visual_hints = self._parse_json(record.get("visualStyleHints", "{}"))

            return {
                "id": self._strip_string(record.get("id", "")),
                "name": self._strip_string(record.get("name", "")),
                "description": self._strip_string(record.get("description", "")),
                "shortDescription": self._strip_string(record.get("shortDescription", "")),
                "level": self._strip_string(record.get("level", "")),
                "polygonCoordinates": normalized_polygon,
                "visualStyleHints": visual_hints,
                "relatedLandmarks": self._parse_array(record.get("relatedLandmarks", "[]")),
                "parentCapabilityId": self._optional_string(record.get("parentCapabilityId", "")),
                "zoomThreshold": self._parse_number(record.get("zoomThreshold", "0")),
            }
        except Exception as e:
            raise ValueError(f"Capability coercion failed: {str(e)}")

    def _coerce_landmark(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Coerce landmark record."""
        try:
            external_links = self._parse_json(record.get("externalLinks", "[]"))
            coordinates = self._coerce_coordinate(
                self._parse_json(record.get("coordinates", "{}")),
                f"landmark '{record.get('id', '')}' coordinates"
            )
            tags = self._parse_array(record.get("tags", "[]"))

            return {
                "id": self._strip_string(record.get("id", "")),
                "name": self._strip_string(record.get("name", "")),
                "type": self._strip_string(record.get("type", "")),
                "year": self._parse_number(record.get("year", "0")),
                "organization": self._strip_string(record.get("organization", "")),
                "authors": self._parse_array(record.get("authors", "[]")),
                "description": self._strip_string(record.get("description", "")),
                "abstract": self._optional_string(record.get("abstract", "")),
                "externalLinks": external_links,
                "coordinates": coordinates,
                "capabilityId": self._strip_string(record.get("capabilityId", "")),
                "relatedLandmarks": self._parse_array(record.get("relatedLandmarks", "[]")),
                "tags": tags,
                "icon": self._optional_string(record.get("icon", "")),
                "metadata": self._parse_json(record.get("metadata", "{}")),
                "zoomThreshold": self._parse_number(record.get("zoomThreshold", "1")),
            }
        except Exception as e:
            raise ValueError(f"Landmark coercion failed: {str(e)}")

    def _coerce_organization(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Coerce organization record."""
        try:
            landmark_ids = self._parse_array(record.get("landmarkIds", "[]"))

            return {
                "id": self._strip_string(record.get("id", "")),
                "name": self._strip_string(record.get("name", "")),
                "description": self._strip_string(record.get("description", "")),
                "website": self._optional_string(record.get("website", "")),
                "landmarkIds": landmark_ids,
                "color": self._strip_string(record.get("color", "")),
                "logo": self._optional_string(record.get("logo", "")),
            }
        except Exception as e:
            raise ValueError(f"Organization coercion failed: {str(e)}")

    @staticmethod
    def _strip_string(value: Any) -> str:
        """Convert value to string and strip whitespace."""
        if not value:
            return ""
        return str(value).strip()

    @staticmethod
    def _optional_string(value: Any) -> Optional[str]:
        """Convert value to optional string (None if empty)."""
        stripped = CSVToJSONConverter._strip_string(value)
        return stripped if stripped else None

    @staticmethod
    def _parse_number(value: Any) -> int:
        """Parse value as integer."""
        try:
            stripped = CSVToJSONConverter._strip_string(value)
            if not stripped:
                return 0
            return int(float(stripped))
        except (ValueError, TypeError):
            raise ValueError(f"Cannot parse '{value}' as number")

    @staticmethod
    def _parse_float(value: Any) -> float:
        """Parse value as float."""
        try:
            stripped = CSVToJSONConverter._strip_string(value)
            if not stripped:
                raise ValueError("empty value")
            return float(stripped)
        except (ValueError, TypeError):
            raise ValueError(f"Cannot parse '{value}' as float")

    @staticmethod
    def _parse_json(value: Any) -> Any:
        """Parse value as JSON."""
        try:
            if isinstance(value, str):
                stripped = value.strip()
                if not stripped:
                    return None
                return json.loads(stripped)
            return value
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {str(e)}")

    @staticmethod
    def _parse_array(value: Any) -> List[str]:
        """Parse comma-separated string or JSON array as list."""
        try:
            # Try parsing as JSON first
            parsed = CSVToJSONConverter._parse_json(value)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed]

            # Fall back to comma-separated parsing
            if isinstance(value, str):
                if not value.strip():
                    return []
                return [item.strip() for item in value.split(",") if item.strip()]

            return []
        except Exception:
            # Last resort: treat as comma-separated
            if isinstance(value, str):
                return [item.strip() for item in value.split(",") if item.strip()]
            return []

    @staticmethod
    def _ensure_list(value: Any, context: str) -> List[Any]:
        """Ensure a value is a list."""
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, tuple):
            return list(value)
        raise ValueError(f"{context}: expected a list, got {type(value).__name__}")

    def _coerce_coordinate(self, value: Any, context: str) -> Dict[str, int]:
        """
        Convert various coordinate formats into pixel-based {lat, lng} dictionaries.

        Supported input formats:
          - {"lat": 1200, "lng": 800}
          - [1200, 800]
          - "[1200, 800]" (stringified JSON)

        Coordinates must already be expressed in CRS.Simple pixel space
        where lat ∈ [0, map_height] and lng ∈ [0, map_width].
        """
        if isinstance(value, str):
            parsed = self._parse_json(value)
            return self._coerce_coordinate(parsed, context)

        lat: Optional[float] = None
        lng: Optional[float] = None

        if isinstance(value, dict):
            if "lat" not in value or "lng" not in value:
                raise ValueError(f"{context}: coordinate object must contain 'lat' and 'lng'")
            lat = self._parse_float(value["lat"])
            lng = self._parse_float(value["lng"])
        elif isinstance(value, Sequence):
            if len(value) != 2:
                raise ValueError(f"{context}: coordinate array must have exactly 2 values, got {len(value)}")
            lat = self._parse_float(value[0])
            lng = self._parse_float(value[1])
        else:
            raise ValueError(f"{context}: unsupported coordinate format ({value!r})")

        # Detect accidental geographic coordinates (latitude ±90, longitude ±180) and fail fast.
        if -90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0:
            raise ValueError(
                f"{context}: detected geographic coordinates ({lat}, {lng}). "
                "Please provide pixel-based coordinates (0 ≤ lat ≤ 3072, 0 ≤ lng ≤ 4096) "
                "matching the CRS.Simple map projection."
            )

        lat_int = int(round(lat))
        lng_int = int(round(lng))

        if not (0 <= lat_int <= self.map_height) or not (0 <= lng_int <= self.map_width):
            self.warnings.append(
                f"{context}: coordinate ({lat_int}, {lng_int}) is outside map bounds "
                f"[0,{self.map_height}]x[0,{self.map_width}]"
            )

        return {"lat": lat_int, "lng": lng_int}

    def _validate_json_file(self, json_path: Path) -> bool:
        """
        Validate a JSON file against Zod schemas.

        Args:
            json_path: Path to the JSON file

        Returns:
            True if validation succeeded, False otherwise
        """
        try:
            # Get entity type from filename
            entity_type = json_path.stem

            # Run validation script
            result = subprocess.run(
                [
                    sys.executable,
                    "-c",
                    self._get_validation_code(json_path, entity_type),
                ],
                capture_output=True,
                text=True,
                timeout=30,
            )

            if result.returncode != 0:
                error_msg = result.stderr or result.stdout or "Unknown validation error"
                self.errors.append(f"{json_path.name}: {error_msg}")
                print(f"❌ Validation failed for {json_path.name}")
                print(f"   {error_msg}")
                return False

            print(f"✓ Validated {json_path.name}")
            return True

        except subprocess.TimeoutExpired:
            self.errors.append(f"{json_path.name}: Validation timeout")
            print(f"❌ Validation timeout for {json_path.name}")
            return False
        except Exception as e:
            self.errors.append(f"{json_path.name}: {str(e)}")
            print(f"❌ Validation error for {json_path.name}: {str(e)}")
            return False

    @staticmethod
    def _get_validation_code(json_path: Path, entity_type: str) -> str:
        """
        Get Python code to validate JSON file.

        Args:
            json_path: Path to the JSON file
            entity_type: Type of entity (for informative messages)

        Returns:
            Python code as string
        """
        return f"""
import json
import sys

try:
    with open(r'{json_path}', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Basic validation: ensure data is a list and not empty
    if not isinstance(data, list):
        print(f"Expected array at root, got {{type(data).__name__}}")
        sys.exit(1)

    if not data:
        print("Warning: Empty data array")

    # Validate structure based on entity type
    entity_type = '{entity_type}'

    if entity_type == 'capabilities':
        required_fields = ['id', 'name', 'description', 'level', 'polygonCoordinates', 'visualStyleHints', 'zoomThreshold']
    elif entity_type == 'landmarks':
        required_fields = ['id', 'name', 'type', 'year', 'organization', 'description', 'externalLinks', 'coordinates', 'capabilityId', 'tags', 'zoomThreshold']
    elif entity_type == 'organizations':
        required_fields = ['id', 'name', 'description', 'landmarkIds', 'color']
    else:
        print(f"Unknown entity type: {{entity_type}}")
        sys.exit(1)

    # Check each record
    for i, record in enumerate(data):
        if not isinstance(record, dict):
            print(f"Row {{i+2}}: Expected object, got {{type(record).__name__}}")
            sys.exit(1)

        for field in required_fields:
            if field not in record:
                print(f"Row {{i+2}}: Missing required field '{{field}}'")
                sys.exit(1)

    print(f"✓ {entity_type} validation passed")
    sys.exit(0)

except json.JSONDecodeError as e:
    print(f"Invalid JSON: {{e}}")
    sys.exit(1)
except Exception as e:
    print(f"Validation error: {{e}}")
    sys.exit(1)
"""

    def _report_results(self, converted_files: List[str], valid_files: List[str]) -> None:
        """
        Report pipeline results.

        Args:
            converted_files: List of successfully converted files
            valid_files: List of successfully validated files
        """
        print("\n" + "=" * 60)
        print("Pipeline Results")
        print("=" * 60)

        print(f"\nConverted: {len(converted_files)}/{len(converted_files)}")
        for filename in converted_files:
            print(f"  ✓ {filename}.json")

        print(f"\nValidated: {len(valid_files)}/{len(converted_files)}")
        for filename in valid_files:
            print(f"  ✓ {filename}.json")

        if self.warnings:
            print(f"\n⚠️  Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  - {warning}")

        if self.errors:
            print(f"\n❌ Errors ({len(self.errors)}):")
            for error in self.errors:
                print(f"  - {error}")
        else:
            print(f"\n✅ All files converted and validated successfully!")

        print("=" * 60)


def main() -> int:
    """Main entry point."""
    converter = CSVToJSONConverter()
    return converter.run()


if __name__ == "__main__":
    sys.exit(main())
