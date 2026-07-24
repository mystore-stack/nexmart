import { test, expect } from '@playwright/test';

test('MegaMenu opens and keyboard navigation works', async ({ page }) => {
  await page.goto('/iframe.html?id=components-megamenu--default');

  const trigger = page.locator('[data-testid="megamenu-trigger"]');
  await expect(trigger).toBeVisible();

  await trigger.click();
  const panel = page.locator('[data-testid="megamenu-panel"]');
  await expect(panel).toBeVisible();

  // basic keyboard: press Tab to focus first item
  await page.keyboard.press('Tab');
  const firstItem = panel.locator('a, button').first();
  await expect(firstItem).toBeFocused();
});
