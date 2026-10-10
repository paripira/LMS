'use client';
import { del } from 'idb-keyval';

export class UiError extends Error {}

type Init = Omit<RequestInit, 'body'> & { json?: unknown };

/** fetch wrapper: JSON in/out, friendly Indonesian errors, redirects to /login on 401. */
export async function api<T = unknown>(url: string, init: Init = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: 'same-origin',
      ...rest,
      headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch {
    throw new UiError('Tidak ada koneksi internet. Periksa jaringan Anda lalu coba lagi.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !location.pathname.startsWith('/login')) location.href = '/login';
    throw new UiError(data?.message ?? 'Terjadi kesalahan. Silakan coba lagi.');
  }
  return data as T;
}

/** Clears server cookie AND every locally cached byte (shared school computers). */
export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  await del('lms-cache').catch(() => {});
  try {
    localStorage.removeItem('cbt-active-exam');
  } catch {}
  location.href = '/login';
}
