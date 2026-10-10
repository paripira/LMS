// Shared server utilities: DB client, friendly-error wrapper, auth guard.
// (Split into db.ts / api.ts / auth.ts in your repo if you prefer; imports below assume this single module.)
import postgres from 'postgres';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ZodError } from 'zod';

// ---------- DB ----------
// prepare:false is required for PgBouncer transaction pooling (managed Postgres default).
const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres> };
export const sql =
  g.__sql ??
  (g.__sql = postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  }));

// ---------- Errors ----------
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

// Database RAISE EXCEPTION codes → friendly messages
const PG_MESSAGES: Record<string, string> = {
  SEMESTER_CLOSED: 'Semester ini sudah ditutup. Data hanya bisa dilihat, tidak bisa diubah.',
  GRADE_LOCKED: 'Nilai sudah dikunci. Minta Admin atau Wali Kelas untuk membuka kunci jika perlu koreksi.',
  REPORTS_NOT_APPROVED: 'Semester belum bisa ditutup karena masih ada e-Rapor yang belum disetujui Kepala Sekolah.',
  PROMOTION_INCOMPLETE: 'Masih ada siswa yang belum ditetapkan status kenaikan kelas / kelulusannya.',
  HARD_DELETE_FORBIDDEN: 'Data tidak dapat dihapus permanen. Gunakan fitur arsipkan.',
  SEMESTER_NOT_ACTIVE: 'Semester yang dipilih tidak sedang aktif.',
  NEXT_SEMESTER_NOT_READY: 'Semester berikutnya belum disiapkan.',
};

type Ctx = { params: Promise<Record<string, string>> };

export function handle(fn: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        return Response.json({ message: e.message, code: e.code }, { status: e.status });
      }
      if (e instanceof ZodError) {
        return Response.json({ message: 'Data yang dikirim tidak lengkap atau tidak valid.' }, { status: 400 });
      }
      const msg = e instanceof Error ? e.message : '';
      if (PG_MESSAGES[msg]) {
        return Response.json({ message: PG_MESSAGES[msg], code: msg }, { status: 409 });
      }
      const code = (e as { code?: string }).code;
      if (code === '23505') {
        return Response.json({ message: 'Data dengan nomor atau kode yang sama sudah ada.' }, { status: 409 });
      }
      if (code === '23503') {
        return Response.json({ message: 'Data ini masih dipakai oleh data lain sehingga tidak dapat diubah.' }, { status: 409 });
      }
      console.error('[api]', e); // full detail goes to server logs only
      return Response.json(
        { message: 'Terjadi kesalahan pada server. Silakan coba lagi beberapa saat.' },
        { status: 500 },
      );
    }
  };
}

// ---------- Auth ----------
export type Role = 'admin' | 'guru' | 'siswa' | 'orang_tua' | 'kepala_sekolah';
export interface Session {
  userId: string;
  role: Role;
  studentId?: string; // present for siswa
  teacherId?: string; // present for guru
}

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!);

// 60-second liveness cache so deactivated or soft-deleted accounts lose access quickly
// without adding a DB round-trip on every single API request.
const activeUserCache = new Map<string, { ok: boolean; exp: number }>();
const ACTIVE_TTL_MS = 60_000;

export function invalidateUserSessionCache(userId?: string) {
  if (userId) activeUserCache.delete(userId);
  else activeUserCache.clear();
}

async function assertUserStillActive(userId: string) {
  const now = Date.now();
  const cached = activeUserCache.get(userId);
  if (cached && cached.exp > now) {
    if (!cached.ok) throw new ApiError(401, 'Akun Anda sudah tidak aktif. Silakan hubungi Admin.');
    return;
  }
  const [u] = await sql`SELECT is_active FROM users WHERE id = ${userId} AND deleted_at IS NULL`;
  const ok = !!u && !!u.is_active;
  activeUserCache.set(userId, { ok, exp: now + ACTIVE_TTL_MS });
  if (!ok) throw new ApiError(401, 'Akun Anda sudah tidak aktif. Silakan hubungi Admin.');
}

export async function requireRole(...roles: Role[]): Promise<Session> {
  const token = (await cookies()).get('session')?.value;
  if (!token) throw new ApiError(401, 'Silakan masuk terlebih dahulu.');
  let p;
  try {
    p = (await jwtVerify(token, secret)).payload;
  } catch {
    throw new ApiError(401, 'Sesi Anda telah berakhir. Silakan masuk kembali.');
  }
  const s: Session = {
    userId: p.sub as string,
    role: p.role as Role,
    studentId: p.studentId as string | undefined,
    teacherId: p.teacherId as string | undefined,
  };
  if (roles.length && !roles.includes(s.role)) {
    throw new ApiError(403, 'Anda tidak memiliki akses ke fitur ini.');
  }
  await assertUserStillActive(s.userId);
  return s;
}
