'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups, useMe } from '@/lib/hooks';

export interface ScheduleItem {
  id: string;
  class_id: string;
  teaching_assignment_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  class_name: string;
  jenjang?: string;
  subject_name: string;
  subject_code: string;
  teacher_name: string;
}

const DAYS = [
  { v: 1, name: 'Senin' },
  { v: 2, name: 'Selasa' },
  { v: 3, name: 'Rabu' },
  { v: 4, name: 'Kamis' },
  { v: 5, name: 'Jumat' },
  { v: 6, name: 'Sabtu' },
];

export default function SchedulePanel() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const { data: lk } = useLookups();
  const isAdmin = me?.role === 'admin';

  const [jenjangFilter, setJenjangFilter] = useState<'' | 'SD' | 'SMP'>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  // For guru: 0 means "Semua Hari" so they immediately see their full weekly teaching schedule
  const [teacherDayFilter, setTeacherDayFilter] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states (Admin)
  const [formClass, setFormClass] = useState('');
  const [formAssignment, setFormAssignment] = useState('');
  const [formDay, setFormDay] = useState<number>(1);
  const [formStart, setFormStart] = useState('07:30');
  const [formEnd, setFormEnd] = useState('09:00');
  const [formRoom, setFormRoom] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const visibleClasses = (lk?.classes ?? []).filter(
    (c) => !jenjangFilter || c.jenjang === jenjangFilter,
  );
  const activeClass =
    visibleClasses.some((c) => c.id === selectedClass)
      ? selectedClass
      : (visibleClasses[0]?.id ?? '');

  // Admin query: per class & day
  const { data: adminSchedules = [], refetch: refetchAdmin } = useQuery({
    queryKey: ['schedules', 'admin', activeClass, selectedDay],
    enabled: isAdmin && !!activeClass,
    queryFn: () => api<ScheduleItem[]>(`/api/schedules?classId=${activeClass}&day=${selectedDay}`),
  });

  // Guru query: only the logged-in teacher's own teaching schedule across all their classes
  const { data: teacherSchedules = [] } = useQuery({
    queryKey: ['schedules', 'guru-self'],
    enabled: !!me && !isAdmin,
    queryFn: () => api<ScheduleItem[]>('/api/schedules'),
  });

  const addSchedule = useMutation({
    mutationFn: () =>
      api('/api/schedules', {
        method: 'POST',
        json: {
          classId: formClass,
          teachingAssignmentId: formAssignment,
          dayOfWeek: formDay,
          startTime: formStart,
          endTime: formEnd,
          room: formRoom || undefined,
        },
      }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Jadwal pelajaran berhasil ditambahkan.' });
      setShowAddModal(false);
      refetchAdmin();
      qc.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => api(`/api/schedules?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setMsg({ ok: true, text: 'Jadwal berhasil dihapus.' });
      refetchAdmin();
    },
    onError: (e) => setMsg({ ok: false, text: (e as Error).message }),
  });

  // Filter assignments matching formClass
  const filteredAssignments = lk?.assignments.filter((a) => !formClass || a.class_id === formClass) ?? [];

  // Teacher view: only their own teaching schedules
  if (me && !isAdmin) {
    const visibleDays =
      teacherDayFilter === 0 ? DAYS : DAYS.filter((d) => d.v === teacherDayFilter);

    return (
      <div className="w-full space-y-5">
        <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">Jadwal Mengajar Saya</h1>
            <p className="text-xs text-slate-200 mt-0.5">
              Daftar jam, mata pelajaran, dan kelas yang Anda ajar pada semester aktif.
            </p>
          </div>
          <div className="rounded-xl bg-white/15 px-3.5 py-2 text-xs font-bold text-white">
            Total: {teacherSchedules.length} Sesi Mengajar / Minggu
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Filter Hari Mengajar
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTeacherDayFilter(0)}
                className={`btn py-1.5 px-3 text-xs ${teacherDayFilter === 0 ? 'btn-primary' : ''}`}
              >
                Semua Hari
              </button>
              {DAYS.map((d) => (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => setTeacherDayFilter(d.v)}
                  className={`btn py-1.5 px-3 text-xs ${teacherDayFilter === d.v ? 'btn-primary' : ''}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {teacherSchedules.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Belum ada jadwal mengajar yang terdaftar untuk akun Anda pada semester ini.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleDays.map((d) => {
                const items = teacherSchedules.filter((s) => s.day_of_week === d.v);
                if (teacherDayFilter === 0 && items.length === 0) return null;
                return (
                  <div
                    key={d.v}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-sm font-extrabold text-[#162d6e]">{d.name}</span>
                      <span className="rounded-full bg-[#162d6e]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#162d6e]">
                        {items.length} Jam Pelajaran
                      </span>
                    </div>
                    {items.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400">
                        Tidak ada jadwal mengajar pada hari {d.name}.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-200/60">
                        {items.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-28 shrink-0 rounded-lg bg-[#162d6e] px-2 py-1.5 text-center font-mono text-xs font-bold text-white">
                                {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">
                                  {s.subject_name}
                                </div>
                                <div className="text-xs font-medium text-slate-600">
                                  Kelas <span className="font-bold text-[#162d6e]">{s.class_name}</span>
                                  {s.room ? ` · Ruang: ${s.room}` : ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">Jadwal Pelajaran</h1>
          <p className="text-xs text-slate-200 mt-0.5">Susunan jam dan hari mengajar per kelas dengan deteksi otomatis bentrok guru/ruang.</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-gold"
            onClick={() => {
              setFormClass(activeClass);
              setShowAddModal(true);
              setMsg(null);
            }}
          >
            + Tambah Jadwal
          </button>
        )}
      </div>

      {msg && (
        <p role="status" className={`rounded-lg p-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {msg.text}
        </p>
      )}

      {/* Class Selector & Days (Admin) */}
      <div className="card space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="label">Filter Jenjang</label>
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {[
                  { k: '', label: 'Semua' },
                  { k: 'SD', label: 'Unit SD' },
                  { k: 'SMP', label: 'Unit SMP' },
                ].map((j) => (
                  <button
                    key={j.k}
                    type="button"
                    onClick={() => setJenjangFilter(j.k as typeof jenjangFilter)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      jenjangFilter === j.k ? 'bg-[#162d6e] text-white' : 'text-slate-600 hover:text-[#162d6e]'
                    }`}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-52">
              <label className="label">Pilih Kelas</label>
              <select
                className="input"
                value={activeClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setMsg(null);
                }}
              >
                {visibleClasses.map((c) => (
                  <option key={c.id} value={c.id}>[{c.jenjang}] {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {DAYS.map((d) => (
              <button
                key={d.v}
                onClick={() => setSelectedDay(d.v)}
                className={`btn py-1.5 px-3 text-xs whitespace-nowrap ${selectedDay === d.v ? 'btn-primary' : ''}`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        <div className="divide-y divide-slate-100">
          {adminSchedules.map((s) => (
            <div key={s.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-28 font-mono text-sm font-semibold text-blue-700 bg-blue-50 rounded px-2 py-1 text-center">
                  {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{s.subject_name}</div>
                  <div className="text-xs text-slate-500">
                    Guru: {s.teacher_name} {s.room && `· Ruang: ${s.room}`}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => confirm('Hapus slot jadwal ini?') && deleteSchedule.mutate(s.id)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}

          {adminSchedules.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">
              Tidak ada jadwal pelajaran pada hari {DAYS.find((d) => d.v === selectedDay)?.name}.
            </p>
          )}
        </div>
      </div>

      {/* Modal Tambah Jadwal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Tambah Jadwal Pelajaran</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Kelas</label>
                <select
                  className="input"
                  value={formClass}
                  onChange={(e) => {
                    setFormClass(e.target.value);
                    setFormAssignment('');
                  }}
                >
                  {lk?.classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Hari</label>
                <select className="input" value={formDay} onChange={(e) => setFormDay(Number(e.target.value))}>
                  {DAYS.map((d) => (
                    <option key={d.v} value={d.v}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Mata Pelajaran & Guru Pengampu</label>
              <select
                className="input"
                value={formAssignment}
                onChange={(e) => setFormAssignment(e.target.value)}
              >
                <option value="">— Pilih Penugasan —</option>
                {filteredAssignments.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Jam Mulai (HH:MM)</label>
                <input
                  type="time"
                  className="input"
                  value={formStart}
                  onChange={(e) => setFormStart(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Jam Selesai (HH:MM)</label>
                <input
                  type="time"
                  className="input"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Ruang Kelas / Lab (Opsional)</label>
              <input
                className="input"
                placeholder="R. 7A / Lab Komputer"
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button className="btn" onClick={() => setShowAddModal(false)}>Batal</button>
              <button
                className="btn btn-primary"
                disabled={!formClass || !formAssignment || addSchedule.isPending}
                onClick={() => addSchedule.mutate()}
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
