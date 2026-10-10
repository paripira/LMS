import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test('admin mengimpor CSV siswa: baris valid masuk, baris salah dilaporkan', async ({ page }) => {
  await loginAs(page, 'admin', /\/admin\/data\/students/);
  await page.goto('/admin/import');
  await expect(page.getByRole('heading', { name: 'Impor Data' })).toBeVisible();

  const csv = [
    'nis,nama,jk,jenjang,kelas,ortu_username',
    '9001,Budi Import,L,SMP,7A,ortu.budi',
    '9002,Siti Import,P,SMP,7A,',
    '9003,,L,SMP,7A,', // nama kosong → harus ditolak di pratinjau
  ].join('\n');

  await page.getByTestId('import-file').setInputFiles({ name: 'siswa.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.getByText(/2 baris valid/)).toBeVisible();
  await expect(page.getByText(/1 baris bermasalah/)).toBeVisible();
  await expect(page.getByText(/Baris 4: nama/)).toBeVisible();

  await page.getByRole('button', { name: 'Mulai Impor' }).click();
  await expect(page.getByText(/Impor selesai: 2 data baru/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Unduh daftar akun/ })).toBeVisible();

  await page.goto('/admin/data/students');
  await page.getByLabel('Cari').fill('Budi Import');
  await expect(page.getByRole('cell', { name: 'Budi Import' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Siti Import' })).toHaveCount(0);
});

test('mengimpor ulang file yang sama memperbarui data (tidak menggandakan)', async ({ page }) => {
  await loginAs(page, 'admin', /\/admin\/data\/students/);
  await page.goto('/admin/import');
  const csv = 'nis,nama,jk,jenjang\n9001,Budi Import Revisi,L,SMP';
  await page.getByTestId('import-file').setInputFiles({ name: 'ulang.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.getByRole('button', { name: 'Mulai Impor' }).click();
  await expect(page.getByText(/0 data baru, 1 diperbarui/)).toBeVisible();
});
