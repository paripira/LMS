import { sql, handle, requireRole } from '@/lib/server';

export const GET = handle(async (req) => {
  await requireRole('kepala_sekolah', 'admin');
  const u = new URL(req.url).searchParams;
  const param = u.get('semesterId');
  const rawJenjang = u.get('jenjang');
  const jenjang = rawJenjang && ['TK', 'SD', 'SMP'].includes(rawJenjang) ? rawJenjang : null;

  const [sem] = param
    ? await sql`SELECT s.id, s.starts_on::text AS starts_on, s.ends_on::text AS ends_on, ay.name || ' ' || initcap(s.kind::text) AS label
                FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id WHERE s.id = ${param}::uuid`
    : await sql`SELECT s.id, s.starts_on::text AS starts_on, s.ends_on::text AS ends_on, ay.name || ' ' || initcap(s.kind::text) AS label
                FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id
                WHERE s.status = 'active' AND s.deleted_at IS NULL`;

  if (!sem) return Response.json({ semester: null, bySubject: [], byClass: [], distribution: [], approval: [], kpi: null });

  const [bySubject, byClass, distribution, approval, [kpi]] = await Promise.all([
    sql`SELECT sub.name AS label, round(avg(g.final_score), 2)::float AS avg
        FROM grades g
        JOIN teaching_assignments ta ON ta.id = g.teaching_assignment_id
        JOIN subjects sub ON sub.id = ta.subject_id
        WHERE g.semester_id = ${sem.id} AND g.final_score IS NOT NULL AND g.deleted_at IS NULL
          ${jenjang ? sql`AND sub.jenjang = ${jenjang}::jenjang` : sql``}
        GROUP BY sub.name ORDER BY sub.name`,
    sql`SELECT c.name AS label, round(avg(g.final_score), 2)::float AS avg
        FROM grades g
        JOIN enrollments e ON e.id = g.enrollment_id
        JOIN classes c ON c.id = e.class_id
        WHERE g.semester_id = ${sem.id} AND g.final_score IS NOT NULL AND g.deleted_at IS NULL
          ${jenjang ? sql`AND c.jenjang = ${jenjang}::jenjang` : sql``}
        GROUP BY c.name ORDER BY c.name`,
    sql`SELECT g.predicate AS label, count(*)::int AS count
        FROM grades g
        JOIN enrollments e ON e.id = g.enrollment_id
        JOIN classes c ON c.id = e.class_id
        WHERE g.semester_id = ${sem.id} AND g.predicate IS NOT NULL AND g.deleted_at IS NULL
          ${jenjang ? sql`AND c.jenjang = ${jenjang}::jenjang` : sql``}
        GROUP BY g.predicate ORDER BY g.predicate`,
    sql`SELECT c.id AS class_id, ('[' || c.jenjang || '] ' || c.name) AS name, count(rc.id)::int AS total,
               count(*) FILTER (WHERE rc.status = 'approved')::int AS approved,
               count(*) FILTER (WHERE rc.status = 'submitted')::int AS submitted
        FROM classes c
        JOIN enrollments e ON e.class_id = c.id AND e.deleted_at IS NULL
        JOIN report_cards rc ON rc.enrollment_id = e.id AND rc.semester_id = ${sem.id} AND rc.deleted_at IS NULL
        WHERE c.deleted_at IS NULL
          ${jenjang ? sql`AND c.jenjang = ${jenjang}::jenjang` : sql``}
        GROUP BY c.id, c.jenjang, c.name, c.grade_level
        ORDER BY c.jenjang, c.grade_level, c.name`,
    sql`SELECT
          (SELECT round(avg(g.final_score), 2)::float
             FROM grades g
             JOIN enrollments e ON e.id = g.enrollment_id
             JOIN classes c ON c.id = e.class_id
            WHERE g.semester_id = ${sem.id} AND g.final_score IS NOT NULL AND g.deleted_at IS NULL
              ${jenjang ? sql`AND c.jenjang = ${jenjang}::jenjang` : sql``}) AS avg_score,
          COALESCE(
            (SELECT round(100.0 * count(*) FILTER (WHERE asub.status = 'hadir') / NULLIF(count(*), 0), 1)::float
               FROM attendance_subject asub
               JOIN teaching_assignments ta ON ta.id = asub.teaching_assignment_id AND ta.deleted_at IS NULL
               JOIN classes c ON c.id = ta.class_id AND c.deleted_at IS NULL
              WHERE ta.semester_id = ${sem.id} AND asub.deleted_at IS NULL
                ${jenjang ? sql`AND c.jenjang = ${jenjang}::jenjang` : sql``}),
            (SELECT round(100.0 * count(*) FILTER (WHERE a.status = 'hadir') / NULLIF(count(*), 0), 1)::float
               FROM attendance_daily a
               JOIN classes c ON c.id = a.class_id
              WHERE a.attendance_date BETWEEN ${sem.starts_on}::date AND ${sem.ends_on}::date AND a.deleted_at IS NULL
                ${jenjang ? sql`AND c.jenjang = ${jenjang}::jenjang` : sql``})
          ) AS attendance_rate,
          (SELECT count(*)::int
             FROM students s
            WHERE s.status = 'aktif' AND s.deleted_at IS NULL
              ${jenjang ? sql`AND s.jenjang = ${jenjang}::jenjang` : sql``}) AS students`,
  ]);

  return Response.json({ semester: { id: sem.id, label: sem.label }, bySubject, byClass, distribution, approval, kpi });
});
