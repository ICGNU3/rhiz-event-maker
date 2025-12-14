import { test, expect } from '@playwright/test';

test.describe('Event Creation', () => {

  test('Architect Mode flow (Protected)', async ({ page }) => {
    await page.goto('/create');
    // Page is public, check for header
    await expect(page.locator('h1')).toContainText('Configure Your Event');
    await expect(page.getByRole('button', { name: 'Generate Event' })).toBeVisible();
  });

  test('Lite Mode flow (Protected)', async ({ page }) => {
    await page.goto('/create');
    // Page is public, check for header
    await expect(page.locator('h1')).toContainText('Configure Your Event');
  });
});
