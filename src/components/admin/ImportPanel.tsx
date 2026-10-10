'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { downloadTemplate, exportRows, readSheet } from '@/lib/import/parse';
import { ENTITY_LABEL, IMPORT_ENTITIES, TEMPLATES, validateRows, type ImportEntity, type RowIssue } from '@/lib/import/schemas';

const CHUNK = 50; // small chunks: each one is a single DB transaction + parallel password hashing
interface Cred { username: string; password: string; name: string; role: string }

export default function ImportPanel() {
  const qc = useQueryClient();
  const [entity, setEntity] = useState<ImportEntity>('students');
  const [createAccounts, setCreateAccounts] = useState(true);
  const [valid, setValid] = useState<{ row: number; data: unknown }[]>([]);
  const [errors, setErrors] = useState<RowIssue[]>([]);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ inserted: number; updated: number } | null>(null);
  const [creds, setCreds] = useState<Cred[]>([]);
  const [fatal, setFatal] = useState<string | null>(null);

  const reset = () => { setValid([]); setErrors([]); setFileName(''); setResult(null); setCreds([]); setFatal(null); setProgress(null); };

  async function onFile(file: File | undefined) {
    reset();
    if (!file) return;
    try {
      const rows = await readSheet(file);
      if (rows.length === 0) return setFatal('File kosong atau tidak memiliki baris data.');
      if (rows.length > 5000) return setFatal('Maksimal 5.000 baris per file. Pecah file menjadi beberapa bagian.');
      const v = validateRows(entity, rows);
      setValid(v.valid);
      setErrors(v.errors);
      setFileName(file.name);
    } catch {
      setFatal('File tidak dapat dibaca. Gunakan file .xlsx, .xls, atau .csv sesuai template.');
    }
  }

  async function run() {
    setFatal(null);
    setResult(null);
    const all = valid.map((v) => v.data);
    const sum = { inserted: 0, updated: 0 };
    const got: Cred[] = [];
    try {
      for (let i = 0; i < all.length; i += CHUNK) {
        setProgress({ done: i, total: all.length });
        const r = await api<{ inserted: number; updated: number; credentials: Cred[] }>(`/api/import/${entity}`, {
          method: 'POST',
          json: { rows: all.slice(i, i + CHUNK), createAccounts },
        });
        sum.inserted += r.inserted;
        sum.updated += r.updated;
        got.push(...r.credentials);
      }
      setProgress({ done: all.length, total: all.length });
      setResult(sum);
      setCreds(got);
      qc.invalidateQueries({ queryKey: ['admin'] });
    } catch (e) {
      // Chunks already written stay written (re-importing is safe: students/classes are upserts).
      setCreds(got);
      setFatal(`${(e as Error).message} (Data yang sudah masuk: ${sum.inserted + sum.updated} baris.)`);
    }
  }

  const importing = progress !== null && !result && !fatal;

  return (
    <div className="w-full space-y-4">
      <div className="teramia-banner p-4 sm:p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-white">Impor Data Massal</h1>
        <p className="text-xs text-slate-200 mt-0.5">Unggah data siswa, guru, kelas, mata pelajaran, penugasan, dan penempatan kelas via Excel/CSV.</p>
      </div>

      <div className="card space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="ent" className="label">Jenis data</label>
            <select id="ent" className="input" value={entity} onChange={(e) => { setEntity(e.target.value as ImportEntity); reset(); }}>
              {IMPORT_ENTITIES.map((e) => <option key={e} value={e}>{ENTITY_LABEL[e]}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn" onClick={() => downloadTemplate(entity)}>Unduh template (.xlsx)</button>
          </div>
        </div>
        <p className="text-xs text-slate-500">Kolom: {TEMPLATES[entity].headers.join(', ')}. Baris yang sudah ada diperbarui (NIS / nama pengguna / nama kelas sebagai kunci).</p>

        {entity === 'students' && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={createAccounts} onChange={(e) => setCreateAccounts(e.target.checked)} />
            Buat akun login siswa otomatis (nama pengguna = NIS, kata sandi awal = NIS)
          </label>
        )}

        <input data-testid="import-file" type="file" accept=".xlsx,.xls,.csv" className="input" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      {fatal && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{fatal}</p>}

      {fileName && (
        <div className="card space-y-3">
          <p className="text-sm font-medium">{fileName}: {valid.length} baris valid · {errors.length} baris bermasalah</p>
          {errors.length > 0 && (
            <ul className="max-h-48 list-disc space-y-1 overflow-y-auto pl-5 text-sm text-rose-700">
              {errors.slice(0, 50).map((e) => <li key={e.row}>Baris {e.row}: {e.message}</li>)}
              {errors.length > 50 && <li>…dan {errors.length - 50} masalah lainnya.</li>}
            </ul>
          )}
          {errors.length > 0 && <p className="text-xs text-slate-500">Baris bermasalah dilewati. Perbaiki di file lalu impor ulang bila perlu.</p>}
          <button className="btn btn-primary" disabled={valid.length === 0 || importing || !!result} onClick={run}>
            {importing ? `Mengimpor… ${progress!.done}/${progress!.total}` : 'Mulai Impor'}
          </button>
        </div>
      )}

      {result && (
        <div role="status" className="card space-y-2 border-emerald-200">
          <p className="font-medium text-emerald-700">Impor selesai: {result.inserted} data baru, {result.updated} diperbarui.</p>
        </div>
      )}

      {creds.length > 0 && (
        <div className="card space-y-2 bg-amber-50">
          <p className="text-sm text-amber-900">
            {creds.length} akun baru dibuat. <b>Kata sandi awal hanya tampil sekali</b>: unduh dan bagikan kepada pemilik akun (mereka akan diminta menggantinya saat login pertama).
          </p>
          <button
            className="btn btn-primary"
            onClick={() => exportRows(creds as unknown as Record<string, unknown>[], [
              { header: 'Nama', key: 'name' }, { header: 'Peran', key: 'role' },
              { header: 'Nama pengguna', key: 'username' }, { header: 'Kata sandi awal', key: 'password' },
            ], 'akun-baru.xlsx')}
          >
            Unduh daftar akun (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}
