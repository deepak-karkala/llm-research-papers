/**
 * Hook to focus on an entity (landmark, capability, or organization) on the map
 * Provides a convenient way to navigate to and highlight entities
 * For organizations, opens the InfoPanel with organization details
 */

import { useCallback } from 'react';
import { useMapStore } from '@/lib/store';
import { focusEntity as focusEntityUtil } from '@/lib/utils';
import type { SearchResult } from '@/types/search';
import type { Capability, Landmark, Organization } from '@/types/data';

/**
 * Hook to focus on map entities
 * @returns Function to focus on an entity
 */
export function useFocusEntity() {
  const mapRef = useMapStore((state) => state.mapRef);
  const capabilities = useMapStore((state) => state.capabilities);
  const landmarks = useMapStore((state) => state.landmarks);
  const organizations = useMapStore((state) => state.organizations);
  const selectEntity = useMapStore((state) => state.selectEntity);

  const focusEntity = useCallback(
    (result: SearchResult) => {
      let entity: Capability | Landmark | Organization | null = null;

      // Find the entity
      if (result.entityType === 'landmark') {
        entity = landmarks.find((l) => l.id === result.item.id) || null;
      } else if (result.entityType === 'capability') {
        entity = capabilities.find((c) => c.id === result.item.id) || null;
      } else if (result.entityType === 'organization') {
        entity = organizations.find((o) => o.id === result.item.id) || null;
      }

      if (!entity) {
        console.warn(`useFocusEntity: Entity "${result.item.id}" not found`);
        return;
      }

      // For organizations, just open the InfoPanel
      if (result.entityType === 'organization') {
        selectEntity('organization', result.item.id);
        return;
      }

      // For landmarks and capabilities, also focus on map
      focusEntityUtil(
        result.item.id,
        result.entityType as 'capability' | 'landmark',
        mapRef,
        entity as Capability | Landmark,
        landmarks
      );
    },
    [mapRef, capabilities, landmarks, organizations, selectEntity]
  );

  return focusEntity;
}
