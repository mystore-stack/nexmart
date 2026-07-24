import { test, expect } from '@playwright/test';

test('UserList shows users and delete button triggers', async ({ page }) => {
  await page.goto('/iframe.html?id=admin-userlist--withusers');

  const userRow = page.locator('[data-testid="user-1"]');
  await expect(userRow).toBeVisible();

  const deleteBtn = page.locator('[data-testid="delete-1"]');
  await expect(deleteBtn).toBeVisible();
});
