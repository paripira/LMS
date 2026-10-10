import { defineConfig, devices } from '@playwright/test';

// Tests run against a throw-away database (name must contain "test"); seed wipes it every run.
try {
  process.loadEnvFile('.env.test');
} catch {
  /* env may come from the shell / CI */
}

const PORT = 3100;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  globalSetup: './tests/global-setup.ts',
  fullyParallel: false,
  workers: 1, // tests share one seeded database
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', locale: 'id-ID', timezoneId: 'Asia/Jakarta' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: process.env as Record<string, string>,
  },
});
