import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';
import { ID } from '../scripts/seed-ids';

const EXAM_URL = `/siswa/ujian/${ID.exam}`;

test('ujian: jawaban & timer bertahan saat refresh, terkirim otomatis setelah offline', async ({ page, context }) => {
  await loginAs(page, 'siswa1', /\/siswa$/);
  await page.goto(EXAM_URL);
  await expect(page.getByRole('timer')).toBeVisible();

  // Jawab soal 1 → refresh halaman → jawaban masih ada (localStorage-first)
  await page.getByRole('radio').first().check();
  await expect(page.getByText(/Terjawab 1/)).toBeVisible();
  await page.waitForTimeout(500); // debounce penyimpanan 250 ms
  const before = await page.getByRole('timer').innerText();
  await page.reload();
  await expect(page.getByText(/Terjawab 1/)).toBeVisible();
  await expect(page.getByRole('radio').first()).toBeChecked();
  const after = await page.getByRole('timer').innerText();
  expect(after <= before).toBeTruthy(); // timer terus berjalan (berbasis deadline server), tidak mengulang

  // Jawab semua soal lalu kumpulkan SAAT OFFLINE
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /Selanjutnya/ }).click();
    await page.getByRole('radio').first().check();
  }
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Selesai & Kumpulkan' }).first().click();
  await page.getByRole('button', { name: 'Ya, kumpulkan' }).click();
  await expect(page.getByText(/aman di perangkat ini/)).toBeVisible();

  // Koneksi pulih → terkirim otomatis (event "online" atau retry 15 dtk)
  await context.setOffline(false);
  await expect(page.getByText('Jawaban berhasil dikumpulkan')).toBeVisible({ timeout: 25_000 });
  await expect(page.getByText(/Nilai Anda: \d+/)).toBeVisible(); // seed: show_score = true
});

test('ujian yang sudah dikumpulkan tidak bisa dimulai lagi', async ({ page }) => {
  await loginAs(page, 'siswa1', /\/siswa$/);
  const res = await page.request.post(`/api/exams/${ID.exam}/start`);
  expect(res.status()).toBe(409);
  expect((await res.json()).code).toBe('ALREADY_SUBMITTED');
});

test('kunci jawaban tidak pernah dikirim ke browser', async ({ page }) => {
  await loginAs(page, 'siswa2', /\/siswa$/);
  const res = await page.request.post(`/api/exams/${ID.exam}/start`);
  expect(res.ok()).toBeTruthy();
  const body = JSON.stringify(await res.json());
  expect(body).not.toMatch(/"answer"|explanation|question_keys/);
});
