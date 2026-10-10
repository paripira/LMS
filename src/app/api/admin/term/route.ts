import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

// Overview used by the "Semester & Rapor" screen.
export const GET = handle(async () => {
  await requireRole('admin');
  const [active] = await sql`
    SELECT s.id, s.kind, s.academic_year_id, ay.name AS year_name
    FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id
    WHERE s.status = 'active' AND s.deleted_at IS NULL`;
  const upcoming = await sql`
    SELECT s.id, s.academic_year_id, ay.name || ' ' || initcap(s.kind::text) AS label
    FROM semesters s JOIN academic_years ay ON ay.id = s.academic_year_id
    WHERE s.status = 'upcoming' AND s.deleted_at IS NULL ORDER BY s.starts_on`;
  const reports = active
    ? (await sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE status = 'approved')::int AS approved
                 FROM report_cards WHERE semester_id = ${active.id} AND deleted_at IS NULL`)[0]
    : { total: 0, approved: 0 };
  const [promo] = active
    ? await sql`SELECT count(*)::int AS missing FROM enrollments
                WHERE academic_year_id = ${active.academic_year_id} AND deleted_at IS NULL AND promotion_status IS NULL`
    : [{ missing: 0 }];
  return Response.json({ active: active ?? null, upcoming, reports, promotionMissing: promo.missing });
});

const Create = z.object({ action: z.literal('create_year'), startYear: z.number().int().min(2000).max(2100) });
const Promote = z.object({
  action: z.literal('promote'),
  fromYearId: z.string().uuid(),
  toYearId: z.string().uuid(),
  mapping: z.array(z.object({ from_class: z.string().uuid(), to_class: z.string().uuid().nullable(), repeat_class: z.string().uuid().nullable() })).min(1),
});
const Close = z.object({ action: z.literal('close'), semesterId: z.string().uuid(), nextSemesterId: z.string().uuid() });
const Body = z.discriminatedUnion('action', [Create, Promote, Close]);

export const POST = handle(async (req) => {
  const me = await requireRole('admin');
  const b = Body.parse(await req.json());

  if (b.action === 'create_year') {
    const y = b.startYear;
    const id = await sql.begin(async (tx) => {
      const [{ n }] = await tx`SELECT count(*)::int AS n FROM academic_years WHERE deleted_at IS NULL`;
      const [ay] = await tx`INSERT INTO academic_years (name, starts_on, ends_on, is_active)
        VALUES (${`${y}/${y + 1}`}, ${`${y}-07-01`}, ${`${y + 1}-06-30`}, ${n === 0}) RETURNING id`;
      await tx`INSERT INTO semesters (academic_year_id, kind, starts_on, ends_on, status) VALUES
        (${ay.id}, 'ganjil', ${`${y}-07-01`}, ${`${y}-12-31`}, ${n === 0 ? 'active' : 'upcoming'}),
        (${ay.id}, 'genap',  ${`${y + 1}-01-01`}, ${`${y + 1}-06-30`}, 'upcoming')`;
      return ay.id as string;
    });
    return Response.json({ ok: true, id });
  }

  if (b.action === 'promote') {
    const [r] = await sql`SELECT * FROM promote_students(${b.fromYearId}::uuid, ${b.toYearId}::uuid, ${sql.json(b.mapping)})`;
    return Response.json({ ok: true, enrolled: r.enrolled, graduated: r.graduated, transferred: r.transferred });
  }

  // close: DB function validates (all reports approved, semester active); year flag flips in the same transaction.
  await sql.begin(async (tx) => {
    const [cur] = await tx`SELECT academic_year_id FROM semesters WHERE id = ${b.semesterId}`;
    const [nxt] = await tx`SELECT academic_year_id FROM semesters WHERE id = ${b.nextSemesterId}`;
    if (!cur || !nxt) throw new ApiError(404, 'Semester tidak ditemukan.');
    await tx`SELECT close_semester_and_open_next(${b.semesterId}::uuid, ${b.nextSemesterId}::uuid, ${me.userId}::uuid)`;
    if (cur.academic_year_id !== nxt.academic_year_id) {
      await tx`UPDATE academic_years SET is_active = false WHERE id = ${cur.academic_year_id}`;
      await tx`UPDATE academic_years SET is_active = true WHERE id = ${nxt.academic_year_id}`;
    }
  });
  return Response.json({ ok: true });
});
