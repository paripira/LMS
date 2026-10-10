'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { exportRows } from '@/lib/import/parse';

interface Row {
  student_id: string;
  nis: string;
  name: string;
  session_id: string | null;
  status: 'in_progress' | 'submitted' | null;
  score: number | null;
  correct_count: number | null;
  total_questions: number | null;
  submitted_at: string | null;
  is_late: boolean;
  answers: Record<string, string | string[]>;
  essay_scores: Record<string, number>;
}
interface StatRow {
  id: string;
  position: number;
  type: string;
  points: number;
  rubric: string | null;
  body: string;
  fullBody: string;
  correctPct: number | null;
}
interface Result {
  exam: { title: string; status: string; passingScore: number | null };
  summary: { enrolled: number; submitted: number; inProgress: number; avg: number | null; max: number | null; min: number | null; passed: number | null };
  rows: Row[];
  stats: StatRow[];
}
const LABEL = { submitted: 'Terkumpul', in_progress: 'Sedang mengerjakan' } as const;

export default function ResultsPanel({ examId }: { examId: string }) {
  const qc = useQueryClient();
  const key = ['exam-results', examId];
  const { data, isLoading } = useQuery({ queryKey: key, staleTime: 15_000, queryFn: () => api<Result>(`/api/exams/${examId}/results`) });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [gradingRow, setGradingRow] = useState<Row | null>(null);
  const [essayInputs, setEssayInputs] = useState<Record<string, string>>({});

  const retake = useMutation({
    mutationFn: (sessionId: string) => api(`/api/exams/${examId}/results`, { method: 'POST', json: { action: 'retake', sessionId } }),
    onSuccess: () => { setMsg({ ok: true, text: 'Izin mengulang diberikan. Siswa dapat memulai ujian lagi selama jadwal masih terbuka.' }); qc.invalidateQueries({ queryKey: key }); },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const saveEssay = useMutation({
    mutationFn: () => {
      const numericScores: Record<string, number> = {};
      for (const [qid, val] of Object.entries(essayInputs)) {
        const n = Number(val);
        if (Number.isFinite(n) && n >= 0) numericScores[qid] = n;
      }
      return api(`/api/exams/${examId}/results`, {
        method: 'POST',
        json: { action: 'grade_essay', sessionId: gradingRow!.session_id, essayScores: numericScores },
      });
    },
    onSuccess: () => {
      setMsg({ ok: true, text: `Nilai esai ${gradingRow?.name} berhasil disimpan & skor akhir diperbarui.` });
      setGradingRow(null);
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  if (isLoading || !data) return <p className="text-slate-400">Memuat…</p>;
  const { summary: s } = data;
  const essayQuestions = data.stats.filter((q) => q.type === 'esai');

  return (
    <div className="w-full space-y-5">
      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/guru/ujian" className="text-xs font-semibold text-[#f5b800] hover:underline">← Daftar ujian</Link>
          <h1 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">Hasil: {data.exam.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => qc.invalidateQueries({ queryKey: key })}>Segarkan</button>
          <button className="btn btn-gold" onClick={() => exportRows(
            data.rows.map((r) => ({
              ...r,
              status_label: r.status ? LABEL[r.status] : 'Belum mulai',
              telat: r.is_late ? 'Ya' : '',
              pindah_tab: Number(r.essay_scores?.__tab_switches ?? 0),
            })),
            [
              { header: 'NIS', key: 'nis' },
              { header: 'Nama', key: 'name' },
              { header: 'Status', key: 'status_label' },
              { header: 'Nilai', key: 'score' },
              { header: 'Benar', key: 'correct_count' },
              { header: 'Jumlah soal', key: 'total_questions' },
              { header: 'Terlambat', key: 'telat' },
              { header: 'Pindah Tab (x)', key: 'pindah_tab' },
            ],
            `hasil-${data.exam.title.replace(/[^\p{L}\p{N}]+/gu, '_')}.xlsx`)}>Ekspor Excel</button>
        </div>
      </div>

      {msg && <p role="status" className={`rounded-lg p-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Terkumpul', `${s.submitted}/${s.enrolled}`], ['Rerata', s.avg ?? '—'], ['Tertinggi / terendah', s.max != null ? `${s.max} / ${s.min}` : '—'],
          [data.exam.passingScore != null ? `Lulus (≥ ${data.exam.passingScore})` : 'Sedang mengerjakan', data.exam.passingScore != null ? (s.passed ?? '—') : s.inProgress]].map(([l, v]) => (
          <div key={String(l)} className="card border-t-4 border-[#f5b800]"><div className="text-xs font-semibold text-slate-500">{l}</div><div className="mt-1 text-xl font-extrabold text-[#162d6e]">{String(v)}</div></div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
        <table className="w-full min-w-[650px] md:min-w-0 table-fixed text-sm">
          <colgroup><col style={{ width: '90px' }} /><col /><col style={{ width: '190px' }} /><col style={{ width: '100px' }} /><col style={{ width: '100px' }} /><col style={{ width: '210px' }} /></colgroup>
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr><th className="px-3 py-2">NIS</th><th className="px-3 py-2">Nama</th><th className="px-3 py-2">Status &amp; Pengawasan</th><th className="px-3 py-2">Nilai</th><th className="px-3 py-2">Benar</th><th className="px-3 py-2" /></tr>
          </thead>
          <tbody>
            {data.rows.map((r) => {
              const tabSwitches = Number(r.essay_scores?.__tab_switches ?? 0);
              return (
              <tr key={r.student_id} className="border-t border-slate-100">
                <td className="px-3 py-2">{r.nis}</td>
                <td className="truncate px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">
                  {r.status ? LABEL[r.status] : <span className="text-slate-400">Belum mulai</span>}
                  {r.is_late && <span className="ml-1 rounded bg-amber-100 px-1 text-xs text-amber-800">terlambat</span>}
                  {tabSwitches > 0 && (
                    <span
                      className={`ml-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                        tabSwitches > 3 ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                      title="Jumlah siswa berpindah tab/keluar layar ujian (lebih dari 3x otomatis dikumpulkan)"
                    >
                      {tabSwitches > 3 ? `Auto-Submit (Pindah tab ${tabSwitches}x)` : `Pindah tab ${tabSwitches}/3`}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-medium">{r.score ?? '—'}</td>
                <td className="px-3 py-2">{r.correct_count != null ? `${r.correct_count}/${r.total_questions}` : '—'}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1.5">
                    {r.session_id && r.status === 'submitted' && essayQuestions.length > 0 && (
                      <button
                        className="btn btn-primary text-xs py-1 px-2.5"
                        onClick={() => {
                          setGradingRow(r);
                          setEssayInputs(
                            Object.fromEntries(
                              essayQuestions.map((eq) => [eq.id, String(r.essay_scores?.[eq.id] ?? 0)]),
                            ),
                          );
                        }}
                      >
                        Koreksi Esai ({essayQuestions.length})
                      </button>
                    )}
                    {r.session_id && (
                      <button className="btn text-xs py-1 px-2.5" onClick={() => confirm(`Izinkan ${r.name} mengulang? Hasil sebelumnya diarsipkan.`) && retake.mutate(r.session_id!)}>
                        Izinkan ulang
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="card space-y-2">
        <h2 className="font-semibold">Analisis butir soal</h2>
        <p className="text-xs text-slate-500">Persentase siswa yang menjawab benar. Soal di bawah 40% mungkin terlalu sulit atau kuncinya perlu dicek.</p>
        {data.stats.map((q) => (
          <div key={q.id} className="space-y-1">
            <div className="flex justify-between gap-2 text-sm">
              <span className="truncate">
                {q.position}. {q.type === 'esai' && <b className="text-[#162d6e]">[Esai] </b>}
                {q.body}
              </span>
              <span className="shrink-0 font-medium">{q.correctPct != null ? `${q.correctPct}%` : '—'}</span>
            </div>
            <div className="h-2 rounded bg-slate-100"><div className={`h-2 rounded ${(q.correctPct ?? 0) < 40 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${q.correctPct ?? 0}%` }} /></div>
          </div>
        ))}
      </section>

      {/* Modal Koreksi Soal Esai */}
      {gradingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#162d6e]">Koreksi Jawaban Esai · {gradingRow.name}</h2>
                <p className="text-xs text-slate-500">NIS: {gradingRow.nis} · Masukkan skor untuk setiap soal esai di bawah ini.</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 font-bold" onClick={() => setGradingRow(null)}>✕</button>
            </div>

            <div className="space-y-4">
              {essayQuestions.map((eq) => {
                const studentAnswer = gradingRow.answers?.[eq.id];
                return (
                  <div key={eq.id} className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-slate-50/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-900">
                        Soal #{eq.position} <span className="text-xs font-normal text-slate-500">(Maks. {eq.points} poin)</span>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{eq.fullBody}</p>
                    {eq.rubric && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900">
                        <b>Pedoman Penskoran / Rubrik:</b> {eq.rubric}
                      </div>
                    )}
                    <div className="rounded-lg bg-white border border-slate-200 p-3 text-sm">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1">Jawaban Siswa:</div>
                      <div className="whitespace-pre-wrap text-slate-800">
                        {studentAnswer ? String(studentAnswer) : <i className="text-slate-400">Tidak dijawab</i>}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <label className="text-xs font-semibold text-slate-700">Skor diberikan (0 – {eq.points}):</label>
                      <input
                        type="number"
                        min={0}
                        max={eq.points}
                        step="0.5"
                        className="input w-24 py-1 text-center font-bold"
                        value={essayInputs[eq.id] ?? '0'}
                        onChange={(e) => setEssayInputs({ ...essayInputs, [eq.id]: e.target.value })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button className="btn" onClick={() => setGradingRow(null)}>Batal</button>
              <button className="btn btn-primary" disabled={saveEssay.isPending} onClick={() => saveEssay.mutate()}>
                {saveEssay.isPending ? 'Menyimpan…' : 'Simpan Nilai Esai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
