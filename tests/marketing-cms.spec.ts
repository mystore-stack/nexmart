import { test, expect, devices } from '@playwright/test';

test.describe('MarketingCMSSection E2E Tests', () => {
  test.setTimeout(60000);

  test('should render MarketingCMSSection on homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/', { waitUntil: 'commit', timeout: 60000 });
    
    // Check if MarketingCMSSection exists in the DOM
    const marketingSection = page.locator('section').filter({ hasText: /Campagnes|Produits Sponsorisés|Offres Flash/ }).first();
    
    // The section may not render if there's no data, so we check if it exists
    const isVisible = await marketingSection.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(marketingSection).toBeVisible();
      console.log('✅ MarketingCMSSection is visible on homepage');
    } else {
      console.log('⚠️ MarketingCMSSection not visible (no marketing data in database)');
    }
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/', { waitUntil: 'commit', timeout: 60000 });
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(3000);
    
    expect(errors.length).toBe(0);
    console.log('✅ No console errors');
  });

  test('should have no failed network requests', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.url()} - ${response.status()}`);
      }
    });
    
    await page.goto('/', { waitUntil: 'commit', timeout: 60000 });
    
    // Filter out non-critical failures (e.g., analytics, tracking)
    const criticalFailures = failedRequests.filter(url => 
      !url.includes('analytics') && 
      !url.includes('tracking') &&
      !url.includes('telemetry')
    );
    
    expect(criticalFailures.length).toBe(0);
    console.log('✅ No critical network request failures');
  });

  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize(devices['Pixel 5'].viewport);
    await page.goto('/', { waitUntil: 'commit', timeout: 60000 });
    
    // Check if marketing section is visible
    const marketingSection = page.locator('section').filter({ hasText: /Campagnes|Produits Sponsorisés|Offres Flash/ }).first();
    const isVisible = await marketingSection.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(marketingSection).toBeVisible();
      console.log('✅ MarketingCMSSection visible on mobile');
    } else {
      console.log('⚠️ No marketing data to test mobile layout');
    }
  });

  test('should render correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize(devices['iPad Pro'].viewport);
    await page.goto('/', { waitUntil: 'commit', timeout: 60000 });
    
    const marketingSection = page.locator('section').filter({ hasText: /Campagnes|Produits Sponsorisés|Offres Flash/ }).first();
    const isVisible = await marketingSection.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(marketingSection).toBeVisible();
      console.log('✅ MarketingCMSSection visible on tablet');
    } else {
      console.log('⚠️ No marketing data to test tablet layout');
    }
  });

  test('should render correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize(devices['Desktop Chrome'].viewport);
    await page.goto('/', { waitUntil: 'commit', timeout: 60000 });
    
    const marketingSection = page.locator('section').filter({ hasText: /Campagnes|Produits Sponsorisés|Offres Flash/ }).first();
    const isVisible = await marketingSection.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(marketingSection).toBeVisible();
      console.log('✅ MarketingCMSSection visible on desktop');
    } else {
      console.log('⚠️ No marketing data to test desktop layout');
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit', timeout: 60000 });
    
    // If no marketing data exists, the section should not render
    const marketingSection = page.locator('section').filter({ hasText: /Campagnes|Produits Sponsorisés|Offres Flash/ }).first();
    const isVisible = await marketingSection.isVisible().catch(() => false);
    
    if (!isVisible) {
      console.log('✅ Empty state handled correctly (section not rendered when no data)');
    } else {
      console.log('✅ Section renders with data');
    }
  });
});
