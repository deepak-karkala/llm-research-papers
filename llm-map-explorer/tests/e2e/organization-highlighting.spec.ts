import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Organization Highlighting Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('[class*="leaflet"]', { timeout: 5000 });
  });

  test.describe('Highlight Badge Display', () => {
    test('should not display highlight badge when no organization is highlighted', async ({
      page,
    }) => {
      // Badge should not be visible initially
      const badge = page.locator('[role="status"]');
      await expect(badge).not.toBeVisible({ timeout: 1000 });
    });

    test('should display highlight badge with correct organization name and count', async ({
      page,
    }) => {
      // Get first organization button (if available in info panel)
      // This test assumes there's a highlight button in the UI
      // For now, we'll use direct store interaction via page evaluation
      await page.evaluate(() => {
        // Get the store directly from window
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Organization',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      // Wait for badge to appear
      const badge = page.locator('[role="status"]');
      await expect(badge).toBeVisible({ timeout: 1000 });

      // Check badge contains organization name
      await expect(badge).toContainText('Test Organization');

      // Check badge contains count
      await expect(badge).toContainText('2 contributions');
    });

    test('should update badge when highlighting different organization', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'First Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002'],
            },
            {
              id: 'org-002',
              name: 'Second Org',
              description: 'Test',
              color: '#4285F4',
              landmarkIds: ['lm-003', 'lm-004', 'lm-005'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      await expect(badge).toContainText('First Org');
      await expect(badge).toContainText('2 contributions');

      // Switch to second organization
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().highlightOrganization('org-002');
        }
      });

      await page.waitForTimeout(300);
      await expect(badge).toContainText('Second Org');
      await expect(badge).toContainText('3 contributions');
    });
  });

  test.describe('Marker Highlighting Visual States', () => {
    test('should highlight markers with CSS class when organization is highlighted', async ({
      page,
    }) => {
      // Set up test data
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002'],
            },
          ]);
          useMapStore.getState().setLandmarks([
            {
              id: 'lm-001',
              name: 'Paper 1',
              type: 'paper',
              year: 2020,
              organization: 'Test Org',
              coordinates: { lat: 0, lng: 0 },
              description: 'Test paper',
            },
            {
              id: 'lm-002',
              name: 'Paper 2',
              type: 'paper',
              year: 2021,
              organization: 'Test Org',
              coordinates: { lat: 1, lng: 1 },
              description: 'Test paper',
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      // Wait for markers to be rendered
      await page.waitForTimeout(500);

      // Check for highlighted markers with the appropriate class
      const highlightedMarkers = page.locator('.landmark-marker-highlighted');
      const count = await highlightedMarkers.count();

      // Should have at least some highlighted markers
      expect(count).toBeGreaterThan(0);
    });

    test('should apply dimmed state to non-highlighted markers', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Org A',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
            {
              id: 'org-002',
              name: 'Org B',
              description: 'Test',
              color: '#4285F4',
              landmarkIds: ['lm-002'],
            },
          ]);
          useMapStore.getState().setLandmarks([
            {
              id: 'lm-001',
              name: 'Paper 1',
              type: 'paper',
              year: 2020,
              organization: 'Org A',
              coordinates: { lat: 0, lng: 0 },
              description: 'Test',
            },
            {
              id: 'lm-002',
              name: 'Paper 2',
              type: 'paper',
              year: 2021,
              organization: 'Org B',
              coordinates: { lat: 1, lng: 1 },
              description: 'Test',
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      await page.waitForTimeout(500);

      // Check for dimmed markers
      const dimmedMarkers = page.locator('.landmark-marker-dimmed');
      const dimmedCount = await dimmedMarkers.count();

      // Should have at least one dimmed marker
      expect(dimmedCount).toBeGreaterThan(0);
    });

    test('should animate highlighted markers with pulse effect', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().setLandmarks([
            {
              id: 'lm-001',
              name: 'Test Landmark',
              type: 'paper',
              year: 2020,
              organization: 'Test Org',
              coordinates: { lat: 0, lng: 0 },
              description: 'Test',
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      await page.waitForTimeout(500);

      // Check that highlighted marker has animation
      const highlightedMarker = page.locator('.landmark-marker-highlighted').first();
      const animationName = await highlightedMarker.evaluate((el) => {
        return window.getComputedStyle(el).animationName;
      });

      // Should have pulse animation
      expect(animationName).toContain('pulse');
    });
  });

  test.describe('Clear Highlighting', () => {
    test('should clear highlights when clear button is clicked', async ({ page }) => {
      // Set up highlighting
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      await expect(badge).toBeVisible();

      // Click clear button
      const clearButton = badge.locator('button');
      await clearButton.click();

      // Badge should disappear
      await expect(badge).not.toBeVisible({ timeout: 1000 });
    });

    test('should remove highlighting classes from markers when cleared', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().setLandmarks([
            {
              id: 'lm-001',
              name: 'Test Paper',
              type: 'paper',
              year: 2020,
              organization: 'Test Org',
              coordinates: { lat: 0, lng: 0 },
              description: 'Test',
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      await page.waitForTimeout(500);
      let highlightedCount = await page.locator('.landmark-marker-highlighted').count();
      expect(highlightedCount).toBeGreaterThan(0);

      // Clear highlighting
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().clearHighlights();
        }
      });

      await page.waitForTimeout(500);
      highlightedCount = await page.locator('.landmark-marker-highlighted').count();
      expect(highlightedCount).toBe(0);
    });

    test('should restore normal marker states after clearing', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002'],
            },
            {
              id: 'org-002',
              name: 'Other Org',
              description: 'Test',
              color: '#4285F4',
              landmarkIds: ['lm-003'],
            },
          ]);
          useMapStore.getState().setLandmarks([
            {
              id: 'lm-001',
              name: 'Paper 1',
              type: 'paper',
              year: 2020,
              organization: 'Test Org',
              coordinates: { lat: 0, lng: 0 },
              description: 'Test',
            },
            {
              id: 'lm-002',
              name: 'Paper 2',
              type: 'paper',
              year: 2021,
              organization: 'Test Org',
              coordinates: { lat: 1, lng: 1 },
              description: 'Test',
            },
            {
              id: 'lm-003',
              name: 'Paper 3',
              type: 'paper',
              year: 2022,
              organization: 'Other Org',
              coordinates: { lat: 2, lng: 2 },
              description: 'Test',
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      await page.waitForTimeout(500);
      let dimmedCount = await page.locator('.landmark-marker-dimmed').count();
      expect(dimmedCount).toBeGreaterThan(0);

      // Clear highlighting
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().clearHighlights();
        }
      });

      await page.waitForTimeout(500);
      dimmedCount = await page.locator('.landmark-marker-dimmed').count();
      expect(dimmedCount).toBe(0);
    });
  });

  test.describe('Rapid Highlighting Toggling', () => {
    test('should handle rapid highlight/clear toggling', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Org A',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
            {
              id: 'org-002',
              name: 'Org B',
              description: 'Test',
              color: '#4285F4',
              landmarkIds: ['lm-002'],
            },
          ]);
        }
      });

      // Rapid toggling
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          const { useMapStore } = (window as any);
          if (useMapStore) {
            useMapStore.getState().highlightOrganization('org-001');
          }
        });
        await page.waitForTimeout(50);

        await page.evaluate(() => {
          const { useMapStore } = (window as any);
          if (useMapStore) {
            useMapStore.getState().clearHighlights();
          }
        });
        await page.waitForTimeout(50);
      }

      // Should end in cleared state without errors
      const badge = page.locator('[role="status"]');
      await expect(badge).not.toBeVisible({ timeout: 1000 });
    });

    test('should handle rapid organization switching', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Org A',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
            {
              id: 'org-002',
              name: 'Org B',
              description: 'Test',
              color: '#4285F4',
              landmarkIds: ['lm-002'],
            },
            {
              id: 'org-003',
              name: 'Org C',
              description: 'Test',
              color: '#8B5CF6',
              landmarkIds: ['lm-003'],
            },
          ]);
        }
      });

      // Rapid switching between organizations
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          const { useMapStore } = (window as any);
          if (useMapStore) {
            useMapStore.getState().highlightOrganization('org-001');
          }
        });
        await page.waitForTimeout(50);

        await page.evaluate(() => {
          const { useMapStore } = (window as any);
          if (useMapStore) {
            useMapStore.getState().highlightOrganization('org-002');
          }
        });
        await page.waitForTimeout(50);

        await page.evaluate(() => {
          const { useMapStore } = (window as any);
          if (useMapStore) {
            useMapStore.getState().highlightOrganization('org-003');
          }
        });
        await page.waitForTimeout(50);
      }

      // Should end in highlighted state for org-003
      const badge = page.locator('[role="status"]');
      await expect(badge).toContainText('Org C', { timeout: 1000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes on badge', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      await expect(badge).toHaveAttribute('aria-live', 'polite');
      await expect(badge).toHaveAttribute('aria-label', /Highlighting Test Org: 2 contributions/);
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      const clearButton = badge.locator('button');

      // Tab to button
      await clearButton.focus();

      // Press Enter to clear
      await page.keyboard.press('Enter');

      // Badge should disappear
      await expect(badge).not.toBeVisible({ timeout: 1000 });
    });

    test('should announce highlight state to screen readers', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'OpenAI',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002', 'lm-003'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      const ariaLabel = await badge.getAttribute('aria-label');

      expect(ariaLabel).toContain('Highlighting');
      expect(ariaLabel).toContain('OpenAI');
      expect(ariaLabel).toContain('3 contributions');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle organization with no landmarks', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Empty Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: [],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      await expect(badge).toBeVisible();
      await expect(badge).toContainText('Empty Org');
      await expect(badge).toContainText('0 contributions');
    });

    test('should display singular/plural correctly', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      await expect(badge).toContainText('1 contribution');

      // Switch to organization with multiple
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-002',
              name: 'Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-002');
        }
      });

      await page.waitForTimeout(300);
      await expect(badge).toContainText('2 contributions');
    });
  });

  test.describe('Visual Regression', () => {
    test('should display badge at correct position', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      const boundingBox = await badge.boundingBox();

      // Badge should be positioned at bottom center
      if (boundingBox) {
        const viewportSize = page.viewportSize();
        if (viewportSize) {
          expect(boundingBox.y).toBeGreaterThan(viewportSize.height * 0.7);
          expect(boundingBox.x).toBeGreaterThan(viewportSize.width * 0.25);
        }
      }
    });

    test('should maintain badge visibility on viewport resize', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'Test Org',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().highlightOrganization('org-001');
        }
      });

      const badge = page.locator('[role="status"]');
      await expect(badge).toBeVisible();

      // Resize viewport
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(300);

      // Badge should still be visible
      await expect(badge).toBeVisible();

      // Resize again
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(300);

      await expect(badge).toBeVisible();
    });
  });
});
