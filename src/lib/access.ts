import { sql, ApiError, type Session } from '@/lib/server';

export interface ActiveSemester { id: string; kind: 'ganjil' | 'genap'; starts_on: string; ends_on: string; academic_year_id: string }

export async function activeSemester(): Promise<ActiveSemester> {
  const [s] = await sql`SELECT id, kind, starts_on::text AS starts_on, ends_on::text AS ends_on, academic_year_id
                        FROM semesters WHERE status = 'active' AND deleted_at IS NULL`;
  if (!s) throw new ApiError(409, 'Belum ada semester aktif. Hubungi Admin sekolah.');
  return s as unknown as ActiveSemester;
}

/** Admin: always. Guru: homeroom teacher of the class, or (unless waliOnly) teaches in it this semester. */
export async function assertClassAccess(me: Session, classId: string, waliOnly = false) {
  if (me.role === 'admin') return;
  if (!me.teacherId) throw new ApiError(403, 'Akun Anda tidak terhubung dengan data guru.');
  const [ok] = await sql`
    SELECT 1 FROM classes c
    WHERE c.id = ${classId} AND c.deleted_at IS NULL
      AND (c.homeroom_teacher_id = ${me.teacherId}
           ${waliOnly ? sql`` : sql`OR EXISTS (
             SELECT 1 FROM teaching_assignments ta
             JOIN semesters s ON s.id = ta.semester_id AND s.status = 'active'
             WHERE ta.class_id = c.id AND ta.teacher_id = ${me.teacherId} AND ta.deleted_at IS NULL)`})`;
  if (!ok) throw new ApiError(403, waliOnly ? 'Hanya Wali Kelas yang dapat mengakses data ini.' : 'Anda tidak memiliki akses ke kelas ini.');
}

export async function assertAssignmentAccess(me: Session, assignmentId: string) {
  const [ta] = await sql`SELECT id, teacher_id, class_id, semester_id, subject_id FROM teaching_assignments WHERE id = ${assignmentId} AND deleted_at IS NULL`;
  if (!ta) throw new ApiError(404, 'Penugasan mengajar tidak ditemukan.');
  if (me.role === 'guru' && ta.teacher_id !== me.teacherId) throw new ApiError(403, 'Anda bukan pengampu mata pelajaran ini.');
  return ta as unknown as { id: string; teacher_id: string; class_id: string; semester_id: string; subject_id: string };
}

export async function assertBankAccess(me: Session, bankId: string) {
  const [b] = await sql`SELECT id, teacher_id, subject_id FROM question_banks WHERE id = ${bankId} AND deleted_at IS NULL`;
  if (!b) throw new ApiError(404, 'Bank soal tidak ditemukan.');
  if (me.role === 'guru' && b.teacher_id !== me.teacherId) throw new ApiError(403, 'Bank soal ini milik guru lain.');
  return b as unknown as { id: string; teacher_id: string; subject_id: string };
}
