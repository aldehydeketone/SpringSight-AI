import { test, expect } from '@playwright/test';

test('Homepage loads properly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/SpringSight AI/);
});
