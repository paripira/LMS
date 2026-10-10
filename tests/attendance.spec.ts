import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test('guru menandai presensi massal lalu data bertahan setelah muat ulang', async ({ page }) => {
  await loginAs(page, 'guru1', /\/guru\/presensi/);
  await expect(page.getByTestId('att-row-1002')).toBeVisible(); // kelas 7A terpilih otomatis

  await page.getByRole('button', { name: 'Semua Hadir' }).click();
  await page.getByRole('button', { name: 'Siswa Dua - Sakit' }).click();
  await expect(page.getByRole('button', { name: 'Siswa Dua - Sakit' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Siswa Satu - Hadir' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Simpan Presensi' }).click();
  await expect(page.getByText('Presensi tersimpan.')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Siswa Dua - Sakit' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Siswa Tiga - Hadir' })).toHaveAttribute('aria-pressed', 'true');
});

test('guru tidak bisa mengakses presensi kelas yang bukan miliknya (API)', async ({ page }) => {
  await loginAs(page, 'guru2', /\/guru\/presensi/); // guru2 mengajar MTK di 7A, tetapi bukan wali
  const res = await page.request.get('/api/wali?classId=00000000-0000-4000-8000-000000000028');
  expect([403, 404]).toContain(res.status()); // 7A: hanya wali kelas yang boleh
  expect(JSON.stringify(await res.json())).not.toMatch(/select|from|syntax/i); // tidak ada bocoran SQL
});
