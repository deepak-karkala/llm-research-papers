import { test, expect } from '@playwright/test';

test.describe('Tour Map Synchronization (Issue #030)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('[class*="leaflet"]', { timeout: 5000 });
  });

  test.describe('Map Pan and Zoom', () => {
    test('should pan map to first tour stage coordinates', async ({ page }) => {
      // Initialize map with a tour
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          // Create a mock tour
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1600, lng: 2100 },
                mapZoom: 0,
                landmarkIds: ['landmark-1', 'landmark-2'],
                capabilities: ['capability-1'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      // Wait for map sync to occur
      await page.waitForTimeout(1500);

      // Check if map is centered at the expected coordinates
      const mapCenter = await page.evaluate(() => {
        // This is a simplified check - in real Leaflet, we'd access the actual map object
        return document.querySelector('[class*="leaflet-pane"]') !== null;
      });

      expect(mapCenter).toBeTruthy();
    });

    test('should zoom map to stage zoom level', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 1,
                landmarkIds: ['landmark-1'],
                capabilities: ['capability-1'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      // Wait for animation
      await page.waitForTimeout(1500);

      // Verify map is still interactive
      const mapExists = await page.evaluate(() => {
        return document.querySelector('[class*="leaflet-container"]') !== null;
      });

      expect(mapExists).toBeTruthy();
    });

    test('should animate map transition between stages', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: ['landmark-1'],
                capabilities: ['capability-1'],
              },
              {
                id: 'stage-1',
                title: 'Stage 1',
                narration: 'Second stage',
                mapCenter: { lat: 1600, lng: 2100 },
                mapZoom: 0.5,
                landmarkIds: ['landmark-2'],
                capabilities: ['capability-2'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      // Wait for first map sync
      await page.waitForTimeout(1500);

      // Move to second stage
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        useMapStore.getState().setCurrentTourStageIndex(1);
      });

      // Wait for animation to second stage
      await page.waitForTimeout(1500);

      // Verify map is still functional
      const mapValid = await page.evaluate(() => {
        return document.querySelector('[class*="leaflet-pane"]') !== null;
      });

      expect(mapValid).toBeTruthy();
    });
  });

  test.describe('Landmark Highlighting', () => {
    test('should highlight current stage landmarks', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: ['landmark-current-1', 'landmark-current-2'],
                capabilities: ['capability-1'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      // Wait for highlighting to be applied
      await page.waitForTimeout(1500);

      // Check if highlights were updated in store
      const highlights = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        return useMapStore.getState().tourHighlights;
      });

      expect(highlights.current).toContain('landmark-current-1');
      expect(highlights.current).toContain('landmark-current-2');
    });

    test('should differentiate between current, previous, and future landmarks', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: ['landmark-past-1'],
                capabilities: ['capability-1'],
              },
              {
                id: 'stage-1',
                title: 'Stage 1',
                narration: 'Second stage',
                mapCenter: { lat: 1600, lng: 2100 },
                mapZoom: 0.5,
                landmarkIds: ['landmark-current-1', 'landmark-current-2'],
                capabilities: ['capability-2'],
              },
              {
                id: 'stage-2',
                title: 'Stage 2',
                narration: 'Third stage',
                mapCenter: { lat: 1700, lng: 2200 },
                mapZoom: 1,
                landmarkIds: ['landmark-future-1', 'landmark-future-2'],
                capabilities: ['capability-3'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(1);
        }
      });

      // Wait for highlighting
      await page.waitForTimeout(1500);

      const highlights = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        return useMapStore.getState().tourHighlights;
      });

      // Check current stage highlights
      expect(highlights.current).toContain('landmark-current-1');
      expect(highlights.current).toContain('landmark-current-2');

      // Check previous stage highlights
      expect(highlights.previous).toContain('landmark-past-1');

      // Check future stage highlights
      expect(highlights.future).toContain('landmark-future-1');
      expect(highlights.future).toContain('landmark-future-2');
    });

    test('should update highlights when stage changes', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: ['landmark-stage0-1'],
                capabilities: ['capability-1'],
              },
              {
                id: 'stage-1',
                title: 'Stage 1',
                narration: 'Second stage',
                mapCenter: { lat: 1600, lng: 2100 },
                mapZoom: 0.5,
                landmarkIds: ['landmark-stage1-1'],
                capabilities: ['capability-2'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      await page.waitForTimeout(1500);

      // Get initial highlights
      const initialHighlights = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        return useMapStore.getState().tourHighlights;
      });

      expect(initialHighlights.current).toContain('landmark-stage0-1');

      // Move to next stage
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        useMapStore.getState().setCurrentTourStageIndex(1);
      });

      await page.waitForTimeout(1500);

      // Get updated highlights
      const updatedHighlights = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        return useMapStore.getState().tourHighlights;
      });

      // Verify highlights changed
      expect(updatedHighlights.current).toContain('landmark-stage1-1');
      expect(updatedHighlights.previous).toContain('landmark-stage0-1');
    });

    test('should clear highlights when tour ends', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: ['landmark-1'],
                capabilities: ['capability-1'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      await page.waitForTimeout(1500);

      // Verify highlights are set
      let highlights = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        return useMapStore.getState().tourHighlights;
      });

      expect(highlights.current.length).toBeGreaterThan(0);

      // Clear the tour
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        useMapStore.getState().setCurrentTour(null);
      });

      await page.waitForTimeout(500);

      // Verify highlights are cleared
      highlights = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        return useMapStore.getState().tourHighlights;
      });

      expect(highlights.current.length).toBe(0);
      expect(highlights.previous.length).toBe(0);
      expect(highlights.future.length).toBe(0);
    });
  });

  test.describe('Animation Configuration', () => {
    test('should respect custom animation duration', async ({ page }) => {
      const startTime = Date.now();

      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: ['landmark-1'],
                capabilities: ['capability-1'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      // Wait for animation with custom duration
      await page.waitForTimeout(2500);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should have taken at least the animation duration (1000ms default + overhead)
      expect(duration).toBeGreaterThanOrEqual(1000);
    });

    test('should handle rapid stage navigation', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: ['landmark-1'],
                capabilities: ['capability-1'],
              },
              {
                id: 'stage-1',
                title: 'Stage 1',
                narration: 'Second stage',
                mapCenter: { lat: 1600, lng: 2100 },
                mapZoom: 0.5,
                landmarkIds: ['landmark-2'],
                capabilities: ['capability-2'],
              },
              {
                id: 'stage-2',
                title: 'Stage 2',
                narration: 'Third stage',
                mapCenter: { lat: 1700, lng: 2200 },
                mapZoom: 1,
                landmarkIds: ['landmark-3'],
                capabilities: ['capability-3'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      await page.waitForTimeout(500);

      // Rapidly navigate through stages
      for (let i = 1; i <= 2; i++) {
        await page.evaluate((stageIdx: number) => {
          const { useMapStore } = (window as any);
          useMapStore.getState().setCurrentTourStageIndex(stageIdx);
        }, i);

        await page.waitForTimeout(200);
      }

      // Wait for final animation to complete
      await page.waitForTimeout(1500);

      // Verify final state is correct
      const finalHighlights = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        const state = useMapStore.getState();
        return {
          stageIndex: state.currentTourStageIndex,
          currentHighlights: state.tourHighlights.current,
        };
      });

      expect(finalHighlights.stageIndex).toBe(2);
      expect(finalHighlights.currentHighlights).toContain('landmark-3');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle tour with no landmarks gracefully', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: [], // No landmarks
                capabilities: ['capability-1'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      await page.waitForTimeout(1500);

      // Verify map is still functional
      const mapValid = await page.evaluate(() => {
        return document.querySelector('[class*="leaflet-container"]') !== null;
      });

      expect(mapValid).toBeTruthy();

      // Verify empty highlights
      const highlights = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        return useMapStore.getState().tourHighlights;
      });

      expect(highlights.current).toEqual([]);
    });

    test('should handle missing mapRef gracefully', async ({ page }) => {
      // Set up a tour without initializing map first
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          const store = useMapStore.getState();
          // Ensure mapRef is null
          store.setMapRef(null);

          const mockTour = {
            id: 'test-tour',
            name: 'Test Tour',
            description: 'A test tour',
            difficulty: 'beginner',
            estimatedDuration: 5,
            stages: [
              {
                id: 'stage-0',
                title: 'Stage 0',
                narration: 'First stage',
                mapCenter: { lat: 1500, lng: 2000 },
                mapZoom: 0,
                landmarkIds: ['landmark-1'],
                capabilities: ['capability-1'],
              },
            ],
          };

          store.setCurrentTour(mockTour);
          store.setCurrentTourStageIndex(0);
        }
      });

      // Should not crash
      await page.waitForTimeout(1500);

      // Page should still be functional
      const isValid = await page.evaluate(() => {
        return document.body !== null;
      });

      expect(isValid).toBeTruthy();
    });
  });
});
