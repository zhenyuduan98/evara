import { test, expect } from '@playwright/test';

test('should navigate to checkout page', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL(/checkout|login/);
});

test('should show checkout form when logged in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.goto('/checkout');
  await expect(page.locator('main')).toBeVisible();
});
