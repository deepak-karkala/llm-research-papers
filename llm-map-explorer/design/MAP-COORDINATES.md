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
