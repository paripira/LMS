import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

// "Never alter table layout once established": any change to column widths/order/headers fails here.
// First run creates baselines:  npm run test:update   (commit the generated *-snapshots folder)
// Runs last (zz- prefix) and uses the subjects table, which other tests never modify.
test('tata letak tabel Mata Pelajaran tidak berubah', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAs(page, 'admin', /\/admin\/data\/students/);
  await page.goto('/admin/data/subjects');
  const table = page.getByTestId('data-table');
  await expect(table).toBeVisible();
  await expect(table.getByRole('cell', { name: 'Matematika' })).toBeVisible();
  await expect(table).toHaveScreenshot('subjects-table.png', { maxDiffPixelRatio: 0.02 });
});
