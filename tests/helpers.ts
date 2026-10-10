import { expect, type Page } from '@playwright/test';
import { PASSWORD } from '../scripts/seed-ids';

export async function login(page: Page, username: string, password = PASSWORD) {
  await page.goto('/login');
  await page.getByLabel('Nama pengguna').fill(username);
  await page.getByLabel('Kata sandi').fill(password);
  await page.getByRole('button', { name: 'Masuk' }).click();
}

export async function loginAs(page: Page, username: string, landing: RegExp) {
  await login(page, username);
  await expect(page).toHaveURL(landing);
}
