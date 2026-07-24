import { test, expect } from '@playwright/test';

test('ProductCard story renders and has accessible image and CTA', async ({ page }) => {
  // Storybook iframe path for the ProductCard default story.
  await page.goto('/iframe.html?id=components-productcard--default');

  // Expect the product image to be present
  const img = page.locator('img');
  await expect(img.first()).toBeVisible();

  // Expect a CTA (Add to cart / Buy) to be visible
  const cta = page.locator('button, [role="button"]');
  await expect(cta.first()).toBeVisible();
});
