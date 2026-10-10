import { sql } from './server';

export type NotificationType = 'info' | 'tugas' | 'ujian' | 'presensi' | 'rapor';

export interface NotificationPayload {
  title: string;
  body: string;
  link?: string;
  type?: NotificationType;
}

/** Log email dispatch to console / simulated inbox; plug in SMTP or Resend if configured */
export async function dispatchEmail(userId: string, title: string, body: string) {
  try {
    const [u] = await sql`SELECT username, email, full_name FROM users WHERE id = ${userId} AND deleted_at IS NULL`;
    if (u && (u.email || u.username)) {
      const recipient = u.email || `${u.username}@sekolah.local`;
      console.log(`[EMAIL DISPATCH] To: ${u.full_name} <${recipient}> | Subject: ${title} | Body: ${body.slice(0, 100)}...`);
    }
  } catch (e) {
    console.error('[EMAIL ERROR]', e);
  }
}

export async function sendNotification(userId: string, p: NotificationPayload) {
  try {
    await sql`
      INSERT INTO notifications (user_id, title, body, link, type)
      VALUES (${userId}, ${p.title}, ${p.body}, ${p.link ?? null}, ${p.type ?? 'info'})`;
    await dispatchEmail(userId, p.title, p.body);
  } catch (e) {
    console.error('[NOTIF ERROR]', e);
  }
}

export async function sendNotifications(userIds: string[], p: NotificationPayload) {
  if (!userIds.length) return;
  const unique = [...new Set(userIds)];
  try {
    const titles = unique.map(() => p.title);
    const bodies = unique.map(() => p.body);
    const links = unique.map(() => p.link ?? null);
    const types = unique.map(() => p.type ?? 'info');

    await sql`
      INSERT INTO notifications (user_id, title, body, link, type)
      SELECT unnest(${sql.array(unique)}::uuid[]),
             unnest(${sql.array(titles)}::text[]),
             unnest(${sql.array(bodies)}::text[]),
             unnest(${sql.array(links)}::text[]),
             unnest(${sql.array(types)}::text[])`;

    for (const uid of unique) {
      dispatchEmail(uid, p.title, p.body).catch(() => {});
    }
  } catch (e) {
    console.error('[NOTIF BULK ERROR]', e);
  }
}

/** Sends notification to all active students in a given class */
export async function sendClassNotification(classId: string, p: NotificationPayload) {
  try {
    const students = await sql`
      SELECT s.user_id FROM enrollments e
      JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
      WHERE e.class_id = ${classId} AND e.deleted_at IS NULL AND s.user_id IS NOT NULL`;
    const userIds = students.map((r) => r.user_id as string).filter(Boolean);
    await sendNotifications(userIds, p);
  } catch (e) {
    console.error('[NOTIF CLASS ERROR]', e);
  }
}

/** Sends notification to the parent(s) of a given student */
export async function sendParentNotification(studentId: string, p: NotificationPayload) {
  try {
    const parents = await sql`
      SELECT parent_user_id FROM parent_students
      WHERE student_id = ${studentId} AND deleted_at IS NULL`;
    const userIds = parents.map((r) => r.parent_user_id as string).filter(Boolean);
    await sendNotifications(userIds, p);
  } catch (e) {
    console.error('[NOTIF PARENT ERROR]', e);
  }
}
