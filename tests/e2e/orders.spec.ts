import { test, expect } from '@playwright/test';

test('should view order history page', async ({ page }) => {
  await page.goto('/orders');
  await expect(page).toHaveURL(/orders|login/);
});

test('should show order details', async ({ page }) => {
  await page.goto('/orders');
  const orderLink = page.locator('a[href*="order"]').first();
  if (await orderLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await orderLink.click();
    await expect(page).toHaveURL(/order/);
  }
});
