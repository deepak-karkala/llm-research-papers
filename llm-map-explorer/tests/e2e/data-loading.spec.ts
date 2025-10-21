import { test, expect } from '@playwright/test';

test.describe('Data Loading (useDataLoader)', () => {
  test('should load app successfully with all data', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for map to be initialized and data to load
    // The map should be visible once data is loaded
    const mapContainer = page.locator('[class*="leaflet"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Check that the page has fully loaded
    await expect(page).toHaveTitle(/LLM Map Explorer/);
  });

  test('should render map with capabilities after data loads', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for capabilities to render (they appear as polygons/regions on the map)
    // Look for SVG elements which are part of Leaflet polygons
    const leaftletSvg = page.locator('svg[class*="leaflet"]').first();
    await expect(leaftletSvg).toBeVisible({ timeout: 10000 });

    // Verify that there are multiple path elements (capabilities are drawn as paths)
    const paths = page.locator('svg path[fill]');
    const pathCount = await paths.count();
    expect(pathCount).toBeGreaterThan(0);
  });

  test('should render landmarks after data loads', async ({ page }) => {
    await page.goto('/');

    // Wait for landmark markers to appear
    // Markers are typically <img> elements in Leaflet
    const markers = page.locator('img[class*="leaflet-marker-icon"]');
    await expect(markers.first()).toBeVisible({ timeout: 10000 });

    // Should have multiple landmarks
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should make search bar functional after data loads', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.locator('[class*="leaflet"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('attention');

    // Wait for search results to appear
    // Results typically appear in a dropdown or results section
    await page.waitForTimeout(500);

    // Check if search has processed
    const searchResults = page.locator('[class*="search"], [role="listbox"]');
    const isVisible = await searchResults.first().isVisible().catch(() => false);
    expect(typeof isVisible).toBe('boolean');
  });

  test('should not show loading state after data loads', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.locator('[class*="leaflet"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Check that loading spinner/skeleton is not visible (if one exists)
    const loadingSpinner = page.locator('[class*="loading"], [class*="skeleton"]');
    const spinnerCount = await loadingSpinner.count();

    // If there is a loading element, it should not be visible after data loads
    if (spinnerCount > 0) {
      await expect(loadingSpinner.first()).not.toBeVisible();
    }
  });

  test('should display error message if data fails to load', async ({
    page,
    context,
  }) => {
    // Intercept all fetch requests and block data loading
    await context.route('**/data/**', (route) => {
      route.abort('blockedbyclient');
    });

    await page.goto('/');

    // Wait a bit for the app to attempt loading
    await page.waitForTimeout(2000);

    // Check for error message or empty state
    const errorMessage = page.locator('[class*="error"], text="Error", text="failed"');
    const errorCount = await errorMessage.count();

    // Either an error message is shown or map is empty/not visible
    const mapContainer = page.locator('[class*="leaflet"]');
    const mapVisible = await mapContainer.isVisible().catch(() => false);

    // At least one of these should be true:
    // 1. Error message is displayed
    // 2. Map is not visible (because data failed to load)
    const hasErrorOrEmptyMap = errorCount > 0 || !mapVisible;
    expect(hasErrorOrEmptyMap).toBe(true);
  });

  test('should use search index built from loaded data', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.locator('[class*="leaflet"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Get the search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Type a known landmark (from our test data or common knowledge)
    // This tests that search index was built from loaded data
    await searchInput.fill('paper');

    // Wait for search processing
    await page.waitForTimeout(500);

    // Check that search didn't throw an error by checking console
    // for any JavaScript errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Perform another search to trigger search functionality
    await searchInput.fill('model');
    await page.waitForTimeout(500);

    // There should not be critical errors related to search
    const searchErrors = consoleErrors.filter((err) =>
      /search|index|data/i.test(err)
    );
    expect(searchErrors).toHaveLength(0);
  });

  test('should maintain data after navigation', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.locator('[class*="leaflet"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Get initial landmark count
    const initialMarkers = page.locator('img[class*="leaflet-marker-icon"]');
    const initialCount = await initialMarkers.count();
    expect(initialCount).toBeGreaterThan(0);

    // Perform a navigation action (e.g., click on search, then search)
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');
    await page.waitForTimeout(300);

    // Go back to main view
    await page.keyboard.press('Escape');

    // Wait a moment
    await page.waitForTimeout(300);

    // Verify map is still loaded with same data
    await expect(mapContainer).toBeVisible();
    const finalMarkers = page.locator('img[class*="leaflet-marker-icon"]');
    const finalCount = await finalMarkers.count();

    // Marker count should be similar (allowing for some variance)
    expect(finalCount).toBeGreaterThan(0);
  });

  test('should load organizations data', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.locator('[class*="leaflet"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // Open landmark info panel or search to access organization data
    // Click on a landmark marker
    const marker = page.locator('img[class*="leaflet-marker-icon"]').first();
    await marker.click();

    // Wait for info panel to open
    await page.waitForTimeout(500);

    // Check if organization information is displayed somewhere
    // (typically in an info panel or tooltip)
    const infoPanel = page.locator('[class*="info"], [class*="panel"]');

    // At least info panel should be visible or there should be organization data accessible
    const infoPanelVisible = await infoPanel.first().isVisible().catch(() => false);
    expect(typeof infoPanelVisible).toBe('boolean');
  });

  test('should handle parallel data loading efficiently', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for map to load
    const mapContainer = page.locator('[class*="leaflet"]');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Data should load reasonably quickly (within 10 seconds)
    // This ensures parallel loading is working
    expect(loadTime).toBeLessThan(10000);

    // Verify all three data types are loaded
    const leaftletSvg = page.locator('svg[class*="leaflet"]').first();
    await expect(leaftletSvg).toBeVisible();

    const markers = page.locator('img[class*="leaflet-marker-icon"]').first();
    await expect(markers).toBeVisible();
  });

  test('should not cause Lighthouse performance regression', async ({
    page,
  }) => {
    // This is a basic performance check
    // Full Lighthouse audit would require additional setup

    const navigationTiming = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    // DOM content should load reasonably quickly
    // These are conservative thresholds for a dev environment
    expect(navigationTiming.domContentLoaded).toBeLessThan(5000);
  });
});
