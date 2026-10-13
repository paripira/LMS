'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import ReportsList from '@/components/ReportsList';
import StudentAssignmentsPanel from '@/components/StudentAssignmentsPanel';
import StudentMaterialsPanel from '@/components/StudentMaterialsPanel';

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  opens_at: string;
  closes_at: string;
  session_status: 'in_progress' | 'submitted' | null;
  is_open: boolean;
}

interface Child {
  id: string;
  name: string;
  class_name: string | null;
  reports: { id: string; label: string }[];
}

interface ScheduleItem {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject_name: string;
  subject_code: string;
  teacher_name: string;
}

interface StudentRecordItem {
  id: string;
  kind: 'prestasi' | 'kedisiplinan' | 'konseling';
  category: string;
  title: string;
  description: string | null;
  points: number;
  follow_up: string | null;
  recorded_on: string;
  author_name: string;
}

interface StudentDetail {
  attendance: {
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    pct: number;
    logs: { date: string; status: 'hadir' | 'izin' | 'sakit' | 'alpa'; note: string | null; subject?: string | null }[];
  };
  grades: {
    subject: string;
    formative: number | null;
    sas: number | null;
    final: number | null;
    predicate: string | null;
    narrative: string | null;
    is_locked: boolean;
  }[];
  cbtResults: {
    title: string;
    subject: string;
    score: number | null;
    submitted_at: string | null;
    status: string;
  }[];
  schedules?: ScheduleItem[];
  studentRecords?: StudentRecordItem[];
}

const ATT_BADGE: Record<string, string> = {
  hadir: 'bg-emerald-100 text-emerald-800',
  izin: 'bg-sky-100 text-sky-800',
  sakit: 'bg-amber-100 text-amber-800',
  alpa: 'bg-rose-100 text-rose-800',
};

const DAYS: Record<number, string> = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
};

