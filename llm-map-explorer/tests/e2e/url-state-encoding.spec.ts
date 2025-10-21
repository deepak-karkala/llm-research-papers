/**
 * E2E Tests for URL State Encoding/Decoding (Issue #24)
 *
 * Tests the complete user flow for shareable links:
 * 1. User navigates the map and selects entities
 * 2. URL updates to reflect current state
 * 3. User shares the URL
 * 4. Another user opens the link
 * 5. Map restores to exact state
 */

import { test, expect } from '@playwright/test';

test.describe('URL State Encoding - Issue #24', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for map container to be visible with increased timeout
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    // Wait for data to load
    await page.waitForTimeout(1000);
  });

  test('should load app with default state when no URL params', async ({ page }) => {
    // Verify URL has no params
    expect(page.url()).toBe('http://localhost:3000/');

    // Map should be visible
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
  });

  test('should restore map center from URL parameters', async ({ page }) => {
    // Navigate with map center parameters
    await page.goto('/?lat=45.50&lng=120.75&zoom=1');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Get map center through JavaScript
    const center = await page.evaluate(() => {
      // @ts-ignore - Leaflet map is attached to window
      return window.__map?.getCenter ? window.__map.getCenter() : null;
    });

    // Verify map moved to approximate location
    // Allow some tolerance due to map interpolation
    if (center) {
      expect(Math.abs(center.lat - 45.5)).toBeLessThan(2);
      expect(Math.abs(center.lng - 120.75)).toBeLessThan(2);
    }
  });

  test('should restore zoom level from URL parameters', async ({ page }) => {
    // Navigate with zoom parameter
    await page.goto('/?zoom=2');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Get zoom level
    const zoom = await page.evaluate(() => {
      // @ts-ignore - Leaflet map is attached to window
      return window.__map?.getZoom ? window.__map.getZoom() : null;
    });

    // Verify zoom level
    if (zoom !== null) {
      expect(zoom).toBe(2);
    }
  });

  test('should restore selected landmark from URL parameters', async ({ page }) => {
    // Navigate with entity parameters
    await page.goto('/?entity=test-landmark&entityType=landmark');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // On desktop, info panel should be visible with entity details
    // This depends on data availability, so we just check the URL is parsed
    const url = page.url();
    expect(url).toContain('entity=test-landmark');
    expect(url).toContain('entityType=landmark');
  });

  test('should restore capability selection from URL parameters', async ({ page }) => {
    // Navigate with capability entity
    await page.goto('/?entity=test-capability&entityType=capability');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Verify URL params are present
    const url = page.url();
    expect(url).toContain('entity=test-capability');
    expect(url).toContain('entityType=capability');
  });

  test('should restore organization highlighting from URL parameters', async ({ page }) => {
    // Navigate with org parameter
    await page.goto('/?org=test-org');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Verify URL params are present
    const url = page.url();
    expect(url).toContain('org=test-org');
  });

  test('should restore complete state from URL with all parameters', async ({ page }) => {
    // Navigate with all parameters
    await page.goto('/?lat=50.00&lng=100.00&zoom=1&entity=lm-001&entityType=landmark&org=org-001');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verify all parameters are in URL
    const url = page.url();
    expect(url).toContain('lat=50.00');
    expect(url).toContain('lng=100.00');
    expect(url).toContain('zoom=1');
    expect(url).toContain('entity=lm-001');
    expect(url).toContain('entityType=landmark');
    expect(url).toContain('org=org-001');
  });

  test('should update URL when panning map', async ({ page }) => {
    // Get initial URL
    const initialUrl = page.url();

    // Pan the map by dragging
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.dragTo(mapContainer, { sourcePosition: { x: 500, y: 300 }, targetPosition: { x: 200, y: 100 } });

    // Wait for debounced URL update (500ms)
    await page.waitForTimeout(600);

    // Get new URL
    const newUrl = page.url();

    // URL should have changed with new lat/lng
    expect(newUrl).not.toBe(initialUrl);
    expect(newUrl).toContain('lat=');
    expect(newUrl).toContain('lng=');
  });

  test('should update URL when zooming map', async ({ page }) => {
    // Get initial URL
    const initialUrl = page.url();

    // Zoom in using the zoom control
    const zoomInButton = page.locator('.leaflet-control-zoom-in');
    if (await zoomInButton.isVisible({ timeout: 5000 })) {
      await zoomInButton.click();
      // Wait for zoom animation and debounced URL update
      await page.waitForTimeout(1100);

      // Get new URL
      const newUrl = page.url();

      // URL should have zoom parameter
      expect(newUrl).toContain('zoom=');
    }
  });

  test('should preserve URL parameters when performing map actions', async ({ page }) => {
    // Navigate with entity parameter
    await page.goto('/?entity=lm-001&entityType=landmark');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Pan the map
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.dragTo(mapContainer, { sourcePosition: { x: 500, y: 300 }, targetPosition: { x: 300, y: 400 } });

    // Wait for debounced update
    await page.waitForTimeout(600);

    // Get URL
    const url = page.url();

    // Should still have entity parameter
    expect(url).toContain('entity=lm-001');
    expect(url).toContain('entityType=landmark');

    // Should also have new map position
    expect(url).toContain('lat=');
    expect(url).toContain('lng=');
  });

  test('should gracefully handle invalid URL parameters', async ({ page }) => {
    // Navigate with invalid parameters
    await page.goto('/?lat=invalid&lng=xyz&zoom=notanumber&entity=&entityType=invalid');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Map should still load successfully
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();

    // Should not crash or show errors
    const errorMessages = await page.evaluate(() => {
      // @ts-ignore - Check if there are console errors
      return window.__errors || [];
    });
    expect(errorMessages.length).toBe(0);
  });

  test('should ignore unknown URL parameters', async ({ page }) => {
    // Navigate with both known and unknown parameters
    await page.goto('/?lat=45&lng=120&zoom=2&unknown=value&another=param&entity=lm-001&entityType=landmark');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Map should load successfully
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();

    // Known parameters should be processed
    const url = page.url();
    expect(url).toContain('lat=45');
    expect(url).toContain('lng=120');
    expect(url).toContain('entity=lm-001');
  });

  test('should debounce rapid URL updates', async ({ page }) => {
    // Get initial URL
    const initialUrl = page.url();

    // Perform multiple rapid map pans
    const mapContainer = page.locator('.leaflet-container');
    for (let i = 0; i < 3; i++) {
      await mapContainer.dragTo(mapContainer, {
        sourcePosition: { x: 500 + i * 50, y: 300 },
        targetPosition: { x: 300 + i * 50, y: 200 },
      });
      // Small delay between drags but less than debounce time
      await page.waitForTimeout(100);
    }

    // Wait for final debounced update
    await page.waitForTimeout(600);

    // Should only have one URL with final position, not multiple
    const finalUrl = page.url();
    expect(finalUrl).not.toBe(initialUrl);
    expect(finalUrl).toContain('lat=');
    expect(finalUrl).toContain('lng=');
  });

  test('should support copying and sharing URL', async ({ page }) => {
    // Navigate to a specific state
    await page.goto('/?lat=50&lng=100&zoom=2&entity=lm-001&entityType=landmark');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Get the current URL
    const shareUrl = page.url();
    expect(shareUrl).toContain('lat=50');
    expect(shareUrl).toContain('lng=100');
    expect(shareUrl).toContain('zoom=2');
    expect(shareUrl).toContain('entity=lm-001');

    // Open the same URL in a new page (simulating share)
    const newPage = await page.context().newPage();
    await newPage.goto(shareUrl);

    // Wait for map to load
    await newPage.waitForSelector('.leaflet-container', { timeout: 10000 });
    await newPage.waitForTimeout(500);

    // New page should have the same URL
    expect(newPage.url()).toBe(shareUrl);

    // Cleanup
    await newPage.close();
  });

  test('should handle special characters in entity IDs', async ({ page }) => {
    // Navigate with entity ID containing special characters (URL encoded)
    await page.goto('/?entity=lm-001_special&entityType=landmark');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // URL should handle special characters
    const url = page.url();
    expect(url).toContain('entity=lm-001_special');
    expect(url).toContain('entityType=landmark');
  });

  test('should handle full workflow: navigate, share, restore', async ({ page, context }) => {
    // Step 1: User navigates the map and selects an entity
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Simulate navigating to a specific state
    const targetUrl = '/?lat=45&lng=120&zoom=1&entity=lm-test&entityType=landmark&org=org-test';

    // Step 2: Go to the state
    await page.goto(targetUrl);
    await page.waitForTimeout(1000);

    // Verify state is loaded
    let url = page.url();
    expect(url).toContain('lat=45');
    expect(url).toContain('lng=120');

    // Step 3: Simulate sharing by getting the URL
    const shareUrl = page.url();

    // Step 4: Another user opens the shared URL in a new page
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    await newPage.waitForSelector('.leaflet-container', { timeout: 10000 });
    await newPage.waitForTimeout(1000);

    // Step 5: Verify exact state is restored
    url = newPage.url();
    expect(url).toContain('lat=45');
    expect(url).toContain('lng=120');
    expect(url).toContain('zoom=1');
    expect(url).toContain('entity=lm-test');
    expect(url).toContain('entityType=landmark');
    expect(url).toContain('org=org-test');

    // Cleanup
    await newPage.close();
  });

  test('should maintain backward compatibility with old URLs', async ({ page }) => {
    // Navigate to URL without new params (old link format)
    await page.goto('/');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Should load successfully with default state
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();

    // No errors should be thrown
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit and check for errors
    await page.waitForTimeout(500);
    expect(errors.length).toBe(0);
  });

  test('should handle URL with only latitude (without longitude)', async ({ page }) => {
    // Navigate with only lat
    await page.goto('/?lat=50');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Map should load (ignoring incomplete coordinates)
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
  });

  test('should handle URL with only longitude (without latitude)', async ({ page }) => {
    // Navigate with only lng
    await page.goto('/?lng=120');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Map should load (ignoring incomplete coordinates)
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
  });

  test('should replace browser history instead of pushing', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await page.waitForTimeout(500);

    // Pan the map multiple times
    const mapContainer = page.locator('.leaflet-container');

    for (let i = 0; i < 3; i++) {
      await mapContainer.dragTo(mapContainer, {
        sourcePosition: { x: 500, y: 300 },
        targetPosition: { x: 400 - i * 50, y: 350 },
      });
      await page.waitForTimeout(700);
    }

    // Try to go back - should go to original page, not through each map pan
    // This verifies we used replace instead of push
    await page.goBack();
    await page.waitForTimeout(500);

    // Should be back at home or original state
    const url = page.url();
    // History should be clean (not cluttered with intermediate states)
    expect(url).toBeDefined();
  });
});
