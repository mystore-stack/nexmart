import { test, expect } from '@playwright/test';

test('Navbar renders and contains navigation links', async ({ page }) => {
  await page.goto('/iframe.html?id=components-navbar--default');

  const nav = page.locator('nav');
  await expect(nav).toBeVisible();

  const links = nav.locator('a');
  await expect(links.first()).toBeVisible();
});
