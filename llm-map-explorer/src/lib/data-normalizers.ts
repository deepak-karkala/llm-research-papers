import type { Capability, Landmark, LatLng } from '@/types/data';

/**
 * Coordinate formats supported by the static JSON payloads.
 * The authoring pipeline sometimes emits tuples instead of objects,
 * so we normalise before storing in Zustand.
 */
type LatLngLike = LatLng | [number, number];

/**
 * Convert any supported coordinate shape into a LatLng object.
 */
function toLatLng(coord: LatLngLike): LatLng {
  if (Array.isArray(coord)) {
    const [lat, lng] = coord;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error(`Invalid tuple coordinate: ${JSON.stringify(coord)}`);
    }
    return { lat, lng };
  }

  if (coord && typeof coord === 'object' && 'lat' in coord && 'lng' in coord) {
    const { lat, lng } = coord as LatLng;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error(`Invalid object coordinate: ${JSON.stringify(coord)}`);
    }
    return { lat, lng };
  }

  throw new Error(`Unsupported coordinate format: ${JSON.stringify(coord)}`);
}

/**
 * Normalise a capability so polygon coordinates are guaranteed LatLng objects.
 */
export function normalizeCapability(
  capability: Omit<Capability, 'polygonCoordinates'> & { polygonCoordinates: LatLngLike[] }
): Capability {
  return {
    ...capability,
    polygonCoordinates: capability.polygonCoordinates.map(toLatLng),
  };
}

/**
 * Normalise a landmark so coordinates are guaranteed LatLng objects.
 */
export function normalizeLandmark(
  landmark: Omit<Landmark, 'coordinates'> & { coordinates: LatLngLike }
): Landmark {
  return {
    ...landmark,
    coordinates: toLatLng(landmark.coordinates),
  };
}
