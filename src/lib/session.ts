// Edge-safe (used by middleware too): only depends on `jose`.
import { SignJWT, jwtVerify } from 'jose';
import type { Role, Session } from './server'; // type-only import, erased at build

export const COOKIE = 'session';
export const SESSION_HOURS = 12;

export const HOME: Record<Role, string> = {
  admin: '/admin/data/students',
  guru: '/guru/presensi',
  siswa: '/siswa',
  orang_tua: '/ortu',
  kepala_sekolah: '/kepsek',
};

export const ROLE_PREFIX: Record<Role, string> = {
  admin: '/admin',
  guru: '/guru',
  siswa: '/siswa',
  orang_tua: '/ortu',
  kepala_sekolah: '/kepsek',
};

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export function signSession(s: Session) {
  return new SignJWT({ role: s.role, studentId: s.studentId, teacherId: s.teacherId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(s.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());
}

export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: payload.sub as string,
      role: payload.role as Role,
      studentId: payload.studentId as string | undefined,
      teacherId: payload.teacherId as string | undefined,
    };
  } catch {
    return null;
  }
}
