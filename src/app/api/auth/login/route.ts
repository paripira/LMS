import { z } from 'zod';
import { cookies } from 'next/headers';
import { sql, handle, ApiError } from '@/lib/server';
import { verifyPassword, hashPassword } from '@/lib/password';
import { signSession, COOKIE, SESSION_HOURS, HOME } from '@/lib/session';

const Body = z.object({ username: z.string().trim().min(1).max(64), password: z.string().min(1).max(200) });

// Simple in-memory brute-force guard (per server instance): 8 failures → 10 min lock per IP+user.
const fails = new Map<string, { n: number; until: number }>();
const MAX = 8;
const LOCK_MS = 10 * 60_000;

let dummyHash: Promise<string> | undefined; // keeps timing similar for unknown usernames

export const POST = handle(async (req) => {
  const { username, password } = Body.parse(await req.json());
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const normUser = username.toLowerCase();
  const key = `${ip}|${normUser}`;
  const userKey = `user|${normUser}`;

  const f = fails.get(key);
  const uf = fails.get(userKey);
  if ((f && f.n >= MAX && f.until > Date.now()) || (uf && uf.n >= MAX * 2 && uf.until > Date.now())) {
    throw new ApiError(429, 'Terlalu banyak percobaan masuk. Silakan coba lagi dalam beberapa menit.');
  }

  const [u] = await sql`
    SELECT u.id, u.password_hash, u.role, u.is_active, u.must_change_password,
           s.id AS student_id, t.id AS teacher_id
    FROM users u
    LEFT JOIN students s ON s.user_id = u.id AND s.deleted_at IS NULL
    LEFT JOIN teachers t ON t.user_id = u.id AND t.deleted_at IS NULL
    WHERE u.username = ${username} AND u.deleted_at IS NULL`;

  const ok = u
    ? await verifyPassword(password, u.password_hash)
    : (await verifyPassword(password, await (dummyHash ??= hashPassword('dummy'))), false);

  if (!u || !ok || !u.is_active) {
    const cur = fails.get(key) ?? { n: 0, until: 0 };
    fails.set(key, { n: cur.n + 1, until: Date.now() + LOCK_MS });
    const ucur = fails.get(userKey) ?? { n: 0, until: 0 };
    fails.set(userKey, { n: ucur.n + 1, until: Date.now() + LOCK_MS });
    throw new ApiError(401, 'Nama pengguna atau kata sandi salah.');
  }
  fails.delete(key);
  fails.delete(userKey);

  await sql`UPDATE users SET last_login_at = now() WHERE id = ${u.id}`;

  const token = await signSession({
    userId: u.id,
    role: u.role,
    studentId: u.student_id ?? undefined,
    teacherId: u.teacher_id ?? undefined,
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });

  return Response.json({ role: u.role, home: HOME[u.role as keyof typeof HOME], mustChange: u.must_change_password });
});
