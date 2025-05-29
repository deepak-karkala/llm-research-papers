// src/components/map/MapViewer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapFeature, SeaRoute, SeaRouteStage, TimelineEvent } from '../../types/data';
import InfoPanel from '../../ui/InfoPanel';
import SeaRouteDisplay from '../../routes/SeaRouteDisplay';
import MapEffectController from './MapEffectController';
import Legend from '../ui/Legend'; // Import Legend

// Define props for MapViewer
interface MapViewerProps {
  timelineEventToFocus?: TimelineEvent | null;
  onClearTimelineEventFocus?: () => void;
}

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
const parseCoordinates = (coordsInput: string | number[] | number[][]): L.LatLngExpression[] | L.LatLngExpression => {
  if (typeof coordsInput === 'string') {
    try {
      const parsed = JSON.parse(coordsInput);
      return parseCoordinates(parsed);
    } catch (e) {
      console.error("Failed to parse coordinate string", e, "Original string:", coordsInput);
      return [];
    }
  } else if (Array.isArray(coordsInput)) {
    if (coordsInput.length === 0) return [];
    if (Array.isArray(coordsInput[0]) && typeof coordsInput[0][0] === 'number') {
      return coordsInput as L.LatLngExpression[];
    } else if (typeof coordsInput[0] === 'number' && coordsInput.length === 2) {
      return [coordsInput[0], coordsInput[1]] as L.LatLngExpression;
    }
  }
  console.warn("Coordinates in unexpected format:", coordsInput);
  return [];
};


