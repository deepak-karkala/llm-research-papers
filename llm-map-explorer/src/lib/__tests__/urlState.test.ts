import { describe, it, expect } from 'vitest';
import { serializeState, parseState, generateShareUrl } from '@/lib/urlState';
import type { SelectedEntity } from '@/lib/store';

describe('URL State Serialization', () => {
  describe('serializeState', () => {
    it('should serialize map center coordinates', () => {
      const state = {
        mapCenter: [50.5, 100.5] as [number, number],
      };
      const params = serializeState(state);
      expect(params.get('lat')).toBe('50.50');
      expect(params.get('lng')).toBe('100.50');
    });

    it('should round latitude and longitude to 2 decimal places', () => {
      const state = {
        mapCenter: [45.123456, 120.987654] as [number, number],
      };
      const params = serializeState(state);
      expect(params.get('lat')).toBe('45.12');
      expect(params.get('lng')).toBe('120.99');
    });

    it('should serialize zoom level as integer', () => {
      const state = {
        currentZoom: 1.5,
      };
      const params = serializeState(state);
      expect(params.get('zoom')).toBe('2');
    });

    it('should serialize selected landmark entity', () => {
      const selectedEntity: SelectedEntity = {
        type: 'landmark',
        id: 'lm-001',
      };
      const state = { selectedEntity };
      const params = serializeState(state);
      expect(params.get('entity')).toBe('lm-001');
      expect(params.get('entityType')).toBe('landmark');
    });

    it('should serialize selected capability entity', () => {
      const selectedEntity: SelectedEntity = {
        type: 'capability',
        id: 'cap-123',
      };
      const state = { selectedEntity };
      const params = serializeState(state);
      expect(params.get('entity')).toBe('cap-123');
      expect(params.get('entityType')).toBe('capability');
    });

    it('should serialize selected organization entity', () => {
      const selectedEntity: SelectedEntity = {
        type: 'organization',
        id: 'org-456',
      };
      const state = { selectedEntity };
      const params = serializeState(state);
      expect(params.get('entity')).toBe('org-456');
      expect(params.get('entityType')).toBe('organization');
    });

    it('should serialize highlighted organization', () => {
      const state = {
        highlightedOrgId: 'org-001',
      };
      const params = serializeState(state);
      expect(params.get('org')).toBe('org-001');
    });

    it('should serialize complete state with all properties', () => {
      const state = {
        mapCenter: [45.0, 120.0] as [number, number],
        currentZoom: 2,
        selectedEntity: { type: 'landmark', id: 'lm-001' } as SelectedEntity,
        highlightedOrgId: 'org-001',
      };
      const params = serializeState(state);
      expect(params.get('lat')).toBe('45.00');
      expect(params.get('lng')).toBe('120.00');
      expect(params.get('zoom')).toBe('2');
      expect(params.get('entity')).toBe('lm-001');
      expect(params.get('entityType')).toBe('landmark');
      expect(params.get('org')).toBe('org-001');
    });

    it('should handle undefined mapCenter gracefully', () => {
      const state = {
        mapCenter: undefined,
      };
      const params = serializeState(state);
      expect(params.get('lat')).toBeNull();
      expect(params.get('lng')).toBeNull();
    });

    it('should handle null selectedEntity gracefully', () => {
      const state = {
        selectedEntity: null,
      };
      const params = serializeState(state);
      expect(params.get('entity')).toBeNull();
      expect(params.get('entityType')).toBeNull();
    });

    it('should handle null highlightedOrgId gracefully', () => {
      const state = {
        highlightedOrgId: null,
      };
      const params = serializeState(state);
      expect(params.get('org')).toBeNull();
    });

    it('should handle empty state gracefully', () => {
      const state = {};
      const params = serializeState(state);
      expect(params.toString()).toBe('');
    });
  });

  describe('parseState', () => {
    it('should parse valid latitude and longitude', () => {
      const search = '?lat=50&lng=100';
      const state = parseState(search);
      expect(state.lat).toBe(50);
      expect(state.lng).toBe(100);
    });

    it('should parse decimal latitude and longitude', () => {
      const search = '?lat=45.12&lng=120.99';
      const state = parseState(search);
      expect(state.lat).toBe(45.12);
      expect(state.lng).toBe(120.99);
    });

    it('should parse zoom level', () => {
      const search = '?zoom=2';
      const state = parseState(search);
      expect(state.zoom).toBe(2);
    });

    it('should parse landmark entity', () => {
      const search = '?entity=lm-001&entityType=landmark';
      const state = parseState(search);
      expect(state.selectedEntity?.id).toBe('lm-001');
      expect(state.selectedEntity?.type).toBe('landmark');
    });

    it('should parse capability entity', () => {
      const search = '?entity=cap-123&entityType=capability';
      const state = parseState(search);
      expect(state.selectedEntity?.id).toBe('cap-123');
      expect(state.selectedEntity?.type).toBe('capability');
    });

    it('should parse organization entity', () => {
      const search = '?entity=org-456&entityType=organization';
      const state = parseState(search);
      expect(state.selectedEntity?.id).toBe('org-456');
      expect(state.selectedEntity?.type).toBe('organization');
    });

    it('should parse highlighted organization', () => {
      const search = '?org=org-001';
      const state = parseState(search);
      expect(state.highlightedOrgId).toBe('org-001');
    });

    it('should parse complete URL with all parameters', () => {
      const search = '?lat=45&lng=120&zoom=2&entity=lm-001&entityType=landmark&org=org-001';
      const state = parseState(search);
      expect(state.lat).toBe(45);
      expect(state.lng).toBe(120);
      expect(state.zoom).toBe(2);
      expect(state.selectedEntity?.id).toBe('lm-001');
      expect(state.selectedEntity?.type).toBe('landmark');
      expect(state.highlightedOrgId).toBe('org-001');
    });

    it('should ignore unknown parameters', () => {
      const search = '?lat=45&lng=120&unknown=value&another=param';
      const state = parseState(search);
      expect(state.lat).toBe(45);
      expect(state.lng).toBe(120);
      expect(Object.keys(state).length).toBe(2);
    });

    it('should ignore entity without entityType', () => {
      const search = '?entity=lm-001';
      const state = parseState(search);
      expect(state.selectedEntity).toBeUndefined();
    });

    it('should ignore entityType without entity', () => {
      const search = '?entityType=landmark';
      const state = parseState(search);
      expect(state.selectedEntity).toBeUndefined();
    });

    it('should ignore invalid entityType', () => {
      const search = '?entity=lm-001&entityType=invalid';
      const state = parseState(search);
      expect(state.selectedEntity).toBeUndefined();
    });

    it('should ignore invalid zoom value', () => {
      const search = '?zoom=abc';
      const state = parseState(search);
      expect(state.zoom).toBeUndefined();
    });

    it('should ignore invalid latitude value', () => {
      const search = '?lat=abc&lng=120';
      const state = parseState(search);
      expect(state.lat).toBeUndefined();
      expect(state.lng).toBeUndefined();
    });

    it('should ignore invalid longitude value', () => {
      const search = '?lat=45&lng=xyz';
      const state = parseState(search);
      expect(state.lat).toBeUndefined();
      expect(state.lng).toBeUndefined();
    });

    it('should handle empty search string', () => {
      const state = parseState('');
      expect(Object.keys(state).length).toBe(0);
    });

    it('should handle search string without leading ?', () => {
      const search = 'lat=45&lng=120&zoom=2';
      const state = parseState(search);
      expect(state.lat).toBe(45);
      expect(state.lng).toBe(120);
      expect(state.zoom).toBe(2);
    });
  });

  describe('Round-trip serialization/deserialization', () => {
    it('should round-trip map center coordinates', () => {
      const originalState = {
        mapCenter: [45.12, 120.99] as [number, number],
        currentZoom: 2,
        selectedEntity: null,
        highlightedOrgId: null,
      };
      const params = serializeState(originalState);
      const parsed = parseState(params.toString());
      expect(parsed.lat).toBe(45.12);
      expect(parsed.lng).toBe(120.99);
    });

    it('should round-trip complete state', () => {
      const originalState = {
        mapCenter: [50.0, 100.0] as [number, number],
        currentZoom: 1,
        selectedEntity: { type: 'landmark', id: 'lm-001' } as SelectedEntity,
        highlightedOrgId: 'org-001',
      };
      const params = serializeState(originalState);
      const parsed = parseState(params.toString());
      expect(parsed.lat).toBe(50.0);
      expect(parsed.lng).toBe(100.0);
      expect(parsed.zoom).toBe(1);
      expect(parsed.selectedEntity?.id).toBe('lm-001');
      expect(parsed.selectedEntity?.type).toBe('landmark');
      expect(parsed.highlightedOrgId).toBe('org-001');
    });
  });

  describe('generateShareUrl', () => {
    it('should generate URL with parameters', () => {
      const url = generateShareUrl('https://example.com', {
        mapCenter: [45, 120] as [number, number],
        currentZoom: 2,
        selectedEntity: null,
        highlightedOrgId: null,
      });
      expect(url).toBe('https://example.com?lat=45.00&lng=120.00&zoom=2');
    });

    it('should generate base URL when no state provided', () => {
      const url = generateShareUrl('https://example.com', {});
      expect(url).toBe('https://example.com');
    });

    it('should include all state parameters in URL', () => {
      const url = generateShareUrl('https://example.com', {
        mapCenter: [50, 100] as [number, number],
        currentZoom: 1,
        selectedEntity: { type: 'landmark', id: 'lm-001' },
        highlightedOrgId: 'org-001',
      });
      expect(url).toContain('lat=50.00');
      expect(url).toContain('lng=100.00');
      expect(url).toContain('zoom=1');
      expect(url).toContain('entity=lm-001');
      expect(url).toContain('entityType=landmark');
      expect(url).toContain('org=org-001');
    });
  });

  describe('Edge cases', () => {
    it('should handle negative coordinates', () => {
      const state = {
        mapCenter: [-45.5, -120.5] as [number, number],
      };
      const params = serializeState(state);
      const parsed = parseState(params.toString());
      expect(parsed.lat).toBe(-45.5);
      expect(parsed.lng).toBe(-120.5);
    });

    it('should handle zero coordinates', () => {
      const state = {
        mapCenter: [0, 0] as [number, number],
      };
      const params = serializeState(state);
      const parsed = parseState(params.toString());
      expect(parsed.lat).toBe(0);
      expect(parsed.lng).toBe(0);
    });

    it('should handle entity IDs with special characters', () => {
      const selectedEntity: SelectedEntity = {
        type: 'landmark',
        id: 'lm-001_special-chars',
      };
      const state = { selectedEntity };
      const params = serializeState(state);
      const parsed = parseState(params.toString());
      expect(parsed.selectedEntity?.id).toBe('lm-001_special-chars');
    });

    it('should handle very large zoom values', () => {
      const state = {
        currentZoom: 100,
      };
      const params = serializeState(state);
      const parsed = parseState(params.toString());
      expect(parsed.zoom).toBe(100);
    });

    it('should handle negative zoom values', () => {
      const state = {
        currentZoom: -5,
      };
      const params = serializeState(state);
      const parsed = parseState(params.toString());
      expect(parsed.zoom).toBe(-5);
    });
  });
});
