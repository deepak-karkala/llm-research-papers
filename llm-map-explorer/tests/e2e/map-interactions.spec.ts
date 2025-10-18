import { test, expect } from '@playwright/test';

test.describe('Map Pan and Zoom Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for map container to be visible with increased timeout
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  });

  test('should render map with zoom controls', async ({ page }) => {
    // Verify map container is visible
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();

    // Verify zoom control buttons are present
    const zoomInButton = page.locator('.leaflet-control-zoom-in');
    const zoomOutButton = page.locator('.leaflet-control-zoom-out');

    await expect(zoomInButton).toBeVisible();
    await expect(zoomOutButton).toBeVisible();
  });

  test('should zoom in using zoom control button', async ({ page }) => {
    const zoomInButton = page.locator('.leaflet-control-zoom-in');

    // Click zoom in button
    await zoomInButton.click();

    // Wait for zoom animation to complete
    await page.waitForTimeout(400);

    // Verify button is still visible and clickable
    await expect(zoomInButton).toBeVisible();
    await expect(zoomInButton).toBeEnabled();
  });

  test('should zoom out using zoom control button', async ({ page }) => {
    // First zoom in so we can zoom out
    const zoomInButton = page.locator('.leaflet-control-zoom-in');
    await zoomInButton.click();
    await page.waitForTimeout(400);

    const zoomOutButton = page.locator('.leaflet-control-zoom-out');
    await zoomOutButton.click();
    await page.waitForTimeout(400);

    await expect(zoomOutButton).toBeVisible();
  });

  test('should pan map with mouse drag', async ({ page }) => {
    const map = page.locator('.leaflet-container');

    // Get map bounding box
    const box = await map.boundingBox();
    if (!box) {
      throw new Error('Map bounding box not found');
    }

    // Perform drag operation
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
    await page.mouse.up();

    // Verify map is still visible after panning
    await expect(map).toBeVisible();
  });

  test('should respect min zoom level', async ({ page }) => {
    const zoomOutButton = page.locator('.leaflet-control-zoom-out');

    // Map starts at zoom -1 (minimum), so zoom out button should be disabled
    // Wait a bit for initial render
    await page.waitForTimeout(500);

    // Check if zoom out button has disabled class
    const hasDisabledClass = await zoomOutButton.evaluate((el) =>
      el.classList.contains('leaflet-disabled')
    );

    expect(hasDisabledClass).toBeTruthy();
  });

  test('should respect max zoom level', async ({ page }) => {
    const zoomInButton = page.locator('.leaflet-control-zoom-in');

    // Zoom in to maximum (from -1 to 2 = 3 clicks)
    for (let i = 0; i < 3; i++) {
      await zoomInButton.click();
      await page.waitForTimeout(400);
    }

    // Check if zoom in button is now disabled
    const hasDisabledClass = await zoomInButton.evaluate((el) =>
      el.classList.contains('leaflet-disabled')
    );

    expect(hasDisabledClass).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    const mapWrapper = page.locator('[role="application"]');

    // Focus on map container
    await mapWrapper.focus();

    // Test arrow key navigation (pan)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    // Test zoom shortcuts
    await page.keyboard.press('+');
    await page.waitForTimeout(400);

    await page.keyboard.press('-');
    await page.waitForTimeout(400);

    // Verify map is still visible and functional
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const mapWrapper = page.locator('[role="application"]');

    // Check ARIA attributes
    await expect(mapWrapper).toHaveAttribute('aria-label', 'Interactive LLM Research Map');
    await expect(mapWrapper).toHaveAttribute('aria-describedby', 'map-instructions');

    // Verify map wrapper is focusable
    const tabIndex = await mapWrapper.getAttribute('tabindex');
    expect(tabIndex).toBe('0');

    // Verify screen reader instructions exist
    const instructions = page.locator('#map-instructions');
    const instructionText = await instructions.textContent();
    expect(instructionText).toContain('Navigate the map using arrow keys');
  });

  test('should support scroll wheel zoom', async ({ page }) => {
    const map = page.locator('.leaflet-container');

    // Hover over map
    await map.hover();

    // Scroll to zoom in
    await map.hover();
    await page.mouse.wheel(0, -100); // Scroll up

    // Wait for zoom animation
    await page.waitForTimeout(400);

    // Verify map is still visible
    await expect(map).toBeVisible();
  });

  test('should support double-click zoom', async ({ page }) => {
    const map = page.locator('.leaflet-container');

    // Get map center
    const box = await map.boundingBox();
    if (!box) {
      throw new Error('Map bounding box not found');
    }

    // Double-click to zoom in
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);

    // Wait for zoom animation
    await page.waitForTimeout(400);

    // Verify map is still visible
    await expect(map).toBeVisible();
  });

  test('should maintain smooth performance during interactions', async ({ page }) => {
    const map = page.locator('.leaflet-container');
    const box = await map.boundingBox();
    if (!box) {
      throw new Error('Map bounding box not found');
    }

    // Perform multiple rapid zoom operations
    const zoomInButton = page.locator('.leaflet-control-zoom-in');

    const startTime = Date.now();
    await zoomInButton.click();
    await page.waitForTimeout(300);
    await zoomInButton.click();
    await page.waitForTimeout(300);
    const endTime = Date.now();

    // Verify operations completed in reasonable time (should be < 2000ms for 2 zooms with delays)
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(2000);

    // Verify map is still responsive
    await expect(map).toBeVisible();
  });
});
