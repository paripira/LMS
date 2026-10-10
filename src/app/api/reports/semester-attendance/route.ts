import { sql, handle, requireRole, ApiError } from '@/lib/server';

export const GET = handle(async (req) => {
  await requireRole('admin', 'guru', 'kepala_sekolah');
  const u = new URL(req.url).searchParams;
  const classId = u.get('classId');
  if (!classId) throw new ApiError(400, 'Pilih kelas terlebih dahulu.');

  const [sem] = await sql`
    SELECT s.id, s.kind, s.starts_on::text, s.ends_on::text, ay.name AS year_name
    FROM semesters s
    JOIN academic_years ay ON ay.id = s.academic_year_id
    WHERE s.status = 'active' AND s.deleted_at IS NULL`;
  if (!sem) throw new ApiError(409, 'Belum ada semester aktif.');

  const [cls] = await sql`SELECT id, name FROM classes WHERE id = ${classId} AND deleted_at IS NULL`;
  if (!cls) throw new ApiError(404, 'Kelas tidak ditemukan.');

  const rows = await sql`
    SELECT
      s.id AS student_id,
      s.nis,
      s.full_name,
      CASE
        WHEN count(asub.id) > 0 THEN count(asub.id) FILTER (WHERE asub.status = 'hadir')::int
        ELSE count(ad.id) FILTER (WHERE ad.status = 'hadir')::int
      END AS hadir,
      CASE
        WHEN count(asub.id) > 0 THEN count(asub.id) FILTER (WHERE asub.status = 'izin')::int
        ELSE count(ad.id) FILTER (WHERE ad.status = 'izin')::int
      END AS izin,
      CASE
        WHEN count(asub.id) > 0 THEN count(asub.id) FILTER (WHERE asub.status = 'sakit')::int
        ELSE count(ad.id) FILTER (WHERE ad.status = 'sakit')::int
      END AS sakit,
      CASE
        WHEN count(asub.id) > 0 THEN count(asub.id) FILTER (WHERE asub.status = 'alpa')::int
        ELSE count(ad.id) FILTER (WHERE ad.status = 'alpa')::int
      END AS alpa
    FROM enrollments e
    JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
    LEFT JOIN teaching_assignments ta
      ON ta.class_id = e.class_id AND ta.semester_id = ${sem.id} AND ta.deleted_at IS NULL
    LEFT JOIN attendance_subject asub
      ON asub.student_id = s.id AND asub.teaching_assignment_id = ta.id AND asub.deleted_at IS NULL
    LEFT JOIN attendance_daily ad
      ON ad.student_id = s.id AND ad.class_id = e.class_id AND ad.deleted_at IS NULL
     AND ad.attendance_date >= ${sem.starts_on}::date AND ad.attendance_date <= ${sem.ends_on}::date
    WHERE e.class_id = ${classId}::uuid AND e.deleted_at IS NULL
    GROUP BY s.id, s.nis, s.full_name
    ORDER BY s.full_name`;

  const formatted = rows.map((r) => {
    const total = (r.hadir as number) + (r.izin as number) + (r.sakit as number) + (r.alpa as number);
    const pct = total > 0 ? Math.round(((r.hadir as number) / total) * 1000) / 10 : 100;
    return {
      student_id: r.student_id,
      nis: r.nis,
      full_name: r.full_name,
      hadir: r.hadir,
      izin: r.izin,
      sakit: r.sakit,
      alpa: r.alpa,
      total,
      pct,
    };
  });

  return Response.json({
    class: cls,
    semester: sem,
    rows: formatted,
  });
});
