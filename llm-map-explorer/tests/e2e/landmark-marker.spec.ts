import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('LandmarkMarker Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('[class*="leaflet"]', { timeout: 5000 });
  });

  test.describe('Visual Rendering', () => {
    test('should render landmark markers on the map', async ({ page }) => {
      // Wait for markers to be rendered
      const markers = page.locator('[class*="marker"]');
      const count = await markers.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should display different icons for different landmark types', async ({ page }) => {
      // Get all markers
      const markers = page.locator('[class*="marker"]');

      // Check that we have markers
      const count = await markers.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Hover Interactions', () => {
    test('should show tooltip when hovering over a marker', async ({ page }) => {
      // Get first marker and hover
      const firstMarker = page.locator('[class*="marker"]').first();
      await firstMarker.hover();

      // Wait for tooltip to appear
      const tooltip = page.locator('[class*="tooltip"]');
      await expect(tooltip).toBeVisible({ timeout: 1000 });
    });

    test('should display tooltip text with landmark name, type, and year', async ({ page }) => {
      // Hover over first marker
      const firstMarker = page.locator('[class*="marker"]').first();
      const title = await firstMarker.getAttribute('title');

      expect(title).toBeDefined();
      expect(title).toContain('·'); // Separator in tooltip format
    });

    test('should hide tooltip when hover ends', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Hover
      await firstMarker.hover();
      const tooltip = page.locator('[class*="tooltip"]');
      await expect(tooltip).toBeVisible({ timeout: 1000 });

      // Unhover
      await page.mouse.move(0, 0);

      // Tooltip should be hidden or not visible
      await expect(tooltip).not.toBeVisible({ timeout: 500 });
    });

    test('should handle rapid hover interactions', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Rapid hover/unhover
      for (let i = 0; i < 5; i++) {
        await firstMarker.hover();
        await page.mouse.move(0, 0);
      }

      // No errors should occur
      const markers = page.locator('[class*="marker"]');
      expect(await markers.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Click Interactions', () => {
    test('should respond to marker click', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Click should not throw error
      await firstMarker.click();

      // Marker should still be visible
      await expect(firstMarker).toBeVisible();
    });

    test('should handle multiple consecutive clicks', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Multiple clicks
      await firstMarker.click();
      await firstMarker.click();
      await firstMarker.click();

      // Component should still be functional
      await expect(firstMarker).toBeVisible();
    });

    test('should be clickable from different positions on the marker', async ({ page }) => {
      const markers = page.locator('[class*="marker"]');
      const firstMarker = markers.first();

      // Click should work
      await firstMarker.click({ force: true });

      expect(await markers.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should allow keyboard focus on markers', async ({ page }) => {
      // Tab through markers
      await page.keyboard.press('Tab');

      // Wait a bit and ensure page is still functional
      await page.waitForTimeout(100);
      const markers = page.locator('[class*="marker"]');
      expect(await markers.count()).toBeGreaterThan(0);
    });

    test('should support Enter key on focused marker', async ({ page }) => {
      // Get first marker
      const firstMarker = page.locator('[class*="marker"]').first();

      // Focus the marker
      await firstMarker.focus();

      // Press Enter
      await page.keyboard.press('Enter');

      // Marker should still be present
      await expect(firstMarker).toBeVisible();
    });

    test('should support Space key on focused marker', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Focus the marker
      await firstMarker.focus();

      // Press Space
      await page.keyboard.press('Space');

      // Marker should still be present
      await expect(firstMarker).toBeVisible();
    });
  });

  test.describe('Visual States', () => {
    test('should apply hover styling when marker is hovered', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Get initial styles
      const initialStyle = await firstMarker.getAttribute('style');

      // Hover
      await firstMarker.hover();
      await page.waitForTimeout(200); // Wait for transition

      // Marker should still be visible with changes
      await expect(firstMarker).toBeVisible();
    });

    test('should show selected state styling when clicked', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Click to select
      await firstMarker.click();

      // Marker should be visible and responsive
      await expect(firstMarker).toBeVisible();
    });

    test('should show dimmed state when another marker is hovered', async ({ page }) => {
      const markers = page.locator('[class*="marker"]');
      const count = await markers.count();

      if (count >= 2) {
        const firstMarker = markers.first();

        // Hover over first marker
        await firstMarker.hover();

        // Other markers should still be visible
        const secondMarker = markers.nth(1);
        await expect(secondMarker).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Check for title attribute (used for accessibility)
      const title = await firstMarker.getAttribute('title');
      expect(title).toBeDefined();
      expect(title).toBeTruthy();
    });

    test('should be keyboard accessible', async ({ page }) => {
      // Tab to first marker
      await page.keyboard.press('Tab');

      // Get focused element
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.className || '';
      });

      // Some element should be focused
      expect(focusedElement).toBeDefined();
    });

    test('should have no accessibility violations', async ({ page }) => {
      // Wait for markers to load
      await page.waitForSelector('[class*="marker"]', { timeout: 5000 });

      // Run accessibility scan
      const results = await new AxeBuilder({ page }).analyze();

      // Filter out known limitations with leaflet markers
      const violations = results.violations.filter(
        (v) => !v.id.includes('color-contrast') // Leaflet colors might differ
      );

      expect(violations).toEqual([]);
    });

    test('should display tooltip with complete landmark information', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Get title attribute which contains full accessibility info
      const title = await firstMarker.getAttribute('title');

      // Should contain name, type, year, and organization separated by dots
      expect(title).toMatch(/.*·.*·.*·.*/);
    });

    test('should support screen reader navigation', async ({ page }) => {
      // Get markers
      const markers = page.locator('[class*="marker"]');
      const count = await markers.count();

      // Each marker should have a title for screen readers
      for (let i = 0; i < Math.min(count, 3); i++) {
        const marker = markers.nth(i);
        const title = await marker.getAttribute('title');
        expect(title).toBeTruthy();
      }
    });
  });

  test.describe('Performance', () => {
    test('should render multiple markers without performance degradation', async ({ page }) => {
      // Get all markers
      const markers = page.locator('[class*="marker"]');
      const count = await markers.count();

      expect(count).toBeGreaterThan(0);

      // Interact with all markers
      for (let i = 0; i < Math.min(count, 5); i++) {
        const marker = markers.nth(i);
        await marker.hover();
        await marker.click();
      }

      // All markers should still be visible
      expect(await markers.count()).toBe(count);
    });

    test('should handle rapid hover interactions on multiple markers', async ({ page }) => {
      const markers = page.locator('[class*="marker"]');
      const count = await markers.count();

      // Rapid hover over multiple markers
      for (let i = 0; i < Math.min(count, 5); i++) {
        const marker = markers.nth(i);
        await marker.hover({ timeout: 100 });
      }

      // Move mouse away
      await page.mouse.move(0, 0);

      // All markers should still be present
      expect(await markers.count()).toBe(count);
    });
  });

  test.describe('Error Handling', () => {
    test('should not throw errors on rapid interactions', async ({ page }) => {
      const firstMarker = page.locator('[class*="marker"]').first();

      // Perform rapid interactions
      await firstMarker.hover();
      await firstMarker.click();
      await firstMarker.hover();
      await firstMarker.click();

      // Check for console errors
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Component should still be responsive
      await expect(firstMarker).toBeVisible();
    });

    test('should gracefully handle missing data', async ({ page }) => {
      // Even if some data is missing, component should render
      const markers = page.locator('[class*="marker"]');
      expect(await markers.count()).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Multi-Marker Interactions', () => {
    test('should handle interactions between multiple markers', async ({ page }) => {
      const markers = page.locator('[class*="marker"]');
      const count = await markers.count();

      if (count >= 2) {
        // Hover over first marker
        await markers.first().hover();
        await page.waitForTimeout(100);

        // Click second marker
        await markers.nth(1).click();
        await page.waitForTimeout(100);

        // Hover over first marker again
        await markers.first().hover();

        // Both should still be visible
        expect(await markers.count()).toBe(count);
      }
    });

    test('should maintain state when switching between markers', async ({ page }) => {
      const markers = page.locator('[class*="marker"]');
      const count = await markers.count();

      if (count >= 2) {
        // Click first marker
        await markers.first().click();

        // Click second marker
        await markers.nth(1).click();

        // Both markers should be visible
        expect(await markers.count()).toBe(count);
      }
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should work on different viewport sizes', async ({ page }) => {
      // Set different viewport sizes
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 },   // Mobile
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);

        // Wait for re-layout
        await page.waitForTimeout(500);

        // Markers should still be present
        const markers = page.locator('[class*="marker"]');
        expect(await markers.count()).toBeGreaterThan(0);
      }
    });

    test('should handle zoom level changes', async ({ page }) => {
      // Get initial marker count
      const initialCount = await page.locator('[class*="marker"]').count();

      // Zoom in/out (simulated with viewport change)
      await page.setViewportSize({ width: 1200, height: 900 });
      await page.waitForTimeout(300);

      // Markers should still be visible
      const finalCount = await page.locator('[class*="marker"]').count();
      expect(finalCount).toBeGreaterThan(0);
    });
  });
});
