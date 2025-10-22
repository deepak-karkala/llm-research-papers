import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 *
 * Captures and compares screenshots of key components to detect visual regressions.
 * Useful for catching unintended visual changes before they reach production.
 *
 * Run with: npm run test:e2e -- tests/visual/visual-regression.spec.ts
 */

test.describe('Visual Regression Tests', () => {
  // Update snapshots with: npm run test:e2e -- --update-snapshots

  test('home page snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      mask: [page.locator('[data-testid="map-container"]')], // Mask dynamic map content
    });
  });

  test('info panel in default state', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check that info panel is visible with welcome content
    const infoPanel = page.locator('[role="complementary"]');
    await expect(infoPanel).toBeVisible();

    await expect(infoPanel).toHaveScreenshot('info-panel-default.png');
  });

  test('info panel with landmark selected', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Click a landmark to open info panel
    const landmark = page.locator('[data-testid="landmark-marker"]').first();
    await landmark.click();

    // Wait for info panel to animate in
    await page.waitForTimeout(300);

    const infoPanel = page.locator('[role="complementary"]');
    await expect(infoPanel).toHaveScreenshot('info-panel-landmark.png');
  });

  test('tour panel snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Open tours from header or welcome panel
    const toursButton = page.locator('button:has-text("Tours")').first();
    if (await toursButton.isVisible()) {
      await toursButton.click();
    } else {
      // If Tours button not in header, try clicking in welcome panel
      const toursTab = page.locator('[role="tab"]:has-text("Tours")');
      await toursTab.click();
    }

    // Start first tour
    const startButton = page.locator('[role="article"]')
      .first()
      .locator('button:has-text("Start")');
    await startButton.click();

    // Wait for tour panel to load
    await page.waitForTimeout(300);

    const tourPanel = page.locator('[data-testid="tour-panel"]');
    await expect(tourPanel).toHaveScreenshot('tour-panel.png');
  });

  test('search bar focused state', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('[placeholder*="Search"]').first();
    await searchInput.focus();

    await page.waitForTimeout(100);

    await expect(page).toHaveScreenshot('search-bar-focused.png', {
      mask: [page.locator('[data-testid="map-container"]')],
    });
  });

  test('search results dropdown', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('[placeholder*="Search"]').first();
    await searchInput.click();
    await searchInput.type('attention', { delay: 50 });

    // Wait for results to appear
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    const dropdown = page.locator('[role="listbox"], [role="menu"]').first();
    await expect(dropdown).toHaveScreenshot('search-results.png');
  });

  test('legend panel', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const legend = page.locator('[data-testid="legend-panel"]');
    if (await legend.isVisible()) {
      await expect(legend).toHaveScreenshot('legend-panel.png');
    }
  });

  test('loading skeleton states', async ({ page }) => {
    // This test is primarily for manual verification
    // Skeletons appear briefly during real use
    await page.goto('http://localhost:3000');

    // Try to catch a skeleton state by intercepting responses
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000); // Delay to see skeleton
    });

    await page.reload();

    // Screenshot might show skeleton depending on timing
    const skeleton = page.locator('[role="status"]:has-text("Loading")');
    if (await skeleton.isVisible()) {
      await expect(skeleton).toHaveScreenshot('skeleton-loading.png');
    }
  });

  test('error alert state', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Inject error display for visual testing
    await page.evaluate(() => {
      const alert = document.createElement('div');
      alert.setAttribute('role', 'alert');
      alert.className = 'rounded-lg border border-red-200 bg-red-50 p-4 m-4';
      alert.innerHTML = `
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div class="flex-1">
            <h3 class="font-semibold text-red-900">Connection Error</h3>
            <p class="text-sm text-red-700 mt-1">Unable to load data. Please check your connection.</p>
          </div>
        </div>
      `;
      document.body.appendChild(alert);
    });

    const alert = page.locator('[role="alert"]');
    await expect(alert).toHaveScreenshot('error-alert.png');
  });

  test('toast notification', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Inject toast for visual testing
    await page.evaluate(() => {
      const toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.className = 'fixed bottom-4 right-4 rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3 z-50';
      toast.innerHTML = `
        <svg class="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
        <span class="text-sm font-medium text-green-900">Link copied to clipboard!</span>
      `;
      document.body.appendChild(toast);
    });

    const toast = page.locator('[role="status"]');
    await expect(toast).toHaveScreenshot('toast-success.png');
  });

  test('button hover states', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Inject buttons for testing hover states
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.className = 'p-4 space-y-2';
      div.innerHTML = `
        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Primary Button
        </button>
        <button class="px-4 py-2 border border-gray-300 text-gray-900 rounded hover:border-gray-400 transition-colors">
          Secondary Button
        </button>
        <button class="px-4 py-2 bg-gray-200 text-gray-400 rounded cursor-not-allowed">
          Disabled Button
        </button>
      `;
      document.body.appendChild(div);
    });

    // Screenshot buttons in default state
    await expect(page).toHaveScreenshot('buttons-default.png', {
      mask: [page.locator('[data-testid="map-container"]')],
    });

    // Hover over first button
    const button = page.locator('button').first();
    await button.hover();
    await page.waitForTimeout(100);

    await expect(page).toHaveScreenshot('buttons-hover.png', {
      mask: [page.locator('[data-testid="map-container"]')],
    });
  });

  test('responsive design - mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone SE size
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('mobile-home.png', { fullPage: true });
  });

  test('responsive design - tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('tablet-home.png', { fullPage: true });
  });

  test('dark mode snapshot (if enabled)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Enable dark mode if available
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    await page.waitForTimeout(100);

    await expect(page).toHaveScreenshot('dark-mode.png', {
      fullPage: true,
      mask: [page.locator('[data-testid="map-container"]')],
    });
  });
});
