import { test, expect } from '@playwright/test';

test('should view cart page', async ({ page }) => {
  await page.goto('/cart');
  await expect(page).toHaveURL(/cart/);
});

test('should add item to cart from product page', async ({ page }) => {
  await page.goto('/products');
  await page.locator('a[href*="product"]').first().click();
  await page.click('button:has-text("Add to Cart"), button:has-text("add to cart"), button:has-text("Add")');
  await expect(page.locator('text=/cart|added/i')).toBeVisible({ timeout: 5000 });
});
