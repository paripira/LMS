import { z } from 'zod';
import { handle, requireRole, ApiError } from '@/lib/server';
import { ENTITIES } from '@/lib/admin/entities';

const entityOf = async (params: Promise<Record<string, string>>) => {
  const p = await params;
  const e = ENTITIES[p.entity];
  if (!e) throw new ApiError(404, 'Data tidak ditemukan.');
  z.string().uuid().parse(p.id);
  return { e, id: p.id };
};

export const PATCH = handle(async (req, { params }) => {
  await requireRole('admin');
  const { e, id } = await entityOf(params);
  if (!e.update || !e.createSchema) throw new ApiError(405, 'Operasi ini tidak didukung.');
  return Response.json(await e.update(id, e.createSchema.partial().parse(await req.json())));
});

export const DELETE = handle(async (_req, { params }) => {
  await requireRole('admin');
  const { e, id } = await entityOf(params);
  if (!e.remove) throw new ApiError(405, 'Operasi ini tidak didukung.');
  await e.remove(id); // soft delete only
  return Response.json({ ok: true });
});

// POST { action: 'reset-password' } → returns fresh credentials (shown once in the UI)
export const POST = handle(async (req, { params }) => {
  await requireRole('admin');
  const { e, id } = await entityOf(params);
  const { action } = z.object({ action: z.literal('reset-password') }).parse(await req.json());
  if (action !== 'reset-password' || !e.resetPassword) throw new ApiError(405, 'Operasi ini tidak didukung.');
  return Response.json(await e.resetPassword(id));
});
