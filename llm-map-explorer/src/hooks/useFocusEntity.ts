/**
 * Hook to focus on an entity (landmark or capability) on the map
 * Provides a convenient way to navigate to and highlight entities
 */

import { useCallback } from 'react';
import { useMapStore } from '@/lib/store';
import { focusEntity as focusEntityUtil } from '@/lib/utils';
import type { SearchResult } from '@/types/search';
import type { Capability, Landmark } from '@/types/data';

/**
 * Hook to focus on map entities
 * @returns Function to focus on an entity
 */
export function useFocusEntity() {
  const mapRef = useMapStore((state) => state.mapRef);
  const capabilities = useMapStore((state) => state.capabilities);
  const landmarks = useMapStore((state) => state.landmarks);

  const focusEntity = useCallback(
    (result: SearchResult) => {
      let entity: Capability | Landmark | null = null;

      // Find the entity
      if (result.entityType === 'landmark') {
        entity = landmarks.find((l) => l.id === result.item.id) || null;
      } else if (result.entityType === 'capability') {
        entity = capabilities.find((c) => c.id === result.item.id) || null;
      }

      if (!entity) {
        console.warn(`useFocusEntity: Entity "${result.item.id}" not found`);
        return;
      }

      // Call the utility function
      focusEntityUtil(
        result.item.id,
        result.entityType as 'capability' | 'landmark',
        mapRef,
        entity,
        landmarks
      );
    },
    [mapRef, capabilities, landmarks]
  );

  return focusEntity;
}
