#!/usr/bin/env python3
"""
Unit tests for CSV-to-JSON converter script.

Run with:
    python -m pytest scripts/__tests__/csv-to-json.test.py -v
"""

import json
import tempfile
import pytest
from pathlib import Path
from csv import DictWriter
from typing import Dict, Any, List

# Import the converter
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from csv_to_json import CSVToJSONConverter


class TestCSVToJSONConverter:
    """Test suite for CSVToJSONConverter."""

    @pytest.fixture
    def converter(self):
        """Create a converter instance with temporary directories."""
        converter = CSVToJSONConverter()
        with tempfile.TemporaryDirectory() as tmpdir:
            converter.csv_dir = Path(tmpdir) / "csv"
            converter.output_dir = Path(tmpdir) / "data"
            converter.csv_dir.mkdir()
            converter.output_dir.mkdir()
            yield converter

    def create_csv_file(self, converter: CSVToJSONConverter, filename: str, data: List[Dict[str, Any]]) -> Path:
        """Helper to create a CSV file with data."""
        if not data:
            return None

        csv_path = converter.csv_dir / filename
        fieldnames = list(data[0].keys())

        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)

        return csv_path

    # String coercion tests
    def test_strip_string(self):
        """Test string stripping."""
        assert CSVToJSONConverter._strip_string("  hello  ") == "hello"
        assert CSVToJSONConverter._strip_string("") == ""
        assert CSVToJSONConverter._strip_string(None) == ""
        assert CSVToJSONConverter._strip_string(123) == "123"

    def test_optional_string(self):
        """Test optional string conversion."""
        assert CSVToJSONConverter._optional_string("  hello  ") == "hello"
        assert CSVToJSONConverter._optional_string("") is None
        assert CSVToJSONConverter._optional_string(None) is None
        assert CSVToJSONConverter._optional_string("  ") is None

    # Number parsing tests
    def test_parse_number_valid(self):
        """Test valid number parsing."""
        assert CSVToJSONConverter._parse_number("123") == 123
        assert CSVToJSONConverter._parse_number("123.456") == 123
        assert CSVToJSONConverter._parse_number("-42") == -42
        assert CSVToJSONConverter._parse_number("0") == 0

    def test_parse_number_empty(self):
        """Test empty string returns 0."""
        assert CSVToJSONConverter._parse_number("") == 0
        assert CSVToJSONConverter._parse_number("  ") == 0

    def test_parse_number_invalid(self):
        """Test invalid number raises error."""
        with pytest.raises(ValueError):
            CSVToJSONConverter._parse_number("invalid")
        with pytest.raises(ValueError):
            CSVToJSONConverter._parse_number("12.34.56")

    # JSON parsing tests
    def test_parse_json_valid_array(self):
        """Test parsing valid JSON array."""
        result = CSVToJSONConverter._parse_json('["a", "b", "c"]')
        assert result == ["a", "b", "c"]

    def test_parse_json_valid_object(self):
        """Test parsing valid JSON object."""
        result = CSVToJSONConverter._parse_json('{"key": "value"}')
        assert result == {"key": "value"}

    def test_parse_json_empty_string(self):
        """Test empty string returns None."""
        assert CSVToJSONConverter._parse_json("") is None
        assert CSVToJSONConverter._parse_json("  ") is None

    def test_parse_json_invalid(self):
        """Test invalid JSON raises error."""
        with pytest.raises(ValueError):
            CSVToJSONConverter._parse_json("{invalid json}")

    # Array parsing tests
    def test_parse_array_json(self):
        """Test parsing JSON array."""
        result = CSVToJSONConverter._parse_array('["item1", "item2"]')
        assert result == ["item1", "item2"]

    def test_parse_array_comma_separated(self):
        """Test parsing comma-separated string."""
        result = CSVToJSONConverter._parse_array("item1,item2,item3")
        assert result == ["item1", "item2", "item3"]

    def test_parse_array_with_spaces(self):
        """Test parsing with spaces around commas."""
        result = CSVToJSONConverter._parse_array("item1 , item2 , item3")
        assert result == ["item1", "item2", "item3"]

    def test_parse_array_empty(self):
        """Test parsing empty array."""
        assert CSVToJSONConverter._parse_array("") == []
        assert CSVToJSONConverter._parse_array("[]") == []
        assert CSVToJSONConverter._parse_array(None) == []

    # Capability coercion tests
    def test_coerce_capability_valid(self):
        """Test capability coercion with valid data."""
        record = {
            "id": "cap-001",
            "name": "Test Capability",
            "description": "A test capability",
            "shortDescription": "Test",
            "level": "continent",
            "polygonCoordinates": "[[0, 0], [1, 1]]",
            "visualStyleHints": '{"fillColor": "#FF0000", "fillOpacity": 0.5, "strokeColor": "#000000", "strokeWeight": 2}',
            "relatedLandmarks": "lm-001,lm-002",
            "parentCapabilityId": "",
            "zoomThreshold": "0",
        }

        result = CSVToJSONConverter()._coerce_capability(record)

        assert result["id"] == "cap-001"
        assert result["name"] == "Test Capability"
        assert result["level"] == "continent"
        assert result["polygonCoordinates"] == [[0, 0], [1, 1]]
        assert result["visualStyleHints"]["fillColor"] == "#FF0000"
        assert result["relatedLandmarks"] == ["lm-001", "lm-002"]
        assert result["parentCapabilityId"] is None
        assert result["zoomThreshold"] == 0

    def test_coerce_capability_missing_field(self):
        """Test capability coercion with missing required field."""
        record = {
            "id": "cap-001",
            # Missing other fields
        }

        with pytest.raises(ValueError):
            CSVToJSONConverter()._coerce_capability(record)

    # Landmark coercion tests
    def test_coerce_landmark_paper(self):
        """Test landmark coercion for paper."""
        record = {
            "id": "lm-001",
            "name": "Test Paper",
            "type": "paper",
            "year": "2023",
            "organization": "Test Org",
            "authors": "Author1,Author2",
            "description": "A test paper",
            "abstract": "Abstract text",
            "externalLinks": '[{"type": "arxiv", "url": "https://arxiv.org/abs/123", "label": "arXiv"}]',
            "coordinates": "[0, 0]",
            "capabilityId": "cap-001",
            "relatedLandmarks": "lm-002",
            "tags": "tag1,tag2",
            "icon": "📄",
            "metadata": "{}",
            "zoomThreshold": "0",
        }

        result = CSVToJSONConverter()._coerce_landmark(record)

        assert result["id"] == "lm-001"
        assert result["name"] == "Test Paper"
        assert result["type"] == "paper"
        assert result["year"] == 2023
        assert result["authors"] == ["Author1", "Author2"]
        assert result["tags"] == ["tag1", "tag2"]
        assert isinstance(result["externalLinks"], list)

    def test_coerce_landmark_model(self):
        """Test landmark coercion for model."""
        record = {
            "id": "lm-002",
            "name": "Test Model",
            "type": "model",
            "year": "2023",
            "organization": "Test Org",
            "authors": "",
            "description": "A test model",
            "abstract": "",
            "externalLinks": "[]",
            "coordinates": "[0, 0]",
            "capabilityId": "cap-001",
            "relatedLandmarks": "",
            "tags": "model",
            "icon": "🤖",
            "metadata": '{"parameters": "1B", "architecture": "Transformer"}',
            "zoomThreshold": "1",
        }

        result = CSVToJSONConverter()._coerce_landmark(record)

        assert result["type"] == "model"
        assert result["authors"] == []
        assert result["metadata"]["parameters"] == "1B"

    # Organization coercion tests
    def test_coerce_organization_valid(self):
        """Test organization coercion with valid data."""
        record = {
            "id": "org-001",
            "name": "Test Org",
            "description": "A test organization",
            "website": "https://example.com",
            "landmarkIds": "lm-001,lm-002",
            "color": "#FF0000",
            "logo": "https://example.com/logo.png",
        }

        result = CSVToJSONConverter()._coerce_organization(record)

        assert result["id"] == "org-001"
        assert result["name"] == "Test Org"
        assert result["landmarkIds"] == ["lm-001", "lm-002"]
        assert result["color"] == "#FF0000"
        assert result["logo"] == "https://example.com/logo.png"

    def test_coerce_organization_optional_fields(self):
        """Test organization coercion with optional fields empty."""
        record = {
            "id": "org-002",
            "name": "Test Org 2",
            "description": "Another organization",
            "website": "",
            "landmarkIds": "",
            "color": "#0000FF",
            "logo": "",
        }

        result = CSVToJSONConverter()._coerce_organization(record)

        assert result["website"] is None
        assert result["logo"] is None
        assert result["landmarkIds"] == []

    # CSV reading tests
    def test_read_csv_valid(self, converter):
        """Test reading valid CSV file."""
        data = [
            {"id": "1", "name": "Item 1"},
            {"id": "2", "name": "Item 2"},
        ]
        csv_path = self.create_csv_file(converter, "test.csv", data)

        result = converter._read_csv(csv_path)

        assert len(result) == 2
        assert result[0]["id"] == "1"
        assert result[1]["name"] == "Item 2"

    def test_read_csv_skip_empty_rows(self, converter):
        """Test that empty rows are skipped."""
        with open(converter.csv_dir / "test.csv", "w") as f:
            f.write("id,name\n")
            f.write("1,Item 1\n")
            f.write(",,\n")  # Empty row
            f.write("2,Item 2\n")

        result = converter._read_csv(converter.csv_dir / "test.csv")

        assert len(result) == 2
        assert result[0]["id"] == "1"
        assert result[1]["id"] == "2"

    def test_read_csv_no_headers(self, converter):
        """Test reading CSV with no headers raises error."""
        with open(converter.csv_dir / "test.csv", "w") as f:
            f.write("")

        with pytest.raises(ValueError):
            converter._read_csv(converter.csv_dir / "test.csv")

    # Type coercion tests
    def test_coerce_types_capabilities(self, converter):
        """Test type coercion for capabilities."""
        data = [
            {
                "id": "cap-001",
                "name": "Test",
                "description": "Test",
                "shortDescription": "Test",
                "level": "continent",
                "polygonCoordinates": "[[0, 0]]",
                "visualStyleHints": '{"fillColor": "#FF0000", "fillOpacity": 0.5, "strokeColor": "#000000", "strokeWeight": 2}',
                "relatedLandmarks": "",
                "parentCapabilityId": "",
                "zoomThreshold": "0",
            }
        ]

        result = converter._coerce_types("capabilities", data)

        assert len(result) == 1
        assert result[0]["id"] == "cap-001"
        assert isinstance(result[0]["polygonCoordinates"], list)

    def test_coerce_types_invalid_entity(self, converter):
        """Test coerce types with unknown entity type."""
        data = [{"id": "test"}]
        result = converter._coerce_types("unknown", data)

        # Should return unmodified records for unknown type
        assert result[0]["id"] == "test"

    # Full pipeline tests
    def test_full_conversion_pipeline(self, converter):
        """Test full conversion pipeline."""
        capabilities_data = [
            {
                "id": "cap-001",
                "name": "Test",
                "description": "Test",
                "shortDescription": "Test",
                "level": "continent",
                "polygonCoordinates": "[[0, 0]]",
                "visualStyleHints": '{"fillColor": "#FF0000", "fillOpacity": 0.5, "strokeColor": "#000000", "strokeWeight": 2}',
                "relatedLandmarks": "",
                "parentCapabilityId": "",
                "zoomThreshold": "0",
            }
        ]

        self.create_csv_file(converter, "capabilities.csv", capabilities_data)

        # Run conversion
        result = converter._convert_file(converter.csv_dir / "capabilities.csv")

        assert result is True
        assert (converter.output_dir / "capabilities.json").exists()

        # Verify output JSON
        with open(converter.output_dir / "capabilities.json") as f:
            output_data = json.load(f)

        assert isinstance(output_data, list)
        assert len(output_data) == 1
        assert output_data[0]["id"] == "cap-001"

    def test_conversion_error_handling(self, converter):
        """Test error handling during conversion."""
        invalid_data = [
            {
                "id": "cap-001",
                "name": "Test",
                # Missing required fields
            }
        ]

        self.create_csv_file(converter, "capabilities.csv", invalid_data)

        # Conversion should fail and add to errors
        result = converter._convert_file(converter.csv_dir / "capabilities.csv")

        assert result is False
        assert len(converter.errors) > 0

    def test_validation_code_generation(self):
        """Test validation code generation."""
        with tempfile.NamedTemporaryFile(suffix=".json") as f:
            code = CSVToJSONConverter._get_validation_code(Path(f.name), "organizations")

            # Should contain the file path and entity type
            assert f.name in code
            assert "organizations" in code
            assert "json.load" in code


class TestCSVToJSONConverterIntegration:
    """Integration tests for CSV to JSON converter."""

    def test_converter_initialization(self):
        """Test converter initialization."""
        converter = CSVToJSONConverter()

        assert converter.csv_dir.name == "csv"
        assert converter.output_dir.name == "data"
        assert converter.errors == []
        assert converter.warnings == []

    def test_check_directories(self):
        """Test directory checking."""
        with tempfile.TemporaryDirectory() as tmpdir:
            converter = CSVToJSONConverter()
            converter.csv_dir = Path(tmpdir) / "csv"
            converter.output_dir = Path(tmpdir) / "data"

            # Create CSV dir
            converter.csv_dir.mkdir()

            # Should create output directory
            result = converter._check_directories()

            assert result is True
            assert converter.output_dir.exists()

    def test_missing_csv_directory(self):
        """Test error when CSV directory doesn't exist."""
        with tempfile.TemporaryDirectory() as tmpdir:
            converter = CSVToJSONConverter()
            converter.csv_dir = Path(tmpdir) / "nonexistent"
            converter.output_dir = Path(tmpdir) / "data"

            result = converter._check_directories()

            assert result is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
