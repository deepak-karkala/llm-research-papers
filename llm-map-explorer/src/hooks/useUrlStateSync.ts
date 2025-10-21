'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMapStore } from '@/lib/store';
import { serializeState } from '@/lib/urlState';

/**
 * Configuration for URL state synchronization
 */
interface UseUrlStateSyncOptions {
  debounceMs?: number;
}

/**
 * Hook to synchronize application state changes to the URL
 * Uses debouncing to prevent excessive URL updates
 * @param options - Configuration options
 */
export function useUrlStateSync(options: UseUrlStateSyncOptions = {}) {
  const { debounceMs = 500 } = options;
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialRenderRef = useRef(true);

  // Watch for changes in state and update URL
  const mapCenter = useMapStore((state) => state.mapCenter);
  const currentZoom = useMapStore((state) => state.currentZoom);
  const selectedEntity = useMapStore((state) => state.selectedEntity);
  const highlightedOrgId = useMapStore((state) => state.highlightedOrgId);

  useEffect(() => {
    // Skip initial render to avoid double-encoding on page load
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced timer
    debounceTimerRef.current = setTimeout(() => {
      const params = serializeState({
        mapCenter,
        currentZoom,
        selectedEntity,
        highlightedOrgId,
      });

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : '/';

      // Use replace to update URL without adding to browser history
      router.replace(newUrl);
    }, debounceMs);

    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [mapCenter, currentZoom, selectedEntity, highlightedOrgId, debounceMs, router]);
}
