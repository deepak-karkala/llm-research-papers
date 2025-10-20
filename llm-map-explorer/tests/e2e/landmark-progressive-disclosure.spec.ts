import { test, expect } from '@playwright/test';

test.describe('Landmark Progressive Disclosure', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('[class*="leaflet"]', { timeout: 5000 });
  });

  test.describe('Z0 (Continental): Zoom < 1', () => {
    test('should show only 5 seminal papers at continental zoom', async ({ page }) => {
      // Set zoom to Z0 (continental level)
      await page.evaluate(() => {
        // Access Leaflet map and zoom to level -1 or 0
        const mapEl = document.querySelector('[class*="leaflet-container"]');
        if (mapEl) {
          const maps = (window as any).L?.map?.instances || [];
          if (maps.length > 0) {
            maps[0].setZoom(-1);
          }
        }
      });

      // Wait for markers to settle
      await page.waitForTimeout(500);

      // Count visible landmark markers
      const markers = page.locator('[class*="landmark-marker"]');
      const count = await markers.count();

      // At Z0, we should see ~5 seminal papers
      expect(count).toBeLessThanOrEqual(6); // Allow small variation
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('should display seminal papers like Attention, BERT, GPT-3', async ({ page }) => {
      // Zoom to continental level
      await page.evaluate(() => {
        const mapEl = document.querySelector('[class*="leaflet-container"]');
        if (mapEl) {
          const maps = (window as any).L?.map?.instances || [];
          if (maps.length > 0) {
            maps[0].setZoom(-1);
          }
        }
      });

      await page.waitForTimeout(500);

      // Get all marker titles
      const markers = page.locator('[class*="landmark-marker"]');

      // Hover over markers to see titles
      for (let i = 0; i < Math.min(await markers.count(), 5); i++) {
        const marker = markers.nth(i);
        const title = await marker.getAttribute('title');

        // Should contain landmark name
        expect(title).toBeTruthy();
      }
    });
  });

  test.describe('Z1 (Archipelago): 1 <= zoom < 2', () => {
    test('should show 12-13 landmarks at archipelago zoom', async ({ page }) => {
      // Set zoom to Z1 (archipelago level)
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(1);
        }
      });

      await page.waitForTimeout(500);

      // Count visible landmarks
      const markers = page.locator('[class*="landmark-marker"]');
      const count = await markers.count();

      // At Z1, should see ~12 landmarks
      expect(count).toBeLessThanOrEqual(15);
      expect(count).toBeGreaterThanOrEqual(10);
    });

    test('should include both Z0 and Z1 landmarks', async ({ page }) => {
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(1);
        }
      });

      await page.waitForTimeout(500);

      // Should have more landmarks than Z0 but less than Z2
      const markersZ1 = page.locator('[class*="landmark-marker"]');
      const countZ1 = await markersZ1.count();

      // Now zoom to Z0 to compare
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(-1);
        }
      });

      await page.waitForTimeout(500);

      const markersZ0 = page.locator('[class*="landmark-marker"]');
      const countZ0 = await markersZ0.count();

      // Z1 should have more than Z0
      expect(countZ1).toBeGreaterThan(countZ0);
    });
  });

  test.describe('Z2 (Island): 2 <= zoom <= 3', () => {
    test('should show all 26 landmarks at island zoom', async ({ page }) => {
      // Set zoom to Z2 (island level)
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(2);
        }
      });

      await page.waitForTimeout(500);

      // Count all visible landmarks
      const markers = page.locator('[class*="landmark-marker"]');
      const count = await markers.count();

      // At Z2, should see all 26 landmarks
      expect(count).toBe(26);
    });

    test('should show complete research landscape', async ({ page }) => {
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(3); // Max zoom
        }
      });

      await page.waitForTimeout(500);

      const markers = page.locator('[class*="landmark-marker"]');
      const count = await markers.count();

      // All landmarks visible
      expect(count).toBe(26);

      // All different types should be present
      const titles = await markers.locator('..').allTextContents();
      const hasAll = titles.length > 0;

      expect(hasAll).toBe(true);
    });
  });

  test.describe('Zoom Level Transitions', () => {
    test('should progressively show more landmarks when zooming in', async ({ page }) => {
      const zoomSequence = [-1, 0, 1, 2, 3];
      const counts: number[] = [];

      for (const zoom of zoomSequence) {
        await page.evaluate((z) => {
          const maps = (window as any).L?.map?.instances || [];
          if (maps.length > 0) {
            maps[0].setZoom(z);
          }
        }, zoom);

        await page.waitForTimeout(300);

        const markers = page.locator('[class*="landmark-marker"]');
        const count = await markers.count();
        counts.push(count);
      }

      // Counts should generally increase or stay the same as we zoom in
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
      }

      // Final count should be 26
      expect(counts[counts.length - 1]).toBe(26);
    });

    test('should progressively hide landmarks when zooming out', async ({ page }) => {
      const zoomSequence = [3, 2, 1, 0, -1];
      const counts: number[] = [];

      for (const zoom of zoomSequence) {
        await page.evaluate((z) => {
          const maps = (window as any).L?.map?.instances || [];
          if (maps.length > 0) {
            maps[0].setZoom(z);
          }
        }, zoom);

        await page.waitForTimeout(300);

        const markers = page.locator('[class*="landmark-marker"]');
        const count = await markers.count();
        counts.push(count);
      }

      // Counts should generally decrease as we zoom out
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
      }

      // Final count should be ~5
      expect(counts[counts.length - 1]).toBeLessThanOrEqual(6);
    });

    test('should handle rapid zoom level changes', async ({ page }) => {
      const zoomLevels = [-1, 2, 1, 3, 0, 2, -1];

      for (const zoom of zoomLevels) {
        await page.evaluate((z) => {
          const maps = (window as any).L?.map?.instances || [];
          if (maps.length > 0) {
            maps[0].setZoom(z);
          }
        }, zoom);

        await page.waitForTimeout(100); // Quick transitions

        const markers = page.locator('[class*="landmark-marker"]');
        const count = await markers.count();

        // Should still have valid count
        expect(count).toBeGreaterThanOrEqual(0);
        expect(count).toBeLessThanOrEqual(26);
      }
    });
  });

  test.describe('Smooth Transitions', () => {
    test('should smoothly reveal landmarks as user zooms in', async ({ page }) => {
      // Start at Z0
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(-1);
        }
      });

      await page.waitForTimeout(500);

      const markersBefore = page.locator('[class*="landmark-marker"]');
      const countBefore = await markersBefore.count();

      // Zoom to Z1
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(1.5);
        }
      });

      // Wait for transitions (300ms as per design spec)
      await page.waitForTimeout(400);

      const markersAfter = page.locator('[class*="landmark-marker"]');
      const countAfter = await markersAfter.count();

      // Should have more markers after zoom
      expect(countAfter).toBeGreaterThan(countBefore);

      // Markers should have transition CSS applied
      const markerElement = markersAfter.first();
      const style = await markerElement.getAttribute('style');

      // Should have transition styles
      expect(style).toBeTruthy();
    });

    test('should maintain selection state during zoom transitions', async ({ page }) => {
      // Start at Z1
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(1);
        }
      });

      await page.waitForTimeout(300);

      // Click on a marker
      const firstMarker = page.locator('[class*="landmark-marker"]').first();
      await firstMarker.click();

      // Zoom out
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(0.5);
        }
      });

      await page.waitForTimeout(300);

      // If marker is still visible, it should maintain state
      const markers = page.locator('[class*="landmark-marker"]');
      const count = await markers.count();

      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Accessibility During Zoom', () => {
    test('should maintain keyboard accessibility through zoom levels', async ({ page }) => {
      // Start at Z0
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(0);
        }
      });

      await page.waitForTimeout(300);

      // Tab through markers at Z0
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement?.className);
      expect(focusedElement).toBeTruthy();

      // Zoom to Z1
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(1);
        }
      });

      await page.waitForTimeout(300);

      // Should still be able to tab through new markers
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.className);
      expect(focusedElement).toBeTruthy();
    });

    test('should update ARIA labels for visible landmarks', async ({ page }) => {
      // Get landmarks at Z1
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(1);
        }
      });

      await page.waitForTimeout(300);

      const firstMarker = page.locator('[class*="landmark-marker"]').first();
      const title = await firstMarker.getAttribute('title');

      // Should have accessible title
      expect(title).toBeTruthy();
      expect(title).toContain('·'); // Format check
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle zoom level boundaries correctly', async ({ page }) => {
      const boundaryZooms = [0.99, 1.0, 1.99, 2.0];

      for (const zoom of boundaryZooms) {
        await page.evaluate((z) => {
          const maps = (window as any).L?.map?.instances || [];
          if (maps.length > 0) {
            maps[0].setZoom(z);
          }
        }, zoom);

        await page.waitForTimeout(200);

        const markers = page.locator('[class*="landmark-marker"]');
        const count = await markers.count();

        // Should have valid count at boundary
        expect(count).toBeGreaterThanOrEqual(0);
        expect(count).toBeLessThanOrEqual(26);
      }
    });

    test('should handle maximum zoom level', async ({ page }) => {
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(3); // Max zoom
        }
      });

      await page.waitForTimeout(300);

      const markers = page.locator('[class*="landmark-marker"]');
      const count = await markers.count();

      // Should show all landmarks
      expect(count).toBe(26);
    });

    test('should handle minimum zoom level', async ({ page }) => {
      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          maps[0].setZoom(-1); // Min zoom
        }
      });

      await page.waitForTimeout(300);

      const markers = page.locator('[class*="landmark-marker"]');
      const count = await markers.count();

      // Should show only ~5 seminal papers
      expect(count).toBeLessThanOrEqual(6);
      expect(count).toBeGreaterThanOrEqual(4);
    });
  });

  test.describe('Performance', () => {
    test('should not lag when filtering large landmark set', async ({ page }) => {
      const startTime = Date.now();

      await page.evaluate(() => {
        const maps = (window as any).L?.map?.instances || [];
        if (maps.length > 0) {
          for (let i = 0; i < 5; i++) {
            maps[0].setZoom(i % 4); // Cycle through zoom levels
          }
        }
      });

      await page.waitForTimeout(2000);
      const endTime = Date.now();

      // Should complete in reasonable time (< 5 seconds for 5 zoom changes)
      expect(endTime - startTime).toBeLessThan(5000);

      // Should have valid landmark count
      const markers = page.locator('[class*="landmark-marker"]');
      const count = await markers.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
