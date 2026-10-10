import { z } from 'zod';
import { sql, handle, requireRole } from '@/lib/server';

export const GET = handle(async () => {
  const me = await requireRole();
  const rows = await sql`
    SELECT id, title, body, link, type, is_read, created_at
    FROM notifications
    WHERE user_id = ${me.userId} AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 30`;

  const [{ unread }] = await sql`
    SELECT count(*)::int AS unread
    FROM notifications
    WHERE user_id = ${me.userId} AND is_read = false AND deleted_at IS NULL`;

  return Response.json({ notifications: rows, unread });
});

const Patch = z.object({
  id: z.string().uuid().optional(),
  all: z.boolean().optional(),
});

export const PATCH = handle(async (req) => {
  const me = await requireRole();
  const b = Patch.parse(await req.json());

  if (b.all) {
    await sql`UPDATE notifications SET is_read = true WHERE user_id = ${me.userId} AND is_read = false AND deleted_at IS NULL`;
  } else if (b.id) {
    await sql`UPDATE notifications SET is_read = true WHERE id = ${b.id} AND user_id = ${me.userId} AND deleted_at IS NULL`;
  }

  return Response.json({ ok: true });
});
