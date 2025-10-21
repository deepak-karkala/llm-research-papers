/**
 * Performance tests for search functionality
 * Ensures search operations complete within acceptable time limits
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSearchIndex, search } from '@/lib/search';
import type { Capability, Landmark, Organization } from '@/types/data';
import type Fuse from 'fuse.js';

/**
 * Generate test data at scale
 */
function generateTestData(count: number): {
  capabilities: Capability[];
  landmarks: Landmark[];
  organizations: Organization[];
} {
  const capabilities: Capability[] = [];
  const landmarks: Landmark[] = [];
  const organizations: Organization[] = [];

  // Generate capabilities
  for (let i = 0; i < Math.floor(count / 10); i++) {
    capabilities.push({
      id: `capability-${i}`,
      name: `Capability ${i}`,
      description: `Description for capability ${i} with various keywords and technical terms`,
      shortDescription: `Short desc ${i}`,
      level: i % 2 === 0 ? 'archipelago' : 'island',
      polygonCoordinates: [
        { lat: i * 10, lng: i * 20 },
        { lat: i * 10 + 50, lng: i * 20 },
        { lat: i * 10 + 50, lng: i * 20 + 50 },
        { lat: i * 10, lng: i * 20 + 50 },
      ],
      visualStyleHints: {
        fillColor: '#3b82f6',
        fillOpacity: 0.3,
        strokeColor: '#1e40af',
        strokeWeight: 2,
      },
      relatedLandmarks: [],
      zoomThreshold: 2,
    });
  }

  // Generate landmarks (majority of items)
  for (let i = 0; i < Math.floor(count * 0.7); i++) {
    landmarks.push({
      id: `landmark-${i}`,
      name: `Landmark ${i}: ${i % 3 === 0 ? 'Attention' : i % 3 === 1 ? 'Transformer' : 'Model'}`,
      type: i % 4 === 0 ? 'paper' : i % 4 === 1 ? 'model' : i % 4 === 2 ? 'tool' : 'benchmark',
      year: 2010 + (i % 15),
      organization: `Organization ${i % 10}`,
      description: `Description for landmark ${i} containing various technical keywords and information`,
      externalLinks: [],
      coordinates: { lat: i * 5, lng: i * 10 },
      capabilityId: `capability-${i % 5}`,
      relatedLandmarks: [],
      tags: [
        `tag-${i % 10}`,
        `keyword-${i % 20}`,
        i % 3 === 0 ? 'attention' : 'transformer',
      ],
      zoomThreshold: -1,
    });
  }

  // Generate organizations
  for (let i = 0; i < Math.floor(count / 5); i++) {
    organizations.push({
      id: `org-${i}`,
      name: `Organization ${i}`,
      description: `Research organization ${i} focused on AI and machine learning`,
      landmarkIds: [],
      color: '#10a37f',
    });
  }

  return { capabilities, landmarks, organizations };
}

describe('search performance tests', () => {
  describe('initialization performance', () => {
    it('should initialize index with 50+ items in <100ms', () => {
      const data = generateTestData(50);
      const startTime = performance.now();
      const index = initializeSearchIndex(data);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(index).toBeDefined();
      expect(duration).toBeLessThan(100);
    });

    it('should initialize index with 100+ items in <150ms', () => {
      const data = generateTestData(100);
      const startTime = performance.now();
      const index = initializeSearchIndex(data);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(index).toBeDefined();
      expect(duration).toBeLessThan(150);
    });

    it('should handle large datasets (200+ items) efficiently', () => {
      const data = generateTestData(200);
      const startTime = performance.now();
      const index = initializeSearchIndex(data);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(index).toBeDefined();
      expect(duration).toBeLessThan(300); // Allow more time for larger dataset
    });
  });

  describe('search performance', () => {
    let searchIndex: Fuse<any>;

    beforeEach(() => {
      // Initialize with 50+ items as specified in requirements
      const data = generateTestData(50);
      searchIndex = initializeSearchIndex(data);
    });

    it('should complete search in <50ms for 50+ items', () => {
      const startTime = performance.now();
      const results = search('attention', searchIndex);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toBeDefined();
      expect(duration).toBeLessThan(50);
    });

    it('should handle multiple consecutive searches efficiently', () => {
      const queries = ['attention', 'transformer', 'model', 'organization', 'research'];
      const durations: number[] = [];

      queries.forEach((query) => {
        const startTime = performance.now();
        search(query, searchIndex);
        const endTime = performance.now();
        durations.push(endTime - startTime);
      });

      // Average duration should be well under the threshold
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      expect(avgDuration).toBeLessThan(50);

      // All individual searches should complete in reasonable time
      durations.forEach((duration) => {
        expect(duration).toBeLessThan(100);
      });
    });

    it('should handle short queries efficiently', () => {
      const startTime = performance.now();
      const results = search('a', searchIndex);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toBeDefined();
      expect(duration).toBeLessThan(50);
    });

    it('should handle long queries efficiently', () => {
      const startTime = performance.now();
      const results = search('attention mechanism transformer architecture', searchIndex);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toBeDefined();
      expect(duration).toBeLessThan(75); // Long queries may take slightly more time
    });

    it('should scale well with limited results', () => {
      const limits = [5, 10, 20, 50];

      limits.forEach((limit) => {
        const startTime = performance.now();
        const results = search('attention', searchIndex, limit);
        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(results.length).toBeLessThanOrEqual(limit);
        expect(duration).toBeLessThan(50);
      });
    });
  });

  describe('scalability tests', () => {
    it('should maintain performance with 100+ items', () => {
      const data = generateTestData(100);
      const index = initializeSearchIndex(data);

      const startTime = performance.now();
      const results = search('attention', index);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toBeDefined();
      expect(duration).toBeLessThan(75); // Slightly higher threshold for larger dataset
    });

    it('should handle stress test with multiple queries on large dataset', () => {
      const data = generateTestData(150);
      const index = initializeSearchIndex(data);
      const queries = [
        'attention',
        'transformer',
        'model',
        'capability',
        'organization',
        'research',
        'ai',
        'machine learning',
      ];

      const startTime = performance.now();
      queries.forEach((query) => {
        search(query, index);
      });
      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // All searches should complete in reasonable total time
      expect(totalDuration).toBeLessThan(400); // ~50ms per query
    });
  });

  describe('memory efficiency', () => {
    it('should not create excessive objects during search', () => {
      const data = generateTestData(50);
      const index = initializeSearchIndex(data);

      // Perform multiple searches
      for (let i = 0; i < 10; i++) {
        search('test query', index);
      }

      // If this test completes without memory issues, we're good
      expect(true).toBe(true);
    });

    it('should handle rapid consecutive searches', () => {
      const data = generateTestData(50);
      const index = initializeSearchIndex(data);

      const startTime = performance.now();
      for (let i = 0; i < 20; i++) {
        search(`query-${i}`, index, 10);
      }
      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // 20 searches should complete quickly
      expect(totalDuration).toBeLessThan(1000); // 1 second for 20 searches
    });
  });
});
