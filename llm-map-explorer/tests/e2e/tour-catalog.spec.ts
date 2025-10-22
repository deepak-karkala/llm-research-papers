import { test, expect } from '@playwright/test';

test.describe('Tour Discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[class*="leaflet"]', { timeout: 10000 });
  });

  test.describe('Tour List Display', () => {
    test('should display tour list and welcome guidance by default', async ({ page }) => {
      await expect(page.locator('[data-testid="tour-list"]')).toBeVisible();
      await expect(page.locator('text=Getting Started')).toBeVisible();
    });

    test('should display all available tours in the list', async ({ page }) => {
      const count = await page.locator('[data-testid^="tour-list-item-"]').count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display tour metadata (duration, stages, difficulty)', async ({ page }) => {
      const firstTour = page.locator('[data-testid^="tour-list-item-"]').first();
      await expect(firstTour.locator('[data-testid="tour-duration"]')).toBeVisible();
      await expect(firstTour.locator('[data-testid="tour-stages"]')).toBeVisible();
      await expect(firstTour.locator('[data-testid="tour-difficulty"]')).toBeVisible();
    });

    test('should keep tours sorted by difficulty (beginner before advanced)', async ({ page }) => {
      const tourItems = page.locator('[data-testid^="tour-list-item-"]');
      const total = await tourItems.count();
      if (total < 2) return;

      const difficultyTexts: string[] = [];
      for (let i = 0; i < Math.min(3, total); i++) {
        const text = await tourItems.nth(i).locator('[data-testid="tour-difficulty"]').textContent();
        difficultyTexts.push((text ?? '').toLowerCase());
      }

      const beginnerIdx = difficultyTexts.findIndex((txt) => txt.includes('beginner'));
      const advancedIdx = difficultyTexts.findIndex((txt) => txt.includes('advanced'));
      if (beginnerIdx !== -1 && advancedIdx !== -1) {
        expect(beginnerIdx).toBeLessThanOrEqual(advancedIdx);
      }
    });
  });

  test.describe('Tour Start Interaction', () => {
    test('should start a tour when a list item is clicked', async ({ page }) => {
      await page.locator('[data-testid^="tour-list-item-"]').first().click();
      await expect(page.locator('[data-testid="tour-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="tour-stage-indicator"]')).toHaveText(/Stage 1 of/i);
    });

    test('should support keyboard navigation between stages', async ({ page }) => {
      await page.locator('[data-testid^="tour-list-item-"]').first().click();
      await expect(page.locator('[data-testid="tour-stage-indicator"]')).toHaveText(/Stage 1 of/i);

      await page.keyboard.press(']');
      await expect(page.locator('[data-testid="tour-stage-indicator"]')).toHaveText(/Stage 2 of/i, { timeout: 5000 });
    });
  });

  test.describe('Empty State Handling', () => {
    test('should show either tour list or empty state', async ({ page }) => {
      const listVisible = await page.locator('[data-testid="tour-list"]').isVisible().catch(() => false);
      const emptyVisible = await page.locator('[data-testid="tour-list-empty"]').isVisible().catch(() => false);
      expect(listVisible || emptyVisible).toBeTruthy();
    });
  });

  test.describe('Accessibility', () => {
    test('should expose list semantics', async ({ page }) => {
      const list = page.locator('[data-testid="tour-list"]');
      await expect(list).toHaveAttribute('role', 'list');

      const firstItem = page.locator('[data-testid^="tour-list-item-"]').first();
      await expect(firstItem).toHaveAttribute('role', 'listitem');
    });
  });
});
