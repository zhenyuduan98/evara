import { test, expect } from '@playwright/test';

test('should load gift registry page', async ({ page }) => {
  await page.goto('/gift-registry');
  await expect(page.locator('main')).toBeVisible();
});

test('should load auctions page', async ({ page }) => {
  await page.goto('/auctions');
  await expect(page.locator('main')).toBeVisible();
});

test('should load subscriptions page', async ({ page }) => {
  await page.goto('/subscriptions');
  await expect(page.locator('main')).toBeVisible();
});

test('should load live shopping page', async ({ page }) => {
  await page.goto('/live-shopping');
  await expect(page.locator('main')).toBeVisible();
});
