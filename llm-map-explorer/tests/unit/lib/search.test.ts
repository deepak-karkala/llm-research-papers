/**
 * Unit tests for search functionality
 * Tests Fuse.js integration, search accuracy, and helper functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSearchIndex, search, filterByEntityType, filterByScore } from '@/lib/search';
import type { Capability, Landmark, Organization } from '@/types/data';
import type Fuse from 'fuse.js';

// Test data fixtures
const testCapabilities: Capability[] = [
  {
    id: 'attention-mechanisms',
    name: 'Attention Mechanisms',
    description: 'Core techniques for modeling relationships in sequences',
    shortDescription: 'Sequence modeling techniques',
    level: 'archipelago',
    polygonCoordinates: [
      { lat: 100, lng: 200 },
      { lat: 150, lng: 200 },
      { lat: 150, lng: 250 },
      { lat: 100, lng: 250 },
    ],
    visualStyleHints: {
      fillColor: '#3b82f6',
      fillOpacity: 0.3,
      strokeColor: '#1e40af',
      strokeWeight: 2,
    },
    relatedLandmarks: ['attention-is-all-you-need', 'bert'],
    zoomThreshold: 2,
  },
  {
    id: 'alignment-safety',
    name: 'Alignment & Safety',
    description: 'Techniques for ensuring AI systems behave as intended',
    shortDescription: 'AI safety research',
    level: 'archipelago',
    polygonCoordinates: [
      { lat: 200, lng: 300 },
      { lat: 250, lng: 300 },
      { lat: 250, lng: 350 },
      { lat: 200, lng: 350 },
    ],
    visualStyleHints: {
      fillColor: '#ef4444',
      fillOpacity: 0.3,
      strokeColor: '#991b1b',
      strokeWeight: 2,
    },
    relatedLandmarks: [],
    zoomThreshold: 2,
  },
];

const testLandmarks: Landmark[] = [
  {
    id: 'attention-is-all-you-need',
    name: 'Attention Is All You Need',
    type: 'paper',
    year: 2017,
    organization: 'Google Brain',
    authors: ['Vaswani et al.'],
    description: 'Introduced the Transformer architecture',
    externalLinks: [
      {
        type: 'arxiv',
        url: 'https://arxiv.org/abs/1706.03762',
        label: 'arXiv Paper',
      },
    ],
    coordinates: { lat: 125, lng: 225 },
    capabilityId: 'attention-mechanisms',
    relatedLandmarks: ['bert', 'gpt-2'],
    tags: ['transformer', 'attention', 'nlp'],
    zoomThreshold: -1,
  },
  {
    id: 'gpt-3',
    name: 'GPT-3',
    type: 'model',
    year: 2020,
    organization: 'OpenAI',
    description: 'Large-scale language model with 175B parameters',
    externalLinks: [
      {
        type: 'paper',
        url: 'https://arxiv.org/abs/2005.14165',
        label: 'GPT-3 Paper',
      },
    ],
    coordinates: { lat: 200, lng: 300 },
    capabilityId: 'language-models',
    relatedLandmarks: ['gpt-2', 'instruct-gpt'],
    tags: ['gpt', 'language-model', 'few-shot'],
    zoomThreshold: -1,
  },
  {
    id: 'rlhf-paper',
    name: 'Learning to summarize from human feedback',
    type: 'paper',
    year: 2020,
    organization: 'OpenAI',
    description: 'Pioneering work on reinforcement learning from human feedback',
    externalLinks: [],
    coordinates: { lat: 220, lng: 320 },
    capabilityId: 'alignment-safety',
    relatedLandmarks: ['instruct-gpt'],
    tags: ['rlhf', 'alignment', 'safety'],
    zoomThreshold: -1,
  },
];

const testOrganizations: Organization[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI research and deployment company',
    website: 'https://openai.com',
    landmarkIds: ['gpt-2', 'gpt-3', 'gpt-4'],
    color: '#10a37f',
  },
  {
    id: 'google-brain',
    name: 'Google Brain',
    description: 'Deep learning AI research team at Google',
    website: 'https://research.google/teams/brain/',
    landmarkIds: ['attention-is-all-you-need', 'bert'],
    color: '#4285f4',
  },
];

describe('search library', () => {
  let searchIndex: Fuse<any>;

  beforeEach(() => {
    // Initialize search index before each test
    searchIndex = initializeSearchIndex({
      capabilities: testCapabilities,
      landmarks: testLandmarks,
      organizations: testOrganizations,
    });
  });

  describe('initializeSearchIndex', () => {
    it('should create a Fuse.js index with all entities', () => {
      expect(searchIndex).toBeDefined();
      expect(searchIndex.search).toBeDefined();
    });

    it('should handle empty data', () => {
      const emptyIndex = initializeSearchIndex({
        capabilities: [],
        landmarks: [],
        organizations: [],
      });
      expect(emptyIndex).toBeDefined();
      const results = search('anything', emptyIndex);
      expect(results).toHaveLength(0);
    });

    it('should handle partial data', () => {
      const partialIndex = initializeSearchIndex({
        capabilities: testCapabilities,
        landmarks: [],
        organizations: [],
      });
      expect(partialIndex).toBeDefined();
      const results = search('Attention', partialIndex);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('search', () => {
    it('should return empty array for empty query', () => {
      const results = search('', searchIndex);
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace query', () => {
      const results = search('   ', searchIndex);
      expect(results).toEqual([]);
    });

    it('should find entities by name', () => {
      const results = search('Attention', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toContain('Attention');
    });

    it('should find entities by description', () => {
      const results = search('Transformer', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      const hasTransformer = results.some(
        (r) => r.item.description.toLowerCase().includes('transformer')
      );
      expect(hasTransformer).toBe(true);
    });

    it('should find entities by tags', () => {
      const results = search('rlhf', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      // Should find the RLHF paper
      const rlhfPaper = results.find((r) => r.item.id === 'rlhf-paper');
      expect(rlhfPaper).toBeDefined();
    });

    it('should prioritize name matches over description matches (weighted search)', () => {
      // "Attention" appears in both name and description
      const results = search('Attention', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      // The first result should be the one with "Attention" in the name
      const firstResult = results[0];
      expect(firstResult.item.name).toContain('Attention');
    });

    it('should handle fuzzy matching with typos', () => {
      // Test with typo: "attnetion" instead of "attention"
      const results = search('attnetion', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      const hasAttention = results.some((r) => r.item.name.toLowerCase().includes('attention'));
      expect(hasAttention).toBe(true);
    });

    it('should return results sorted by relevance score', () => {
      const results = search('attention', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      // Scores should be in ascending order (lower is better in Fuse.js)
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i - 1].score);
      }
    });

    it('should respect the limit parameter', () => {
      const results = search('a', searchIndex, 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should include entity type in results', () => {
      const results = search('OpenAI', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result.entityType).toBeDefined();
        expect(['capability', 'landmark', 'organization']).toContain(result.entityType);
      });
    });

    it('should include score in results', () => {
      const results = search('attention', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result.score).toBeDefined();
        expect(typeof result.score).toBe('number');
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
      });
    });

    it('should include match information for highlighting', () => {
      const results = search('attention', searchIndex);
      expect(results.length).toBeGreaterThan(0);
      // At least some results should have matches
      const hasMatches = results.some((r) => r.matches && r.matches.length > 0);
      expect(hasMatches).toBe(true);
    });

    it('should search across all entity types', () => {
      const results = search('attention', searchIndex, 20);
      const entityTypes = new Set(results.map((r) => r.entityType));
      // Should find at least capabilities and landmarks
      expect(entityTypes.size).toBeGreaterThan(1);
    });

    it('should handle special characters in search query', () => {
      const results = search('GPT-3', searchIndex);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const lowerResults = search('attention', searchIndex);
      const upperResults = search('ATTENTION', searchIndex);
      expect(lowerResults.length).toBe(upperResults.length);
    });
  });

  describe('filterByEntityType', () => {
    it('should filter results to only landmarks', () => {
      const results = search('attention', searchIndex);
      const filtered = filterByEntityType(results, ['landmark']);
      expect(filtered.every((r) => r.entityType === 'landmark')).toBe(true);
    });

    it('should filter results to only capabilities', () => {
      const results = search('attention', searchIndex);
      const filtered = filterByEntityType(results, ['capability']);
      expect(filtered.every((r) => r.entityType === 'capability')).toBe(true);
    });

    it('should filter results to only organizations', () => {
      const results = search('research', searchIndex);
      const filtered = filterByEntityType(results, ['organization']);
      expect(filtered.every((r) => r.entityType === 'organization')).toBe(true);
    });

    it('should allow multiple entity types', () => {
      const results = search('attention', searchIndex);
      const filtered = filterByEntityType(results, ['landmark', 'capability']);
      expect(
        filtered.every((r) => r.entityType === 'landmark' || r.entityType === 'capability')
      ).toBe(true);
    });

    it('should return empty array if no results match types', () => {
      const results = search('attention', searchIndex);
      const filtered = filterByEntityType(results, ['tour']); // No tours in test data
      expect(filtered).toEqual([]);
    });

    it('should handle empty results array', () => {
      const filtered = filterByEntityType([], ['landmark']);
      expect(filtered).toEqual([]);
    });
  });

  describe('filterByScore', () => {
    it('should filter results by maximum score threshold', () => {
      const results = search('attention', searchIndex);
      const filtered = filterByScore(results, 0.3);
      expect(filtered.every((r) => r.score <= 0.3)).toBe(true);
    });

    it('should return all results if all scores are below threshold', () => {
      const results = search('attention', searchIndex);
      const filtered = filterByScore(results, 1.0);
      expect(filtered.length).toBe(results.length);
    });

    it('should return empty array if all scores exceed threshold', () => {
      const results = search('attention', searchIndex);
      const filtered = filterByScore(results, 0.0);
      expect(filtered).toEqual([]);
    });

    it('should handle empty results array', () => {
      const filtered = filterByScore([], 0.5);
      expect(filtered).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      const results = search(longQuery, searchIndex);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle queries with only numbers', () => {
      const results = search('2017', searchIndex);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle unicode characters', () => {
      const results = search('café', searchIndex);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should not mutate original data', () => {
      const originalCapabilities = JSON.parse(JSON.stringify(testCapabilities));
      search('attention', searchIndex);
      expect(testCapabilities).toEqual(originalCapabilities);
    });
  });
});
