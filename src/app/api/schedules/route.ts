import { z } from 'zod';
import { sql, handle, requireRole, ApiError } from '@/lib/server';

const TimeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam HH:MM');

export const GET = handle(async (req) => {
  const me = await requireRole();
  const u = new URL(req.url).searchParams;
  const classId = u.get('classId');
  const teacherId = me.role === 'guru' ? me.teacherId : u.get('teacherId');
  const day = u.get('day');

  const rows = await sql`
    SELECT s.id, s.academic_year_id, s.semester_id, s.class_id, s.teaching_assignment_id,
           s.day_of_week, s.start_time::text AS start_time, s.end_time::text AS end_time, s.room,
           c.name AS class_name, c.jenjang, sub.name AS subject_name, sub.code AS subject_code,
           t.full_name AS teacher_name, t.id AS teacher_id
    FROM schedules s
    JOIN classes c ON c.id = s.class_id
    JOIN teaching_assignments ta ON ta.id = s.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN teachers t ON t.id = ta.teacher_id
    JOIN semesters sem ON sem.id = s.semester_id AND sem.status = 'active'
    WHERE s.deleted_at IS NULL
      ${classId ? sql`AND s.class_id = ${classId}::uuid` : sql``}
      ${teacherId ? sql`AND ta.teacher_id = ${teacherId}::uuid` : sql``}
      ${day ? sql`AND s.day_of_week = ${Number(day)}::smallint` : sql``}
    ORDER BY s.day_of_week, s.start_time`;

  return Response.json(rows);
});

const Post = z.object({
  classId: z.string().uuid(),
  teachingAssignmentId: z.string().uuid(),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: TimeStr,
  endTime: TimeStr,
  room: z.string().trim().max(50).nullish().transform((v) => v || null),
});

export const POST = handle(async (req) => {
  await requireRole('admin');
  const b = Post.parse(await req.json());

  if (b.endTime <= b.startTime) {
    throw new ApiError(400, 'Jam selesai harus setelah jam mulai.');
  }

  // Active semester
  const [sem] = await sql`
    SELECT id, academic_year_id FROM semesters WHERE status = 'active' AND deleted_at IS NULL`;
  if (!sem) throw new ApiError(409, 'Belum ada semester aktif.');

  // Teacher of the assignment
  const [ta] = await sql`
    SELECT ta.teacher_id, t.full_name AS teacher_name, sub.name AS subject_name, c.name AS class_name
    FROM teaching_assignments ta
    JOIN teachers t ON t.id = ta.teacher_id
    JOIN subjects sub ON sub.id = ta.subject_id
    JOIN classes c ON c.id = ta.class_id
    WHERE ta.id = ${b.teachingAssignmentId} AND ta.deleted_at IS NULL`;

  if (!ta) throw new ApiError(404, 'Penugasan guru tidak ditemukan.');

  // 1. Conflict Check: Class conflict (same class, same day, overlapping time)
  const [classConflict] = await sql`
    SELECT s.id, sub.name AS subject_name, s.start_time::text, s.end_time::text
    FROM schedules s
    JOIN teaching_assignments ta ON ta.id = s.teaching_assignment_id
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE s.class_id = ${b.classId}
      AND s.semester_id = ${sem.id}
      AND s.day_of_week = ${b.dayOfWeek}
      AND s.deleted_at IS NULL
      AND s.start_time < ${b.endTime}::time
      AND s.end_time > ${b.startTime}::time
    LIMIT 1`;

  if (classConflict) {
    throw new ApiError(
      409,
      `Bentrok kelas: Kelas ${ta.class_name} sudah memiliki jadwal ${classConflict.subject_name} pada jam ${classConflict.start_time.slice(0, 5)} - ${classConflict.end_time.slice(0, 5)}.`,
    );
  }

  // 2. Conflict Check: Teacher conflict (same teacher, same day, overlapping time in another class)
  const [teacherConflict] = await sql`
    SELECT s.id, c.name AS other_class, sub.name AS other_subject, s.start_time::text, s.end_time::text
    FROM schedules s
    JOIN teaching_assignments ta ON ta.id = s.teaching_assignment_id
    JOIN classes c ON c.id = s.class_id
    JOIN subjects sub ON sub.id = ta.subject_id
    WHERE ta.teacher_id = ${ta.teacher_id}
      AND s.semester_id = ${sem.id}
      AND s.day_of_week = ${b.dayOfWeek}
      AND s.deleted_at IS NULL
      AND s.start_time < ${b.endTime}::time
      AND s.end_time > ${b.startTime}::time
    LIMIT 1`;

  if (teacherConflict) {
    throw new ApiError(
      409,
      `Bentrok guru: Guru ${ta.teacher_name} sudah mengajar di kelas ${teacherConflict.other_class} (${teacherConflict.other_subject}) pada jam ${teacherConflict.start_time.slice(0, 5)} - ${teacherConflict.end_time.slice(0, 5)}.`,
    );
  }

  const [s] = await sql`
    INSERT INTO schedules (academic_year_id, semester_id, class_id, teaching_assignment_id, day_of_week, start_time, end_time, room)
    VALUES (${sem.academic_year_id}, ${sem.id}, ${b.classId}, ${b.teachingAssignmentId}, ${b.dayOfWeek}, ${b.startTime}::time, ${b.endTime}::time, ${b.room})
    RETURNING id`;

  return Response.json({ ok: true, id: s.id });
});

export const DELETE = handle(async (req) => {
  await requireRole('admin');
  const id = z.string().uuid().parse(new URL(req.url).searchParams.get('id'));

  await sql`UPDATE schedules SET deleted_at = now() WHERE id = ${id}`;
  return Response.json({ ok: true });
});
