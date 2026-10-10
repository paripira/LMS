'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import DriveUploadBox from './DriveUploadBox';

interface StudentAssignment {
  id: string;
  teaching_assignment_id: string;
  title: string;
  instructions: string | null;
  url: string | null;
  due_at: string | null;
  subject_name: string;
  class_name: string;
  submission_id: string | null;
  submission_url: string | null;
  submission_note: string | null;
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  is_submitted: boolean;
}

export default function StudentAssignmentsPanel() {
  const qc = useQueryClient();
  const [selectedAsg, setSelectedAsg] = useState<StudentAssignment | null>(null);
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitNote, setSubmitNote] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const { data: assignments = [], refetch } = useQuery({
    queryKey: ['siswa-assignments'],
    queryFn: () => api<StudentAssignment[]>('/api/assignments'),
  });

  const submitWork = useMutation({
    mutationFn: () =>
      api(`/api/assignments/${selectedAsg!.id}/submissions`, {
        method: 'POST',
        json: { url: submitUrl, note: submitNote || undefined },
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Jawaban tugas berhasil dikumpulkan!' });
      setSelectedAsg(null);
      setSubmitUrl('');
      setSubmitNote('');
      refetch();
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  return (
    <div className="space-y-4">
      {msg && (
        <p role="status" className={`rounded-lg p-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {msg.text}
        </p>
      )}

      <div className="space-y-3">
        {assignments.map((a) => {
          const isOverdue = a.due_at && new Date(a.due_at).getTime() < Date.now();
          return (
            <div key={a.id} className="card space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-500">
                    {a.subject_name} · {a.due_at ? `Tenggat: ${new Date(a.due_at).toLocaleString('id-ID')}` : 'Tanpa tenggat'}
                  </div>
                </div>
                <div>
                  {a.score != null ? (
                    <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                      Nilai: {a.score}/100
                    </span>
                  ) : a.is_submitted ? (
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Sudah Dikumpulkan
                    </span>
                  ) : isOverdue ? (
                    <span className="rounded bg-rose-100 px-2 py-1 text-xs font-medium text-rose-800">
                      Terlambat
                    </span>
                  ) : (
                    <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                      Belum Dikumpulkan
                    </span>
                  )}
                </div>
              </div>

              {a.instructions && <p className="text-xs text-slate-600">{a.instructions}</p>}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    Buka Referensi Tugas ↗
                  </a>
                ) : <span />}

                <div className="flex items-center gap-2">
                  {a.submission_url && (
                    <a href={a.submission_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:underline">
                      Tautan Anda
                    </a>
                  )}
                  <button
                    className="btn btn-primary text-xs py-1"
                    onClick={() => {
                      setSelectedAsg(a);
                      setSubmitUrl(a.submission_url ?? '');
                      setSubmitNote(a.submission_note ?? '');
                      setMsg(null);
                    }}
                  >
                    {a.is_submitted ? 'Ubah Jawaban' : 'Kumpulkan Tugas'}
                  </button>
                </div>
              </div>

              {a.feedback && (
                <div className="rounded bg-slate-50 p-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Catatan Guru: </span>
                  {a.feedback}
                </div>
              )}
            </div>
          );
        })}

        {assignments.length === 0 && (
          <p className="text-sm text-slate-400 py-3">Tidak ada tugas saat ini.</p>
        )}
      </div>

      {/* Modal Kumpulkan Tugas */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4 my-8">
            <h2 className="text-lg font-bold text-[#162d6e]">Kumpulkan Tugas: {selectedAsg.title}</h2>
            <DriveUploadBox
              label="Upload Hasil Tugas Anda"
              folderSubpath="Tugas Siswa"
              value={submitUrl}
              onChange={(url) => setSubmitUrl(url)}
              helperText="Pilih file atau foto jawaban langsung dari HP/Laptop Anda. File otomatis tersimpan ke Google Drive Anda dan akses link untuk Guru langsung aktif otomatis!"
            />
            <div>
              <label className="label">Catatan untuk Guru (Opsional)</label>
              <textarea
                className="input min-h-20"
                placeholder="Catatan pengerjaan tambahan…"
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setSelectedAsg(null)}>Batal</button>
              <button
                className="btn btn-primary"
                disabled={!submitUrl.trim() || submitWork.isPending}
                onClick={() => submitWork.mutate()}
              >
                {submitWork.isPending ? 'Mengirim…' : 'Kirimkan Jawaban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
