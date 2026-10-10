'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups } from '@/lib/hooks';
import type { Bank, Q } from '@/components/BankPanel';
import { TYPE_LABEL } from '@/lib/cbt/question-schema';

interface ExamRow {
  id: string; title: string; status: 'draft' | 'published' | 'archived'; opens_at: string; closes_at: string; duration_minutes: number;
  label: string; question_count: number; submitted: number; enrolled: number;
}
interface Detail {
  id: string; assignmentId: string; title: string; instructions: string | null; durationMinutes: number; opensAt: string; closesAt: string;
  shuffleQuestions: boolean; shuffleOptions: boolean; passingScore: number | null; showScore: boolean; questionIds: string[];
}
const STATUS = { draft: ['Draf', 'bg-slate-100 text-slate-700'], published: ['Diterbitkan', 'bg-emerald-100 text-emerald-800'], archived: ['Diarsipkan', 'bg-amber-100 text-amber-800'] } as const;
const pad = (n: number) => String(n).padStart(2, '0');
const toLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const when = (iso: string) => new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

function Picker({ subjectId, selected, setSelected }: { subjectId: string; selected: string[]; setSelected: (ids: string[]) => void }) {
  const { data: banks = [] } = useQuery({ queryKey: ['banks'], queryFn: () => api<Bank[]>('/api/banks') });
  const mine = banks.filter((b) => b.subject_id === subjectId);
  const [bankId, setBankId] = useState('');
  const active = bankId || mine[0]?.id || '';
  const { data: qs = [] } = useQuery({ queryKey: ['questions', active], enabled: !!active, queryFn: () => api<Q[]>(`/api/questions?bankId=${active}`) });
  const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  if (mine.length === 0) return <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Belum ada bank soal untuk mata pelajaran ini. Buat dulu di menu <b>Bank Soal</b>.</p>;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Bank soal" className="input max-w-xs" value={active} onChange={(e) => setBankId(e.target.value)}>
          {mine.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.question_count})</option>)}
        </select>
        <button className="btn" onClick={() => setSelected([...new Set([...selected, ...qs.map((q) => q.id)])])}>Pilih semua</button>
        <span className="text-sm text-slate-500">Dipilih: <b>{selected.length}</b> soal</span>
      </div>
      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
        {qs.map((q) => (
          <li key={q.id}>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={selected.includes(q.id)} onChange={() => toggle(q.id)} />
              <span><span className="mr-1 text-xs text-slate-400">[{TYPE_LABEL[q.type]}]</span>{q.body.slice(0, 110)}</span>
            </label>
          </li>
        ))}
        {qs.length === 0 && <li className="text-sm text-slate-400">Bank ini kosong.</li>}
      </ul>
    </div>
  );
}

function ExamForm({ initial, onClose }: { initial?: Detail; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: lk } = useLookups();
  const start = new Date(); start.setMinutes(0, 0, 0);
  const [f, setF] = useState({
    assignmentId: initial?.assignmentId ?? lk?.assignments[0]?.id ?? '',
    title: initial?.title ?? '', instructions: initial?.instructions ?? '',
    durationMinutes: String(initial?.durationMinutes ?? 60),
    opensAt: toLocal(initial ? new Date(initial.opensAt) : start),
    closesAt: toLocal(initial ? new Date(initial.closesAt) : new Date(start.getTime() + 24 * 3600_000)),
    shuffleQuestions: initial?.shuffleQuestions ?? true, shuffleOptions: initial?.shuffleOptions ?? true,
    showScore: initial?.showScore ?? false, passingScore: initial?.passingScore != null ? String(initial.passingScore) : '',
  });
  const [ids, setIds] = useState<string[]>(initial?.questionIds ?? []);
  const [err, setErr] = useState<string | null>(null);
  const subjectId = lk?.assignments.find((a) => a.id === f.assignmentId)?.subject_id ?? '';
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  const save = useMutation({
    mutationFn: () => {
      const body = {
        title: f.title, instructions: f.instructions || null, durationMinutes: Number(f.durationMinutes),
        opensAt: new Date(f.opensAt).toISOString(), closesAt: new Date(f.closesAt).toISOString(),
        shuffleQuestions: f.shuffleQuestions, shuffleOptions: f.shuffleOptions, showScore: f.showScore,
        passingScore: f.passingScore === '' ? null : Number(f.passingScore), questionIds: ids,
      };
      return initial
        ? api(`/api/exams/${initial.id}`, { method: 'PATCH', json: { action: 'update', ...body } })
        : api('/api/exams', { method: 'POST', json: { assignmentId: f.assignmentId, ...body } });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); onClose(); },
    onError: (e) => setErr((e as Error).message),
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-label="Form ujian" className="max-h-[92vh] w-full max-w-2xl space-y-3 overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{initial ? 'Ubah ujian (draf)' : 'Buat ujian baru'}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="ea" className="label">Mata pelajaran & kelas</label>
            <select id="ea" className="input" disabled={!!initial} value={f.assignmentId} onChange={(e) => { set('assignmentId', e.target.value); setIds([]); }}>
              {lk?.assignments.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <div><label htmlFor="et" className="label">Judul ujian</label><input id="et" className="input" value={f.title} onChange={(e) => set('title', e.target.value)} /></div>
          <div><label htmlFor="eo" className="label">Dibuka</label><input id="eo" type="datetime-local" className="input" value={f.opensAt} onChange={(e) => set('opensAt', e.target.value)} /></div>
          <div><label htmlFor="ec" className="label">Ditutup</label><input id="ec" type="datetime-local" className="input" value={f.closesAt} onChange={(e) => set('closesAt', e.target.value)} /></div>
          <div><label htmlFor="ed" className="label">Durasi pengerjaan (menit)</label><input id="ed" type="number" min={1} max={300} className="input" value={f.durationMinutes} onChange={(e) => set('durationMinutes', e.target.value)} /></div>
          <div><label htmlFor="ep" className="label">Nilai lulus (opsional)</label><input id="ep" type="number" min={0} max={100} className="input" value={f.passingScore} onChange={(e) => set('passingScore', e.target.value)} /></div>
        </div>
        <div><label htmlFor="ei" className="label">Petunjuk untuk siswa (opsional)</label><textarea id="ei" className="input min-h-16" value={f.instructions} onChange={(e) => set('instructions', e.target.value)} /></div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.shuffleQuestions} onChange={(e) => set('shuffleQuestions', e.target.checked)} /> Acak urutan soal</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.shuffleOptions} onChange={(e) => set('shuffleOptions', e.target.checked)} /> Acak pilihan jawaban</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.showScore} onChange={(e) => set('showScore', e.target.checked)} /> Tampilkan nilai ke siswa setelah selesai</label>
        </div>
        <div>
          <div className="label">Pilih soal</div>
          {subjectId ? <Picker subjectId={subjectId} selected={ids} setSelected={setIds} /> : <p className="text-sm text-slate-400">Pilih mata pelajaran terlebih dahulu.</p>}
        </div>
        {err && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{err}</p>}
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" disabled={save.isPending || !f.title.trim() || ids.length === 0} onClick={() => save.mutate()}>{save.isPending ? 'Menyimpan…' : 'Simpan sebagai draf'}</button>
        </div>
      </div>
    </div>
  );
}

