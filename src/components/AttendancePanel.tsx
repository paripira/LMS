'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups, today } from '@/lib/hooks';
import { exportRows } from '@/lib/import/parse';

const STATUS = [
  { v: 'hadir', label: 'Hadir', on: 'bg-emerald-600 text-white' },
  { v: 'izin', label: 'Izin', on: 'bg-sky-600 text-white' },
  { v: 'sakit', label: 'Sakit', on: 'bg-amber-500 text-white' },
  { v: 'alpa', label: 'Alpa', on: 'bg-rose-600 text-white' },
] as const;
type Status = (typeof STATUS)[number]['v'];
interface Row { id: string; nis: string; name: string; status: Status | null }

interface LeaveReq {
  id: string;
  student_id: string;
  student_name: string;
  nis: string;
  class_id: string | null;
  class_name: string | null;
  kind: 'izin' | 'sakit';
  starts_on: string;
  ends_on: string;
  reason: string;
  attachment_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requester_name: string | null;
  reviewer_name: string | null;
}

interface JournalRow {
  id: string;
  teaching_assignment_id: string;
  journal_date: string;
  topic: string;
  method: string | null;
  student_activity: string | null;
  present_count: number;
  absent_count: number;
  class_name: string;
  subject_name: string;
  teacher_name: string;
}

