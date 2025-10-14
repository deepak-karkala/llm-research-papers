import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/LLM Map Explorer/);

    // Check main heading exists
    const heading = page.getByRole('heading', { name: /Welcome to LLM Map Explorer/i });
    await expect(heading).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for Next.js docs link
    const docsLink = page.getByRole('link', { name: /Next.js Docs/i });
    await expect(docsLink).toBeVisible();

    // Check for Tailwind guide link
    const tailwindLink = page.getByRole('link', { name: /TailwindCSS Guide/i });
    await expect(tailwindLink).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('main')).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('main')).toBeVisible();
  });
});
