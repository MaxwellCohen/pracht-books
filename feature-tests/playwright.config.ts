import { defineConfig } from '@playwright/test';

const port = Number(process.env.FT_PORT ?? 4113);

export default defineConfig({
  fullyParallel: false,
  reporter: [['list'], ['json', { outputFile: process.env.FT_JSON ?? 'out/playwright.json' }]],
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 240_000,
  use: {
    baseURL: `http://localhost:${port}`,
    browserName: 'chromium',
    launchOptions: { executablePath: process.env.CHROME_PATH ?? '/home/maxc/.local/bin/google-chrome' },
  },
  workers: 1,
});
