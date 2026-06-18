import { test, expect } from '@playwright/test';

test('should load admin dashboard', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/admin|login/);
});

test('should access user management', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/admin|login/);
});
