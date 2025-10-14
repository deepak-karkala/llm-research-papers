import { describe, it, expect } from 'vitest';
import type { Capability, Landmark, ModelLandmark } from '@/types';
import { isModelLandmark } from '@/types';
import {
  sampleCapability,
  sampleLandmark,
  sampleModelLandmark,
  sampleOrganization,
  sampleTour,
} from '../../fixtures/sampleData';

describe('Data Types', () => {
  describe('Capability', () => {
    it('should match Capability interface', () => {
      const capability: Capability = sampleCapability;

      expect(capability.id).toBe('attention-mechanisms');
      expect(capability.level).toBe('archipelago');
      expect(capability.polygonCoordinates).toHaveLength(4);
      expect(capability.visualStyleHints.fillColor).toBe('#3b82f6');
    });

    it('should have required fields', () => {
      expect(sampleCapability.id).toBeDefined();
      expect(sampleCapability.name).toBeDefined();
      expect(sampleCapability.description).toBeDefined();
      expect(sampleCapability.level).toBeDefined();
      expect(sampleCapability.polygonCoordinates).toBeDefined();
    });

    it('should have proper LatLng coordinates', () => {
      const firstCoord = sampleCapability.polygonCoordinates[0];
      expect(firstCoord).toHaveProperty('lat');
      expect(firstCoord).toHaveProperty('lng');
      expect(typeof firstCoord.lat).toBe('number');
      expect(typeof firstCoord.lng).toBe('number');
    });

    it('should have VisualStyle with proper properties', () => {
      const style = sampleCapability.visualStyleHints;
      expect(style.fillColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(style.fillOpacity).toBeGreaterThanOrEqual(0);
      expect(style.fillOpacity).toBeLessThanOrEqual(1);
      expect(style.strokeWeight).toBeGreaterThan(0);
    });
  });

  describe('Landmark', () => {
    it('should match Landmark interface', () => {
      const landmark: Landmark = sampleLandmark;

      expect(landmark.id).toBe('attention-is-all-you-need');
      expect(landmark.type).toBe('paper');
      expect(landmark.year).toBe(2017);
      expect(landmark.externalLinks).toHaveLength(1);
    });

    it('should have coordinates', () => {
      expect(sampleLandmark.coordinates.lat).toBeDefined();
      expect(sampleLandmark.coordinates.lng).toBeDefined();
    });

    it('should have valid landmark type', () => {
      const validTypes = ['paper', 'model', 'tool', 'benchmark'];
      expect(validTypes).toContain(sampleLandmark.type);
    });

    it('should have external links with proper structure', () => {
      const link = sampleLandmark.externalLinks[0];
      expect(link).toHaveProperty('type');
      expect(link).toHaveProperty('url');
      expect(link).toHaveProperty('label');
      expect(link.url).toMatch(/^https?:\/\//);
    });
  });

  describe('ModelLandmark', () => {
    it('should extend Landmark with metadata', () => {
      const model: ModelLandmark = sampleModelLandmark;

      expect(model.type).toBe('model');
      expect(model.metadata).toBeDefined();
      expect(model.metadata.parameters).toBe('175B');
      expect(model.metadata.architecture).toBe('Transformer');
    });

    it('should be identified by type guard', () => {
      expect(isModelLandmark(sampleModelLandmark)).toBe(true);
      expect(isModelLandmark(sampleLandmark)).toBe(false);
    });

    it('should have all required metadata fields', () => {
      const metadata = sampleModelLandmark.metadata;
      expect(metadata.parameters).toBeDefined();
      expect(metadata.architecture).toBeDefined();
      expect(metadata.trainingMethod).toBeDefined();
      expect(metadata.capabilities).toBeInstanceOf(Array);
      expect(metadata.releaseDate).toBeDefined();
    });

    it('should have ISO formatted release date', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(sampleModelLandmark.metadata.releaseDate).toMatch(dateRegex);
    });
  });

  describe('Organization', () => {
    it('should have required fields', () => {
      expect(sampleOrganization.id).toBe('openai');
      expect(sampleOrganization.name).toBe('OpenAI');
      expect(sampleOrganization.landmarkIds).toBeInstanceOf(Array);
      expect(sampleOrganization.color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should have valid color hex code', () => {
      const hexColorRegex = /^#[0-9a-f]{6}$/i;
      expect(sampleOrganization.color).toMatch(hexColorRegex);
    });

    it('should have landmark IDs array', () => {
      expect(sampleOrganization.landmarkIds).toBeInstanceOf(Array);
      expect(sampleOrganization.landmarkIds.length).toBeGreaterThan(0);
    });
  });

  describe('Tour', () => {
    it('should have stages with proper ordering', () => {
      expect(sampleTour.stages).toHaveLength(2);
      expect(sampleTour.stages[0].index).toBe(0);
      expect(sampleTour.stages[1].index).toBe(1);
    });

    it('should have difficulty level', () => {
      expect(['beginner', 'intermediate', 'advanced']).toContain(
        sampleTour.difficulty
      );
    });

    it('should have all required tour fields', () => {
      expect(sampleTour.id).toBeDefined();
      expect(sampleTour.title).toBeDefined();
      expect(sampleTour.description).toBeDefined();
      expect(sampleTour.stages).toBeInstanceOf(Array);
      expect(sampleTour.estimatedDuration).toBeGreaterThan(0);
    });

    it('should have stages with proper structure', () => {
      const stage = sampleTour.stages[0];
      expect(stage).toHaveProperty('index');
      expect(stage).toHaveProperty('title');
      expect(stage).toHaveProperty('description');
      expect(stage).toHaveProperty('landmarkIds');
      expect(stage).toHaveProperty('mapCenter');
      expect(stage).toHaveProperty('mapZoom');
      expect(stage).toHaveProperty('narration');
    });

    it('should have valid map center coordinates in stages', () => {
      const stage = sampleTour.stages[0];
      expect(stage.mapCenter).toHaveProperty('lat');
      expect(stage.mapCenter).toHaveProperty('lng');
      expect(typeof stage.mapCenter.lat).toBe('number');
      expect(typeof stage.mapCenter.lng).toBe('number');
    });
  });

  describe('Type Safety', () => {
    it('should enforce required fields at compile time', () => {
      // This test ensures TypeScript compilation catches missing fields
      const capability: Capability = sampleCapability;
      expect(capability.id).toBeDefined();
      expect(capability.name).toBeDefined();
      expect(capability.description).toBeDefined();
    });

    it('should allow optional fields to be undefined', () => {
      const landmarkWithoutAuthors: Landmark = {
        ...sampleLandmark,
        authors: undefined,
        abstract: undefined,
      };
      expect(landmarkWithoutAuthors.authors).toBeUndefined();
      expect(landmarkWithoutAuthors.abstract).toBeUndefined();
    });

    it('should properly type arrays', () => {
      expect(Array.isArray(sampleCapability.polygonCoordinates)).toBe(true);
      expect(Array.isArray(sampleLandmark.externalLinks)).toBe(true);
      expect(Array.isArray(sampleTour.stages)).toBe(true);
    });
  });
});
