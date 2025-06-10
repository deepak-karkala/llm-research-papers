// src/components/map/MapEffectController.tsx
'use client';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapEffectControllerProps {
  target: { center: L.LatLngExpression, zoom?: number } | null;
}

const MapEffectController: React.FC<MapEffectControllerProps> = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.setView(target.center, target.zoom || map.getZoom());
    }
  }, [target, map]);

  return null; // This component does not render anything
};

export default MapEffectController;
