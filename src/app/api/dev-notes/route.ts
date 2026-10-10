import { z } from 'zod';
import { sql, handle, requireRole, ApiError, type Session } from '@/lib/server';
import { activeSemester, assertClassAccess } from '@/lib/access';

const Id = z.string().uuid();

async function studentClass(studentId: string) {
  const [e] = await sql`
    SELECT e.class_id FROM enrollments e
    WHERE e.student_id = ${studentId} AND e.deleted_at IS NULL
      AND e.academic_year_id = (SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL)`;
  if (!e) throw new ApiError(404, 'Siswa tidak terdaftar pada kelas di tahun ajaran aktif.');
  return e.class_id as string;
}

async function assertCanRead(me: Session, studentId: string) {
  if (me.role === 'admin') return;
  if (me.role === 'siswa') {
    if (me.studentId !== studentId) throw new ApiError(403, 'Anda tidak memiliki akses.');
    return;
  }
  if (me.role === 'orang_tua') {
    const [l] = await sql`SELECT 1 FROM parent_students WHERE parent_user_id = ${me.userId} AND student_id = ${studentId} AND deleted_at IS NULL`;
    if (!l) throw new ApiError(403, 'Anda tidak memiliki akses.');
    return;
  }
  await assertClassAccess(me, await studentClass(studentId), true);
}

export const GET = handle(async (req) => {
  const me = await requireRole('admin', 'guru', 'siswa', 'orang_tua');
  const studentId = Id.parse(new URL(req.url).searchParams.get('studentId'));
  await assertCanRead(me, studentId);
  const notes = await sql`
    SELECT n.id, n.aspect, n.narrative, n.observed_on::text AS observed_on, t.full_name AS author
    FROM development_notes n JOIN teachers t ON t.id = n.author_id
    WHERE n.student_id = ${studentId} AND n.deleted_at IS NULL
    ORDER BY n.observed_on DESC, n.created_at DESC LIMIT 50`;
  return Response.json(notes);
});

const Post = z.object({
  studentId: Id,
  aspect: z.enum(['agama_budi_pekerti', 'jati_diri', 'literasi', 'sosial_emosional', 'motorik', 'karakter', 'lainnya']),
  narrative: z.string().trim().min(5, 'Catatan terlalu pendek').max(1500),
  observedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const POST = handle(async (req) => {
  const me = await requireRole('guru');
  const b = Post.parse(await req.json());
  await assertClassAccess(me, await studentClass(b.studentId), true);
  const sem = await activeSemester();
  const [n] = await sql`
    INSERT INTO development_notes (student_id, semester_id, author_id, aspect, narrative, observed_on)
    VALUES (${b.studentId}, ${sem.id}, ${me.teacherId!}, ${b.aspect}, ${b.narrative}, ${b.observedOn ?? sql`current_date`})
    RETURNING id`;
  return Response.json({ id: n.id });
});