export default function ExamPanel() {
  const qc = useQueryClient();
  const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: () => api<ExamRow[]>('/api/exams') });
  const [form, setForm] = useState<Detail | 'new' | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const act = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'publish' | 'archive' | 'delete' }) =>
      action === 'delete' ? api(`/api/exams/${id}`, { method: 'DELETE' }) : api(`/api/exams/${id}`, { method: 'PATCH', json: { action } }),
    onSuccess: (_r, v) => { setMsg({ ok: true, text: v.action === 'publish' ? 'Ujian diterbitkan. Siswa dapat mengerjakan sesuai jadwal.' : v.action === 'archive' ? 'Ujian diarsipkan.' : 'Draf dihapus.' }); qc.invalidateQueries({ queryKey: ['exams'] }); },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  async function edit(id: string) {
    try { setForm(await api<Detail>(`/api/exams/${id}`)); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  }

  return (
    <div className="w-full space-y-4">
      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">Ujian (CBT)</h1>
          <p className="text-xs text-slate-200 mt-0.5">Jadwalkan ujian berbasis komputer, pantau pengumpulan siswa, dan unduh hasil.</p>
        </div>
        <button className="btn btn-gold" onClick={() => setForm('new')}>+ Buat ujian</button>
      </div>
      {msg && <p role="status" className={`rounded-lg p-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</p>}

      {exams.map((e) => (
        <div key={e.id} data-testid={`exam-${e.id}`} className="card flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{e.title}</span>
              <span className={`rounded px-2 py-0.5 text-xs ${STATUS[e.status][1]}`}>{STATUS[e.status][0]}</span>
            </div>
            <div className="text-xs text-slate-500">{e.label} · {e.question_count} soal · {e.duration_minutes} menit · {when(e.opens_at)} – {when(e.closes_at)}</div>
            {e.status !== 'draft' && <div className="text-xs text-slate-500">Terkumpul {e.submitted} dari {e.enrolled} siswa</div>}
          </div>
          <div className="flex flex-wrap gap-1">
            {e.status === 'draft' && <>
              <button className="btn" onClick={() => edit(e.id)}>Ubah</button>
              <button className="btn btn-primary" onClick={() => act.mutate({ id: e.id, action: 'publish' })}>Terbitkan</button>
              <button className="btn" onClick={() => confirm('Hapus draf ujian ini?') && act.mutate({ id: e.id, action: 'delete' })}>Hapus</button>
            </>}
            {e.status !== 'draft' && <Link className="btn" href={`/guru/ujian/${e.id}`}>Hasil</Link>}
            {e.status === 'published' && <button className="btn" onClick={() => confirm('Arsipkan ujian? Siswa tidak dapat memulai lagi.') && act.mutate({ id: e.id, action: 'archive' })}>Arsipkan</button>}
          </div>
        </div>
      ))}
      {exams.length === 0 && <p className="text-slate-400">Belum ada ujian.</p>}

      {form && <ExamForm key={form === 'new' ? 'new' : form.id} initial={form === 'new' ? undefined : form} onClose={() => setForm(null)} />}
    </div>
  );
}
