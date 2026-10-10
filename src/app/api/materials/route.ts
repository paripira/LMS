import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { assertAssignmentAccess } from '@/lib/access';

export const GET = handle(async (req) => {
  const me = await requireRole();
  const assignmentId = z.string().uuid().parse(new URL(req.url).searchParams.get('assignmentId'));

  if (me.role === 'guru') {
    await assertAssignmentAccess(me, assignmentId);
  } else if (me.role === 'siswa') {
    const [enrolled] = await sql`
      SELECT 1 FROM teaching_assignments ta
      JOIN enrollments e ON e.class_id = ta.class_id AND e.student_id = ${me.studentId!} AND e.deleted_at IS NULL
      WHERE ta.id = ${assignmentId} AND ta.deleted_at IS NULL`;
    if (!enrolled) throw new ApiError(403, 'Anda tidak terdaftar di kelas mata pelajaran ini.');
  }

  const rows = await sql`
    SELECT id, teaching_assignment_id, title, description, url, published_at
    FROM materials
    WHERE teaching_assignment_id = ${assignmentId} AND deleted_at IS NULL
    ORDER BY published_at DESC`;

  return Response.json(rows);
});

const Post = z.object({
  teachingAssignmentId: z.string().uuid(),
  title: z.string().trim().min(1, 'Judul materi wajib diisi').max(200),
  description: z.string().trim().max(2000).nullish().transform((v) => v || null),
  url: z.string().trim().regex(/^https?:\/\//i, 'Tautan materi harus diawali http:// atau https://'),
});

export const POST = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const b = Post.parse(await req.json());
  if (me.role === 'guru') await assertAssignmentAccess(me, b.teachingAssignmentId);

  const [m] = await sql`
    INSERT INTO materials (teaching_assignment_id, title, description, url)
    VALUES (${b.teachingAssignmentId}, ${b.title}, ${b.description}, ${b.url})
    RETURNING id`;

  // Asynchronously notify class
  import('@/lib/notifications').then(async ({ sendClassNotification }) => {
    const [ta] = await sql`
      SELECT c.id AS class_id, sub.name AS subject_name
      FROM teaching_assignments ta
      JOIN classes c ON c.id = ta.class_id
      JOIN subjects sub ON sub.id = ta.subject_id
      WHERE ta.id = ${b.teachingAssignmentId}`;
    if (ta) {
      sendClassNotification(ta.class_id as string, {
        title: `Materi Baru: ${ta.subject_name}`,
        body: `${b.title} telah dibagikan oleh guru.`,
        link: '/siswa',
        type: 'tugas',
      }).catch(() => {});
    }
  }).catch(() => {});

  return Response.json({ ok: true, id: m.id });
});

export const DELETE = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('id'));

  const [m] = await sql`
    SELECT m.id, m.teaching_assignment_id, ta.teacher_id
    FROM materials m
    JOIN teaching_assignments ta ON ta.id = m.teaching_assignment_id
    WHERE m.id = ${id} AND m.deleted_at IS NULL`;

  if (!m) throw new ApiError(404, 'Materi tidak ditemukan.');
  if (me.role === 'guru' && m.teacher_id !== me.teacherId) {
    throw new ApiError(403, 'Anda bukan pemilik materi ini.');
  }

  await sql`UPDATE materials SET deleted_at = now() WHERE id = ${id}`;
  return Response.json({ ok: true });
});
