import { test, expect } from '@playwright/test';

test.describe('Public Pages Availability', () => {

  test('Home page loads and has main CTA', async ({ page }) => {
    await page.goto('/');
    // Check for the main heading "EventManage.ai"
    await expect(page.locator('h1')).toContainText('Event');
    await expect(page.locator('h1')).toContainText('Manage.ai');
    // Check for "Start Building" CTA link
    await expect(page.getByRole('link', { name: /Start Building/i })).toBeVisible();
  });

  test('Demo page loads', async ({ page }) => {
    await page.goto('/demo');
    // The demo page loads EventLandingPage with "Convergence Intelligence Summit"
    // Use .first() to avoid strict mode violation with multiple matches
    await expect(page.getByText(/Convergence Intelligence Summit/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Sign In page loads', async ({ page }) => {
    await page.goto('/sign-in');
    // Wait for the page to be the sign-in page and have some content
    await expect(page).toHaveURL(/sign-in/);
    // Wait for page to have loaded (body has content)
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Sign Up page loads', async ({ page }) => {
    await page.goto('/sign-up');
    // Wait for the page to be the sign-up page and have some content
    await expect(page).toHaveURL(/sign-up/);
    // Wait for page to have loaded (body has content)
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('Dashboard redirects to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/sign-in/);
  });

});
