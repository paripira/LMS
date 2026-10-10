'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { today } from '@/lib/hooks';
import ReportsList from '@/components/ReportsList';
import AnnouncementBoard from '@/components/AnnouncementBoard';
import DriveUploadBox from '@/components/DriveUploadBox';

interface Child {
  id: string;
  name: string;
  nis: string;
  class_name: string | null;
  reports: { id: string; label: string }[];
}

interface Note {
  id: string;
  aspect: string;
  narrative: string;
  observed_on: string;
  author: string;
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

interface LeaveItem {
  id: string;
  kind: 'izin' | 'sakit';
  starts_on: string;
  ends_on: string;
  reason: string;
  attachment_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_name: string | null;
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

interface ChildDetail {
  student: { id: string; name: string; nis: string; nisn: string | null; class_name: string | null };
  attendance: {
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    total: number;
    pct: number;
    logs: { date: string; status: 'hadir' | 'izin' | 'sakit' | 'alpa'; note: string | null }[];
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
  assignments: {
    title: string;
    subject: string;
    due_at: string | null;
    submitted_at: string | null;
    score: number | null;
    feedback: string | null;
    is_submitted: boolean;
  }[];
  schedules?: ScheduleItem[];
  leaveRequests?: LeaveItem[];
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

export default function ParentPortal() {
  const qc = useQueryClient();
  const { data: children = [] } = useQuery({
    queryKey: ['children'],
    queryFn: () => api<Child[]>('/api/children'),
  });

  const [picked, setPicked] = useState<string>('');
  const [tab, setTab] = useState<
    'overview' | 'schedule' | 'grades' | 'assignments' | 'records' | 'reports' | 'announcements'
  >('overview');

  // Leave request form states
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveKind, setLeaveKind] = useState<'izin' | 'sakit'>('izin');
  const [startsOn, setStartsOn] = useState(today());
  const [endsOn, setEndsOn] = useState(today());
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [leaveMsg, setLeaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const child = children.find((c) => c.id === picked) ?? children[0];

  const { data: detail } = useQuery({
    queryKey: ['child-detail', child?.id],
    enabled: !!child,
    queryFn: () => api<ChildDetail>(`/api/children/${child!.id}`),
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['devnotes', child?.id],
    enabled: !!child,
    queryFn: () => api<Note[]>(`/api/dev-notes?studentId=${child!.id}`),
  });

  const submitLeave = useMutation({
    mutationFn: () =>
      api('/api/leave-requests', {
        method: 'POST',
        json: {
          studentId: child!.id,
          kind: leaveKind,
          startsOn,
          endsOn,
          reason,
          attachmentUrl,
        },
      }),
    onSuccess: () => {
      setReason('');
      setAttachmentUrl('');
      setShowLeaveForm(false);
      setLeaveMsg({
        ok: true,
        text: 'Pengajuan izin/sakit berhasil dikirim ke Wali Kelas / Guru.',
      });
      qc.invalidateQueries({ queryKey: ['child-detail', child?.id] });
    },
    onError: (e) => setLeaveMsg({ ok: false, text: (e as Error).message }),
  });

  if (children.length === 0) {
    return (
      <p className="text-slate-400">
        Belum ada data anak yang terhubung dengan akun Anda. Hubungi pihak sekolah.
      </p>
    );
  }

  const schedules = detail?.schedules ?? [];
  const leaveRequests = detail?.leaveRequests ?? [];
  const studentRecords = detail?.studentRecords ?? [];
  const totalPoints = studentRecords.reduce((acc, r) => acc + (r.points || 0), 0);

  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#162d6e]">
          Portal Orang Tua
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Pantau perkembangan akademik, jadwal pelajaran, kehadiran, pengajuan izin, serta prestasi ananda di Sekolah Teramia.
        </p>
      </div>

      {/* Multi-child switcher */}
      {children.length > 1 && (
        <div role="tablist" aria-label="Pilih anak" className="flex gap-2 overflow-x-auto pb-1">
          {children.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === child.id}
              onClick={() => setPicked(c.id)}
              className={`btn whitespace-nowrap ${
                c.id === child.id ? 'btn-primary ring-2 ring-[#f5b800]' : ''
              }`}
            >
              {c.name} ({c.class_name ?? '—'})
            </button>
          ))}
        </div>
      )}

