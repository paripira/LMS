import { NextResponse, type NextRequest } from 'next/server';
import { verifySession, COOKIE, HOME, ROLE_PREFIX } from '@/lib/session';
import type { Role } from '@/lib/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const go = (to: string) => NextResponse.redirect(new URL(to, req.url));
  const session = await verifySession(req.cookies.get(COOKIE)?.value);

  if (pathname === '/login') return session ? go(HOME[session.role]) : NextResponse.next();

  if (!session) return go(`/login?next=${encodeURIComponent(pathname)}`);
  if (pathname === '/') return go(HOME[session.role]);

  // Role areas: /admin, /guru, /siswa, /ortu, /kepsek. Wrong role → bounced to own home.
  for (const [role, prefix] of Object.entries(ROLE_PREFIX) as [Role, string][]) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      if (session.role !== role) return go(HOME[session.role]);
      if (pathname === prefix && HOME[role] !== prefix) return go(HOME[role]);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'] };
