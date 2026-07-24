import { test, expect } from '@playwright/test';

test('UserList delete is keyboard accessible', async ({ page }) => {
  await page.goto('/iframe.html?id=admin-userlist--withusers');

  const deleteBtn = page.locator('[data-testid="delete-1"]');
  await deleteBtn.focus();
  await page.keyboard.press('Enter');

  const confirmBtn = page.locator('[data-testid="confirm-1"]');
  await expect(confirmBtn).toBeVisible();
});
