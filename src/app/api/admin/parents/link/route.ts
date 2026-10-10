import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

export const GET = handle(async (req) => {
  await requireRole('admin');
  const parentId = new URL(req.url).searchParams.get('parentId');
  if (!parentId) throw new ApiError(400, 'Parameter parentId wajib diisi.');

  const [parent] = await sql`
    SELECT id, username, full_name, email FROM users
    WHERE id = ${parentId} AND role = 'orang_tua' AND deleted_at IS NULL`;

  if (!parent) throw new ApiError(404, 'Akun orang tua tidak ditemukan.');

  const linked = await sql`
    SELECT ps.id AS link_id, ps.student_id, ps.relation,
           s.nis, s.full_name, c.name AS class_name
    FROM parent_students ps
    JOIN students s ON s.id = ps.student_id AND s.deleted_at IS NULL
    LEFT JOIN enrollments e ON e.student_id = s.id AND e.deleted_at IS NULL
         AND e.academic_year_id = (SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL)
    LEFT JOIN classes c ON c.id = e.class_id
    WHERE ps.parent_user_id = ${parentId} AND ps.deleted_at IS NULL
    ORDER BY s.full_name`;

  const available = await sql`
    SELECT s.id, s.nis, s.full_name, c.name AS class_name
    FROM students s
    LEFT JOIN enrollments e ON e.student_id = s.id AND e.deleted_at IS NULL
         AND e.academic_year_id = (SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL)
    LEFT JOIN classes c ON c.id = e.class_id
    WHERE s.status = 'aktif' AND s.deleted_at IS NULL
      AND s.id NOT IN (SELECT student_id FROM parent_students WHERE parent_user_id = ${parentId} AND deleted_at IS NULL)
    ORDER BY s.full_name LIMIT 100`;

  return Response.json({ parent, linked, available });
});

const LinkPost = z.object({
  parentId: z.string().uuid(),
  studentId: z.string().uuid(),
  relation: z.string().trim().max(30).default('wali'),
});

export const POST = handle(async (req) => {
  await requireRole('admin');
  const b = LinkPost.parse(await req.json());

  await sql`
    INSERT INTO parent_students (parent_user_id, student_id, relation)
    VALUES (${b.parentId}, ${b.studentId}, ${b.relation})
    ON CONFLICT (parent_user_id, student_id) WHERE deleted_at IS NULL
    DO UPDATE SET relation = EXCLUDED.relation`;

  return Response.json({ ok: true });
});

export const DELETE = handle(async (req) => {
  await requireRole('admin');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('linkId'));

  await sql`UPDATE parent_students SET deleted_at = now() WHERE id = ${id}`;
  return Response.json({ ok: true });
});
