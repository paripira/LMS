'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { DataTable } from '@/components/DataTable';
import { exportRows } from '@/lib/import/parse';
import type { EntityConfig, Field } from '@/lib/admin/configs';

type Row = { id: string } & Record<string, unknown>;
interface Cred { username: string; password: string }

interface EnrollmentHistory {
  enrollment_id: string;
  year_name: string;
  class_name: string;
  grade_level: number;
  promotion_status: string | null;
  homeroom_name: string | null;
}

interface ParentLinkData {
  parent: { id: string; username: string; full_name: string };
  linked: { link_id: string; student_id: string; nis: string; full_name: string; class_name: string | null }[];
  available: { id: string; nis: string; full_name: string; class_name: string | null }[];
}

function FieldInput({
  f,
  value,
  onChange,
  disabled,
  filterJenjang,
}: {
  f: Field;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  filterJenjang?: string;
}) {
  const { data } = useQuery({
    queryKey: ['admin', f.from?.entity ?? '_none'],
    enabled: !!f.from,
    queryFn: () => api<Row[]>(`/api/admin/${f.from!.entity}`),
  });
  const id = `f-${f.name}`;
  const sourceRows =
    filterJenjang && (f.from?.entity === 'classes' || f.from?.entity === 'subjects')
      ? (data ?? []).filter((r) => !r.jenjang || r.jenjang === filterJenjang)
      : (data ?? []);
  const opts = f.options ?? sourceRows.map((r) => ({ value: r.id, label: f.from!.label(r) }));
  return (
    <div>
      <label htmlFor={id} className="label">{f.label}{f.required && ' *'}</label>
      {f.type === 'select' ? (
        <select id={id} className="input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          <option value="">— pilih —</option>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input id={id} className="input" type={f.type ?? 'text'} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

const JENJANG_ENTITIES = new Set(['students', 'classes', 'subjects', 'assignments']);

export default function MasterPage({ config }: { config: EntityConfig }) {
  const qc = useQueryClient();
  const key = ['admin', config.entity];
  const { data: rows = [], isLoading } = useQuery({ queryKey: key, queryFn: () => api<Row[]>(`/api/admin/${config.entity}`) });

  const { data: allClasses = [] } = useQuery({
    queryKey: ['admin', 'classes'],
    enabled: config.entity === 'students' || config.entity === 'assignments',
    queryFn: () => api<Row[]>('/api/admin/classes'),
  });

  // Admin dashboard metrics (data integrity)
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<{
      stats?: {
        integrity: {
          studentsNoClass: number;
          studentsNoNisn: number;
          teachersNoNip: number;
          classesNoWali: number;
          subjectsNoAssignment: number;
        };
      };
    }>('/api/dashboard'),
  });

  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [creds, setCreds] = useState<Cred[] | null>(null);

  // Jenjang filter (Semua / SD / SMP / TK)
  const [jenjangFilter, setJenjangFilter] = useState<'all' | 'SD' | 'SMP' | 'TK'>('all');

  // Student specific modals
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'lulus' | 'pindah' | 'keluar'>('all');
  const [historyStudent, setHistoryStudent] = useState<Row | null>(null);
  const [mutationStudent, setMutationStudent] = useState<Row | null>(null);
  const [mutationStatus, setMutationStatus] = useState<'aktif' | 'lulus' | 'pindah' | 'keluar' | 'lanjut_smp' | 'lanjut_sd'>('pindah');
  const [mutationTargetClassId, setMutationTargetClassId] = useState('');
  const [mutationReason, setMutationReason] = useState('');

  // Parent linking modal
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const { data: historyData } = useQuery({
    queryKey: ['student-history', historyStudent?.id],
    enabled: !!historyStudent,
    queryFn: () => api<{ history: EnrollmentHistory[] }>(`/api/admin/students/${historyStudent!.id}/history`),
  });

  const { data: parentLinkData, refetch: refetchParentLinks } = useQuery({
    queryKey: ['parent-links', selectedParentId],
    enabled: !!selectedParentId,
    queryFn: () => api<ParentLinkData>(`/api/admin/parents/link?parentId=${selectedParentId}`),
  });

  const open = (row: Row | 'new') => {
    setError(null);
    const initial = Object.fromEntries(config.fields.map((f) => [f.name, row === 'new' ? '' : String(row[f.name] ?? '')]));
    if (row === 'new' && jenjangFilter !== 'all' && 'jenjang' in initial) {
      initial.jenjang = jenjangFilter;
    }
    setValues(initial);
    setEditing(row);
  };

  const save = useMutation({
    mutationFn: () => {
      const isNew = editing === 'new';
      const payload: Record<string, unknown> = {};
      for (const f of config.fields) {
        if (!isNew && f.createOnly) continue;
        const v = values[f.name] ?? '';
        payload[f.name] = v === '' ? (f.required ? '' : null) : f.type === 'number' ? Number(v) : v;
      }
      return isNew
        ? api<{ credentials?: Cred[] }>(`/api/admin/${config.entity}`, { method: 'POST', json: payload })
        : api<{ credentials?: Cred[] }>(`/api/admin/${config.entity}/${(editing as Row).id}`, { method: 'PATCH', json: payload });
    },
    onSuccess: (r) => {
      if (r?.credentials) setCreds(r.credentials);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['lookups'] });
    },
    onError: (e) => setError((e as Error).message),
  });

  const remove = useMutation({
    mutationFn: (row: Row) => api(`/api/admin/${config.entity}/${row.id}`, { method: 'DELETE' }),
    onMutate: async (row) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Row[]>(key);
      qc.setQueryData<Row[]>(key, (old) => (old ?? []).filter((r) => r.id !== row.id));
      return { prev };
    },
    onError: (e, _row, ctx) => {
      qc.setQueryData(key, ctx?.prev);
      setError((e as Error).message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });

  const reset = useMutation({
    mutationFn: (row: Row) => api<{ credentials: Cred[] }>(`/api/admin/${config.entity}/${row.id}`, { method: 'POST', json: { action: 'reset-password' } }),
    onSuccess: (r) => { setCreds(r.credentials); qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => setError((e as Error).message),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      api('/api/admin/students/status', {
        method: 'POST',
        json: {
          studentId: mutationStudent!.id,
          status: mutationStatus,
          targetClassId:
            mutationStatus === 'lanjut_smp' || mutationStatus === 'lanjut_sd'
              ? mutationTargetClassId || null
              : undefined,
          reason: mutationReason || undefined,
        },
      }),
    onSuccess: () => {
      setMutationStudent(null);
      setMutationReason('');
      setMutationTargetClassId('');
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['lookups'] });
    },
    onError: (e) => setError((e as Error).message),
  });

  const linkChild = useMutation({
    mutationFn: ({ parentId, studentId }: { parentId: string; studentId: string }) =>
      api('/api/admin/parents/link', {
        method: 'POST',
        json: { parentId, studentId },
      }),
    onSuccess: () => {
      refetchParentLinks();
    },
  });

  const unlinkChild = useMutation({
    mutationFn: (linkId: string) => api(`/api/admin/parents/link?linkId=${linkId}`, { method: 'DELETE' }),
    onSuccess: () => {
      refetchParentLinks();
    },
  });

  const supportsJenjang = JENJANG_ENTITIES.has(config.entity);

  // Filter rows by jenjang and student status
  const jenjangFilteredRows =
    supportsJenjang && jenjangFilter !== 'all'
      ? rows.filter((r) => r.jenjang === jenjangFilter)
      : rows;

  const displayedRows =
    config.entity === 'students' && statusFilter !== 'all'
      ? jenjangFilteredRows.filter((r) => r.status === statusFilter)
      : jenjangFilteredRows;

  // Determine active jenjang inside the Add/Edit form so dropdowns only show matching SD/SMP classes/subjects
  const formJenjang =
    values.jenjang ||
    (config.entity === 'assignments' && values.class_id
      ? String(allClasses.find((c) => c.id === values.class_id)?.jenjang ?? '')
      : '');

  const integrity = dashboard?.stats?.integrity;
  const hasIntegrityIssues = integrity && (
    integrity.studentsNoClass > 0 ||
    integrity.classesNoWali > 0 ||
    integrity.subjectsNoAssignment > 0
  );

  return (
    <div className="space-y-4">
      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">{config.title}</h1>
          <p className="text-xs text-slate-200 mt-0.5">
            Kelola basis data {config.title.toLowerCase()} unit SD & SMP Sekolah Teramia secara terpusat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn"
            onClick={() =>
              exportRows(
                displayedRows,
                config.columns.map((c) => ({ header: c.header, key: c.key })),
                `${config.entity}${jenjangFilter !== 'all' ? `-${jenjangFilter.toLowerCase()}` : ''}.xlsx`,
              )
            }
          >
            Ekspor Excel
          </button>
          <button className="btn btn-gold" onClick={() => open('new')}>+ Tambah</button>
        </div>
      </div>

      {/* Data Integrity Banner */}
      {hasIntegrityIssues && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-1">
          <div className="font-semibold text-sm text-amber-950 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Perhatian Kelengkapan Data Sekolah:</span>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            {integrity.studentsNoClass > 0 && (
              <span>• <b>{integrity.studentsNoClass}</b> siswa belum terdaftar di kelas manapun.</span>
            )}
            {integrity.classesNoWali > 0 && (
              <span>• <b>{integrity.classesNoWali}</b> kelas belum memiliki wali kelas.</span>
            )}
            {integrity.subjectsNoAssignment > 0 && (
              <span>• <b>{integrity.subjectsNoAssignment}</b> mata pelajaran belum memiliki penugasan guru di semester aktif.</span>
            )}
          </div>
        </div>
      )}

      {/* Multi-Jenjang Switcher (SD / SMP / TK) & Status Filter */}
      {(supportsJenjang || config.entity === 'students') && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs">
          {supportsJenjang && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 text-xs font-bold text-slate-500">Jenjang:</span>
              {[
                { k: 'all', label: `Semua Jenjang (${rows.length})` },
                { k: 'SD', label: `Unit SD (${rows.filter((r) => r.jenjang === 'SD').length})` },
                { k: 'SMP', label: `Unit SMP (${rows.filter((r) => r.jenjang === 'SMP').length})` },
                ...(rows.some((r) => r.jenjang === 'TK')
                  ? [{ k: 'TK', label: `Unit TK (${rows.filter((r) => r.jenjang === 'TK').length})` }]
                  : []),
              ].map((j) => (
                <button
                  key={j.k}
                  type="button"
                  onClick={() => setJenjangFilter(j.k as typeof jenjangFilter)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                    jenjangFilter === j.k
                      ? 'bg-[#162d6e] text-white shadow-2xs ring-2 ring-[#f5b800]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>
          )}

          {config.entity === 'students' && (
            <div className="flex flex-wrap gap-1 text-xs">
              {[
                { k: 'all', label: `Semua Status (${jenjangFilteredRows.length})` },
                { k: 'aktif', label: `Aktif (${jenjangFilteredRows.filter((r) => r.status === 'aktif' || !r.status).length})` },
                { k: 'lulus', label: `Alumni / Lulus (${jenjangFilteredRows.filter((r) => r.status === 'lulus').length})` },
                { k: 'pindah', label: `Pindah (${jenjangFilteredRows.filter((r) => r.status === 'pindah').length})` },
                { k: 'keluar', label: `Keluar (${jenjangFilteredRows.filter((r) => r.status === 'keluar').length})` },
              ].map((f) => (
                <button
                  key={f.k}
                  onClick={() => setStatusFilter(f.k as typeof statusFilter)}
                  className={`btn py-1 px-2.5 text-xs ${statusFilter === f.k ? 'btn-primary' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && !editing && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {creds && (
        <div role="status" className="card bg-amber-50 text-sm">
          <p className="mb-2 font-medium text-amber-900">Catat sekarang: kata sandi ini tidak akan ditampilkan lagi.</p>
          {creds.map((c) => <p key={c.username} className="font-mono">Nama pengguna: {c.username} · Kata sandi: {c.password}</p>)}
          <button className="btn mt-2" onClick={() => setCreds(null)}>Tutup</button>
        </div>
      )}

      {isLoading ? (
        <p className="text-slate-400">Memuat…</p>
      ) : (
        <DataTable
          columns={config.columns}
          rows={displayedRows}
          search={config.search}
          actions={(r) => (
            <div className="flex justify-end gap-1">
              {config.entity === 'students' && (
                <>
                  <button className="btn text-xs py-1 px-2" title="Riwayat Kelas" onClick={() => setHistoryStudent(r as Row)}>
                    Riwayat
                  </button>
                  <button
                    className="btn text-xs py-1 px-2"
                    title="Mutasi / Lanjut Jenjang"
                    onClick={() => {
                      setMutationStudent(r as Row);
                      setMutationStatus(r.jenjang === 'SD' ? 'lanjut_smp' : ((r.status as typeof mutationStatus) || 'pindah'));
                      setMutationTargetClassId('');
                    }}
                  >
                    Mutasi / Jenjang
                  </button>
                </>
              )}
              {config.entity === 'parents' && (
                <button className="btn btn-primary text-xs py-1 px-2" onClick={() => setSelectedParentId(String(r.id))}>
                  Tautkan Anak
                </button>
              )}
              {config.canReset && <button className="btn text-xs py-1 px-2" onClick={() => reset.mutate(r as Row)}>{config.resetLabel}</button>}
              <button className="btn text-xs py-1 px-2" onClick={() => open(r as Row)}>Ubah</button>
              <button className="btn text-xs py-1 px-2 text-rose-600 hover:bg-rose-50" onClick={() => confirm('Arsipkan data ini? Data tidak dihapus permanen.') && remove.mutate(r as Row)}>
                Arsip
              </button>
            </div>
          )}
        />
      )}

      {/* Modal Edit / Tambah */}
      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div role="dialog" aria-label="Form data" className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold">{editing === 'new' ? 'Tambah' : 'Ubah'} {config.title}</h2>
            {config.fields.map((f) => (
              <FieldInput
                key={f.name}
                f={f}
                value={values[f.name] ?? ''}
                disabled={editing !== 'new' && !!f.createOnly}
                filterJenjang={formJenjang || undefined}
                onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))}
              />
            ))}
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn btn-primary" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Menyimpan…' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Riwayat Kelas Siswa */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-bold text-slate-900">Riwayat Kelas: {String(historyStudent.full_name)}</h2>
              <button className="text-slate-400 hover:text-slate-600 font-bold" onClick={() => setHistoryStudent(null)}>✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {historyData?.history.map((h) => (
                <div key={h.enrollment_id} className="py-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900">Kelas {h.class_name} ({h.year_name})</div>
                    <div className="text-slate-500">Wali Kelas: {h.homeroom_name ?? '—'}</div>
                  </div>
                  <span className="rounded bg-blue-50 px-2 py-1 text-blue-800 font-medium capitalize">
                    {h.promotion_status ? `Status: ${h.promotion_status}` : 'Terdaftar Aktif'}
                  </span>
                </div>
              ))}
              {(!historyData || historyData.history.length === 0) && (
                <p className="text-center text-slate-400 py-4">Belum ada riwayat kelas.</p>
              )}
            </div>
            <div className="flex justify-end">
              <button className="btn" onClick={() => setHistoryStudent(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mutasi / Lanjut Jenjang Siswa */}
      {mutationStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Mutasi & Kenaikan Jenjang: {String(mutationStudent.full_name)}
              </h2>
              <p className="text-xs text-slate-500">
                Jenjang saat ini: <b>{String(mutationStudent.jenjang)}</b> · Kelas: <b>{String(mutationStudent.class_name ?? '—')}</b>
              </p>
            </div>
            <div>
              <label className="label">Tindakan / Status Baru</label>
              <select className="input" value={mutationStatus} onChange={(e) => setMutationStatus(e.target.value as typeof mutationStatus)}>
                <option value="lanjut_smp">★ Lulus SD & Lanjut ke Unit SMP (Naik Jenjang ke Kelas 7)</option>
                <option value="lanjut_sd">★ Lulus TK & Lanjut ke Unit SD (Naik Jenjang ke Kelas 1)</option>
                <option value="aktif">Aktif</option>
                <option value="lulus">Lulus / Alumni (Keluar dari Sekolah)</option>
                <option value="pindah">Pindah Sekolah</option>
                <option value="keluar">Keluar / Dikeluarkan</option>
              </select>
            </div>

            {(mutationStatus === 'lanjut_smp' || mutationStatus === 'lanjut_sd') && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-2">
                <label className="label text-amber-950">
                  Pilih Kelas Tujuan di Unit {mutationStatus === 'lanjut_smp' ? 'SMP' : 'SD'} (Tahun Ajaran Aktif)
                </label>
                <select
                  className="input bg-white"
                  value={mutationTargetClassId}
                  onChange={(e) => setMutationTargetClassId(e.target.value)}
                >
                  <option value="">— Pilih kelas tujuan (opsional) —</option>
                  {allClasses
                    .filter((c) => c.jenjang === (mutationStatus === 'lanjut_smp' ? 'SMP' : 'SD'))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        [{String(c.jenjang)}] Kelas {String(c.name)} ({String(c.year_name)})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-amber-800">
                  Akun login siswa dan tautan ke akun Orang Tua tetap dipertahankan otomatis.
                </p>
              </div>
            )}

            <div>
              <label className="label">Keterangan / Catatan</label>
              <textarea
                className="input min-h-20"
                placeholder="Contoh: Melanjutkan dari SD Teramia ke SMP Teramia Kelas 7A..."
                value={mutationReason}
                onChange={(e) => setMutationReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setMutationStudent(null)}>Batal</button>
              <button className="btn btn-primary" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? 'Menyimpan…' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tautkan Anak ke Orang Tua */}
      {selectedParentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tautkan Anak: {parentLinkData?.parent.full_name ?? 'Memuat…'}
                </h2>
                <p className="text-xs text-slate-500">Hubungkan satu atau lebih siswa (SD maupun SMP) ke akun orang tua ini.</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 font-bold" onClick={() => { setSelectedParentId(''); qc.invalidateQueries({ queryKey: key }); }}>✕</button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">Anak yang Terhubung ({parentLinkData?.linked.length ?? 0}):</div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded border border-slate-200 p-2 text-xs">
                {parentLinkData?.linked.map((l) => (
                  <div key={l.link_id} className="py-1.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{l.full_name}</span>
                      <span className="text-slate-500 ml-2">({l.nis} · Kelas {l.class_name ?? '—'})</span>
                    </div>
                    <button
                      onClick={() => unlinkChild.mutate(l.link_id)}
                      className="text-rose-600 hover:underline font-medium"
                    >
                      Lepas Tautan
                    </button>
                  </div>
                ))}
                {(!parentLinkData || parentLinkData.linked.length === 0) && (
                  <p className="text-center text-slate-400 py-3">Belum ada anak yang ditautkan.</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label className="label">Tambah Anak untuk Ditautkan</label>
              <div className="flex gap-2">
                <select
                  id="add-child-select"
                  className="input flex-1 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      linkChild.mutate({ parentId: selectedParentId, studentId: e.target.value });
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">— Pilih siswa aktif untuk ditambahkan —</option>
                  {parentLinkData?.available.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.nis} · {s.class_name ?? 'Tanpa Kelas'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="btn btn-primary" onClick={() => { setSelectedParentId(''); qc.invalidateQueries({ queryKey: key }); }}>
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
