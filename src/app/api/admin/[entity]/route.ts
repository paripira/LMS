import { handle, requireRole, ApiError } from '@/lib/server';
import { ENTITIES } from '@/lib/admin/entities';

export const GET = handle(async (_req, { params }) => {
  await requireRole('admin');
  const e = ENTITIES[(await params).entity];
  if (!e) throw new ApiError(404, 'Data tidak ditemukan.');
  return Response.json(await e.list());
});

export const POST = handle(async (req, { params }) => {
  await requireRole('admin');
  const e = ENTITIES[(await params).entity];
  if (!e) throw new ApiError(404, 'Data tidak ditemukan.');
  if (!e.create || !e.createSchema) throw new ApiError(405, 'Operasi ini tidak didukung.');
  return Response.json(await e.create(e.createSchema.parse(await req.json())));
});
