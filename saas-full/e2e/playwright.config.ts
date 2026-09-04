import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  fullyParallel: false,
  reporter: [['html', { outputFolder: 'reports/liqi', open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:5180',
    headless: true,
    viewport: { width: 1600, height: 900 },
    screenshot: 'only-on-failure',
    launchOptions: {
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    }
  }
})