const when = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export default function StudentHome() {
  const [activeTab, setActiveTab] = useState<
    'exams' | 'grades' | 'schedule' | 'attendance' | 'assignments' | 'materials' | 'records' | 'reports'
  >('exams');

  const { data: exams = [] } = useQuery({
    queryKey: ['siswa', 'exams'],
    queryFn: () => api<Exam[]>('/api/siswa/exams'),
  });

  const { data: me = [] } = useQuery({
    queryKey: ['children'],
    queryFn: () => api<Child[]>('/api/children'),
  });

  const studentInfo = me[0];

  const { data: detail } = useQuery({
    queryKey: ['child-detail', studentInfo?.id],
    enabled: !!studentInfo?.id,
    queryFn: () => api<StudentDetail>(`/api/children/${studentInfo!.id}`),
  });

  const schedules = detail?.schedules ?? [];
  const studentRecords = detail?.studentRecords ?? [];
  const totalPoints = studentRecords.reduce((acc, r) => acc + (r.points || 0), 0);

  return (
    <div className="w-full space-y-5">
      {/* Sekolah Teramia Hero Card */}
      <div className="teramia-banner p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f5b800]/50 bg-[#0f2154]/60 px-3 py-0.5 text-[11px] font-semibold text-[#f5b800] mb-2">
            <span>★</span>
            <span>Portal Akademik Siswa · Sekolah Teramia</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Beranda Siswa
            {studentInfo &&
              ` · ${studentInfo.name}${studentInfo.class_name ? ` (${studentInfo.class_name})` : ''}`}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-200">
            Akses ujian online (CBT), jadwal pelajaran, tugas sekolah, materi pembelajaran, dan dokumen e-Rapor resmi Anda.
          </p>
        </div>
        {detail && (
          <div className="flex flex-wrap gap-2.5">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2 text-right">
              <div className="text-[11px] text-slate-200">Kehadiran</div>
              <div className="text-xl font-extrabold text-[#f5b800]">{detail.attendance.pct}%</div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2 text-right">
              <div className="text-[11px] text-slate-200">Poin Kesiswaan</div>
              <div className="text-xl font-extrabold text-white">
                {totalPoints > 0 ? `+${totalPoints}` : totalPoints}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Nav with Gold Active Underline */}
      <div className="flex gap-1.5 border-b border-slate-200 overflow-x-auto bg-white px-2 pt-2 rounded-t-2xl shadow-2xs">
        <button
          onClick={() => setActiveTab('exams')}
          className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'exams'
              ? 'border-[#f5b800] text-[#162d6e]'
              : 'border-transparent text-slate-500 hover:text-[#162d6e]'
          }`}
        >
          Ujian (CBT){' '}
          {exams.filter((e) => e.is_open && e.session_status !== 'submitted').length > 0 && (
            <span className="ml-1 rounded-full bg-[#f5b800] px-1.5 py-0.5 text-[10px] font-extrabold text-[#162d6e]">
              {exams.filter((e) => e.is_open && e.session_status !== 'submitted').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'grades'
              ? 'border-[#f5b800] text-[#162d6e]'
              : 'border-transparent text-slate-500 hover:text-[#162d6e]'
          }`}
        >
          Nilai & Ujian
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'schedule'
              ? 'border-[#f5b800] text-[#162d6e]'
              : 'border-transparent text-slate-500 hover:text-[#162d6e]'
          }`}
        >
          Jadwal Pelajaran
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'attendance'
              ? 'border-[#f5b800] text-[#162d6e]'
              : 'border-transparent text-slate-500 hover:text-[#162d6e]'
          }`}
        >
          Kehadiran
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'assignments'
              ? 'border-[#f5b800] text-[#162d6e]'
              : 'border-transparent text-slate-500 hover:text-[#162d6e]'
          }`}
        >
          Tugas Sekolah
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'materials'
              ? 'border-[#f5b800] text-[#162d6e]'
              : 'border-transparent text-slate-500 hover:text-[#162d6e]'
          }`}
        >
          Materi Pembelajaran
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'records'
              ? 'border-[#f5b800] text-[#162d6e]'
              : 'border-transparent text-slate-500 hover:text-[#162d6e]'
          }`}
        >
          Prestasi & Kesiswaan
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'reports'
              ? 'border-[#f5b800] text-[#162d6e]'
              : 'border-transparent text-slate-500 hover:text-[#162d6e]'
          }`}
        >
          e-Rapor
        </button>
      </div>

      {/* Tab: Ujian */}
      {activeTab === 'exams' && (
        <section className="space-y-3">
          {exams.map((e) => (
            <div key={e.id} className="card flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium text-slate-900">{e.title}</div>
                <div className="text-xs text-slate-500">
                  {e.subject} · {e.duration_minutes} menit · dibuka {when(e.opens_at)} –{' '}
                  {when(e.closes_at)}
                </div>
              </div>
              <div>
                {e.session_status === 'submitted' ? (
                  <span className="text-sm font-medium text-emerald-700">✓ Sudah dikumpulkan</span>
                ) : e.is_open ? (
                  <Link href={`/siswa/ujian/${e.id}`} className="btn btn-primary">
                    {e.session_status === 'in_progress' ? 'Lanjutkan Pengerjaan' : 'Mulai Ujian'}
                  </Link>
                ) : (
                  <span className="text-sm text-slate-400">Belum / sudah tidak dibuka</span>
                )}
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">Tidak ada ujian saat ini.</p>
          )}
        </section>
      )}

      {/* Tab: Nilai & Hasil Ujian */}
      {activeTab === 'grades' && detail && (
        <section className="space-y-4">
          <div className="card space-y-3">
            <h3 className="font-semibold text-slate-900">Nilai Mata Pelajaran (Semester Aktif)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600 text-xs">
                  <tr>
                    <th className="px-3 py-2">Mata Pelajaran</th>
                    <th className="px-3 py-2 text-center">Formatif</th>
                    <th className="px-3 py-2 text-center">SAS / PAS</th>
                    <th className="px-3 py-2 text-center">Nilai Akhir</th>
                    <th className="px-3 py-2 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.grades.map((g, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-medium">{g.subject}</td>
                      <td className="px-3 py-2 text-center">
                        {g.formative != null ? Math.round(g.formative) : '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {g.sas != null ? Math.round(g.sas) : '—'}
                      </td>
                      <td className="px-3 py-2 text-center font-bold">
                        {g.final != null ? Math.round(g.final) : '—'}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-blue-700">
                        {g.predicate ?? '—'}
                      </td>
                    </tr>
                  ))}
                  {detail.grades.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-xs text-slate-400">
                        Belum ada nilai yang diinput guru semester ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-slate-900">Riwayat Ujian Online (CBT)</h3>
            <div className="divide-y divide-slate-100 text-sm">
              {detail.cbtResults.map((r, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{r.title}</div>
                    <div className="text-xs text-slate-500">
                      {r.subject} ·{' '}
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleDateString('id-ID')
                        : 'Belum selesai'}
                    </div>
                  </div>
                  <div>
                    {r.score != null ? (
                      <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        {r.score}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {r.status === 'submitted' ? 'Menunggu pengumuman' : 'Sedang berjalan'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {detail.cbtResults.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400">
                  Belum ada riwayat ujian CBT.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tab: Jadwal Pelajaran */}
      {activeTab === 'schedule' && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((dayNum) => {
            const items = schedules.filter((s) => s.day_of_week === dayNum);
            return (
              <div key={dayNum} className="card space-y-2.5 border-t-4 border-[#162d6e]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-[#162d6e]">{DAYS[dayNum]}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {items.length} Mapel
                  </span>
                </div>
                {items.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {items.map((it) => (
                      <div key={it.id} className="py-2 space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{it.subject_name}</span>
                          <span className="rounded bg-[#f5b800]/20 px-1.5 py-0.5 text-[11px] text-[#102152]">
                            {it.start_time.slice(0, 5)} – {it.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          Guru: {it.teacher_name}
                          {it.room ? ` · Ruang ${it.room}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-slate-400">
                    Tidak ada jadwal pelajaran.
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Tab: Kehadiran */}
      {activeTab === 'attendance' && detail && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="card bg-emerald-50 border border-emerald-100 p-3">
              <div className="text-xs text-emerald-700 font-medium">Hadir</div>
              <div className="text-xl font-bold text-emerald-800">{detail.attendance.hadir}</div>
            </div>
            <div className="card bg-sky-50 border border-sky-100 p-3">
              <div className="text-xs text-sky-700 font-medium">Izin</div>
              <div className="text-xl font-bold text-sky-800">{detail.attendance.izin}</div>
            </div>
            <div className="card bg-amber-50 border border-amber-100 p-3">
              <div className="text-xs text-amber-700 font-medium">Sakit</div>
              <div className="text-xl font-bold text-amber-800">{detail.attendance.sakit}</div>
            </div>
            <div className="card bg-rose-50 border border-rose-100 p-3">
              <div className="text-xs text-rose-700 font-medium">Alpa</div>
              <div className="text-xl font-bold text-rose-800">{detail.attendance.alpa}</div>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-slate-900">Riwayat Presensi Pelajaran</h3>
            <div className="divide-y divide-slate-100 text-sm">
              {detail.attendance.logs.map((l, i) => (
                <div key={i} className="py-2 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-medium text-slate-800">
                      {new Date(l.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    {l.subject && (
                      <span className="ml-2 rounded bg-[#162d6e]/10 px-2 py-0.5 text-xs font-bold text-[#162d6e]">
                        {l.subject}
                      </span>
                    )}
                    {l.note && <span className="ml-2 text-xs text-slate-500 italic">({l.note})</span>}
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${ATT_BADGE[l.status]}`}
                  >
                    {l.status}
                  </span>
                </div>
              ))}
              {detail.attendance.logs.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400">
                  Belum ada catatan presensi semester ini.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tab: Tugas */}
      {activeTab === 'assignments' && (
        <section>
          <StudentAssignmentsPanel />
        </section>
      )}

      {/* Tab: Materi */}
      {activeTab === 'materials' && (
        <section>
          <StudentMaterialsPanel />
        </section>
      )}

      {/* Tab: Prestasi & Kesiswaan */}
      {activeTab === 'records' && (
        <section className="card space-y-3">
          <h2 className="font-semibold text-slate-900">
            Catatan Prestasi, Kedisiplinan & Layanan Konseling (BK)
          </h2>
          <div className="divide-y divide-slate-100 text-sm">
            {studentRecords.map((r) => (
              <div key={r.id} className="py-3 flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${
                        r.kind === 'prestasi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.kind === 'kedisiplinan'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {r.kind}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{r.category}</span>
                    <span className="text-xs text-slate-400">· {r.recorded_on}</span>
                  </div>
                  <div className="font-bold text-slate-800">{r.title}</div>
                  {r.description && <p className="text-xs text-slate-600">{r.description}</p>}
                  {r.follow_up && (
                    <p className="text-xs text-[#162d6e]">
                      <span className="font-semibold">Tindak lanjut:</span> {r.follow_up}
                    </p>
                  )}
                </div>
                {r.points !== 0 && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                      r.points > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {r.points > 0 ? `+${r.points} Poin` : `${r.points} Poin`}
                  </span>
                )}
              </div>
            ))}
            {studentRecords.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-400">
                Belum ada catatan prestasi, kedisiplinan, atau layanan BK.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Tab: e-Rapor */}
      {activeTab === 'reports' && (
        <section className="card space-y-3">
          <h2 className="font-semibold text-slate-900">Daftar e-Rapor Resmi</h2>
          <ReportsList reports={studentInfo?.reports ?? []} />
        </section>
      )}
    </div>
  );
}
