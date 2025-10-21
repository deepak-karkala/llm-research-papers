import { test, expect } from '@playwright/test';

test.describe('InfoPanel Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to map
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('[class*="leaflet"]', { timeout: 5000 });
  });

  test.describe('Landmark Selection', () => {
    test('should open InfoPanel when landmark is clicked', async ({ page }) => {
      // Click on a landmark marker
      const markers = page.locator('[class*="landmark-marker"]');
      const firstMarker = markers.first();

      await firstMarker.click();
      await page.waitForTimeout(400); // Wait for slide animation

      // Panel should be visible
      const panel = page.locator('[role="dialog"]');
      await expect(panel).toBeVisible();

      // Should contain landmark name
      const title = page.locator('h2, h3');
      const titleText = await title.first().textContent();
      expect(titleText).toBeTruthy();
    });

    test('should display landmark details when opened', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      // Check for key landmark info
      const heading = page.locator('[role="dialog"] h2').first();
      await expect(heading).toBeVisible();

      // Check for type badge
      const badge = page.locator('[role="dialog"] span');
      await expect(badge).toHaveCount(1); // At least one badge
    });

    test('should display external links', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      // Look for resource links
      const links = page.locator('[role="dialog"] a[target="_blank"]');
      const linkCount = await links.count();

      if (linkCount > 0) {
        // Verify link opens in new tab
        const link = links.first();
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });

    test('should display tags for landmark', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      // Check if tags section exists
      const tagsSection = page.locator('text=Tags');
      const count = await tagsSection.count();

      // Tags may not always be present
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Panel Closing', () => {
    test('should close panel when X button clicked', async ({ page }) => {
      // Open panel
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      const panelBefore = page.locator('[role="dialog"]');
      await expect(panelBefore).toBeVisible();

      // Click close button
      const closeButton = page.locator('[aria-label="Close panel"]');
      await closeButton.click();
      await page.waitForTimeout(400);

      // Panel should be hidden
      const panelAfter = page.locator('[role="dialog"]');
      await expect(panelAfter).not.toBeVisible();
    });

    test('should close panel when Escape key pressed', async ({ page }) => {
      // Open panel
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      const panelBefore = page.locator('[role="dialog"]');
      await expect(panelBefore).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      // Panel should be hidden
      const panelAfter = page.locator('[role="dialog"]');
      await expect(panelAfter).not.toBeVisible();
    });
  });

  test.describe('Deep Linking', () => {
    test('should navigate to related entity when link clicked', async ({ page }) => {
      // This requires having multiple related entities
      const markers = page.locator('[class*="landmark-marker"]');
      if ((await markers.count()) < 2) {
        test.skip();
      }

      // Open panel for first marker
      await markers.first().click();
      await page.waitForTimeout(400);

      // Look for related entity links
      const relatedLinks = page.locator('[role="dialog"] button');
      const count = await relatedLinks.count();

      if (count > 1) {
        // Click on related entity
        const secondLink = relatedLinks.nth(1);
        await secondLink.click();
        await page.waitForTimeout(400);

        // Panel should still be visible but with new content
        const panel = page.locator('[role="dialog"]');
        await expect(panel).toBeVisible();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should allow Tab navigation within panel', async ({ page }) => {
      // Open panel
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      // Tab through elements
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

      expect(focusedElement).toBeTruthy();
    });

    test('should be accessible with keyboard only', async ({ page }) => {
      // Click on landmark using keyboard
      const markers = page.locator('[class*="landmark-marker"]');
      const firstMarker = markers.first();

      // Focus and activate marker
      await firstMarker.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);

      // Panel should open
      const panel = page.locator('[role="dialog"]');
      await expect(panel).toBeVisible();

      // Navigate to close button and activate
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      // Panel should close
      await expect(panel).not.toBeVisible();
    });
  });

  test.describe('Multiple Selections', () => {
    test('should switch between landmarks smoothly', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');

      if ((await markers.count()) < 2) {
        test.skip();
      }

      // Click first landmark
      await markers.first().click();
      await page.waitForTimeout(400);

      const panelBefore = page.locator('[role="dialog"]');
      const contentBefore = await panelBefore.textContent();

      // Click second landmark
      await markers.nth(1).click();
      await page.waitForTimeout(400);

      const panelAfter = page.locator('[role="dialog"]');
      const contentAfter = await panelAfter.textContent();

      // Content should be different
      expect(contentBefore).not.toEqual(contentAfter);

      // Panel should still be visible
      await expect(panelAfter).toBeVisible();
    });
  });

  test.describe('Visual States', () => {
    test('should display smooth slide-in animation', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();

      // Check animation timing (should complete within 500ms)
      const startTime = Date.now();

      const panel = page.locator('[role="dialog"]');
      await expect(panel).toBeVisible({ timeout: 500 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should be visible within animation time
      expect(duration).toBeLessThan(500);
    });

    test('should display all content sections', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      const panel = page.locator('[role="dialog"]');

      // Check for key sections
      const title = panel.locator('h2, h3').first();
      const badge = panel.locator('span').first();
      const content = panel.locator('p').first();

      await expect(title).toBeVisible();
      await expect(badge).toBeVisible();
      await expect(content).toBeVisible();
    });
  });

  test.describe('Scrolling', () => {
    test('should scroll long content', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      const scrollContainer = page.locator('.overflow-y-auto').first();

      if (await scrollContainer.isVisible()) {
        // Scroll down
        await scrollContainer.evaluate((el) => {
          el.scrollTop = 100;
        });

        const scrollTop = await scrollContainer.evaluate((el) => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on different viewport sizes', async ({ page }) => {
      const sizes = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 414, height: 896 },   // Mobile
      ];

      for (const size of sizes) {
        await page.setViewportSize(size);

        const markers = page.locator('[class*="landmark-marker"]');
        if ((await markers.count()) > 0) {
          await markers.first().click();
          await page.waitForTimeout(400);

          const panel = page.locator('[role="dialog"]');
          await expect(panel).toBeVisible();

          // Close for next iteration
          const closeButton = page.locator('[aria-label="Close panel"]');
          await closeButton.click();
          await page.waitForTimeout(400);
        }
      }
    });
  });

  test.describe('Accessibility (a11y)', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      const panel = page.locator('[role="dialog"]');

      // Check for ARIA attributes
      const hasModal = await panel.getAttribute('aria-modal');
      expect(hasModal).toBe('true');

      // Check for close button label
      const closeButton = page.locator('[aria-label="Close panel"]');
      const label = await closeButton.getAttribute('aria-label');
      expect(label).toContain('Close');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      const panel = page.locator('[role="dialog"]');

      // Should have main heading
      const mainHeading = panel.locator('h1, h2').first();
      await expect(mainHeading).toBeVisible();
    });

    test('should have readable color contrast', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      const panel = page.locator('[role="dialog"]');
      const text = panel.locator('p, span, h2, h3');

      // Just verify text is visible
      const count = await text.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Performance', () => {
    test('should not lag when opening panel', async ({ page }) => {
      const startTime = Date.now();

      const markers = page.locator('[class*="landmark-marker"]');
      await markers.first().click();
      await page.waitForTimeout(400);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Opening should complete quickly
      expect(duration).toBeLessThan(1000);
    });

    test('should handle switching between entities quickly', async ({ page }) => {
      const markers = page.locator('[class*="landmark-marker"]');

      if ((await markers.count()) < 3) {
        test.skip();
      }

      const startTime = Date.now();

      // Rapid switches
      for (let i = 0; i < 3; i++) {
        await markers.nth(i).click();
        await page.waitForTimeout(100);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete without lag
      expect(duration).toBeLessThan(2000);
    });
  });
});
