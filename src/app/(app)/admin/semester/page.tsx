'use client';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import ApprovalTable, { type ApprovalRow } from '@/components/ApprovalTable';

interface Term {
  active: { id: string; kind: string; academic_year_id: string; year_name: string } | null;
  upcoming: { id: string; academic_year_id: string; label: string }[];
  reports: { total: number; approved: number };
  promotionMissing: number;
}
interface Cls { id: string; name: string; grade_level: number; academic_year_id: string }
interface Year { id: string; name: string; is_active: boolean }
interface Analytics { semester: { id: string; label: string } | null; approval: ApprovalRow[] }

const stem = (n: string) => n.replace(/^\d+/, '');

export default function SemesterPage() {
  const qc = useQueryClient();
  const { data: term } = useQuery({ queryKey: ['term'], queryFn: () => api<Term>('/api/admin/term') });
  const { data: years = [] } = useQuery({ queryKey: ['admin', 'years'], queryFn: () => api<Year[]>('/api/admin/years') });
  const { data: classes = [] } = useQuery({ queryKey: ['admin', 'classes'], queryFn: () => api<Cls[]>('/api/admin/classes') });
  const { data: an } = useQuery({ queryKey: ['analytics', 'active'], queryFn: () => api<Analytics>('/api/kepsek/analytics') });

  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [startYear, setStartYear] = useState(String(new Date().getFullYear() + 1));
  const [toYear, setToYear] = useState('');
  const [nextSem, setNextSem] = useState('');
  const [map, setMap] = useState<Record<string, { to: string; repeat: string }>>({});

  const fromClasses = useMemo(() => classes.filter((c) => c.academic_year_id === term?.active?.academic_year_id), [classes, term]);
  const toClasses = useMemo(() => classes.filter((c) => c.academic_year_id === toYear), [classes, toYear]);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: ok });
      qc.invalidateQueries();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  };

  const pickYear = (id: string) => {
    setToYear(id);
    const tc = classes.filter((c) => c.academic_year_id === id);
    const m: typeof map = {};
    for (const c of fromClasses) {
      m[c.id] = {
        to: tc.find((t) => t.grade_level === c.grade_level + 1 && stem(t.name) === stem(c.name))?.id ?? '',
        repeat: tc.find((t) => t.grade_level === c.grade_level && stem(t.name) === stem(c.name))?.id ?? '',
      };
    }
    setMap(m);
  };

  if (!term) return <p className="text-slate-400">Memuat…</p>;
  const allApproved = term.reports.total > 0 && term.reports.approved === term.reports.total;

  return (
    <div className="w-full space-y-6">
      <div className="teramia-banner p-4 sm:p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-white">Semester &amp; Rapor</h1>
        <p className="text-xs text-slate-200 mt-0.5">Kelola tahun ajaran aktif, kenaikan kelas, penutupan semester, dan unduhan arsip e-Rapor.</p>
      </div>
      {msg && <p role="status" className={`rounded-lg p-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</p>}

      <section className="card space-y-2">
        <h2 className="font-semibold">Semester aktif</h2>
        {term.active ? (
          <p className="text-sm">{term.active.year_name} · {term.active.kind} — e-Rapor disetujui {term.reports.approved} dari {term.reports.total}.</p>
        ) : (
          <p className="text-sm text-rose-700">Belum ada semester aktif. Buat tahun ajaran di bawah.</p>
        )}
      </section>

      {an?.semester && (
        <section className="space-y-2">
          <h2 className="font-semibold">e-Rapor per kelas (cetak massal ZIP)</h2>
          <ApprovalTable rows={an.approval} semesterId={an.semester.id} canApprove={false} />
        </section>
      )}

      <section className="card space-y-2">
        <h2 className="font-semibold">Buat tahun ajaran baru</h2>
        <p className="text-xs text-slate-500">Membuat semester Ganjil (1 Jul–31 Des) dan Genap (1 Jan–30 Jun). Buat kelas untuk tahun baru di menu Kelas.</p>
        <div className="flex gap-2">
          <input aria-label="Tahun mulai" className="input max-w-[8rem]" type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} />
          <button className="btn btn-primary" onClick={() => run(() => api('/api/admin/term', { method: 'POST', json: { action: 'create_year', startYear: Number(startYear) } }), `Tahun ajaran ${startYear}/${Number(startYear) + 1} dibuat.`)}>Buat</button>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Kenaikan kelas</h2>
        {term.promotionMissing > 0 && <p className="text-sm text-amber-700">{term.promotionMissing} siswa belum ditetapkan status kenaikan/kelulusannya oleh Wali Kelas.</p>}
        <select aria-label="Tahun ajaran tujuan" className="input max-w-xs" value={toYear} onChange={(e) => pickYear(e.target.value)}>
          <option value="">— tahun ajaran tujuan —</option>
          {years.filter((y) => y.id !== term.active?.academic_year_id).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        {toYear && (
          <>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500"><th className="py-1">Kelas asal</th><th>Jika naik →</th><th>Jika tinggal →</th></tr></thead>
              <tbody>
                {fromClasses.map((c) => (
                  <tr key={c.id}>
                    <td className="py-1">{c.name}</td>
                    {(['to', 'repeat'] as const).map((k) => (
                      <td key={k}>
                        <select className="input" value={map[c.id]?.[k] ?? ''} onChange={(e) => setMap((m) => ({ ...m, [c.id]: { ...m[c.id], [k]: e.target.value } }))}>
                          <option value="">— tidak ada —</option>
                          {toClasses.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-primary" onClick={() => run(
              () => api('/api/admin/term', { method: 'POST', json: { action: 'promote', fromYearId: term.active!.academic_year_id, toYearId: toYear,
                mapping: fromClasses.map((c) => ({ from_class: c.id, to_class: map[c.id]?.to || null, repeat_class: map[c.id]?.repeat || null })) } }),
              'Kenaikan kelas diproses.')}>Proses kenaikan kelas</button>
          </>
        )}
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold">Tutup semester & buka semester baru</h2>
        <p className="text-xs text-slate-500">Semua e-Rapor harus sudah disetujui. Data semester lama diarsipkan (hanya-baca), tidak dihapus.</p>
        <select aria-label="Semester berikutnya" className="input max-w-xs" value={nextSem} onChange={(e) => setNextSem(e.target.value)}>
          <option value="">— semester berikutnya —</option>
          {term.upcoming.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button className="btn btn-danger" disabled={!term.active || !nextSem || !allApproved}
          onClick={() => confirm('Tutup semester sekarang? Tindakan ini tidak dapat dibatalkan.') &&
            run(() => api('/api/admin/term', { method: 'POST', json: { action: 'close', semesterId: term.active!.id, nextSemesterId: nextSem } }), 'Semester ditutup dan semester baru dibuka.')}>
          Tutup Semester
        </button>
        {!allApproved && <p className="text-xs text-amber-700">Belum semua e-Rapor disetujui Kepala Sekolah.</p>}
      </section>
    </div>
  );
}
