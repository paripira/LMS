import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { hashPassword, verifyPassword } from '@/lib/password';

const Body = z.object({ current: z.string().min(1), next: z.string().min(8, 'Kata sandi baru minimal 8 karakter').max(200) });

export const POST = handle(async (req) => {
  const me = await requireRole();
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Data tidak valid.');
  const { current, next } = parsed.data;

  const [u] = await sql`SELECT password_hash FROM users WHERE id = ${me.userId} AND deleted_at IS NULL`;
  if (!u || !(await verifyPassword(current, u.password_hash))) throw new ApiError(403, 'Kata sandi saat ini salah.');
  if (current === next) throw new ApiError(400, 'Kata sandi baru harus berbeda dari yang lama.');

  await sql`UPDATE users SET password_hash = ${await hashPassword(next)}, must_change_password = false WHERE id = ${me.userId}`;
  return Response.json({ ok: true });
});
