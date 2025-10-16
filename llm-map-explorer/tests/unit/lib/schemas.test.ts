import { describe, it, expect } from 'vitest';
import {
  capabilitySchema,
  landmarkSchema,
  organizationSchema,
  tourSchema,
} from '@/lib/schemas';
import {
  sampleCapability,
  sampleLandmark,
  sampleModelLandmark,
  sampleOrganization,
  sampleTour,
} from '../../fixtures/sampleData';

describe('Zod Schemas', () => {
  describe('capabilitySchema', () => {
    it('should validate a correct capability object', () => {
      const result = capabilitySchema.safeParse(sampleCapability);
      expect(result.success).toBe(true);
    });

    it('should fail validation for an invalid capability object', () => {
      const invalidCapability = { ...sampleCapability, level: 'invalid-level' };
      const result = capabilitySchema.safeParse(invalidCapability);
      expect(result.success).toBe(false);
    });
  });

  describe('landmarkSchema', () => {
    it('should validate a correct paper landmark object', () => {
      const result = landmarkSchema.safeParse(sampleLandmark);
      expect(result.success).toBe(true);
    });

    it('should validate a correct model landmark object', () => {
      const result = landmarkSchema.safeParse(sampleModelLandmark);
      expect(result.success).toBe(true);
    });

    it('should fail validation for a model landmark with invalid metadata', () => {
      const invalidModelLandmark = {
        ...sampleModelLandmark,
        metadata: { ...sampleModelLandmark.metadata, parameters: 123 },
      };
      const result = landmarkSchema.safeParse(invalidModelLandmark);
      expect(result.success).toBe(false);
    });

    it('should fail validation for an invalid landmark object', () => {
      const invalidLandmark = { ...sampleLandmark, type: 'invalid-type' };
      const result = landmarkSchema.safeParse(invalidLandmark);
      expect(result.success).toBe(false);
    });
  });

  describe('organizationSchema', () => {
    it('should validate a correct organization object', () => {
      const result = organizationSchema.safeParse(sampleOrganization);
      expect(result.success).toBe(true);
    });

    it('should fail validation for an invalid organization object', () => {
      const invalidOrganization = { ...sampleOrganization, color: 'invalid-color' };
      const result = organizationSchema.safeParse(invalidOrganization);
      expect(result.success).toBe(false);
    });
  });

  describe('tourSchema', () => {
    it('should validate a correct tour object', () => {
      const result = tourSchema.safeParse(sampleTour);
      expect(result.success).toBe(true);
    });

    it('should fail validation for an invalid tour object', () => {
      const invalidTour = { ...sampleTour, difficulty: 'invalid-difficulty' };
      const result = tourSchema.safeParse(invalidTour);
      expect(result.success).toBe(false);
    });
  });
});
