import { test, expect } from '@playwright/test';
import { login, loginAs } from './helpers';

test.describe('login & akses per peran', () => {
  test('halaman terproteksi mengarahkan tamu ke /login', async ({ page }) => {
    await page.goto('/admin/data/students');
    await expect(page).toHaveURL(/\/login/);
  });

  test('kata sandi salah menampilkan pesan ramah (bukan error teknis)', async ({ page }) => {
    await login(page, 'admin', 'salah-total');
    await expect(page.locator('form').getByRole('alert')).toHaveText('Nama pengguna atau kata sandi salah.');
    await expect(page).toHaveURL(/\/login/);
  });

  const landings: [string, RegExp][] = [
    ['admin', /\/admin\/data\/students/],
    ['guru1', /\/guru\/presensi/],
    ['siswa1', /\/siswa$/],
    ['ortu1', /\/ortu$/],
    ['kepsek', /\/kepsek$/],
  ];
  for (const [user, url] of landings) {
    test(`${user} masuk ke beranda perannya`, async ({ page }) => {
      await loginAs(page, user, url);
    });
  }

  test('siswa tidak bisa membuka area admin', async ({ page }) => {
    await loginAs(page, 'siswa1', /\/siswa$/);
    await page.goto('/admin/data/students');
    await expect(page).toHaveURL(/\/siswa$/);
  });

  test('API menolak peran yang salah dengan pesan ramah', async ({ page }) => {
    await loginAs(page, 'siswa1', /\/siswa$/);
    const res = await page.request.get('/api/admin/students');
    expect(res.status()).toBe(403);
    expect((await res.json()).message).toContain('tidak memiliki akses');
  });

  test('keluar menghapus sesi', async ({ page }) => {
    await loginAs(page, 'admin', /\/admin\/data\/students/);
    await page.getByRole('button', { name: 'Keluar' }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/admin/data/students');
    await expect(page).toHaveURL(/\/login/);
  });
});
