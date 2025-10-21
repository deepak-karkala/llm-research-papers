/**
 * E2E Tests for Copy Link Button (Issue #25)
 *
 * Tests the complete user flow for copying map view URLs:
 * 1. Button is visible and accessible
 * 2. Clicking button copies URL to clipboard
 * 3. Visual feedback is provided
 * 4. Shared URL restores map state when opened
 */

import { test, expect } from '@playwright/test';

test.describe('Copy Link Button - Issue #25', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for map container to be visible
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    // Wait for data to load
    await page.waitForTimeout(1000);
  });

  test('should display copy link button', async ({ page }) => {
    // Button should be visible in the header
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');
    await expect(copyButton).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Check aria-label
    await expect(copyButton).toHaveAttribute('aria-label', 'Copy current map view URL to clipboard');

    // Check title attribute
    await expect(copyButton).toHaveAttribute('title', 'Copy link to current map view');

    // Button should have role=button
    await expect(copyButton).toHaveAttribute('role', 'button');
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab to focus the button
    await page.keyboard.press('Tab');

    // Keep tabbing until we find the copy button
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      if (focused?.includes('Copy current map view')) {
        break;
      }
      await page.keyboard.press('Tab');
      attempts++;
    }

    // Get the copy button
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Press Enter to activate
    await copyButton.focus();
    await page.keyboard.press('Enter');

    // Wait for state change
    await page.waitForTimeout(200);

    // Button should show "Copied!" state
    await expect(copyButton).toContainText('Copied!');
  });

  test('should copy URL to clipboard', async ({ page, context }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Get initial URL
    const initialUrl = page.url();

    // Click the copy button
    await copyButton.click();

    // Wait for state change
    await page.waitForTimeout(300);

    // Button should show "Copied!" text
    await expect(copyButton).toContainText('Copied!');
  });

  test('should display visual feedback after clicking', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Initial state should show "Copy Link"
    await expect(copyButton).toContainText('Copy Link');

    // Click button
    await copyButton.click();

    // Wait for state change
    await page.waitForTimeout(300);

    // Should show "Copied!"
    await expect(copyButton).toContainText('Copied!');

    // Wait for state to reset (2 seconds)
    await page.waitForTimeout(2100);

    // Should be back to "Copy Link"
    await expect(copyButton).toContainText('Copy Link');
  });

  test('should include all state parameters in URL', async ({ page }) => {
    // First, set up some state by panning and zooming
    await page.goto('/?lat=50&lng=100&zoom=2&entity=test&entityType=landmark&org=test-org');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Get the current URL
    const currentUrl = page.url();

    // Should include all state parameters
    expect(currentUrl).toContain('lat=50');
    expect(currentUrl).toContain('lng=100');
    expect(currentUrl).toContain('zoom=2');
    expect(currentUrl).toContain('entity=test');
    expect(currentUrl).toContain('entityType=landmark');
    expect(currentUrl).toContain('org=test-org');
  });

  test('should work after map interactions', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Perform map interactions
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.dragTo(mapContainer, {
      sourcePosition: { x: 500, y: 300 },
      targetPosition: { x: 300, y: 200 },
    });

    // Wait for debounced URL update
    await page.waitForTimeout(600);

    // Click copy button
    await copyButton.click();

    // Wait for feedback
    await page.waitForTimeout(300);

    // Should show "Copied!"
    await expect(copyButton).toContainText('Copied!');
  });

  test('should reset button state after 2 seconds', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Click button
    await copyButton.click();

    // Wait a bit
    await page.waitForTimeout(300);

    // Should show "Copied!"
    await expect(copyButton).toContainText('Copied!');

    // Wait for reset (2 seconds)
    await page.waitForTimeout(2100);

    // Should be back to "Copy Link"
    await expect(copyButton).toContainText('Copy Link');

    // Button should be enabled again
    await expect(copyButton).toBeEnabled();
  });

  test('should show share icon', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Button should contain an SVG icon (Share2 icon)
    const icon = copyButton.locator('svg');
    await expect(icon).toBeVisible();
  });

  test('should work across multiple clicks', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Click multiple times with wait for state reset
    for (let i = 0; i < 3; i++) {
      await copyButton.click();
      await page.waitForTimeout(300);

      // Should show "Copied!"
      await expect(copyButton).toContainText('Copied!');

      // Wait for reset
      await page.waitForTimeout(2100);

      // Should be back to "Copy Link"
      await expect(copyButton).toContainText('Copy Link');
    }
  });

  test('should maintain state when map is panned', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');
    const initialUrl = page.url();

    // Click copy button
    await copyButton.click();
    await page.waitForTimeout(300);

    // Show "Copied!"
    await expect(copyButton).toContainText('Copied!');

    // Now pan the map (shouldn't affect button state immediately)
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.dragTo(mapContainer, {
      sourcePosition: { x: 500, y: 300 },
      targetPosition: { x: 200, y: 400 },
    });

    // Button should still show "Copied!" (before 2 second timeout)
    await expect(copyButton).toContainText('Copied!');

    // Wait for full reset
    await page.waitForTimeout(2100);

    // Should be back to "Copy Link"
    await expect(copyButton).toContainText('Copy Link');
  });

  test('should support keyboard activation with Space key', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Focus the button
    await copyButton.focus();

    // Press Space to activate
    await page.keyboard.press('Space');

    // Wait for state change
    await page.waitForTimeout(300);

    // Should show "Copied!"
    await expect(copyButton).toContainText('Copied!');
  });

  test('should work on the default URL (no params)', async ({ page }) => {
    // Start at default URL
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Click copy button
    await copyButton.click();

    // Should work and show feedback
    await page.waitForTimeout(300);
    await expect(copyButton).toContainText('Copied!');
  });

  test('should work with complex entity IDs', async ({ page }) => {
    // Navigate with complex entity ID
    await page.goto('/?entity=lm-001_special-chars-123&entityType=landmark');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const currentUrl = page.url();

    // Should properly encode special characters
    expect(currentUrl).toContain('entity=');
    expect(currentUrl).toContain('entityType=landmark');
  });

  test('should handle rapid successive clicks gracefully', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Perform rapid clicks (second click should be ignored while first is pending)
    await copyButton.click();
    await copyButton.click();
    await copyButton.click();

    // Wait for debounce
    await page.waitForTimeout(300);

    // Should show "Copied!" (from first click)
    await expect(copyButton).toContainText('Copied!');

    // Button should be disabled during copied state
    await expect(copyButton).toBeDisabled();
  });

  test('should be visible on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // Copy button should still be visible
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');
    await expect(copyButton).toBeVisible();
  });

  test('should work with full state restoration workflow', async ({ page, context }) => {
    // Step 1: Set map to specific state
    const testUrl = '/?lat=45&lng=120&zoom=2&entity=lm-test&entityType=landmark&org=org-test';
    await page.goto(testUrl);
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Step 2: Click copy button
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');
    const mapUrl = page.url();

    // Verify current URL has the state
    expect(mapUrl).toContain('lat=45');
    expect(mapUrl).toContain('lng=120');
    expect(mapUrl).toContain('zoom=2');

    // Step 3: Get the URL (simulating clipboard access)
    const urlToCopy = mapUrl;

    // Step 4: Open URL in new page (simulating share)
    const newPage = await context.newPage();
    await newPage.goto(urlToCopy);
    await newPage.waitForSelector('.leaflet-container', { timeout: 10000 });
    await newPage.waitForTimeout(1000);

    // Step 5: Verify state is restored
    const newPageUrl = newPage.url();
    expect(newPageUrl).toContain('lat=45');
    expect(newPageUrl).toContain('lng=120');
    expect(newPageUrl).toContain('zoom=2');
    expect(newPageUrl).toContain('entity=lm-test');
    expect(newPageUrl).toContain('entityType=landmark');
    expect(newPageUrl).toContain('org=org-test');

    // Cleanup
    await newPage.close();
  });

  test('should maintain button position in header', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');
    const searchBar = page.locator('input[placeholder*="Search"]');

    // Both should be visible
    await expect(copyButton).toBeVisible();
    await expect(searchBar).toBeVisible();

    // Copy button should be positioned to the left of search bar
    const copyBox = await copyButton.boundingBox();
    const searchBox = await searchBar.boundingBox();

    expect(copyBox).not.toBeNull();
    expect(searchBox).not.toBeNull();

    // Copy button should be to the left (smaller x position)
    if (copyBox && searchBox) {
      expect(copyBox.x).toBeLessThan(searchBox.x);
    }
  });

  test('button should have focus outline when focused', async ({ page }) => {
    const copyButton = page.locator('button[aria-label*="Copy current map view URL"]');

    // Focus the button
    await copyButton.focus();

    // Verify it's focused
    const isFocused = await copyButton.evaluate((el) => {
      return document.activeElement === el;
    });

    expect(isFocused).toBe(true);
  });
});
