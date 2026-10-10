'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups } from '@/lib/hooks';

interface G {
  id: string;
  nis: string;
  name: string;
  formative: number | null;
  sas: number | null;
  final: number | null;
  predicate: string | null;
  locked: boolean;
  avg_assignment?: number | null;
  avg_exam?: number | null;
}
type Edit = { f: string; s: string };

const num = (v: string) => (v.trim() === '' ? null : Number(v));
const valid = (v: string) => v.trim() === '' || (Number(v) >= 0 && Number(v) <= 100);

export default function GradePanel() {
  const qc = useQueryClient();
  const { data: lk } = useLookups();
  const [aid, setAid] = useState('');
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { if (lk && !aid && lk.assignments[0]) setAid(lk.assignments[0].id); }, [lk, aid]);

  const key = ['grades', aid];
  const { data } = useQuery({ queryKey: key, enabled: !!aid, queryFn: () => api<{ rows: G[] }>(`/api/grades?assignmentId=${aid}`) });
  const rows = data?.rows ?? [];

  useEffect(() => {
    if (data) setEdits(Object.fromEntries(data.rows.map((r) => [r.id, { f: r.formative?.toString() ?? '', s: r.sas?.toString() ?? '' }])));
  }, [data]);

  const allLocked = rows.length > 0 && rows.every((r) => r.locked);
  const invalid = rows.some((r) => !r.locked && (!valid(edits[r.id]?.f ?? '') || !valid(edits[r.id]?.s ?? '')));
  const missingSas = rows.some((r) => !r.locked && (edits[r.id]?.s ?? '') === '');

  function syncFromTasksAndExams() {
    let count = 0;
    setEdits((prev) => {
      const next = { ...prev };
      for (const r of rows) {
        if (r.locked) continue;
        const cur = next[r.id] ?? { f: '', s: '' };
        let changed = false;
        const newF = r.avg_assignment != null ? String(r.avg_assignment) : cur.f;
        const newS = r.avg_exam != null ? String(r.avg_exam) : cur.s;
        if (newF !== cur.f || newS !== cur.s) changed = true;
        if (changed) {
          count++;
          next[r.id] = { f: newF, s: newS };
        }
      }
      return next;
    });
    if (count > 0) {
      setMsg({
        ok: true,
        text: `Berhasil menarik nilai Formatif (Rata-rata Tugas) & SAS (Ujian CBT) untuk ${count} siswa. Jangan lupa klik Simpan.`,
      });
    } else {
      setMsg({
        ok: false,
        text: 'Belum ada nilai tugas atau hasil ujian CBT baru yang dapat ditarik untuk mata pelajaran ini.',
      });
    }
  }

  const save = useMutation({
    mutationFn: () => api('/api/grades', {
      method: 'PUT',
      json: { assignmentId: aid, rows: rows.filter((r) => !r.locked).map((r) => ({ id: r.id, formative: num(edits[r.id]?.f ?? ''), sas: num(edits[r.id]?.s ?? '') })) },
    }),
    onSuccess: () => { setMsg({ ok: true, text: 'Nilai tersimpan.' }); qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const lock = useMutation({
    mutationFn: async () => {
      await save.mutateAsync(); // always persist what's on screen before freezing
      return api<{ locked: number }>('/api/grades/lock', { method: 'POST', json: { teachingAssignmentId: aid } });
    },
    onSuccess: (r) => { setMsg({ ok: true, text: `${r.locked} nilai dikunci. Nilai akhir, predikat, dan narasi capaian dibuat otomatis.` }); qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  if (lk && lk.assignments.length === 0) return <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Anda belum memiliki penugasan mengajar pada semester aktif.</p>;

  return (
    <div className="w-full space-y-4">
      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">Input Nilai (SAS / PAS)</h1>
          <p className="text-xs text-slate-200 mt-0.5">Input nilai Formatif dan Sumatif Akhir Semester serta kunci nilai rapor.</p>
        </div>
        <div className="w-full sm:w-72">
          <label htmlFor="ga" className="mb-1 block text-xs font-semibold text-[#f5b800]">Mata pelajaran</label>
          <select id="ga" className="input" value={aid} onChange={(e) => { setAid(e.target.value); setMsg(null); }}>
            {lk?.assignments.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
      </div>

      {!allLocked && rows.length > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="text-xs text-slate-600">
            <b>Sinkronisasi Cepat:</b> Isi otomatis kolom <b>Formatif</b> dari rata-rata nilai Tugas dan kolom <b>SAS / PAS</b> dari nilai Ujian CBT siswa pada mata pelajaran ini.
          </div>
          <button
            type="button"
            onClick={syncFromTasksAndExams}
            className="btn btn-gold text-xs font-bold py-1.5 px-3"
          >
            ⚡ Tarik Otomatis dari Nilai Tugas &amp; Ujian CBT
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
        <table className="w-full min-w-[600px] md:min-w-0 table-fixed text-sm">
          <colgroup><col style={{ width: '90px' }} /><col /><col style={{ width: '130px' }} /><col style={{ width: '130px' }} /><col style={{ width: '90px' }} /><col style={{ width: '80px' }} /></colgroup>
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr><th className="px-3 py-2">NIS</th><th className="px-3 py-2">Nama</th><th className="px-3 py-2">Formatif</th><th className="px-3 py-2">SAS / PAS</th><th className="px-3 py-2">Akhir</th><th className="px-3 py-2">Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{r.nis}</td>
                <td className="truncate px-3 py-2">{r.name}</td>
                {(['f', 's'] as const).map((k) => {
                  const refVal = k === 'f' ? r.avg_assignment : r.avg_exam;
                  const refLabel = k === 'f' ? 'Tugas' : 'CBT';
                  return (
                    <td key={k} className="px-2 py-1.5 align-top">
                      <input
                        aria-label={`${r.name} ${k === 'f' ? 'formatif' : 'SAS'}`}
                        className={`input py-1 ${edits[r.id] && !valid(edits[r.id][k]) ? 'border-rose-500' : ''}`}
                        type="number" min={0} max={100} step="0.01" disabled={r.locked}
                        value={r.locked ? (k === 'f' ? r.formative ?? '' : r.sas ?? '') : (edits[r.id]?.[k] ?? '')}
                        onChange={(e) => setEdits((s) => ({ ...s, [r.id]: { ...s[r.id], [k]: e.target.value } }))}
                      />
                      {!r.locked && refVal != null && (
                        <button
                          type="button"
                          onClick={() => setEdits((s) => ({ ...s, [r.id]: { ...s[r.id], [k]: String(refVal) } }))}
                          className="mt-1 inline-block text-[10px] font-semibold text-[#162d6e] hover:underline"
                          title={`Klik untuk memakai nilai rata-rata ${refLabel}`}
                        >
                          Rerata {refLabel}: {refVal} ↗
                        </button>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2">{r.final != null ? `${Math.round(r.final)} (${r.predicate})` : '—'}</td>
                <td className="px-3 py-2">{r.locked ? '🔒 Terkunci' : 'Draf'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{msg.text}</p>}
      {invalid && <p className="text-sm text-rose-700">Nilai harus antara 0 dan 100.</p>}
      <div className="flex gap-2">
        <button className="btn" disabled={allLocked || invalid || save.isPending} onClick={() => save.mutate()}>Simpan</button>
        <button
          className="btn btn-primary"
          disabled={allLocked || invalid || missingSas || lock.isPending}
          onClick={() => confirm('Kunci nilai? Setelah dikunci, nilai tidak dapat diubah.') && lock.mutate()}
        >
          Kunci Nilai
        </button>
        {missingSas && !allLocked && <span className="self-center text-xs text-amber-700">Lengkapi semua nilai SAS sebelum mengunci.</span>}
      </div>
    </div>
  );
}
