
import { z } from 'zod';

// Base Schemas from data.ts

export const latLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const visualStyleSchema = z.object({
  fillColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  fillOpacity: z.number().min(0).max(1),
  strokeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  strokeWeight: z.number(),
  pattern: z.enum(['solid', 'dots', 'stripes']).optional(),
});

export const capabilityLevelSchema = z.enum(['continent', 'archipelago', 'island', 'strait']);

export const capabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  level: capabilityLevelSchema,
  polygonCoordinates: z.array(latLngSchema),
  visualStyleHints: visualStyleSchema,
  relatedLandmarks: z.array(z.string()),
  parentCapabilityId: z.string().optional(),
  zoomThreshold: z.number(),
});

export const landmarkTypeSchema = z.enum(['paper', 'model', 'tool', 'benchmark']);

export const externalLinkSchema = z.object({
  type: z.enum(['arxiv', 'github', 'paper', 'model-card', 'website', 'other']),
  url: z.string().url(),
  label: z.string(),
});

export const modelMetadataSchema = z.object({
  parameters: z.string(),
  architecture: z.string(),
  trainingMethod: z.string(),
  capabilities: z.array(z.string()),
  releaseDate: z.string(),
  license: z.string().optional(),
  baseModel: z.string().optional(),
});

export const landmarkSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: landmarkTypeSchema,
  year: z.number(),
  organization: z.string(),
  authors: z.array(z.string()).optional(),
  description: z.string(),
  abstract: z.string().optional(),
  externalLinks: z.array(externalLinkSchema),
  coordinates: latLngSchema,
  capabilityId: z.string(),
  relatedLandmarks: z.array(z.string()),
  tags: z.array(z.string()),
  icon: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  /** Zoom threshold for progressive disclosure: -1 (show from Z0), 0 (show from Z1), 1 (show from Z2) */
  zoomThreshold: z.number().default(1),
}).superRefine((data, ctx) => {
  if (data.type === 'model') {
    const result = modelMetadataSchema.safeParse(data.metadata);
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metadata'],
        message: `Invalid model metadata: ${result.error.message}`,
      });
    }
  }
});

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  website: z.string().url().optional(),
  landmarkIds: z.array(z.string()),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  logo: z.string().url().optional(),
});

export const tourDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const tourStageSchema = z.object({
  index: z.number(),
  title: z.string(),
  description: z.string(),
  landmarkIds: z.array(z.string()),
  mapCenter: latLngSchema,
  mapZoom: z.number(),
  narration: z.string(),
});

export const tourSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  stages: z.array(tourStageSchema),
  estimatedDuration: z.number(),
  difficulty: tourDifficultySchema,
  tags: z.array(z.string()),
});


// Inferred Types

export type LatLngInput = z.infer<typeof latLngSchema>;
export type VisualStyleInput = z.infer<typeof visualStyleSchema>;
export type CapabilityLevelInput = z.infer<typeof capabilityLevelSchema>;
export type CapabilityInput = z.infer<typeof capabilitySchema>;
export type LandmarkTypeInput = z.infer<typeof landmarkTypeSchema>;
export type ExternalLinkInput = z.infer<typeof externalLinkSchema>;
export type ModelMetadataInput = z.infer<typeof modelMetadataSchema>;
export type LandmarkInput = z.infer<typeof landmarkSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;
export type TourDifficultyInput = z.infer<typeof tourDifficultySchema>;
export type TourStageInput = z.infer<typeof tourStageSchema>;
export type TourInput = z.infer<typeof tourSchema>;
