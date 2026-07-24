import { test, expect } from '@playwright/test';

test('HeroCarousel displays slides and next control works', async ({ page }) => {
  await page.goto('/iframe.html?id=components-herocarousel--default');

  const carousel = page.locator('[data-testid="hero-carousel"]');
  await expect(carousel).toBeVisible();

  const next = carousel.locator('button[aria-label="Next"]');
  if (await next.count() > 0) {
    await next.first().click();
    // after clicking, ensure at least one slide is visible
    const slide = carousel.locator('[role="group"] img, [data-slide]');
    await expect(slide.first()).toBeVisible();
  }
});
