import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

export const GET = handle(async () => {
  await requireRole();
  const rows = await sql`
    SELECT id, title, description, starts_on::text AS starts_on, ends_on::text AS ends_on, category
    FROM calendar_events
    WHERE deleted_at IS NULL AND ends_on >= current_date - 60
    ORDER BY starts_on LIMIT 300`;
  return Response.json(rows);
});

const Date_ = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid');
const Post = z.object({
  title: z.string().trim().min(1, 'Judul wajib diisi').max(150),
  description: z.string().trim().max(500).nullish().transform((v) => v || null),
  startsOn: Date_,
  endsOn: Date_,
  category: z.enum(['akademik', 'libur', 'ujian', 'kegiatan']).default('akademik'),
}).refine((v) => v.endsOn >= v.startsOn, { message: 'Tanggal selesai tidak boleh sebelum tanggal mulai' });

export const POST = handle(async (req) => {
  await requireRole('admin');
  const b = Post.parse(await req.json());
  const [e] = await sql`INSERT INTO calendar_events (title, description, starts_on, ends_on, category)
                        VALUES (${b.title}, ${b.description}, ${b.startsOn}::date, ${b.endsOn}::date, ${b.category}) RETURNING id`;
  return Response.json({ id: e.id });
});

export const DELETE = handle(async (req) => {
  await requireRole('admin');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('id'));
  const [e] = await sql`UPDATE calendar_events SET deleted_at = now() WHERE id = ${id} AND deleted_at IS NULL RETURNING id`;
  if (!e) throw new ApiError(404, 'Agenda tidak ditemukan.');
  return Response.json({ ok: true });
});