      {/* Child Header Card (Sekolah Teramia Banner) */}
      <div className="teramia-banner p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f5b800]/50 bg-[#0f2154]/60 px-2.5 py-0.5 text-[10px] font-semibold text-[#f5b800] mb-1.5">
            <span>★</span>
            <span>Data Siswa Aktif</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white">{child.name}</div>
          <div className="text-xs text-slate-200 mt-0.5">
            NIS: {child.nis} · Kelas {child.class_name ?? '—'}
          </div>
        </div>
        {detail && (
          <div className="flex flex-wrap gap-2.5">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 text-right">
              <div className="text-[11px] text-slate-200">Tingkat Kehadiran</div>
              <div className="text-2xl font-extrabold text-[#f5b800]">{detail.attendance.pct}%</div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 text-right">
              <div className="text-[11px] text-slate-200">Poin Kesiswaan</div>
              <div className="text-2xl font-extrabold text-white">
                {totalPoints > 0 ? `+${totalPoints}` : totalPoints}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-1.5 border-b border-slate-200 overflow-x-auto bg-white px-2 pt-2 rounded-t-2xl shadow-2xs">
        {[
          { key: 'overview', label: 'Kehadiran & Izin' },
          { key: 'schedule', label: 'Jadwal Pelajaran' },
          { key: 'grades', label: 'Nilai & Ujian' },
          { key: 'assignments', label: 'Tugas' },
          { key: 'records', label: 'Prestasi & BK' },
          { key: 'reports', label: 'e-Rapor & Catatan' },
          { key: 'announcements', label: 'Pengumuman' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`border-b-3 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition ${
              tab === t.key
                ? 'border-[#f5b800] text-[#162d6e]'
                : 'border-transparent text-slate-500 hover:text-[#162d6e]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Kehadiran & Pengajuan Izin */}
      {tab === 'overview' && detail && (
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

          {/* Pengajuan Izin / Sakit Online */}
          <div className="card space-y-3 border-l-4 border-[#162d6e]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-[#162d6e]">Pengajuan Izin / Sakit Online</h3>
                <p className="text-xs text-slate-500">
                  Kirim permohonan izin atau surat keterangan sakit langsung kepada Wali Kelas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveForm((v) => !v);
                  setLeaveMsg(null);
                }}
                className="btn btn-primary text-xs"
              >
                {showLeaveForm ? 'Tutup Formulir' : '+ Ajukan Izin / Sakit'}
              </button>
            </div>

            {leaveMsg && (
              <p
                className={`rounded-lg p-2.5 text-xs font-medium ${
                  leaveMsg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {leaveMsg.text}
              </p>
            )}

            {showLeaveForm && (
              <div className="rounded-xl bg-slate-50 p-3.5 space-y-3 border border-slate-200">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label">Jenis Keterangan</label>
                    <select
                      className="input"
                      value={leaveKind}
                      onChange={(e) => setLeaveKind(e.target.value as 'izin' | 'sakit')}
                    >
                      <option value="izin">Izin Keperluan Keluarga / Lainnya</option>
                      <option value="sakit">Sakit</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Dari Tanggal</label>
                    <input
                      type="date"
                      className="input"
                      value={startsOn}
                      onChange={(e) => {
                        setStartsOn(e.target.value);
                        if (endsOn < e.target.value) setEndsOn(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label className="label">Sampai Tanggal</label>
                    <input
                      type="date"
                      className="input"
                      value={endsOn}
                      min={startsOn}
                      onChange={(e) => setEndsOn(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label">Alasan / Keterangan Lengkap</label>
                    <input
                      className="input"
                      placeholder="Contoh: Demam tinggi dan sedang istirahat sesuai anjuran dokter"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <DriveUploadBox
                    label="Lampiran Foto Surat Dokter / Surat Izin (Opsional)"
                    folderSubpath="Surat Izin & Sakit Siswa"
                    value={attachmentUrl}
                    onChange={(url) => setAttachmentUrl(url)}
                    helperText="Pilih foto atau PDF surat keterangan langsung dari HP Anda. File otomatis tersimpan ke Google Drive Anda dan akses link untuk Guru langsung aktif!"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn" onClick={() => setShowLeaveForm(false)}>
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={submitLeave.isPending || reason.trim().length < 3}
                    onClick={() => submitLeave.mutate()}
                  >
                    {submitLeave.isPending ? 'Mengirim…' : 'Kirim Pengajuan'}
                  </button>
                </div>
              </div>
            )}

            {leaveRequests.length > 0 && (
              <div className="divide-y divide-slate-100 text-xs pt-1">
                {leaveRequests.map((lr) => (
                  <div key={lr.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <div>
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold uppercase ${
                          lr.kind === 'sakit'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {lr.kind}
                      </span>{' '}
                      <span className="font-semibold text-slate-800">
                        {lr.starts_on === lr.ends_on
                          ? lr.starts_on
                          : `${lr.starts_on} s/d ${lr.ends_on}`}
                      </span>{' '}
                      <span className="text-slate-600">— {lr.reason}</span>
                    </div>
                    <div>
                      {lr.status === 'pending' && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800">
                          Menunggu Konfirmasi Guru
                        </span>
                      )}
                      {lr.status === 'approved' && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                          ✓ Disetujui {lr.reviewer_name ? `(${lr.reviewer_name})` : ''}
                        </span>
                      )}
                      {lr.status === 'rejected' && (
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-800">
                          Ditolak
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-slate-900">Riwayat Presensi Mata Pelajaran Terbaru</h3>
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
                    {(l as { subject?: string | null }).subject && (
                      <span className="ml-2 rounded bg-[#162d6e]/10 px-2 py-0.5 text-xs font-bold text-[#162d6e]">
                        {(l as { subject?: string | null }).subject}
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

      {/* Tab: Jadwal Pelajaran */}
      {tab === 'schedule' && detail && (
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

      {/* Tab: Nilai & Ujian */}
      {tab === 'grades' && detail && (
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
                        Belum ada nilai yang diinput.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-slate-900">Hasil Ujian Online (CBT)</h3>
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

      {/* Tab: Tugas */}
      {tab === 'assignments' && detail && (
        <section className="space-y-3">
          {detail.assignments.map((a, i) => (
            <div key={i} className="card space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-slate-900">{a.title}</div>
                <div>
                  {a.score != null ? (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      Nilai: {a.score}
                    </span>
                  ) : a.is_submitted ? (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Sudah Dikumpulkan
                    </span>
                  ) : (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Belum Dikumpulkan
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {a.subject} ·{' '}
                {a.due_at
                  ? `Tenggat: ${new Date(a.due_at).toLocaleDateString('id-ID')}`
                  : 'Tanpa tenggat'}
              </div>
              {a.feedback && (
                <div className="mt-2 rounded bg-slate-50 p-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Catatan Guru: </span>
                  {a.feedback}
                </div>
              )}
            </div>
          ))}
          {detail.assignments.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">Tidak ada tugas saat ini.</p>
          )}
        </section>
      )}

      {/* Tab: Prestasi, Kedisiplinan & BK */}
      {tab === 'records' && detail && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card border-t-4 border-emerald-500 p-3.5">
              <div className="text-xs font-semibold text-slate-500">Catatan Prestasi</div>
              <div className="mt-1 text-2xl font-extrabold text-emerald-700">
                {studentRecords.filter((r) => r.kind === 'prestasi').length}
              </div>
            </div>
            <div className="card border-t-4 border-rose-500 p-3.5">
              <div className="text-xs font-semibold text-slate-500">Pembinaan Kedisiplinan</div>
              <div className="mt-1 text-2xl font-extrabold text-rose-700">
                {studentRecords.filter((r) => r.kind === 'kedisiplinan').length}
              </div>
            </div>
            <div className="card border-t-4 border-[#162d6e] p-3.5">
              <div className="text-xs font-semibold text-slate-500">Bimbingan Konseling (BK)</div>
              <div className="mt-1 text-2xl font-extrabold text-[#162d6e]">
                {studentRecords.filter((r) => r.kind === 'konseling').length}
              </div>
            </div>
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-slate-900">
              Riwayat Prestasi, Kedisiplinan & Layanan Konseling
            </h3>
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
                    <div className="text-[11px] text-slate-400">Oleh: {r.author_name}</div>
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
          </div>
        </section>
      )}

      {/* Tab: e-Rapor & Catatan */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <section className="card space-y-2">
            <h2 className="font-semibold text-slate-900">e-Rapor Resmi</h2>
            <ReportsList reports={child.reports} />
          </section>

          <section className="card space-y-3">
            <h2 className="font-semibold text-slate-900">Catatan Perkembangan Siswa</h2>
            {notes.map((n) => (
              <div
                key={n.id}
                className="text-sm border-t border-slate-100 pt-2 first:border-0 first:pt-0"
              >
                <div className="text-xs text-slate-400">
                  {n.observed_on} · {n.author}
                </div>
                <p className="text-slate-800 mt-1">{n.narrative}</p>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada catatan dari guru.</p>
            )}
          </section>
        </div>
      )}

      {/* Tab: Pengumuman */}
      {tab === 'announcements' && (
        <section>
          <AnnouncementBoard />
        </section>
      )}
    </div>
  );
}
