'use client';
// SheetJS is dynamically imported so it never touches the initial bundle.
import { normHeader, TEMPLATES, type ImportEntity } from './schemas';

export async function readSheet(file: File): Promise<Record<string, unknown>[]> {
  const XLSX = await import('xlsx');
  // CSV is read as text so UTF-8 names (é, ñ, …) survive; xlsx/xls are read as binary.
  const wb = /\.csv$/i.test(file.name)
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { raw: true, defval: '' });

  return raw
    .map((r) => {
      const o: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r)) {
        const key = normHeader(k);
        // Excel stores dates as serial numbers → convert deterministically (no timezone drift).
        if (key === 'tanggal_lahir' && typeof v === 'number') {
          const d = XLSX.SSF.parse_date_code(v);
          o[key] = d ? `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}` : '';
        } else o[key] = v;
      }
      if (o.kelas && !o.nama_kelas) o.nama_kelas = o.kelas;
      if (o.nama_kelas && !o.kelas) o.kelas = o.nama_kelas;
      if (o.nip && !o.guru) o.guru = o.nip;
      if (o.username && !o.guru) o.guru = o.username;
      if (o.nip_guru) {
        if (!o.nip) o.nip = o.nip_guru;
        if (!o.guru) o.guru = o.nip_guru;
      }
      return o;
    })
    .filter((o) => Object.values(o).some((v) => String(v).trim() !== '')); // drop blank rows
}

async function writeBook(aoa: unknown[][], filename: string) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'Data');
  XLSX.writeFile(wb, filename); // extension decides the format: .xlsx or .csv
}

export const downloadTemplate = (entity: ImportEntity) =>
  writeBook([TEMPLATES[entity].headers, TEMPLATES[entity].sample], `template-${entity}.xlsx`);

export const exportRows = (rows: Record<string, unknown>[], cols: { header: string; key: string }[], filename: string) =>
  writeBook([cols.map((c) => c.header), ...rows.map((r) => cols.map((c) => r[c.key] ?? ''))], filename);
