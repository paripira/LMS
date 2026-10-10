'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups } from '@/lib/hooks';

interface Ekskul { name: string; grade: 'A' | 'B' | 'C' | 'D'; description?: string }
interface Card {
  report_id: string; student_id: string; name: string; nis: string; homeroom_notes: string | null;
  extracurriculars: Ekskul[]; status: 'draft' | 'submitted' | 'approved'; promotion_status: string | null;
  grades_total: number; grades_locked: number;
}
const STATUS_LABEL = { draft: 'Draf', submitted: 'Terkirim', approved: 'Disetujui' } as const;
const ASPECTS = [
  ['agama_budi_pekerti', 'Agama & budi pekerti'], ['jati_diri', 'Jati diri'], ['literasi', 'Literasi'],
  ['sosial_emosional', 'Sosial-emosional'], ['motorik', 'Motorik'], ['karakter', 'Karakter'], ['lainnya', 'Lainnya'],
] as const;

function StudentCard({ c, genap, classId }: { c: Card; genap: boolean; classId: string }) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(c.homeroom_notes ?? '');
  const [ekskul, setEkskul] = useState<Ekskul[]>(c.extracurriculars ?? []);
  const [promo, setPromo] = useState(c.promotion_status ?? '');
  const [msg, setMsg] = useState<string | null>(null);
  const locked = c.status === 'approved';

  const save = useMutation({
    mutationFn: () => api('/api/wali', {
      method: 'PUT',
      json: { reportId: c.report_id, homeroomNotes: notes || null, extracurriculars: ekskul.filter((e) => e.name.trim()), promotionStatus: genap ? (promo || null) : undefined },
    }),
    onSuccess: () => { setMsg('Tersimpan.'); qc.invalidateQueries({ queryKey: ['wali', classId] }); },
    onError: (e) => setMsg((e as Error).message),
  });

  return (
    <div className="card space-y-3" data-testid={`wali-card-${c.nis}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><span className="font-medium">{c.name}</span> <span className="text-xs text-slate-400">{c.nis}</span></div>
        <div className="text-xs text-slate-500">Nilai terkunci {c.grades_locked}/{c.grades_total} · {STATUS_LABEL[c.status]}</div>
      </div>

      <div>
        <label className="label">Catatan wali kelas</label>
        <textarea className="input min-h-20" disabled={locked} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div>
        <label className="label">Ekstrakurikuler</label>
        {ekskul.map((e, i) => (
          <div key={i} className="mb-2 grid grid-cols-[1fr_72px_1fr_auto] gap-2">
            <input aria-label="Nama kegiatan" className="input" placeholder="Pramuka" disabled={locked} value={e.name} onChange={(ev) => setEkskul(ekskul.map((x, j) => (j === i ? { ...x, name: ev.target.value } : x)))} />
            <select aria-label="Nilai" className="input" disabled={locked} value={e.grade} onChange={(ev) => setEkskul(ekskul.map((x, j) => (j === i ? { ...x, grade: ev.target.value as Ekskul['grade'] } : x)))}>
              {['A', 'B', 'C', 'D'].map((g) => <option key={g}>{g}</option>)}
            </select>
            <input aria-label="Keterangan" className="input" placeholder="Keterangan" disabled={locked} value={e.description ?? ''} onChange={(ev) => setEkskul(ekskul.map((x, j) => (j === i ? { ...x, description: ev.target.value } : x)))} />
            <button className="btn" disabled={locked} onClick={() => setEkskul(ekskul.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button className="btn" disabled={locked || ekskul.length >= 10} onClick={() => setEkskul([...ekskul, { name: '', grade: 'B' }])}>+ Ekstrakurikuler</button>
      </div>

      {genap && (
        <div className="max-w-xs">
          <label className="label">Keputusan akhir tahun</label>
          <select className="input" disabled={locked} value={promo} onChange={(e) => setPromo(e.target.value)}>
            <option value="">— belum ditetapkan —</option>
            <option value="naik">Naik kelas</option><option value="tinggal">Tinggal kelas</option>
            <option value="lulus">Lulus</option><option value="pindah">Pindah sekolah</option>
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={locked || save.isPending} onClick={() => save.mutate()}>Simpan</button>
        {msg && <span role="status" className="text-sm text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}

function DevNotes({ students }: { students: { student_id: string; name: string }[] }) {
  const qc = useQueryClient();
  const [sid, setSid] = useState('');
  const [aspect, setAspect] = useState<string>('karakter');
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { if (!sid && students[0]) setSid(students[0].student_id); }, [students, sid]);

  const key = ['devnotes', sid];
  const { data: notes = [] } = useQuery({ queryKey: key, enabled: !!sid, queryFn: () => api<{ id: string; aspect: string; narrative: string; observed_on: string; author: string }[]>(`/api/dev-notes?studentId=${sid}`) });
  const add = useMutation({
    mutationFn: () => api('/api/dev-notes', { method: 'POST', json: { studentId: sid, aspect, narrative: text } }),
    onSuccess: () => { setText(''); setMsg({ ok: true, text: 'Catatan tersimpan.' }); qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  return (
    <section className="card space-y-3">
      <h2 className="font-semibold">Catatan Perkembangan Siswa (TK/SD)</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <select aria-label="Siswa" className="input" value={sid} onChange={(e) => setSid(e.target.value)}>
          {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
        </select>
        <select aria-label="Aspek" className="input" value={aspect} onChange={(e) => setAspect(e.target.value)}>
          {ASPECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <textarea aria-label="Catatan" className="input min-h-20" placeholder="Tuliskan pengamatan perilaku/karakter…" value={text} onChange={(e) => setText(e.target.value)} />
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{msg.text}</p>}
      <button className="btn btn-primary" disabled={add.isPending || text.trim().length < 5} onClick={() => add.mutate()}>Simpan catatan</button>
      <ul className="space-y-2 border-t border-slate-100 pt-3 text-sm">
        {notes.map((n) => (
          <li key={n.id}><span className="text-xs text-slate-400">{n.observed_on} · {ASPECTS.find((a) => a[0] === n.aspect)?.[1]} · {n.author}</span><p>{n.narrative}</p></li>
        ))}
        {notes.length === 0 && <li className="text-slate-400">Belum ada catatan.</li>}
      </ul>
    </section>
  );
}

export default function WaliPanel() {
  const qc = useQueryClient();
  const { data: lk } = useLookups();
  const classes = lk?.classes.filter((c) => c.is_wali) ?? lk?.classes ?? [];
  const [classId, setClassId] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { if (!classId && classes[0]) setClassId(classes[0].id); }, [classes, classId]);

  const { data } = useQuery({ queryKey: ['wali', classId], enabled: !!classId, queryFn: () => api<{ rows: Card[]; kind: 'ganjil' | 'genap' }>(`/api/wali?classId=${classId}`) });

  const submit = useMutation({
    mutationFn: () => api<{ submitted: number; notReady: number }>('/api/wali', { method: 'POST', json: { classId } }),
    onSuccess: (r) => {
      setMsg({ ok: r.notReady === 0, text: `${r.submitted} e-Rapor dikirim ke Kepala Sekolah.${r.notReady ? ` ${r.notReady} belum siap (nilai belum terkunci semua${data?.kind === 'genap' ? ' atau keputusan akhir tahun belum ditetapkan' : ''}).` : ''}` });
      qc.invalidateQueries({ queryKey: ['wali', classId] });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  if (lk && classes.length === 0) return <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Anda belum ditetapkan sebagai Wali Kelas.</p>;

  return (
    <div className="w-full space-y-4">
      <div className="teramia-banner p-4 sm:p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-white">Wali Kelas · e-Rapor</h1>
        <p className="text-xs text-slate-200 mt-0.5">Kelola catatan wali kelas, ekstrakurikuler, perkembangan siswa, dan pengajuan e-Rapor.</p>
      </div>
      <div className="card flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="wc" className="label">Kelas</label>
          <select id="wc" className="input" value={classId} onChange={(e) => { setClassId(e.target.value); setMsg(null); }}>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" disabled={submit.isPending || !data?.rows.length} onClick={() => submit.mutate()}>Kirim ke Kepala Sekolah</button>
      </div>
      {msg && <p role="status" className={`rounded-lg p-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{msg.text}</p>}
      {data?.rows.map((c) => <StudentCard key={`${c.report_id}-${c.status}`} c={c} genap={data.kind === 'genap'} classId={classId} />)}
      {data && <DevNotes students={data.rows} />}
    </div>
  );
}
