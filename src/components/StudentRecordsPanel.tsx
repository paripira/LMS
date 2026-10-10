'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups, today } from '@/lib/hooks';
import { exportRows } from '@/lib/import/parse';

interface StudentRecordRow {
  id: string;
  student_id: string;
  student_name: string;
  nis: string;
  class_id: string | null;
  class_name: string | null;
  kind: 'prestasi' | 'kedisiplinan' | 'konseling';
  category: string;
  title: string;
  description: string | null;
  points: number;
  follow_up: string | null;
  recorded_on: string;
  author_name: string;
}

const CATEGORIES: Record<'prestasi' | 'kedisiplinan' | 'konseling', string[]> = {
  prestasi: ['Akademik', 'Olahraga & Seni', 'Kepemimpinan / OSIS', 'Keagamaan & Karakter', 'Lomba Eksternal'],
  kedisiplinan: ['Keterlambatan', 'Seragam & Kerapian', 'Ketertiban Kelas', 'Tugas / Akademik', 'Sikap & Etika'],
  konseling: ['Bimbingan Belajar', 'Konseling Pribadi / Sosial', 'Minat & Bakat / Karir', 'Mediasi / Pembinaan'],
};

export default function StudentRecordsPanel() {
  const qc = useQueryClient();
  const { data: lk } = useLookups();
  const [classId, setClassId] = useState('');
  const [filterKind, setFilterKind] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Form fields
  const [studentId, setStudentId] = useState('');
  const [kind, setKind] = useState<'prestasi' | 'kedisiplinan' | 'konseling'>('prestasi');
  const [category, setCategory] = useState(CATEGORIES.prestasi[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(10);
  const [followUp, setFollowUp] = useState('');
  const [recordedOn, setRecordedOn] = useState(today());

  useEffect(() => {
    if (lk && !classId && lk.classes[0]) setClassId(lk.classes[0].id);
  }, [lk, classId]);

  const { data: classData } = useQuery({
    queryKey: ['class-students', classId],
    enabled: !!classId,
    queryFn: () =>
      api<{ rows: { student_id: string; nis: string; full_name: string }[] }>(
        `/api/reports/semester-attendance?classId=${classId}`,
      ),
  });

  const students = (classData?.rows ?? []).map((r) => ({
    id: r.student_id,
    nis: r.nis,
    name: r.full_name,
  }));

  useEffect(() => {
    if (students.length > 0 && !students.some((s) => s.id === studentId)) {
      setStudentId(students[0].id);
    }
  }, [students, studentId]);

  const { data: records = [] } = useQuery({
    queryKey: ['student-records', classId, filterKind],
    queryFn: () => {
      const p = new URLSearchParams();
      if (classId) p.set('classId', classId);
      if (filterKind) p.set('kind', filterKind);
      return api<StudentRecordRow[]>(`/api/student-records?${p.toString()}`);
    },
  });

  const createRec = useMutation({
    mutationFn: () =>
      api('/api/student-records', {
        method: 'POST',
        json: {
          studentId,
          kind,
          category,
          title,
          description,
          points: kind === 'konseling' ? 0 : Number(points),
          followUp,
          recordedOn,
        },
      }),
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setFollowUp('');
      setShowForm(false);
      setMsg({ ok: true, text: 'Catatan kesiswaan berhasil disimpan dan dinotifikasikan ke orang tua.' });
      qc.invalidateQueries({ queryKey: ['student-records'] });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const deleteRec = useMutation({
    mutationFn: (id: string) => api(`/api/student-records?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student-records'] }),
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const prestasiCount = records.filter((r) => r.kind === 'prestasi').length;
  const disiplinCount = records.filter((r) => r.kind === 'kedisiplinan').length;
  const konselingCount = records.filter((r) => r.kind === 'konseling').length;

  async function handleExport() {
    if (!records.length) return;
    await exportRows(
      records.map((r) => ({ ...r })),
      [
        { header: 'Tanggal', key: 'recorded_on' },
        { header: 'NIS', key: 'nis' },
        { header: 'Nama Siswa', key: 'student_name' },
        { header: 'Kelas', key: 'class_name' },
        { header: 'Jenis', key: 'kind' },
        { header: 'Kategori', key: 'category' },
        { header: 'Judul Catatan', key: 'title' },
        { header: 'Keterangan', key: 'description' },
        { header: 'Poin', key: 'points' },
        { header: 'Tindak Lanjut', key: 'follow_up' },
        { header: 'Pencatat', key: 'author_name' },
      ],
      `catatan-kesiswaan-bk-${today()}.xlsx`,
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">
            Kesiswaan, Prestasi & Bimbingan Konseling (BK)
          </h1>
          <p className="text-xs text-slate-200 mt-0.5">
            Catat prestasi akademik/non-akademik, poin kedisiplinan, dan layanan konseling siswa secara terpadu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={!records.length}
            className="btn bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
          >
            Unduh Excel
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm((v) => !v);
              setMsg(null);
            }}
            className="btn btn-gold text-xs"
          >
            {showForm ? 'Tutup Formulir' : '+ Tambah Catatan Siswa'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card border-t-4 border-emerald-500 p-3.5">
          <div className="text-xs font-semibold text-slate-500">Catatan Prestasi & Penghargaan</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-700">{prestasiCount}</div>
        </div>
        <div className="card border-t-4 border-rose-500 p-3.5">
          <div className="text-xs font-semibold text-slate-500">Catatan Pembinaan Kedisiplinan</div>
          <div className="mt-1 text-2xl font-extrabold text-rose-700">{disiplinCount}</div>
        </div>
        <div className="card border-t-4 border-[#162d6e] p-3.5">
          <div className="text-xs font-semibold text-slate-500">Sesi Bimbingan Konseling (BK)</div>
          <div className="mt-1 text-2xl font-extrabold text-[#162d6e]">{konselingCount}</div>
        </div>
      </div>

      {msg && (
        <p
          role="status"
          className={`rounded-xl border p-3 text-sm font-medium ${
            msg.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {msg.text}
        </p>
      )}

      {showForm && (
        <div className="card border-2 border-[#162d6e]/15 space-y-3">
          <h2 className="text-sm font-bold text-[#162d6e]">Input Catatan Prestasi / Kedisiplinan / BK</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="label">Kelas</label>
              <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
                {lk?.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Pilih Siswa</label>
              <select className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nis})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Jenis Catatan</label>
              <select
                className="input"
                value={kind}
                onChange={(e) => {
                  const k = e.target.value as 'prestasi' | 'kedisiplinan' | 'konseling';
                  setKind(k);
                  setCategory(CATEGORIES[k][0]);
                  setPoints(k === 'prestasi' ? 15 : k === 'kedisiplinan' ? -10 : 0);
                }}
              >
                <option value="prestasi">Prestasi (+ Poin)</option>
                <option value="kedisiplinan">Kedisiplinan (- Poin)</option>
                <option value="konseling">Bimbingan Konseling (BK)</option>
              </select>
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES[kind].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label">Judul Prestasi / Catatan Kejadian</label>
              <input
                className="input"
                placeholder="Contoh: Juara 1 Olimpiade Matematika Tingkat Kota / Terlambat hadir 15 menit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Poin</label>
                <input
                  type="number"
                  className="input"
                  disabled={kind === 'konseling'}
                  value={kind === 'konseling' ? 0 : points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="label">Tanggal</label>
                <input
                  type="date"
                  className="input"
                  value={recordedOn}
                  max={today()}
                  onChange={(e) => setRecordedOn(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Uraian / Keterangan Detail (Opsional)</label>
              <textarea
                rows={2}
                className="input"
                placeholder="Kronologi singkat, penyelenggara lomba, atau detail sesi konseling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Tindak Lanjut / Pembinaan / Apresiasi (Opsional)</label>
              <textarea
                rows={2}
                className="input"
                placeholder="Contoh: Diberikan piagam penghargaan saat upacara / Pembinaan wali kelas..."
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={() => setShowForm(false)}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={createRec.isPending || !studentId || title.trim().length < 3}
              onClick={() => createRec.mutate()}
            >
              {createRec.isPending ? 'Menyimpan…' : 'Simpan Catatan'}
            </button>
          </div>
        </div>
      )}

      <div className="card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="input w-48"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Semua Kelas (SD & SMP)</option>
              {lk?.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.jenjang}] Kelas {c.name}
                </option>
              ))}
            </select>
            <select
              className="input w-48"
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value)}
            >
              <option value="">Semua Jenis Catatan</option>
              <option value="prestasi">Prestasi</option>
              <option value="kedisiplinan">Kedisiplinan</option>
              <option value="konseling">Bimbingan Konseling (BK)</option>
            </select>
          </div>
          <span className="text-xs text-slate-500">Menampilkan {records.length} catatan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="p-2.5">Tanggal</th>
                <th className="p-2.5">Siswa & Kelas</th>
                <th className="p-2.5">Jenis & Kategori</th>
                <th className="p-2.5">Catatan & Tindak Lanjut</th>
                <th className="p-2.5 text-center">Poin</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="p-2.5 whitespace-nowrap text-xs font-medium text-slate-600">
                    {r.recorded_on}
                  </td>
                  <td className="p-2.5">
                    <div className="font-semibold text-slate-800">{r.student_name}</div>
                    <div className="text-xs text-slate-400">
                      NIS {r.nis} {r.class_name ? `· Kelas ${r.class_name}` : ''}
                    </div>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                        r.kind === 'prestasi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.kind === 'kedisiplinan'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {r.kind}
                    </span>
                    <div className="mt-0.5 text-xs text-slate-500">{r.category}</div>
                  </td>
                  <td className="p-2.5">
                    <div className="font-semibold text-slate-800">{r.title}</div>
                    {r.description && <div className="text-xs text-slate-600">{r.description}</div>}
                    {r.follow_up && (
                      <div className="mt-0.5 text-xs text-[#162d6e]">
                        <span className="font-semibold">Tindak lanjut:</span> {r.follow_up}
                      </div>
                    )}
                    <div className="mt-0.5 text-[11px] text-slate-400">Dicatat oleh {r.author_name}</div>
                  </td>
                  <td className="p-2.5 text-center">
                    {r.points !== 0 ? (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                          r.points > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {r.points > 0 ? `+${r.points}` : r.points}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => deleteRec.mutate(r.id)}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Belum ada catatan prestasi, kedisiplinan, atau konseling.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
