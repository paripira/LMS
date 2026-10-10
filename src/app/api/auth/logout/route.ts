import { cookies } from 'next/headers';
import { handle } from '@/lib/server';
import { COOKIE } from '@/lib/session';

export const POST = handle(async () => {
  (await cookies()).delete(COOKIE);
  return Response.json({ ok: true });
});
