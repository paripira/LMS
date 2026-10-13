'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups } from '@/lib/hooks';
import DriveUploadBox from './DriveUploadBox';

interface Material {
  id: string;
  title: string;
  description: string | null;
  url: string;
  published_at: string;
}

interface Assignment {
  id: string;
  title: string;
  instructions: string | null;
  url: string | null;
  due_at: string | null;
  created_at: string;
  submissions_count: number;
  graded_count: number;
  total_students: number;
}

interface StudentSubmission {
  student_id: string;
  nis: string;
  student_name: string;
  submission_id: string | null;
  url: string | null;
  note: string | null;
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  is_submitted: boolean;
}

export default function MaterialAssignmentPanel() {
  const qc = useQueryClient();
  const { data: lk } = useLookups();
  const [aid, setAid] = useState('');
  const [tab, setTab] = useState<'materials' | 'assignments'>('materials');
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);

  // Modals & Edit States
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  function toLocalDatetimeInput(iso?: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function openCreateMaterial() {
    setEditingMaterial(null);
    setMatTitle('');
    setMatUrl('');
    setMatDesc('');
    setShowMaterialModal(true);
  }

  function openEditMaterial(m: Material) {
    setEditingMaterial(m);
    setMatTitle(m.title);
    setMatUrl(m.url);
    setMatDesc(m.description || '');
    setShowMaterialModal(true);
  }

  function openCreateAssignment() {
    setEditingAssignment(null);
    setAsgTitle('');
    setAsgUrl('');
    setAsgInstructions('');
    setAsgDueAt('');
    setShowAssignmentModal(true);
  }

  function openEditAssignment(a: Assignment) {
    setEditingAssignment(a);
    setAsgTitle(a.title);
    setAsgUrl(a.url || '');
    setAsgInstructions(a.instructions || '');
    setAsgDueAt(toLocalDatetimeInput(a.due_at));
    setShowAssignmentModal(true);
  }

  // Forms
  const [matTitle, setMatTitle] = useState('');
  const [matUrl, setMatUrl] = useState('');
  const [matDesc, setMatDesc] = useState('');

  const [asgTitle, setAsgTitle] = useState('');
  const [asgUrl, setAsgUrl] = useState('');
  const [asgInstructions, setAsgInstructions] = useState('');
  const [asgDueAt, setAsgDueAt] = useState('');

  const [gradingScores, setGradingScores] = useState<Record<string, { score: string; feedback: string }>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (lk && !aid && lk.assignments[0]) setAid(lk.assignments[0].id);
  }, [lk, aid]);

  // Queries
  const { data: materials = [], refetch: refetchMat } = useQuery({
    queryKey: ['materials', aid],
    enabled: !!aid,
    queryFn: () => api<Material[]>(`/api/materials?assignmentId=${aid}`),
  });

  const { data: assignments = [], refetch: refetchAsg } = useQuery({
    queryKey: ['assignments', aid],
    enabled: !!aid,
    queryFn: () => api<Assignment[]>(`/api/assignments?assignmentId=${aid}`),
  });

  const { data: subData, refetch: refetchSubs } = useQuery({
    queryKey: ['assignment-submissions', activeAssignment?.id],
    enabled: !!activeAssignment,
    queryFn: () => api<{ students: StudentSubmission[] }>(`/api/assignments/${activeAssignment!.id}/submissions`),
  });

  useEffect(() => {
    if (subData?.students) {
      const initial: Record<string, { score: string; feedback: string }> = {};
      subData.students.forEach((s) => {
        initial[s.student_id] = {
          score: s.score != null ? String(s.score) : '',
          feedback: s.feedback ?? '',
        };
      });
      setGradingScores(initial);
    }
  }, [subData]);

  // Mutations
  const createMaterial = useMutation({
    mutationFn: () =>
      api('/api/materials', {
        method: 'POST',
        json: { teachingAssignmentId: aid, title: matTitle, url: matUrl, description: matDesc || undefined },
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Materi berhasil ditambahkan.' });
      setShowMaterialModal(false);
      setMatTitle('');
      setMatUrl('');
      setMatDesc('');
      refetchMat();
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const updateMaterial = useMutation({
    mutationFn: () =>
      api('/api/materials', {
        method: 'PATCH',
        json: {
          id: editingMaterial!.id,
          title: matTitle,
          url: matUrl,
          description: matDesc || undefined,
        },
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Materi berhasil diperbarui.' });
      setShowMaterialModal(false);
      setEditingMaterial(null);
      setMatTitle('');
      setMatUrl('');
      setMatDesc('');
      refetchMat();
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const deleteMaterial = useMutation({
    mutationFn: (id: string) => api(`/api/materials?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Materi dihapus.' });
      refetchMat();
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const createAssignment = useMutation({
    mutationFn: () =>
      api('/api/assignments', {
        method: 'POST',
        json: {
          teachingAssignmentId: aid,
          title: asgTitle,
          instructions: asgInstructions || undefined,
          url: asgUrl || undefined,
          dueAt: asgDueAt ? new Date(asgDueAt).toISOString() : undefined,
        },
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Tugas berhasil dibuat.' });
      setShowAssignmentModal(false);
      setAsgTitle('');
      setAsgUrl('');
      setAsgInstructions('');
      setAsgDueAt('');
      refetchAsg();
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const updateAssignment = useMutation({
    mutationFn: () =>
      api('/api/assignments', {
        method: 'PATCH',
        json: {
          id: editingAssignment!.id,
          title: asgTitle,
          instructions: asgInstructions || undefined,
          url: asgUrl || undefined,
          dueAt: asgDueAt ? new Date(asgDueAt).toISOString() : undefined,
        },
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Tugas berhasil diperbarui.' });
      setShowAssignmentModal(false);
      setEditingAssignment(null);
      setAsgTitle('');
      setAsgUrl('');
      setAsgInstructions('');
      setAsgDueAt('');
      refetchAsg();
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const deleteAssignment = useMutation({
    mutationFn: (id: string) => api(`/api/assignments?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Tugas dihapus.' });
      if (activeAssignment?.id) setActiveAssignment(null);
      refetchAsg();
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const gradeStudent = useMutation({
    mutationFn: ({ studentId, score, feedback }: { studentId: string; score: number; feedback?: string }) =>
      api(`/api/assignments/${activeAssignment!.id}/submissions`, {
        method: 'PUT',
        json: { studentId, score, feedback: feedback || undefined },
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Nilai tugas berhasil disimpan.' });
      refetchSubs();
      refetchAsg();
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  if (lk && lk.assignments.length === 0) {
    return <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Anda belum memiliki penugasan mengajar.</p>;
  }

  return (
    <div className="w-full space-y-5">
      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">Materi &amp; Tugas Pembelajaran</h1>
          <p className="text-xs text-slate-200 mt-0.5">Kelola bahan ajar, tugas mandiri/kelompok, dan penilaian siswa.</p>
        </div>
        <div className="w-full sm:w-72">
          <label htmlFor="mat-asg-picker" className="sr-only">Mata pelajaran</label>
          <select
            id="mat-asg-picker"
            className="input"
            value={aid}
            onChange={(e) => {
              setAid(e.target.value);
              setActiveAssignment(null);
              setMsg(null);
            }}
          >
            {lk?.assignments.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {msg && (
        <p role="status" className={`rounded-lg p-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {msg.text}
        </p>
      )}

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => { setTab('materials'); setActiveAssignment(null); }}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${tab === 'materials' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Materi Pembelajaran ({materials.length})
        </button>
        <button
          onClick={() => setTab('assignments')}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${tab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Tugas & Penilaian ({assignments.length})
        </button>
      </div>

      {/* Tab: Materi */}
      {tab === 'materials' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Daftar Materi</h2>
            <button className="btn btn-primary" onClick={openCreateMaterial}>+ Bagikan Materi</button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {materials.map((m) => (
              <div key={m.id} className="card space-y-2 relative">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-slate-900">{m.title}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditMaterial(m)}
                      className="text-xs text-[#162d6e] hover:underline font-semibold"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => confirm('Hapus materi ini?') && deleteMaterial.mutate(m.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                {m.description && <p className="text-xs text-slate-600">{m.description}</p>}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(m.published_at).toLocaleDateString('id-ID')}</span>
                  <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                    Buka Tautan Materi ↗
                  </a>
                </div>
              </div>
            ))}
            {materials.length === 0 && (
              <p className="col-span-2 py-8 text-center text-sm text-slate-400">Belum ada materi dibagikan.</p>
            )}
          </div>
        </section>
      )}

      {/* Tab: Tugas */}
      {tab === 'assignments' && !activeAssignment && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Daftar Tugas</h2>
            <button className="btn btn-primary" onClick={openCreateAssignment}>+ Beri Tugas Baru</button>
          </div>

          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-500">
                    {a.due_at ? `Tenggat: ${new Date(a.due_at).toLocaleString('id-ID')}` : 'Tanpa tenggat'} ·{' '}
                    <span className="font-semibold text-slate-700">{a.submissions_count}/{a.total_students} terkumpul</span>
                    {a.submissions_count > a.graded_count && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 font-medium">
                        {a.submissions_count - a.graded_count} belum dinilai
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-primary text-xs" onClick={() => setActiveAssignment(a)}>
                    Periksa & Nilai ({a.submissions_count})
                  </button>
                  <button
                    onClick={() => openEditAssignment(a)}
                    className="btn text-xs text-[#162d6e] hover:bg-slate-50 font-semibold"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => confirm('Hapus tugas ini?') && deleteAssignment.mutate(a.id)}
                    className="btn text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">Belum ada tugas untuk kelas ini.</p>
            )}
          </div>
        </section>
      )}

      {/* Detail Penilaian Tugas */}
      {tab === 'assignments' && activeAssignment && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <button onClick={() => setActiveAssignment(null)} className="text-xs text-blue-600 hover:underline mb-1">
                ← Kembali ke daftar tugas
              </button>
              <h2 className="text-lg font-semibold">{activeAssignment.title}</h2>
              {activeAssignment.instructions && <p className="text-xs text-slate-600 mt-1">{activeAssignment.instructions}</p>}
            </div>
            {activeAssignment.url && (
              <a href={activeAssignment.url} target="_blank" rel="noreferrer" className="btn text-xs">
                Buka Referensi Tugas ↗
              </a>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600 text-xs">
                <tr>
                  <th className="px-3 py-2">Siswa</th>
                  <th className="px-3 py-2">Status & Jawaban</th>
                  <th className="px-3 py-2 w-28">Nilai (0-100)</th>
                  <th className="px-3 py-2">Catatan Guru</th>
                  <th className="px-3 py-2 w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subData?.students.map((s) => {
                  const current = gradingScores[s.student_id] ?? { score: '', feedback: '' };
                  return (
                    <tr key={s.student_id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{s.student_name}</div>
                        <div className="text-xs text-slate-400">{s.nis}</div>
                      </td>
                      <td className="px-3 py-2">
                        {s.is_submitted ? (
                          <div className="space-y-1">
                            <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 font-medium">
                              Terkumpul {new Date(s.submitted_at!).toLocaleDateString('id-ID')}
                            </span>
                            <div>
                              <a href={s.url!} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                                Lihat Berkas Jawaban ↗
                              </a>
                            </div>
                            {s.note && <div className="text-xs italic text-slate-500">"{s.note}"</div>}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Belum mengumpulkan</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!s.is_submitted}
                          placeholder="0-100"
                          className="input py-1 text-sm disabled:bg-slate-100"
                          value={current.score}
                          onChange={(e) =>
                            setGradingScores((prev) => ({
                              ...prev,
                              [s.student_id]: { ...prev[s.student_id], score: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          disabled={!s.is_submitted}
                          placeholder="Umpan balik…"
                          className="input py-1 text-sm disabled:bg-slate-100"
                          value={current.feedback}
                          onChange={(e) =>
                            setGradingScores((prev) => ({
                              ...prev,
                              [s.student_id]: { ...prev[s.student_id], feedback: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          disabled={!s.is_submitted || current.score === '' || gradeStudent.isPending}
                          className="btn btn-primary py-1 px-2 text-xs"
                          onClick={() =>
                            gradeStudent.mutate({
                              studentId: s.student_id,
                              score: Number(current.score),
                              feedback: current.feedback,
                            })
                          }
                        >
                          Simpan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modal Tambah / Edit Materi */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4 my-8">
            <h2 className="text-lg font-bold text-[#162d6e]">
              {editingMaterial ? 'Ubah Materi Pembelajaran' : 'Bagikan Materi Baru'}
            </h2>
            <div>
              <label className="label">Judul Materi</label>
              <input className="input" placeholder="Bab 3: Hukum Newton" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} />
            </div>
            <DriveUploadBox
              label="File Materi / Tautan Pembelajaran"
              folderSubpath="Materi Pembelajaran"
              value={matUrl}
              onChange={(url, fileName) => {
                setMatUrl(url);
                if (!matTitle.trim() && fileName) {
                  setMatTitle(fileName.replace(/\.[^/.]+$/, ''));
                }
              }}
              helperText="Upload modul PDF, PPT, Word, atau gambar langsung ke Google Drive Anda (otomatis diset akses publik 'Siapa saja yang memiliki link')."
            />
            <div>
              <label className="label">Deskripsi / Catatan Singkat</label>
              <textarea className="input min-h-20" placeholder="Pelajari slide halaman 1-15 sebelum pertemuan..." value={matDesc} onChange={(e) => setMatDesc(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => { setShowMaterialModal(false); setEditingMaterial(null); }}>Batal</button>
              <button
                className="btn btn-primary"
                disabled={!matTitle.trim() || !matUrl.trim() || createMaterial.isPending || updateMaterial.isPending}
                onClick={() => (editingMaterial ? updateMaterial.mutate() : createMaterial.mutate())}
              >
                {editingMaterial
                  ? (updateMaterial.isPending ? 'Menyimpan…' : 'Simpan Perubahan')
                  : (createMaterial.isPending ? 'Membagikan…' : 'Bagikan Materi')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Tugas */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4 my-8">
            <h2 className="text-lg font-bold text-[#162d6e]">
              {editingAssignment ? 'Ubah Tugas & Tenggat Waktu' : 'Beri Tugas Baru'}
            </h2>
            <div>
              <label className="label">Judul Tugas</label>
              <input className="input" placeholder="Latihan Soal Gerak Lurus" value={asgTitle} onChange={(e) => setAsgTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Tenggat Waktu (Opsional / Perpanjang Deadline)</label>
              <input type="datetime-local" className="input" value={asgDueAt} onChange={(e) => setAsgDueAt(e.target.value)} />
            </div>
            <DriveUploadBox
              label="Lampiran File Soal / Lembar Kerja (Opsional)"
              folderSubpath="Soal & Tugas Guru"
              value={asgUrl}
              onChange={(url, fileName) => {
                setAsgUrl(url);
                if (!asgTitle.trim() && fileName) {
                  setAsgTitle(fileName.replace(/\.[^/.]+$/, ''));
                }
              }}
              helperText="Pilih file soal/lembar kerja dari perangkat Anda. File otomatis masuk ke Google Drive Anda & akses publik aktif tanpa perlu atur link manual."
            />
            <div>
              <label className="label">Instruksi Pengerjaan</label>
              <textarea className="input min-h-20" placeholder="Kerjakan soal terlampir lalu upload langsung file/foto jawaban Anda melalui tombol Kumpulkan Tugas..." value={asgInstructions} onChange={(e) => setAsgInstructions(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => { setShowAssignmentModal(false); setEditingAssignment(null); }}>Batal</button>
              <button
                className="btn btn-primary"
                disabled={!asgTitle.trim() || createAssignment.isPending || updateAssignment.isPending}
                onClick={() => (editingAssignment ? updateAssignment.mutate() : createAssignment.mutate())}
              >
                {editingAssignment
                  ? (updateAssignment.isPending ? 'Menyimpan…' : 'Simpan Perubahan')
                  : (createAssignment.isPending ? 'Menerbitkan…' : 'Simpan & Terbitkan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
