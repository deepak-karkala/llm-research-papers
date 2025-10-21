# Map Coordinate System

This document outlines the coordinate system and display parameters for the base map image used in the LLM Map Explorer.

## Image Details

-   **Dimensions**: 4096px (width) × 3072px (height)
-   **File Path**: `/public/images/map-base.png`

## Leaflet Coordinate System

The map uses Leaflet's `CRS.Simple` coordinate system, which maps image pixels directly to map coordinates.

-   **Top-Left Origin**: `[0, 0]`
-   **Bottom-Right Bound**: `[3072, 4096]` (Leaflet uses `[height, width]`)

## Recommended MapContainer Settings

These settings should be used when initializing the Leaflet MapContainer component to ensure the map displays correctly.

-   **Bounds**: `[[0, 0], [3072, 4096]]`
-   **Default Center**: `[1536, 2048]` (the geometric center of the image)
-   **Zoom Levels**:
    -   `minZoom`: -1 (Allows zooming out to see the full map)
    -   `defaultZoom`: 0
    -   `maxZoom`: 2 (Allows for detailed magnification)

## CSV Authoring Guidelines

When curating capability or landmark data in the `/csv` files, all coordinates **must** already be expressed in the pixel space described above.

-   `lat` corresponds to the vertical pixel (0 at the top of the image, 3072 at the bottom).
-   `lng` corresponds to the horizontal pixel (0 at the left edge, 4096 at the right edge).
-   Provide coordinates as JSON values in the CSV: polygons use an array of `{ "lat": number, "lng": number }` objects; landmark points use a single `{ "lat": number, "lng": number }` object.
-   Geographic latitude/longitude pairs (e.g. 37.78, -122.41) are rejected by the pipeline because they do not match the fantasy map projection.
-   Keep values within bounds `0 ≤ lat ≤ 3072` and `0 ≤ lng ≤ 4096`; out-of-range coordinates are logged as warnings.

Example CSV cell for a polygon vertex list:

```
"[{""lat"":600,""lng"":800},{""lat"":600,""lng"":1600},{""lat"":1400,""lng"":1600},{""lat"":1400,""lng"":800}]"
```

## Pipeline Safeguards & Recent Fix

The CSV-to-JSON pipeline (`scripts/csv-to-json.py`) now normalizes coordinates and defends against incorrect geographic inputs.

-   `src/lib/data-normalizers.ts` ensures any coordinate loaded in the app is converted to `{lat, lng}` objects.
-   The pipeline converts CSV tuples or objects into the same pixel-based structure and refuses latitude/longitude pairs to prevent silent regressions (root cause of the missing polygons/markers bug).
-   Running `python3 scripts/csv-to-json.py` regenerates `public/data/*.json` and validates that all coordinates comply with the bounds above.
