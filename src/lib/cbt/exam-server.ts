import { z } from 'zod';
import { sql, ApiError, type Session } from '@/lib/server';

export const ExamBase = z.object({
  assignmentId: z.string().uuid('Pilih mata pelajaran & kelas'),
  title: z.string().trim().min(1, 'Judul ujian wajib diisi').max(150),
  instructions: z.string().trim().max(2000).nullish().transform((v) => v || null),
  durationMinutes: z.number().int().min(1, 'Durasi minimal 1 menit').max(300, 'Durasi maksimal 300 menit'),
  opensAt: z.string().datetime(),
  closesAt: z.string().datetime(),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  showScore: z.boolean(),
  passingScore: z.number().min(0).max(100).nullish().transform((v) => v ?? null),
  questionIds: z.array(z.string().uuid()).min(1, 'Pilih minimal 1 soal').max(200),
});

export function assertWindow(opensAt: string, closesAt: string, durationMinutes: number) {
  const o = new Date(opensAt).getTime();
  const c = new Date(closesAt).getTime();
  if (c <= o) throw new ApiError(400, 'Waktu selesai harus setelah waktu mulai.');
  if (c - o < durationMinutes * 60_000 * 0.5) {
    throw new ApiError(400, 'Rentang waktu ujian terlalu pendek dibandingkan durasi pengerjaan.');
  }
}

/** Every chosen question must exist, have an answer key, belong to this teacher's bank, and match the subject. */
export async function assertQuestionsUsable(me: Session, subjectId: string, ids: string[]): Promise<string[]> {
  const unique = [...new Set(ids)];
  const rows = await sql`
    SELECT q.id FROM questions q
    JOIN question_banks b ON b.id = q.bank_id AND b.deleted_at IS NULL
    JOIN question_keys k ON k.question_id = q.id AND k.deleted_at IS NULL
    WHERE q.id = ANY (${sql.array(unique)}::uuid[]) AND q.deleted_at IS NULL
      AND b.subject_id = ${subjectId}
      AND (${me.role === 'admin'}::boolean OR b.teacher_id = ${me.teacherId ?? null}::uuid)`;
  if (rows.length !== unique.length) {
    throw new ApiError(422, 'Sebagian soal tidak valid: sudah dihapus, belum punya kunci jawaban, bukan milik Anda, atau beda mata pelajaran.');
  }
  return unique;
}

export async function assertExamAccess(me: Session, examId: string) {
  const [e] = await sql`
    SELECT e.id, e.status, e.title, e.instructions, e.opens_at, e.closes_at, e.duration_minutes,
           e.shuffle_questions, e.shuffle_options, e.passing_score::float AS passing_score, e.settings,
           e.teaching_assignment_id, ta.teacher_id, ta.subject_id, ta.class_id
    FROM exams e JOIN teaching_assignments ta ON ta.id = e.teaching_assignment_id
    WHERE e.id = ${examId} AND e.deleted_at IS NULL`;
  if (!e) throw new ApiError(404, 'Ujian tidak ditemukan.');
  if (me.role === 'guru' && e.teacher_id !== me.teacherId) throw new ApiError(403, 'Ujian ini milik guru lain.');
  return e as unknown as {
    id: string; status: 'draft' | 'published' | 'archived'; title: string; instructions: string | null;
    opens_at: Date; closes_at: Date; duration_minutes: number; shuffle_questions: boolean; shuffle_options: boolean;
    passing_score: number | null; settings: { show_score?: boolean }; teaching_assignment_id: string;
    teacher_id: string; subject_id: string; class_id: string;
  };
}
