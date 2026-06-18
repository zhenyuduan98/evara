import { test, expect } from '@playwright/test';

test('should load registration page', async ({ page }) => {
  await page.goto('/register');
  await expect(page).toHaveURL(/register/);
});

test('should load login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveURL(/login/);
});

test('should show error for invalid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'invalid@test.com');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=error')).toBeVisible({ timeout: 5000 });
});

test('should register a new user', async ({ page }) => {
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', `test${Date.now()}@test.com`);
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10000 });
});
