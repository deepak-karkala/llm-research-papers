// src/components/map/MapViewer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, Polygon, Polyline } from 'react-leaflet'; // Added Polyline
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapFeature, SeaRoute } from '../../../types/data'; // Added SeaRoute
import InfoPanel from '../../ui/InfoPanel';
import SeaRouteDisplay from '../../routes/SeaRouteDisplay'; // Import SeaRouteDisplay

// Fix for default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Define custom icons
const lighthouseIcon = L.icon({
  iconUrl: '/icons/lighthouse.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const shipIcon = L.icon({
  iconUrl: '/icons/ship_icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Helper to parse string coordinates
const parseCoordinates = (coordsString: string | number[][]): L.LatLngExpression[] | L.LatLngExpression => {
  if (typeof coordsString === 'string') {
    try {
      const parsed = JSON.parse(coordsString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (Array.isArray(parsed[0]) && typeof parsed[0][0] === 'number') {
          return parsed as L.LatLngExpression[]; // Polygon
        } else if (typeof parsed[0] === 'number' && parsed.length === 2) {
          return [parsed[0], parsed[1]] as L.LatLngExpression; // Marker
        }
      }
    } catch (e) {
      console.error("Failed to parse coordinates", e, "Original string:", coordsString);
      return [];
    }
  } else if (Array.isArray(coordsString)) {
      if (coordsString.length > 0 && Array.isArray(coordsString[0])) {
          return coordsString as L.LatLngExpression[]; // Polygon
      } else if (coordsString.length === 2 && typeof coordsString[0] === 'number' && typeof coordsString[1] === 'number') {
          return coordsString as L.LatLngExpression; // Marker
      }
  }
  console.warn("Coordinates in unexpected format:", coordsString);
  return [];
};

const MapViewer: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [mapFeaturesData, setMapFeaturesData] = useState<MapFeature[]>([]);
  const [hoveredPolygon, setHoveredPolygon] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);
  
  const [allSeaRoutes, setAllSeaRoutes] = useState<SeaRoute[]>([]);
  const [selectedSeaRoute, setSelectedSeaRoute] = useState<SeaRoute | null>(null);
  const [currentRoutePolyline, setCurrentRoutePolyline] = useState<L.LatLngExpression[] | null>(null);

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      try {
        const mapFeaturesResponse = await fetch('/data/mapFeatures.json');
        if (!mapFeaturesResponse.ok) throw new Error('Failed to fetch map features');
        const mapFeatures = await mapFeaturesResponse.json();
        setMapFeaturesData(mapFeatures);

        const seaRoutesResponse = await fetch('/data/seaRoutes.json');
        if (!seaRoutesResponse.ok) throw new Error('Failed to fetch sea routes');
        const seaRoutes = await seaRoutesResponse.json();
        setAllSeaRoutes(seaRoutes);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSelectRoute = (routeId: string) => {
    const route = allSeaRoutes.find(r => r.id === routeId);
    if (route && mapFeaturesData.length > 0) {
      setSelectedFeature(null); // Clear selected feature
      setSelectedSeaRoute(route);
      const polylineCoords: L.LatLngExpression[] = route.stages
        .sort((a, b) => a.order - b.order)
        .map(stage => {
          const feature = mapFeaturesData.find(f => f.id === stage.islandID);
          if (feature) {
            const coords = parseCoordinates(feature.mapCoordinates);
            if (Array.isArray(coords) && Array.isArray(coords[0]) && typeof coords[0][0] === 'number') { // Polygon
              return coords[0] as L.LatLngExpression; // Use first point of polygon
            }
            return coords as L.LatLngExpression; // Assumes it's a point
          }
          return null;
        })
        .filter(c => c !== null) as L.LatLngExpression[];
      setCurrentRoutePolyline(polylineCoords.length > 1 ? polylineCoords : null);
    }
  };
  
  const handleFeatureClick = (feature: MapFeature) => {
    setSelectedFeature(feature);
    setCurrentRoutePolyline(null);
    setSelectedSeaRoute(null);
  };

  const handleCloseInfoPanel = () => {
    setSelectedFeature(null);
  };

  if (!isClient) {
    return null;
  }

  const bounds: L.LatLngBoundsLiteral = [[0,0], [1000,1000]];
  const mapContainerProps = {
    crs: L.CRS.Simple,
    bounds: bounds,
    center: [500, 500] as L.LatLngExpression,
    zoom: 0,
    style: { height: '100%', width: '100%', backgroundColor: '#ADD8E6' },
    minZoom: -2,
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {allSeaRoutes.length > 0 && (
        <div style={{ position: 'absolute', top: 10, left: 60, zIndex: 1001, background: 'white', padding: '5px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
          <button onClick={() => handleSelectRoute(allSeaRoutes[0].id)} title={allSeaRoutes[0].description || allSeaRoutes[0].routeName}>
            Load Route: {allSeaRoutes[0].routeName}
          </button>
          {/* Later, map allSeaRoutes to buttons or a <select> */}
        </div>
      )}

      <MapContainer {...mapContainerProps}>
        <ImageOverlay
          url="/images/base_map_parchment_placeholder.png"
          bounds={bounds}
        />

        {mapFeaturesData.map((feature) => {
          const featureType = feature.type;
          const coordinates = parseCoordinates(feature.mapCoordinates);

          if (featureType === "capability" || featureType === "continent" || featureType === "archipelago" || featureType === "island" || featureType === "strait" || featureType === "harbor") {
            if (!Array.isArray(coordinates) || coordinates.length === 0 || !Array.isArray(coordinates[0]) || (Array.isArray(coordinates[0]) && coordinates[0].length === 0) ) {
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
                  click: () => handleFeatureClick(feature)
                }}
              >
                <Popup>{feature.name}</Popup>
              </Polygon>
            );
          } else if (featureType === "landmark_paper" || featureType === "foundational_model" || featureType === "key_tool" || featureType === "benchmark_site") {
            if (!Array.isArray(coordinates) || coordinates.length !== 2 || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
              return null;
            }
            let currentIcon;
            if (feature.iconType === 'lighthouse') currentIcon = lighthouseIcon;
            else if (feature.iconType === 'ship_icon' || feature.type === 'foundational_model') currentIcon = shipIcon;
            
            return (
              <Marker 
                key={feature.id} 
                position={coordinates as L.LatLngExpression}
                icon={currentIcon}
                eventHandlers={{ click: () => handleFeatureClick(feature) }}
              >
                <Popup><b>{feature.name}</b><br />{feature.description}</Popup>
              </Marker>
            );
          }
          return null;
        })}

        {currentRoutePolyline && (
          <Polyline positions={currentRoutePolyline} color="coral" weight={4} dashArray="5, 10" />
        )}
      </MapContainer>

      <InfoPanel feature={selectedFeature} onClose={handleCloseInfoPanel} />

      {selectedSeaRoute && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 1000 }}> 
          <SeaRouteDisplay route={selectedSeaRoute} mapFeatures={mapFeaturesData} />
          {/* onStageClick could be added later: onStageClick={handleStageClick} */}
        </div>
      )}
    </div>
  );
};

export default MapViewer;
