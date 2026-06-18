import { test, expect } from '@playwright/test';

test('should browse products on homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
});

test('should search for products', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="search"], input[placeholder*="Search"], input[name="search"]', 'laptop');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/search|q=/);
});

test('should view product detail page', async ({ page }) => {
  await page.goto('/products');
  await page.locator('a[href*="product"]').first().click();
  await expect(page).toHaveURL(/product/);
});