export default function AttendancePanel() {
  const qc = useQueryClient();
  const { data: lk } = useLookups();
  const [section, setSection] = useState<'attendance' | 'journal' | 'leave'>('attendance');
  const [jenjangFilter, setJenjangFilter] = useState<'' | 'SD' | 'SMP'>('');
  const [classId, setClassId] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [date, setDate] = useState(today());
  const [month, setMonth] = useState(today().slice(0, 7));
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Journal form states
  const [topic, setTopic] = useState('');
  const [method, setMethod] = useState('Ceramah & Diskusi');
  const [studentActivity, setStudentActivity] = useState('');

  const filteredClasses = (lk?.classes ?? []).filter(
    (c) => !jenjangFilter || c.jenjang === jenjangFilter,
  );
  const filteredAssignments = (lk?.assignments ?? []).filter(
    (a) => !jenjangFilter || a.jenjang === jenjangFilter,
  );

  useEffect(() => {
    if (filteredClasses.length && !filteredClasses.some((c) => c.id === classId)) {
      setClassId(filteredClasses[0].id);
    }
    if (filteredAssignments.length && !filteredAssignments.some((a) => a.id === assignmentId)) {
      setAssignmentId(filteredAssignments[0].id);
    }
  }, [filteredClasses, filteredAssignments, classId, assignmentId]);

  const selectedAssignment = lk?.assignments.find((a) => a.id === assignmentId);
  const activeClassId = selectedAssignment?.class_id ?? classId;

  const key = ['attendance', 'subject', assignmentId, date];
  const { data } = useQuery({
    queryKey: key,
    enabled: !!assignmentId,
    queryFn: () =>
      api<{ students: Row[] }>(
        `/api/attendance?mode=subject&assignmentId=${assignmentId}&date=${date}`,
      ),
  });

  // Leave requests for active class
  const { data: leaveReqs = [] } = useQuery({
    queryKey: ['leave-requests', activeClassId],
    enabled: !!activeClassId,
    queryFn: () => api<LeaveReq[]>(`/api/leave-requests?classId=${activeClassId}`),
  });

  // Teaching journals
  const { data: journals = [] } = useQuery({
    queryKey: ['journals', assignmentId, month],
    enabled: section === 'journal',
    queryFn: () =>
      api<JournalRow[]>(
        `/api/journals?${assignmentId ? `assignmentId=${assignmentId}&` : ''}month=${month}`,
      ),
  });

  // Teacher dashboard quick summary
  const { data: dash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () =>
      api<{
        role: string;
        pendingGrading?: number;
        activeExams?: { id: string; title: string; class_name: string }[];
        todayMarked?: number;
      }>('/api/dashboard'),
  });

  // Local marks give instant (optimistic) feedback; the server is only hit on "Simpan".
  useEffect(() => {
    if (data) {
      setMarks(
        Object.fromEntries(
          data.students.filter((s) => s.status).map((s) => [s.id, s.status as Status]),
        ),
      );
    }
  }, [data]);

  const students = data?.students ?? [];
  const unmarked = students.filter((s) => !marks[s.id]).length;
  const pendingLeaves = leaveReqs.filter((l) => l.status === 'pending');
  const todayPendingLeaves = pendingLeaves.filter(
    (l) => l.starts_on <= date && l.ends_on >= date,
  );

  const save = useMutation({
    mutationFn: () =>
      api('/api/attendance', {
        method: 'PUT',
        json: {
          mode: 'subject',
          date,
          assignmentId,
          records: Object.entries(marks).map(([studentId, status]) => ({ studentId, status })),
        },
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Presensi mata pelajaran berhasil disimpan.' });
      qc.setQueryData(key, (old: { students: Row[] } | undefined) =>
        old && { students: old.students.map((s) => ({ ...s, status: marks[s.id] ?? s.status })) },
      );
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const reviewLeave = useMutation({
    mutationFn: (payload: { id: string; status: 'approved' | 'rejected' }) =>
      api('/api/leave-requests', { method: 'PATCH', json: payload }),
    onSuccess: (_, vars) => {
      setMsg({
        ok: true,
        text:
          vars.status === 'approved'
            ? 'Pengajuan izin/sakit disetujui dan otomatis tercatat pada presensi seluruh mata pelajaran.'
            : 'Pengajuan izin/sakit ditolak.',
      });
      qc.invalidateQueries({ queryKey: ['leave-requests'] });
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const createJournal = useMutation({
    mutationFn: () =>
      api('/api/journals', {
        method: 'POST',
        json: {
          teachingAssignmentId: assignmentId,
          journalDate: date,
          topic,
          method,
          studentActivity,
        },
      }),
    onSuccess: () => {
      setTopic('');
      setStudentActivity('');
      setMsg({ ok: true, text: 'Jurnal mengajar berhasil disimpan.' });
      qc.invalidateQueries({ queryKey: ['journals'] });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const deleteJournal = useMutation({
    mutationFn: (id: string) => api(`/api/journals?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journals'] }),
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  async function exportMonthly() {
    if (!assignmentId) return;
    try {
      const rows = await api<
        { nis: string; full_name: string; hadir: number; izin: number; sakit: number; alpa: number }[]
      >(`/api/attendance/monthly?assignmentId=${assignmentId}&month=${month}`);
      const withPct = rows.map((r) => {
        const total = r.hadir + r.izin + r.sakit + r.alpa;
        return { ...r, pct: total ? Math.round((r.hadir / total) * 1000) / 10 : '' };
      });
      await exportRows(
        withPct,
        [
          { header: 'NIS', key: 'nis' },
          { header: 'Nama', key: 'full_name' },
          { header: 'Hadir', key: 'hadir' },
          { header: 'Izin', key: 'izin' },
          { header: 'Sakit', key: 'sakit' },
          { header: 'Alpa', key: 'alpa' },
          { header: '% Hadir', key: 'pct' },
        ],
        `rekap-presensi-${month}.xlsx`,
      );
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  }

  async function exportJournals() {
    if (!journals.length) return;
    await exportRows(
      journals.map((j) => ({ ...j })),
      [
        { header: 'Tanggal', key: 'journal_date' },
        { header: 'Kelas', key: 'class_name' },
        { header: 'Mata Pelajaran', key: 'subject_name' },
        { header: 'Guru', key: 'teacher_name' },
        { header: 'Pokok Bahasan / Materi', key: 'topic' },
        { header: 'Metode', key: 'method' },
        { header: 'Aktivitas / Catatan Kelas', key: 'student_activity' },
        { header: 'Siswa Hadir', key: 'present_count' },
        { header: 'Tidak Hadir', key: 'absent_count' },
      ],
      `jurnal-mengajar-${month}.xlsx`,
    );
  }

  if (lk && !lk.semester)
    return (
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        Belum ada semester aktif. Hubungi Admin sekolah.
      </p>
    );

  return (
    <div className="w-full space-y-4">
      {dash?.role === 'guru' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card border-t-4 border-[#f5b800] p-3.5">
            <div className="text-xs font-semibold text-slate-500">Tugas Perlu Dinilai</div>
            <div className="mt-1 text-2xl font-extrabold text-[#162d6e]">{dash.pendingGrading ?? 0}</div>
          </div>
          <div className="card border-t-4 border-[#162d6e] p-3.5">
            <div className="text-xs font-semibold text-slate-500">Ujian Aktif</div>
            <div className="mt-1 text-2xl font-extrabold text-[#162d6e]">{dash.activeExams?.length ?? 0}</div>
          </div>
          <div className="card border-t-4 border-emerald-500 p-3.5">
            <div className="text-xs font-semibold text-slate-500">Mapel Diabsen Hari Ini</div>
            <div className="mt-1 text-2xl font-extrabold text-emerald-700">{dash.todayMarked ?? 0}</div>
          </div>
        </div>
      )}

      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">Presensi Mata Pelajaran, Izin Siswa & Jurnal KBM</h1>
          <p className="text-xs text-slate-200 mt-0.5">
            Catat kehadiran siswa per mata pelajaran sesuai kelas yang diajar, verifikasi surat izin/sakit, dan isi jurnal mengajar.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-white/10 p-1">
          <button
            type="button"
            onClick={() => { setSection('attendance'); setMsg(null); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              section === 'attendance' ? 'bg-[#f5b800] text-[#102152]' : 'text-white hover:bg-white/10'
            }`}
          >
            Daftar Hadir
          </button>
          <button
            type="button"
            onClick={() => { setSection('journal'); setMsg(null); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              section === 'journal' ? 'bg-[#f5b800] text-[#102152]' : 'text-white hover:bg-white/10'
            }`}
          >
            Jurnal Mengajar (KBM)
          </button>
          <button
            type="button"
            onClick={() => { setSection('leave'); setMsg(null); }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              section === 'leave' ? 'bg-[#f5b800] text-[#102152]' : 'text-white hover:bg-white/10'
            }`}
          >
            Pengajuan Izin/Sakit
            {pendingLeaves.length > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                {pendingLeaves.length}
              </span>
            )}
          </button>
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

      {section === 'attendance' && (
        <>
          <div className={`card grid gap-3 ${dash?.role === 'admin' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            {dash?.role === 'admin' && (
              <div>
                <label htmlFor="jenjang-att" className="label">Filter Jenjang</label>
                <select
                  id="jenjang-att"
                  className="input"
                  value={jenjangFilter}
                  onChange={(e) => setJenjangFilter(e.target.value as '' | 'SD' | 'SMP')}
                >
                  <option value="">Semua Jenjang (SD & SMP)</option>
                  <option value="SD">Unit SD</option>
                  <option value="SMP">Unit SMP</option>
                </select>
              </div>
            )}
            <div>
              <label htmlFor="asg" className="label">Mata Pelajaran & Kelas</label>
              <select
                id="asg"
                className="input"
                value={assignmentId}
                onChange={(e) => {
                  setAssignmentId(e.target.value);
                  setMsg(null);
                }}
              >
                {filteredAssignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {dash?.role === 'admin' && a.jenjang ? `[${a.jenjang}] ` : ''}{a.label}
                  </option>
                ))}
                {filteredAssignments.length === 0 && (
                  <option value="">Belum ada penugasan mata pelajaran</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="dt" className="label">Tanggal Pertemuan</label>
              <input id="dt" type="date" className="input" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {todayPendingLeaves.length > 0 && (
            <div className="card border-l-4 border-[#f5b800] bg-amber-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  Pengajuan Izin / Sakit Menunggu Persetujuan ({todayPendingLeaves.length})
                </div>
                <button
                  type="button"
                  onClick={() => setSection('leave')}
                  className="text-xs font-semibold text-[#162d6e] underline"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="divide-y divide-amber-200/70">
                {todayPendingLeaves.map((lr) => (
                  <div key={lr.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{lr.student_name}</span> ({lr.nis}) ·{' '}
                      <span className="rounded bg-amber-200 px-1.5 py-0.5 font-bold uppercase text-amber-900">
                        {lr.kind}
                      </span>{' '}
                      <span className="text-slate-600">
                        ({lr.starts_on} s/d {lr.ends_on}): &ldquo;{lr.reason}&rdquo;
                      </span>
                      {lr.attachment_url && (
                        <a
                          href={lr.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 font-semibold text-[#162d6e] underline"
                        >
                          Lihat Surat
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={reviewLeave.isPending}
                        onClick={() => reviewLeave.mutate({ id: lr.id, status: 'approved' })}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        Setujui & Tandai
                      </button>
                      <button
                        type="button"
                        disabled={reviewLeave.isPending}
                        onClick={() => reviewLeave.mutate({ id: lr.id, status: 'rejected' })}
                        className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn"
              onClick={() =>
                setMarks(Object.fromEntries(students.map((s) => [s.id, 'hadir' as Status])))
              }
            >
              Semua Hadir
            </button>
            <span className="text-sm text-slate-500">
              {students.length - unmarked} dari {students.length} siswa ditandai
            </span>
          </div>

          <div className="card divide-y divide-slate-100 p-0 overflow-hidden">
            {students.map((s) => (
              <div
                key={s.id}
                data-testid={`att-row-${s.nis}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.nis}</div>
                </div>
                <div className="grid grid-cols-4 sm:flex gap-1.5">
                  {STATUS.map((st) => (
                    <button
                      key={st.v}
                      aria-label={`${s.name} - ${st.label}`}
                      aria-pressed={marks[s.id] === st.v}
                      onClick={() => {
                        setMarks((m) => ({ ...m, [s.id]: st.v }));
                        setMsg(null);
                      }}
                      className={`h-9 sm:w-14 rounded-lg border text-xs font-medium transition ${
                        marks[s.id] === st.v
                          ? st.on
                          : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-400">Tidak ada siswa.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="btn btn-primary"
              disabled={save.isPending || Object.keys(marks).length === 0}
              onClick={() => save.mutate()}
            >
              {save.isPending ? 'Menyimpan…' : 'Simpan Presensi'}
            </button>
            {unmarked > 0 && students.length > 0 && (
              <span className="text-xs text-amber-700">
                {unmarked} siswa belum ditandai (tidak ikut disimpan).
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <input
                aria-label="Bulan rekap"
                type="month"
                className="input w-40"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
              <button className="btn" onClick={exportMonthly}>
                Ekspor rekap bulanan
              </button>
            </div>
          </div>
        </>
      )}

      {section === 'journal' && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <h2 className="text-sm font-bold text-[#162d6e]">
              Isi Berita Acara / Jurnal Mengajar Harian
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Mata Pelajaran & Kelas</label>
                <select
                  className="input"
                  value={assignmentId}
                  onChange={(e) => setAssignmentId(e.target.value)}
                >
                  {lk?.assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tanggal Pertemuan</label>
                <input
                  type="date"
                  className="input"
                  value={date}
                  max={today()}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Metode Pembelajaran</label>
                <input
                  className="input"
                  placeholder="Misal: Diskusi Kelompok / Praktikum"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Pokok Bahasan / Materi yang Diajarkan</label>
                <input
                  className="input"
                  placeholder="Contoh: Bab 3 - Persamaan Linear Satu Variabel"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Catatan Aktivitas / Kejadian di Kelas (Opsional)</label>
                <input
                  className="input"
                  placeholder="Contoh: Siswa aktif berdiskusi, 2 siswa izin UKS"
                  value={studentActivity}
                  onChange={(e) => setStudentActivity(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-500">
                Jumlah siswa hadir & tidak hadir akan dihitung otomatis dari presensi pada tanggal tersebut.
              </span>
              <button
                type="button"
                className="btn btn-primary"
                disabled={createJournal.isPending || !assignmentId || topic.trim().length < 3}
                onClick={() => createJournal.mutate()}
              >
                {createJournal.isPending ? 'Menyimpan…' : 'Simpan Jurnal Mengajar'}
              </button>
            </div>
          </div>

          <div className="card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#162d6e]">Riwayat Jurnal Mengajar</h2>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  className="input w-40"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
                <button
                  type="button"
                  className="btn"
                  disabled={!journals.length}
                  onClick={exportJournals}
                >
                  Unduh Excel Jurnal
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Kelas & Mapel</th>
                    <th className="p-2.5">Pokok Bahasan</th>
                    <th className="p-2.5">Metode & Catatan</th>
                    <th className="p-2.5 text-center">Kehadiran</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {journals.map((j) => (
                    <tr key={j.id}>
                      <td className="p-2.5 whitespace-nowrap font-medium text-slate-700">
                        {j.journal_date}
                      </td>
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-800">{j.class_name}</div>
                        <div className="text-xs text-slate-500">{j.subject_name}</div>
                      </td>
                      <td className="p-2.5 font-medium text-slate-800">{j.topic}</td>
                      <td className="p-2.5 text-xs text-slate-600">
                        {j.method && <div className="font-semibold text-slate-700">{j.method}</div>}
                        {j.student_activity && <div>{j.student_activity}</div>}
                      </td>
                      <td className="p-2.5 text-center text-xs">
                        <span className="rounded bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                          Hadir: {j.present_count}
                        </span>{' '}
                        <span className="rounded bg-rose-50 px-2 py-0.5 font-bold text-rose-700">
                          Absen: {j.absent_count}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => deleteJournal.mutate(j.id)}
                          className="text-xs font-semibold text-rose-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                  {journals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        Belum ada jurnal mengajar pada bulan ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {section === 'leave' && (
        <div className="card space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#162d6e]">
                Daftar Pengajuan Izin & Sakit Siswa
              </h2>
              <p className="text-xs text-slate-500">
                Saat disetujui, status kehadiran siswa pada tanggal terkait otomatis tercatat sebagai Izin/Sakit.
              </p>
            </div>
            <select
              className="input w-48"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              {lk?.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Kelas {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-2.5">Siswa</th>
                  <th className="p-2.5">Jenis</th>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Keterangan & Surat</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveReqs.map((lr) => (
                  <tr key={lr.id}>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-800">{lr.student_name}</div>
                      <div className="text-xs text-slate-400">
                        NIS {lr.nis} {lr.requester_name ? `· Diajukan: ${lr.requester_name}` : ''}
                      </div>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                          lr.kind === 'sakit'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {lr.kind}
                      </span>
                    </td>
                    <td className="p-2.5 whitespace-nowrap text-xs font-medium text-slate-700">
                      {lr.starts_on === lr.ends_on
                        ? lr.starts_on
                        : `${lr.starts_on} s/d ${lr.ends_on}`}
                    </td>
                    <td className="p-2.5 text-xs text-slate-700">
                      <div>{lr.reason}</div>
                      {lr.attachment_url && (
                        <a
                          href={lr.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 inline-block font-semibold text-[#162d6e] underline"
                        >
                          Buka Lampiran Surat
                        </a>
                      )}
                    </td>
                    <td className="p-2.5 text-xs">
                      {lr.status === 'pending' && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800">
                          Menunggu
                        </span>
                      )}
                      {lr.status === 'approved' && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                          Disetujui
                        </span>
                      )}
                      {lr.status === 'rejected' && (
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-800">
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      {lr.status === 'pending' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            disabled={reviewLeave.isPending}
                            onClick={() => reviewLeave.mutate({ id: lr.id, status: 'approved' })}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            Setujui
                          </button>
                          <button
                            type="button"
                            disabled={reviewLeave.isPending}
                            onClick={() => reviewLeave.mutate({ id: lr.id, status: 'rejected' })}
                            className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {lr.reviewer_name ? `Oleh ${lr.reviewer_name}` : 'Selesai'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {leaveReqs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Belum ada pengajuan izin atau sakit untuk kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
