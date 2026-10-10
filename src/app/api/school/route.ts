import { z } from 'zod';
import { sql, handle, requireRole } from '@/lib/server';

const StampField = z
  .string()
  .max(400_000)
  .regex(/^data:image\/(png|jpeg);base64,/, 'Stempel harus berupa gambar PNG/JPG')
  .nullish()
  .transform((v) => v || null);

const UnitSchema = z.object({
  name: z.string().trim().max(120).nullish().transform((v) => v || null),
  npsn: z.string().trim().max(30).nullish().transform((v) => v || null),
  address: z.string().trim().max(300).nullish().transform((v) => v || null),
  principalName: z.string().trim().max(120).nullish().transform((v) => v || null),
  principalNip: z.string().trim().max(40).nullish().transform((v) => v || null),
  stampDataUrl: StampField,
});

const DriveSchema = z.object({
  clientId: z.string().trim().max(300).nullish().transform((v) => v || null),
  appsScriptUrl: z.string().trim().max(500).nullish().transform((v) => v || null),
  folderName: z.string().trim().max(120).nullish().transform((v) => v || null),
});

export const GET = handle(async () => {
  await requireRole(); // any signed-in user (needed for the e-Rapor header & Drive upload config)
  const [s] = await sql`
    SELECT name, address, principal_name, principal_nip, stamp_data_url,
           COALESCE(unit_profiles, '{}'::jsonb) AS unit_profiles
    FROM school_settings`;
  const rawProfiles = (s.unit_profiles ?? {}) as Record<string, unknown>;
  const { drive, ...units } = rawProfiles;
  return Response.json(
    {
      name: s.name,
      address: s.address,
      principalName: s.principal_name,
      principalNip: s.principal_nip,
      stampDataUrl: s.stamp_data_url,
      units,
      drive: (drive as Record<string, unknown> | undefined) ?? {},
    },
    { headers: { 'Cache-Control': 'private, max-age=3600' } },
  );
});

const Put = z.object({
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().max(300),
  principalName: z.string().trim().max(120),
  principalNip: z.string().trim().max(40).nullish().transform((v) => v || null),
  stampDataUrl: StampField,
  units: z
    .object({
      TK: UnitSchema.optional(),
      SD: UnitSchema.optional(),
      SMP: UnitSchema.optional(),
    })
    .optional(),
  drive: DriveSchema.optional(),
});

export const PUT = handle(async (req) => {
  await requireRole('admin', 'kepala_sekolah');
  const d = Put.parse(await req.json());
  const mergedJson = {
    ...(d.units ?? {}),
    ...(d.drive ? { drive: d.drive } : {}),
  };
  await sql`
    UPDATE school_settings
    SET name = ${d.name},
        address = ${d.address},
        principal_name = ${d.principalName},
        principal_nip = ${d.principalNip},
        stamp_data_url = ${d.stampDataUrl},
        unit_profiles = COALESCE(unit_profiles, '{}'::jsonb) || ${sql.json(mergedJson)},
        updated_at = now()`;
  return Response.json({ ok: true });
});
