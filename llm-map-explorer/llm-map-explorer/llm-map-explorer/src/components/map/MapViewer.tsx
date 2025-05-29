// src/components/map/MapViewer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, Polygon } from 'react-leaflet'; // Added Polygon
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapFeature } from '../../../types/data'; // Adjust path as needed

// Fix for default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper to parse string coordinates
const parseCoordinates = (coordsString: string | number[][]): L.LatLngExpression[] | L.LatLngExpression => {
  if (typeof coordsString === 'string') {
    try {
      const parsed = JSON.parse(coordsString);
      // For polygons, ensure it's an array of arrays of numbers
      // For markers, ensure it's an array of two numbers
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (Array.isArray(parsed[0]) && typeof parsed[0][0] === 'number') { // Likely polygon
          return parsed as L.LatLngExpression[];
        } else if (typeof parsed[0] === 'number' && parsed.length === 2) { // Likely marker
          return [parsed[0], parsed[1]] as L.LatLngExpression;
        }
      }
    } catch (e) {
      console.error("Failed to parse coordinates", e, "Original string:", coordsString);
      return []; // Return empty or default for safety
    }
  } else if (Array.isArray(coordsString)) { // Already in correct format (e.g. number[][] for polygon or number[] for marker)
      // Check if it's for a polygon (array of arrays) or marker (array of numbers)
      if (coordsString.length > 0 && Array.isArray(coordsString[0])) {
          return coordsString as L.LatLngExpression[]; // Polygon
      } else if (coordsString.length === 2 && typeof coordsString[0] === 'number' && typeof coordsString[1] === 'number') {
          return coordsString as L.LatLngExpression; // Marker
      }
  }
  console.warn("Coordinates in unexpected format:", coordsString);
  return []; // Default for unexpected format
};


const MapViewer: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [mapFeaturesData, setMapFeaturesData] = useState<MapFeature[]>([]);
  const [hoveredPolygon, setHoveredPolygon] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      try {
        const response = await fetch('/data/mapFeatures.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch map features: ${response.statusText}`);
        }
        const data = await response.json();
        setMapFeaturesData(data);
      } catch (error) {
        console.error("Error fetching map features:", error);
      }
    };
    fetchData();
  }, []);

  if (!isClient) {
    return null;
  }

  const bounds: L.LatLngBoundsLiteral = [[0,0], [1000,1000]];

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      center={[500, 500]}
      zoom={0}
      style={{ height: '100vh', width: '100%', backgroundColor: '#ADD8E6' }}
      minZoom={-2}
    >
      <ImageOverlay
        url="/images/base_map_parchment_placeholder.png" // Ensure this placeholder exists
        bounds={bounds}
      />

      {mapFeaturesData.map((feature) => {
        const featureType = feature.type;
        const coordinates = parseCoordinates(feature.mapCoordinates);

        if (featureType === "capability" || featureType === "continent" || featureType === "archipelago" || featureType === "island" || featureType === "strait" || featureType === "harbor") {
          // Ensure coordinates is LatLngExpression[][] for Polygon
          if (!Array.isArray(coordinates) || coordinates.length === 0 || !Array.isArray(coordinates[0])) {
            console.warn(`Skipping polygon feature due to invalid coordinates: ${feature.name}`, feature.mapCoordinates);
            return null;
          }
          return (
            <Polygon
              key={feature.id}
              positions={coordinates as L.LatLngExpression[]}
              pathOptions={{ 
                color: 'blue', 
                fillColor: 'lightblue', 
                fillOpacity: hoveredPolygon === feature.id ? 0.7 : 0.4 
              }}
              eventHandlers={{
                mouseover: () => setHoveredPolygon(feature.id),
                mouseout: () => setHoveredPolygon(null),
              }}
            >
              <Popup>{feature.name}</Popup>
            </Polygon>
          );
        } else if (featureType === "landmark_paper" || featureType === "foundational_model" || featureType === "key_tool" || featureType === "benchmark_site") {
          // Ensure coordinates is LatLngExpression for Marker
          if (!Array.isArray(coordinates) || coordinates.length !== 2 || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
             console.warn(`Skipping marker feature due to invalid coordinates: ${feature.name}`, feature.mapCoordinates);
            return null;
          }
          return (
            <Marker key={feature.id} position={coordinates as L.LatLngExpression}>
              <Popup>
                <b>{feature.name}</b><br />
                {feature.description}
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default MapViewer;
