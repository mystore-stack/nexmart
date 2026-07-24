import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'storybook-tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:9001',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
});
