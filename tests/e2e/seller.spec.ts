import { test, expect } from '@playwright/test';

test('should load seller dashboard', async ({ page }) => {
  await page.goto('/seller');
  await expect(page).toHaveURL(/seller|login/);
});

test('should access create product page', async ({ page }) => {
  await page.goto('/seller/products/new');
  await expect(page).toHaveURL(/seller|login/);
});
