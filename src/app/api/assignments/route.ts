import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';
import { assertAssignmentAccess } from '@/lib/access';

export const GET = handle(async (req) => {
  const me = await requireRole();
  const u = new URL(req.url).searchParams;
  const assignmentId = u.get('assignmentId');

  if (me.role === 'siswa') {
    // List all assignments across enrolled classes or for a specific teaching assignment
    const rows = await sql`
      SELECT a.id, a.teaching_assignment_id, a.title, a.instructions, a.url, a.due_at,
             sub.name AS subject_name, c.name AS class_name,
             subm.id AS submission_id, subm.url AS submission_url, subm.note AS submission_note,
             subm.submitted_at, subm.score, subm.feedback, subm.graded_at,
             (subm.id IS NOT NULL) AS is_submitted
      FROM assignments a
      JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id
      JOIN subjects sub ON sub.id = ta.subject_id
      JOIN classes c ON c.id = ta.class_id
      JOIN enrollments e ON e.class_id = ta.class_id AND e.student_id = ${me.studentId!} AND e.deleted_at IS NULL
      LEFT JOIN assignment_submissions subm ON subm.assignment_id = a.id AND subm.student_id = ${me.studentId!} AND subm.deleted_at IS NULL
      WHERE a.deleted_at IS NULL
        ${assignmentId ? sql`AND a.teaching_assignment_id = ${assignmentId}::uuid` : sql``}
      ORDER BY a.due_at ASC NULLS LAST, a.created_at DESC`;
    return Response.json(rows);
  }

  // Guru or Admin
  if (!assignmentId) throw new ApiError(400, 'Pilih penugasan mengajar terlebih dahulu.');
  if (me.role === 'guru') await assertAssignmentAccess(me, assignmentId);

  const rows = await sql`
    SELECT a.id, a.teaching_assignment_id, a.title, a.instructions, a.url, a.due_at, a.created_at,
           count(subm.id)::int AS submissions_count,
           count(subm.id) FILTER (WHERE subm.score IS NOT NULL)::int AS graded_count,
           (SELECT count(*)::int FROM enrollments e
            JOIN teaching_assignments ta ON ta.class_id = e.class_id
            WHERE ta.id = a.teaching_assignment_id AND e.deleted_at IS NULL) AS total_students
    FROM assignments a
    LEFT JOIN assignment_submissions subm ON subm.assignment_id = a.id AND subm.deleted_at IS NULL
    WHERE a.teaching_assignment_id = ${assignmentId} AND a.deleted_at IS NULL
    GROUP BY a.id
    ORDER BY a.created_at DESC`;

  return Response.json(rows);
});

const Post = z.object({
  teachingAssignmentId: z.string().uuid(),
  title: z.string().trim().min(1, 'Judul tugas wajib diisi').max(200),
  instructions: z.string().trim().max(4000).nullish().transform((v) => v || null),
  url: z.string().trim().regex(/^https?:\/\//i, 'Tautan referensi harus diawali http:// atau https://').nullish().transform((v) => v || null),
  dueAt: z.string().datetime().nullish().transform((v) => v || null),
});

export const POST = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const b = Post.parse(await req.json());
  if (me.role === 'guru') await assertAssignmentAccess(me, b.teachingAssignmentId);

  const [a] = await sql`
    INSERT INTO assignments (teaching_assignment_id, title, instructions, url, due_at)
    VALUES (${b.teachingAssignmentId}, ${b.title}, ${b.instructions}, ${b.url}, ${b.dueAt ? new Date(b.dueAt) : null})
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
        title: `Tugas Baru: ${ta.subject_name}`,
        body: `${b.title}${b.dueAt ? ` (Tenggat: ${new Date(b.dueAt).toLocaleDateString('id-ID')})` : ''}`,
        link: '/siswa',
        type: 'tugas',
      }).catch(() => {});
    }
  }).catch(() => {});

  return Response.json({ ok: true, id: a.id });
});

const PatchAssignment = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, 'Judul tugas wajib diisi').max(200),
  instructions: z.string().trim().max(4000).nullish().transform((v) => v || null),
  url: z.string().trim().regex(/^https?:\/\//i, 'Tautan referensi harus diawali http:// atau https://').nullish().transform((v) => v || null),
  dueAt: z.string().datetime().nullish().transform((v) => v || null),
});

export const PATCH = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const b = PatchAssignment.parse(await req.json());

  const [a] = await sql`
    SELECT a.id, a.teaching_assignment_id, ta.teacher_id
    FROM assignments a
    JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id
    WHERE a.id = ${b.id} AND a.deleted_at IS NULL`;

  if (!a) throw new ApiError(404, 'Tugas tidak ditemukan.');
  if (me.role === 'guru' && a.teacher_id !== me.teacherId) {
    throw new ApiError(403, 'Anda bukan pemilik tugas ini.');
  }

  await sql`
    UPDATE assignments
    SET title = ${b.title},
        instructions = ${b.instructions},
        url = ${b.url},
        due_at = ${b.dueAt ? new Date(b.dueAt) : null},
        updated_at = now()
    WHERE id = ${b.id}`;

  return Response.json({ ok: true, id: b.id });
});

export const DELETE = handle(async (req) => {
  const me = await requireRole('guru', 'admin');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('id'));

  const [a] = await sql`
    SELECT a.id, a.teaching_assignment_id, ta.teacher_id
    FROM assignments a
    JOIN teaching_assignments ta ON ta.id = a.teaching_assignment_id
    WHERE a.id = ${id} AND a.deleted_at IS NULL`;

  if (!a) throw new ApiError(404, 'Tugas tidak ditemukan.');
  if (me.role === 'guru' && a.teacher_id !== me.teacherId) {
    throw new ApiError(403, 'Anda bukan pemilik tugas ini.');
  }

  await sql`UPDATE assignments SET deleted_at = now() WHERE id = ${id}`;
  return Response.json({ ok: true });
});
