// src/components/map/MapViewer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapFeature, SeaRoute, SeaRouteStage, TimelineEvent } from '../../types/data';
import InfoPanel from '../ui/InfoPanel';
import SeaRouteDisplay from '../routes/SeaRouteDisplay';
import MapEffectController from './MapEffectController';
import Legend from '../ui/Legend';

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
  iconUrl: '/icons/lighthouse.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const shipIcon = L.icon({
  iconUrl: '/icons/ship_icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Updated parseCoordinates function
const parseCoordinates = (
  coordsInput: string | number[][] | number[],
  expectedType: 'polygon' | 'point',
  featureId?: string // Optional: for more informative logging
): L.LatLngExpression[] | L.LatLngExpression | null => {
  let parsed: any;

  if (typeof coordsInput === 'string') {
    try {
      parsed = JSON.parse(coordsInput);
    } catch (e) {
      console.warn(`[${featureId || 'Unknown Feature'}] Failed to parse mapCoordinates string: ${coordsInput}`, e);
      return null;
    }
  } else {
    parsed = coordsInput; // Already an array or potentially malformed
  }

  if (expectedType === 'polygon') {
    if (
      Array.isArray(parsed) &&
      parsed.length >= 3 && // A polygon needs at least 3 points
      parsed.every(p => Array.isArray(p) && p.length === 2 && typeof p[0] === 'number' && typeof p[1] === 'number')
    ) {
      return parsed as L.LatLngExpression[];
    } else {
      console.warn(
        `[${featureId || 'Unknown Feature'}] Invalid polygon coordinates. Expected array of at least 3 points (e.g., [[lng,lat],[lng,lat],...]), got:`,
        JSON.stringify(parsed) // Stringify for clear logging of the actual structure
      );
      return null;
    }
  } else if (expectedType === 'point') {
    if (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      typeof parsed[0] === 'number' &&
      typeof parsed[1] === 'number'
    ) {
      return parsed as L.LatLngExpression;
    } else {
      console.warn(
        `[${featureId || 'Unknown Feature'}] Invalid point coordinates. Expected array of 2 numbers (e.g., [lng,lat]), got:`,
        JSON.stringify(parsed)
      );
      return null;
    }
  }
  // Should not be reached if expectedType is always 'polygon' or 'point', but as a fallback:
  console.warn(`[${featureId || 'Unknown Feature'}] Unexpected expectedType or malformed coordinate structure:`, JSON.stringify(parsed));
  return null;
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
        // Timeline events mapCoordinates are expected to be points if they exist
        const eventCoords = parseCoordinates(timelineEventToFocus.mapCoordinates, 'point', `TimelineEvent: ${timelineEventToFocus.id}`);
        if (eventCoords) { 
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
            // Determine if the first associated feature is a point or polygon for parsing
            const featureExpectedType = (firstFeatureToHighlight.type === "capability" || firstFeatureToHighlight.type === "continent" || firstFeatureToHighlight.type === "archipelago" || firstFeatureToHighlight.type === "island" || firstFeatureToHighlight.type === "strait" || firstFeatureToHighlight.type === "harbor") ? 'polygon' : 'point';
            const featureCoords = parseCoordinates(firstFeatureToHighlight.mapCoordinates, featureExpectedType, firstFeatureToHighlight.id);
            
            let centerPoint: L.LatLngExpression | undefined;
            if (featureCoords) {
              if (featureExpectedType === 'polygon') {
                  centerPoint = (featureCoords as L.LatLngExpression[])[0]; // Use first point of polygon
              } else {
                  centerPoint = featureCoords as L.LatLngExpression; // It's a point
              }
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
            // Island features in stages are typically polygons or points representing areas/locations
            const featureExpectedType = (feature.type === "capability" || feature.type === "continent" || feature.type === "archipelago" || feature.type === "island" || feature.type === "strait" || feature.type === "harbor") ? 'polygon' : 'point';
            const coords = parseCoordinates(feature.mapCoordinates, featureExpectedType, feature.id);
            if (coords) {
              if (featureExpectedType === 'polygon') { 
                return (coords as L.LatLngExpression[])[0]; // Use first point of polygon for polyline
              }
              return coords as L.LatLngExpression; // Assumes it's a point
            }
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
      const featureExpectedType = (islandFeature.type === "capability" || islandFeature.type === "continent" || islandFeature.type === "archipelago" || islandFeature.type === "island" || islandFeature.type === "strait" || islandFeature.type === "harbor") ? 'polygon' : 'point';
      const coords = parseCoordinates(islandFeature.mapCoordinates, featureExpectedType, islandFeature.id);
      
      let targetCoords: L.LatLngExpression | undefined;
      if (coords) {
        if (featureExpectedType === 'polygon') { 
          targetCoords = (coords as L.LatLngExpression[])[0]; // Use first point of polygon
        } else { 
          targetCoords = coords as L.LatLngExpression;
        }
      }

      if (targetCoords) {
        setMapViewTarget({ center: targetCoords, zoom: 3 }); 
        setSelectedFeature(islandFeature); 
        console.log("Selected Stage:", stage.stageName, "Island:", islandFeature.name);
      } else {
        console.warn(`Could not determine target coordinates for stage: ${stage.stageName}, island: ${islandFeature.name}`);
        setSelectedFeature(islandFeature); // Still show info panel if island data exists
      }
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
      <Legend />
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
          const isPolygonType = featureType === "capability" || featureType === "continent" || featureType === "archipelago" || featureType === "island" || featureType === "strait" || featureType === "harbor";
          const expectedCoordType = isPolygonType ? 'polygon' : 'point';
          const coordinates = parseCoordinates(feature.mapCoordinates, expectedCoordType, feature.id);

          if (!coordinates) { // If parseCoordinates returns null, skip rendering this feature
            return null; 
          }

          const isHighlighted = highlightedFeatureIds.includes(feature.id);

          if (isPolygonType) {
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
          } else { // Point types: "landmark_paper", "foundational_model", "key_tool", "benchmark_site"
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
