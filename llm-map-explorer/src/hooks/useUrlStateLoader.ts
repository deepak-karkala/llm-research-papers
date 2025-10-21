'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMapStore } from '@/lib/store';
import { parseState } from '@/lib/urlState';

/**
 * Hook to load and restore application state from URL search parameters on mount
 * This should be called early in the app lifecycle, before other components
 * render their initial state
 */
export function useUrlStateLoader() {
  const searchParams = useSearchParams();
  const setMapCenter = useMapStore((state) => state.setMapCenter);
  const setCurrentZoom = useMapStore((state) => state.setCurrentZoom);
  const selectEntity = useMapStore((state) => state.selectEntity);
  const highlightOrganization = useMapStore((state) => state.highlightOrganization);

  useEffect(() => {
    // Parse URL parameters
    const urlState = parseState(searchParams.toString());

    // Restore map position
    if (urlState.lat !== undefined && urlState.lng !== undefined) {
      setMapCenter([urlState.lat, urlState.lng]);
    }

    // Restore zoom level
    if (urlState.zoom !== undefined) {
      setCurrentZoom(urlState.zoom);
    }

    // Restore selected entity
    if (urlState.selectedEntity) {
      selectEntity(urlState.selectedEntity.type, urlState.selectedEntity.id);
    }

    // Restore organization highlighting
    if (urlState.highlightedOrgId) {
      highlightOrganization(urlState.highlightedOrgId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
}
