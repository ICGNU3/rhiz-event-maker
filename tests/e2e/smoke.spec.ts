import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Adjust based on actual app title if known, usually defined in layout or page
  await expect(page).toHaveTitle(/Rhiz|Event/);
});

test('can navigate to create page', async ({ page }) => {
  await page.goto('/create');
  await expect(page.getByRole('heading', { name: /Configure Your Event/i })).toBeVisible();
});