const MapViewer: React.FC<MapViewerProps> = ({ timelineEventToFocus, onClearTimelineEventFocus }) => {
  const [isClient, setIsClient] = useState(false);
  const [mapFeaturesData, setMapFeaturesData] = useState<MapFeature[]>([]);
  const [hoveredPolygon, setHoveredPolygon] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);
  
  const [allSeaRoutes, setAllSeaRoutes] = useState<SeaRoute[]>([]);
  const [selectedSeaRoute, setSelectedSeaRoute] = useState<SeaRoute | null>(null);
  const [currentRoutePolyline, setCurrentRoutePolyline] = useState<L.LatLngExpression[] | null>(null);
  const [mapViewTarget, setMapViewTarget] = useState<{ center: L.LatLngExpression, zoom?: number } | null>(null);
  const [highlightedFeatureIds, setHighlightedFeatureIds] = useState<string[]>([]);

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

  useEffect(() => {
    if (timelineEventToFocus) {
      let targetSet = false;
      if (timelineEventToFocus.mapCoordinates) {
        const eventCoords = parseCoordinates(timelineEventToFocus.mapCoordinates);
        if (Array.isArray(eventCoords) && eventCoords.length === 2 && typeof eventCoords[0] === 'number' && typeof eventCoords[1] === 'number') { 
          setMapViewTarget({ center: eventCoords as L.LatLngExpression, zoom: 4 }); 
          targetSet = true;
        }
      }
      
      const idsToHighlight: string[] = [
        ...(timelineEventToFocus.associatedIslandIDs || []),
        ...(timelineEventToFocus.associatedLandmarkIDs || []),
      ];
      setHighlightedFeatureIds(idsToHighlight);

      if (!targetSet && idsToHighlight.length > 0) {
        const firstFeatureToHighlight = mapFeaturesData.find(f => f.id === idsToHighlight[0]);
        if (firstFeatureToHighlight) {
            const featureCoords = parseCoordinates(firstFeatureToHighlight.mapCoordinates);
            let centerPoint: L.LatLngExpression | undefined;
            if (Array.isArray(featureCoords) && Array.isArray(featureCoords[0])) {
                centerPoint = featureCoords[0] as L.LatLngExpression; 
            } else if (Array.isArray(featureCoords) && typeof featureCoords[0] === 'number') {
                centerPoint = featureCoords as L.LatLngExpression;
            }
            if (centerPoint) {
              setMapViewTarget({ center: centerPoint, zoom: 3 });
            }
        }
      }
    } else {
      setHighlightedFeatureIds([]);
    }
  }, [timelineEventToFocus, mapFeaturesData]);

  const handleSelectRoute = (routeId: string) => {
    onClearTimelineEventFocus?.();
    const route = allSeaRoutes.find(r => r.id === routeId);
    if (route && mapFeaturesData.length > 0) {
      setSelectedFeature(null); 
      setSelectedSeaRoute(route);
      setMapViewTarget(null); 
      const polylineCoords: L.LatLngExpression[] = route.stages
        .sort((a, b) => a.order - b.order)
        .map(stage => {
          const feature = mapFeaturesData.find(f => f.id === stage.islandID);
          if (feature) {
            const coords = parseCoordinates(feature.mapCoordinates);
            if (Array.isArray(coords) && Array.isArray(coords[0])) { 
              return coords[0] as L.LatLngExpression; 
            }
            return coords as L.LatLngExpression; 
          }
          return null;
        })
        .filter(c => c !== null) as L.LatLngExpression[];
      setCurrentRoutePolyline(polylineCoords.length > 1 ? polylineCoords : null);
    }
  };
  
  const handleFeatureClick = (feature: MapFeature) => {
    onClearTimelineEventFocus?.();
    setSelectedFeature(feature);
    setCurrentRoutePolyline(null);
    setSelectedSeaRoute(null);
    setMapViewTarget(null); 
  };

  const handleCloseInfoPanel = () => {
    setSelectedFeature(null);
  };

  const handleStageSelect = (stage: SeaRouteStage, islandFeature?: MapFeature) => {
    onClearTimelineEventFocus?.();
    if (islandFeature) {
      const coords = parseCoordinates(islandFeature.mapCoordinates);
      let targetCoords: L.LatLngExpression;
      if (Array.isArray(coords) && Array.isArray(coords[0])) { 
        targetCoords = coords[0] as L.LatLngExpression; 
      } else { 
        targetCoords = coords as L.LatLngExpression;
      }
      setMapViewTarget({ center: targetCoords, zoom: 3 }); 
      setSelectedFeature(islandFeature); 
      console.log("Selected Stage:", stage.stageName, "Island:", islandFeature.name);
    }
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
      <Legend /> {/* Add Legend here */}
      {allSeaRoutes.length > 0 && (
        <div style={{ position: 'absolute', top: 10, left: 60, zIndex: 1001, background: 'white', padding: '5px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
          <button onClick={() => handleSelectRoute(allSeaRoutes[0].id)} title={allSeaRoutes[0].description || allSeaRoutes[0].routeName}>
            Load Route: {allSeaRoutes[0].routeName}
          </button>
        </div>
      )}

      <MapContainer {...mapContainerProps}>
        <MapEffectController target={mapViewTarget} />
        <ImageOverlay
          url="/images/base_map_parchment_placeholder.png"
          bounds={bounds}
        />

        {mapFeaturesData.map((feature) => {
          const featureType = feature.type;
          const coordinates = parseCoordinates(feature.mapCoordinates);
          const isHighlighted = highlightedFeatureIds.includes(feature.id);

          if (featureType === "capability" || featureType === "continent" || featureType === "archipelago" || featureType === "island" || featureType === "strait" || featureType === "harbor") {
            if (!Array.isArray(coordinates) || coordinates.length === 0 || !Array.isArray(coordinates[0]) || (Array.isArray(coordinates[0]) && coordinates[0].length === 0) ) {
              return null;
            }
            return (
              <Polygon
                key={feature.id}
                positions={coordinates as L.LatLngExpression[]}
                pathOptions={{ 
                  color: isHighlighted ? 'red' : 'blue',
                  weight: isHighlighted ? 4 : 3,
                  fillColor: 'lightblue', 
                  fillOpacity: isHighlighted ? 0.7 : (hoveredPolygon === feature.id ? 0.6 : 0.4) 
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
            
            if (isHighlighted) {
              console.log("Highlighted Marker:", feature.name);
            }

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
          <SeaRouteDisplay 
            route={selectedSeaRoute} 
            mapFeatures={mapFeaturesData} 
            onStageSelect={handleStageSelect}
          />
        </div>
      )}
    </div>
  );
};

export default MapViewer;
