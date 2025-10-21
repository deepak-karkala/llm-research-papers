import { test, expect } from '@playwright/test';

test.describe('Highlight on Map Button (Issue #23)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the map page
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('[class*="leaflet"]', { timeout: 5000 });
  });

  test.describe('Button Display and State', () => {
    test('should display highlight button in organization detail view', async ({
      page,
    }) => {
      // Set up store with organization data
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'OpenAI',
              description: 'AI research lab',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      // Wait for organization details to render
      await page.waitForTimeout(300);

      // Look for the highlight button
      const button = page.locator('button', { hasText: /Highlight on Map/ });
      await expect(button).toBeVisible();
    });

    it('should display "Highlight on Map" text initially', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test org',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);
      const button = page.locator('button', { hasText: /Highlight on Map/ });
      await expect(button).toHaveText('Highlight on Map');
    });

    test('should have correct aria-pressed attribute', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);
      const button = page.locator('button', { hasText: /Highlight on Map/ });
      await expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Button Click Behavior', () => {
    test('should trigger highlightOrganization action when clicked', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'OpenAI',
              description: 'Test org',
              color: '#10A37F',
              landmarkIds: ['lm-001', 'lm-002'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      // Click the button
      const button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      // Verify store state updated
      const state = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          return {
            highlightedOrgId: useMapStore.getState().highlightedOrgId,
            highlightedLandmarkIds:
              useMapStore.getState().highlightedLandmarkIds,
          };
        }
      });

      expect(state?.highlightedOrgId).toBe('org-001');
      expect(state?.highlightedLandmarkIds).toContain('lm-001');
      expect(state?.highlightedLandmarkIds).toContain('lm-002');
    });

    test('should update button text to "Clear Highlights" after click', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      const button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(300);

      // Button text should change
      await expect(button).toHaveText('Clear Highlights');
    });

    test('should update aria-pressed to true after click', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      const button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(300);

      await expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    test('should apply highlighting class to button when active', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      const button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(300);

      const hasActiveClass = await button.evaluate((el) =>
        el.className.includes('highlight-button-active')
      );
      expect(hasActiveClass).toBe(true);
    });
  });

  test.describe('Toggle Behavior', () => {
    test('should clear highlights when button clicked again', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      // First click to highlight
      let button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(300);

      // Second click to clear
      button = page.locator('button', { hasText: /Clear Highlights/ });
      await button.click();

      await page.waitForTimeout(300);

      // Verify state cleared
      const state = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          return {
            highlightedOrgId: useMapStore.getState().highlightedOrgId,
            highlightedLandmarkIds:
              useMapStore.getState().highlightedLandmarkIds,
          };
        }
      });

      expect(state?.highlightedOrgId).toBeNull();
      expect(state?.highlightedLandmarkIds).toHaveLength(0);
    });

    test('should revert button text to "Highlight on Map" after clear', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      let button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(300);

      button = page.locator('button', { hasText: /Clear Highlights/ });
      await button.click();

      await page.waitForTimeout(300);

      button = page.locator('button', { hasText: /Highlight on Map/ });
      await expect(button).toBeVisible();
    });

    test('should update aria-pressed back to false after clear', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      let button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(300);

      button = page.locator('button', { hasText: /Clear Highlights/ });
      await button.click();

      await page.waitForTimeout(300);

      button = page.locator('button', { hasText: /Highlight on Map/ });
      await expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Map Integration', () => {
    test('should highlight landmarks on map when button clicked', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'OpenAI',
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
              organization: 'OpenAI',
              coordinates: { lat: 0, lng: 0 },
              description: 'Test',
              capabilityId: 'cap-001',
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      // Click highlight button
      const button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(500);

      // Check for highlighted markers on map
      const highlightedMarkers = page.locator(
        '.landmark-marker-highlighted'
      );
      const count = await highlightedMarkers.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should remove highlighting when clear button clicked', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'OpenAI',
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
              organization: 'OpenAI',
              coordinates: { lat: 0, lng: 0 },
              description: 'Test',
              capabilityId: 'cap-001',
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      // Highlight
      let button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(500);

      let highlightedCount = await page
        .locator('.landmark-marker-highlighted')
        .count();
      expect(highlightedCount).toBeGreaterThan(0);

      // Clear
      button = page.locator('button', { hasText: /Clear Highlights/ });
      await button.click();

      await page.waitForTimeout(500);

      highlightedCount = await page.locator('.landmark-marker-highlighted').count();
      expect(highlightedCount).toBe(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have descriptive aria-label', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'OpenAI',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      const button = page.locator('button', { hasText: /Highlight on Map/ });
      const ariaLabel = await button.getAttribute('aria-label');

      expect(ariaLabel).toContain('Highlight');
      expect(ariaLabel).toContain('OpenAI');
      expect(ariaLabel).toContain('map');
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      const button = page.locator('button', { hasText: /Highlight on Map/ });

      // Focus the button
      await button.focus();

      // Press Enter
      await page.keyboard.press('Enter');

      await page.waitForTimeout(300);

      // Button should now be activated
      const updatedButton = page.locator('button', { hasText: /Clear Highlights/ });
      await expect(updatedButton).toBeVisible();
    });

    test('should support Space key', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      const button = page.locator('button', { hasText: /Highlight on Map/ });

      // Focus the button
      await button.focus();

      // Press Space
      await page.keyboard.press('Space');

      await page.waitForTimeout(300);

      // Button should now be activated
      const updatedButton = page.locator('button', { hasText: /Clear Highlights/ });
      await expect(updatedButton).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle rapid button clicks', async ({ page }) => {
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().setOrganizations([
            {
              id: 'org-001',
              name: 'TestOrg',
              description: 'Test',
              color: '#10A37F',
              landmarkIds: ['lm-001'],
            },
          ]);
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      const button = page.locator('button:has-text("Highlight on Map")').first();

      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await button.click({ force: true });
        await page.waitForTimeout(100);
      }

      // Should be in correct final state
      const state = await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          return useMapStore.getState().highlightedOrgId;
        }
      });

      // Should be in one of the valid states
      expect([null, 'org-001']).toContain(state);
    });

    test('should handle switching between organizations', async ({ page }) => {
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
          useMapStore.getState().selectEntity('organization', 'org-001');
        }
      });

      await page.waitForTimeout(300);

      // Highlight first org
      let button = page.locator('button', { hasText: /Highlight on Map/ });
      await button.click();

      await page.waitForTimeout(300);

      // Switch to second org
      await page.evaluate(() => {
        const { useMapStore } = (window as any);
        if (useMapStore) {
          useMapStore.getState().selectEntity('organization', 'org-002');
        }
      });

      await page.waitForTimeout(300);

      // Second org should have unhighlighted button
      button = page.locator('button', { hasText: /Highlight on Map/ });
      await expect(button).toBeVisible();
    });
  });
});
