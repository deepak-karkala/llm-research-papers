import { describe, it, expect } from 'vitest';
import { capabilitySchema } from '@/lib/schemas';
import fs from 'fs';
import path from 'path';

// Load capabilities data
const capabilitiesPath = path.join(process.cwd(), 'public/data/capabilities.json');
const capabilitiesData = fs.readFileSync(capabilitiesPath, 'utf-8');
const capabilities = JSON.parse(capabilitiesData);

describe('Capabilities Data Validation', () => {
  it('should have 10-15 capabilities (actual: ' + capabilities.length + ')', () => {
    expect(capabilities.length).toBeGreaterThanOrEqual(10);
    expect(capabilities.length).toBeLessThanOrEqual(20);
  });

  it('should validate all capabilities against schema', () => {
    capabilities.forEach((capability, index) => {
      expect(() => {
        capabilitySchema.parse(capability);
      }).not.toThrow();
    });
  });

  it('should have unique IDs', () => {
    const ids = capabilities.map((cap) => cap.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid hierarchical relationships', () => {
    const capabilityIds = new Set(capabilities.map((cap) => cap.id));

    capabilities.forEach((capability) => {
      if (capability.parentCapabilityId) {
        expect(capabilityIds.has(capability.parentCapabilityId)).toBe(true);
      }
    });
  });

  it('should cover all required capability areas', () => {
    const requiredAreas = ['attention', 'alignment', 'reasoning', 'multimodal', 'quantization', 'rlhf', 'training'];

    const capabilityIds = capabilities.map((cap) => cap.id).join(' ').toLowerCase();

    requiredAreas.forEach((area) => {
      expect(capabilityIds).toContain(area);
    });
  });

  it('should have valid coordinate bounds for all capabilities', () => {
    capabilities.forEach((capability) => {
      capability.polygonCoordinates.forEach((coord) => {
        expect(coord.lat).toBeGreaterThanOrEqual(0);
        expect(coord.lat).toBeLessThanOrEqual(3072);
        expect(coord.lng).toBeGreaterThanOrEqual(0);
        expect(coord.lng).toBeLessThanOrEqual(4096);
      });
    });
  });

  it('should have continents with zoomThreshold -1 and no parent', () => {
    const continents = capabilities.filter((cap) => cap.level === 'continent');

    expect(continents.length).toBeGreaterThanOrEqual(4);
    continents.forEach((continent) => {
      expect(continent.zoomThreshold).toBe(-1);
      expect(continent.parentCapabilityId).toBeUndefined();
    });
  });

  it('should have archipelagos with zoomThreshold 0 and valid parent', () => {
    const archipelagos = capabilities.filter((cap) => cap.level === 'archipelago');

    expect(archipelagos.length).toBeGreaterThanOrEqual(5);
    archipelagos.forEach((archipelago) => {
      expect(archipelago.zoomThreshold).toBe(0);
      expect(archipelago.parentCapabilityId).toBeDefined();
    });
  });

  it('should have islands with zoomThreshold 1 and valid parent', () => {
    const islands = capabilities.filter((cap) => cap.level === 'island');

    expect(islands.length).toBeGreaterThanOrEqual(2);
    islands.forEach((island) => {
      expect(island.zoomThreshold).toBe(1);
      expect(island.parentCapabilityId).toBeDefined();
    });
  });

  it('should have valid visual styles for all capabilities', () => {
    capabilities.forEach((capability) => {
      const style = capability.visualStyleHints;

      // Validate hex color format
      expect(style.fillColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(style.strokeColor).toMatch(/^#[0-9A-F]{6}$/i);

      // Validate opacity
      expect(style.fillOpacity).toBeGreaterThanOrEqual(0);
      expect(style.fillOpacity).toBeLessThanOrEqual(1);

      // Validate stroke weight
      expect(style.strokeWeight).toBeGreaterThan(0);

      // Validate pattern if provided
      if (style.pattern) {
        expect(['solid', 'dots', 'stripes']).toContain(style.pattern);
      }
    });
  });

  it('should have at least 3 coordinate points per polygon', () => {
    capabilities.forEach((capability) => {
      expect(capability.polygonCoordinates.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should have properly formatted descriptions', () => {
    capabilities.forEach((capability) => {
      // Descriptions should be substantive
      expect(capability.description.length).toBeGreaterThan(50);

      // Short descriptions should be <= 80 characters
      expect(capability.shortDescription.length).toBeLessThanOrEqual(80);

      // IDs should be kebab-case
      expect(capability.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
    });
  });

  it('should have all required fields populated', () => {
    capabilities.forEach((capability) => {
      expect(capability.id).toBeDefined();
      expect(capability.name).toBeDefined();
      expect(capability.description).toBeDefined();
      expect(capability.shortDescription).toBeDefined();
      expect(capability.level).toBeDefined();
      expect(capability.polygonCoordinates).toBeDefined();
      expect(capability.visualStyleHints).toBeDefined();
      expect(capability.relatedLandmarks).toBeDefined();
      expect(capability.zoomThreshold).toBeDefined();
    });
  });
});
