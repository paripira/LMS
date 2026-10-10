import { sql, handle, requireRole } from '@/lib/server';

export const GET = handle(async () => {
  const me = await requireRole();
  const [u] = await sql`
    SELECT u.full_name AS name,
           u.must_change_password,
           EXISTS (
             SELECT 1 FROM classes c
             JOIN teachers t ON t.id = c.homeroom_teacher_id
             WHERE t.user_id = u.id AND c.deleted_at IS NULL
               AND c.academic_year_id = (SELECT id FROM academic_years WHERE is_active AND deleted_at IS NULL)
           ) AS is_wali
    FROM users u WHERE u.id = ${me.userId} AND u.deleted_at IS NULL`;
  return Response.json({
    name: u?.name ?? '',
    role: me.role,
    isWali: !!u?.is_wali,
    mustChangePassword: !!u?.must_change_password,
  });
});
