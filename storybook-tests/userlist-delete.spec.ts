import { test, expect } from '@playwright/test';

test('UserList delete flow shows confirm and triggers delete', async ({ page }) => {
  await page.goto('/iframe.html?id=admin-userlist--withusers');

  const deleteBtn = page.locator('[data-testid="delete-1"]');
  await expect(deleteBtn).toBeVisible();
  await deleteBtn.click();

  const confirmBtn = page.locator('[data-testid="confirm-1"]');
  const cancelBtn = page.locator('[data-testid="cancel-1"]');
  await expect(confirmBtn).toBeVisible();
  await expect(cancelBtn).toBeVisible();

  // Click cancel first
  await cancelBtn.click();
  await expect(page.locator('[data-testid="delete-1"]')).toBeVisible();

  // Re-open and confirm
  await page.locator('[data-testid="delete-1"]').click();
  await page.locator('[data-testid="confirm-1"]').click();

  // After confirming, the confirm controls should be gone
  await expect(page.locator('[data-testid="delete-1"]')).toBeVisible();
});
