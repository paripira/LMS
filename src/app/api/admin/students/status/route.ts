import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

const Body = z.object({
  studentId: z.string().uuid(),
  status: z.enum(['aktif', 'lulus', 'pindah', 'keluar', 'lanjut_smp', 'lanjut_sd']),
  targetClassId: z.string().uuid().optional().nullable(),
  reason: z.string().trim().max(500).optional(),
});

export const POST = handle(async (req) => {
  const me = await requireRole('admin');
  const b = Body.parse(await req.json());

  const result = await sql.begin(async (tx) => {
    if (b.status === 'lanjut_smp' || b.status === 'lanjut_sd') {
      const targetJenjang = b.status === 'lanjut_smp' ? 'SMP' : 'SD';
      const [s] = await tx`
        UPDATE students
        SET jenjang = ${targetJenjang}, status = 'aktif'
        WHERE id = ${b.studentId} AND deleted_at IS NULL
        RETURNING id, full_name, status, jenjang`;
      if (!s) throw new ApiError(404, 'Siswa tidak ditemukan.');

      if (b.targetClassId) {
        await tx`
          INSERT INTO enrollments (student_id, class_id, academic_year_id)
          SELECT ${b.studentId}, c.id, c.academic_year_id
          FROM classes c
          WHERE c.id = ${b.targetClassId} AND c.deleted_at IS NULL
          ON CONFLICT (student_id, academic_year_id) WHERE deleted_at IS NULL
          DO UPDATE SET class_id = EXCLUDED.class_id, updated_at = now()`;
      }

      await tx`
        INSERT INTO audit_log (actor_id, action, entity, entity_id, detail)
        VALUES (${me.userId}, 'student.promote_jenjang', 'students', ${b.studentId},
                jsonb_build_object('new_jenjang', ${targetJenjang}, 'target_class_id', ${b.targetClassId ?? null}, 'reason', ${b.reason ?? null}))`;

      return s;
    }

    const [s] = await tx`
      UPDATE students
      SET status = ${b.status}
      WHERE id = ${b.studentId} AND deleted_at IS NULL
      RETURNING id, full_name, status, jenjang`;

    if (!s) throw new ApiError(404, 'Siswa tidak ditemukan.');

    await tx`
      INSERT INTO audit_log (actor_id, action, entity, entity_id, detail)
      VALUES (${me.userId}, 'student.mutation', 'students', ${b.studentId},
              jsonb_build_object('new_status', ${b.status}, 'reason', ${b.reason ?? null}))`;

    return s;
  });

  return Response.json({ ok: true, status: result.status, jenjang: result.jenjang });
});
