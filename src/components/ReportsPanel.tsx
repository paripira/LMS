'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups, useSchool } from '@/lib/hooks';
import { exportRows } from '@/lib/import/parse';

interface LeggerData {
  class: { id: string; name: string; jenjang: string; homeroom_name: string | null; year_name: string };
  semester: { id: string; kind: string };
  subjects: { id: string; code: string; name: string }[];
  rows: {
    studentId: string;
    nis: string;
    name: string;
    scores: Record<string, number | null>;
    total: number | null;
    average: number | null;
    rank: number | string;
  }[];
}

interface SemesterAttData {
  class: { id: string; name: string };
  semester: { id: string; kind: string; year_name: string };
  rows: {
    student_id: string;
    nis: string;
    full_name: string;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    total: number;
    pct: number;
  }[];
}

interface LoginCard {
  id: string;
  nis: string;
  name: string;
  class_name: string;
  username: string;
  must_change_password: boolean;
}

export default function ReportsPanel() {
  const { data: lk } = useLookups();
  const { data: school } = useSchool();
  const [tab, setTab] = useState<'legger' | 'attendance' | 'blank_sheet' | 'cards'>('legger');
  const [jenjangFilter, setJenjangFilter] = useState<'' | 'TK' | 'SD' | 'SMP'>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [blankMonth, setBlankMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const filteredClasses = (lk?.classes ?? []).filter(
    (c) => !jenjangFilter || c.jenjang === jenjangFilter,
  );
  const activeClass =
    filteredClasses.some((c) => c.id === selectedClass)
      ? selectedClass
      : (filteredClasses[0]?.id ?? '');
  const activeClassObj = lk?.classes.find((c) => c.id === activeClass);
  const activeJenjang = (activeClassObj?.jenjang as 'TK' | 'SD' | 'SMP' | undefined) ?? 'SD';
  const unitProfile = school?.units?.[activeJenjang];
  const unitSchoolName = unitProfile?.name || school?.name || 'SEKOLAH TERAMIA';
  const unitPrincipalName = unitProfile?.principalName || school?.principalName || '................................';
  const unitPrincipalNip =
    unitProfile?.principalNip !== undefined && unitProfile?.principalNip !== null
      ? unitProfile.principalNip
      : school?.principalNip;

  // Legger query
  const { data: legger } = useQuery({
    queryKey: ['report-legger', activeClass],
    enabled: !!activeClass && tab === 'legger',
    queryFn: () => api<LeggerData>(`/api/reports/legger?classId=${activeClass}`),
  });

  // Semester attendance query
  const { data: semAtt } = useQuery({
    queryKey: ['report-sem-attendance', activeClass],
    enabled: !!activeClass && (tab === 'attendance' || tab === 'blank_sheet'),
    queryFn: () => api<SemesterAttData>(`/api/reports/semester-attendance?classId=${activeClass}`),
  });

  // Login cards query
  const { data: cards = [] } = useQuery({
    queryKey: ['report-cards', activeClass],
    enabled: !!activeClass && tab === 'cards',
    queryFn: () => api<LoginCard[]>(`/api/admin/cards?role=siswa&classId=${activeClass}`),
  });

  // Export Legger to Excel
  async function exportLeggerExcel() {
    if (!legger) return;
    const columns: { header: string; key: string }[] = [
      { header: 'No', key: 'no' },
      { header: 'NIS', key: 'nis' },
      { header: 'Nama Siswa', key: 'name' },
    ];
    legger.subjects.forEach((sub) => {
      columns.push({ header: sub.name, key: sub.id });
    });
    columns.push({ header: 'Total Nilai', key: 'total' });
    columns.push({ header: 'Rerata', key: 'average' });
    columns.push({ header: 'Peringkat', key: 'rank' });

    const exportData = legger.rows.map((r, i) => {
      const rowObj: Record<string, unknown> = {
        no: i + 1,
        nis: r.nis,
        name: r.name,
        total: r.total ?? '',
        average: r.average ?? '',
        rank: r.rank,
      };
      legger.subjects.forEach((sub) => {
        rowObj[sub.id] = r.scores[sub.id] ?? '';
      });
      return rowObj;
    });

    await exportRows(exportData, columns, `Legger-Nilai-Kelas-${legger.class.name}.xlsx`);
  }

  // Export Semester Attendance to Excel
  async function exportAttendanceExcel() {
    if (!semAtt) return;
    const columns = [
      { header: 'No', key: 'no' },
      { header: 'NIS', key: 'nis' },
      { header: 'Nama Siswa', key: 'name' },
      { header: 'Hadir', key: 'hadir' },
      { header: 'Izin', key: 'izin' },
      { header: 'Sakit', key: 'sakit' },
      { header: 'Alpa', key: 'alpa' },
      { header: '% Kehadiran', key: 'pct' },
    ];
    const exportData = semAtt.rows.map((r, i) => ({
      no: i + 1,
      nis: r.nis,
      name: r.full_name,
      hadir: r.hadir,
      izin: r.izin,
      sakit: r.sakit,
      alpa: r.alpa,
      pct: `${r.pct}%`,
    }));
    await exportRows(exportData, columns, `Rekap-Presensi-Semester-Kelas-${semAtt.class.name}.xlsx`);
  }

  return (
    <div className="w-full space-y-5">
      <div className="teramia-banner p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white">Laporan &amp; Cetak Dokumen (TK, SD &amp; SMP)</h1>
          <p className="text-xs text-slate-200 mt-0.5">Rekap legger nilai, rekapitulasi presensi semester, format absensi cetak, dan kartu peserta ujian per unit jenjang.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#f5b800]">Filter Jenjang</label>
            <div className="flex rounded-xl bg-white/10 p-1">
              {[
                { k: '', label: 'Semua' },
                { k: 'TK', label: 'Unit TK' },
                { k: 'SD', label: 'Unit SD' },
                { k: 'SMP', label: 'Unit SMP' },
              ].map((j) => (
                <button
                  key={j.k}
                  type="button"
                  onClick={() => setJenjangFilter(j.k as typeof jenjangFilter)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    jenjangFilter === j.k ? 'bg-[#f5b800] text-[#102152]' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-48">
            <label className="mb-1 block text-xs font-semibold text-[#f5b800]">Pilih Kelas</label>
            <select
              className="input"
              value={activeClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {filteredClasses.map((c) => (
                <option key={c.id} value={c.id}>[{c.jenjang}] {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto print:hidden">
        {[
          { key: 'legger', label: 'Legger Nilai Per Kelas' },
          { key: 'attendance', label: 'Rekap Presensi Semester' },
          { key: 'blank_sheet', label: 'Lembar Absensi Cetak (Fisik)' },
          { key: 'cards', label: 'Kartu Peserta Ujian / Login' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap ${
              tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Legger Nilai */}
      {tab === 'legger' && (
        <section className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 print:hidden">
            <h2 className="font-semibold text-slate-900">
              Legger Nilai: Kelas {legger?.class.name} ({legger?.class.year_name})
            </h2>
            <div className="flex gap-2">
              <button className="btn" onClick={() => window.print()}>Cetak Legger</button>
              <button className="btn btn-primary" onClick={exportLeggerExcel} disabled={!legger?.rows.length}>
                Unduh Excel (.xlsx)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200 p-4">
            <div className="mb-4 text-center">
              <h3 className="font-bold text-base text-slate-900 uppercase">LEGER NILAI HASIL BELAJAR PESERTA DIDIK</h3>
              <p className="text-xs text-slate-600">
                {unitSchoolName} · Kelas {legger?.class.name} ({activeJenjang}) · Tahun Ajaran {legger?.class.year_name}
              </p>
              {legger?.class.homeroom_name && (
                <p className="text-xs text-slate-500">Wali Kelas: {legger.class.homeroom_name}</p>
              )}
            </div>

            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-300 p-1.5 w-8">No</th>
                  <th className="border border-slate-300 p-1.5 w-16">NIS</th>
                  <th className="border border-slate-300 p-1.5 text-left min-w-36">Nama Siswa</th>
                  {legger?.subjects.map((sub) => (
                    <th key={sub.id} className="border border-slate-300 p-1.5 min-w-16">
                      {sub.code || sub.name}
                    </th>
                  ))}
                  <th className="border border-slate-300 p-1.5 w-14 bg-slate-200">Total</th>
                  <th className="border border-slate-300 p-1.5 w-14 bg-slate-200">Rerata</th>
                  <th className="border border-slate-300 p-1.5 w-12 bg-slate-200">Rank</th>
                </tr>
              </thead>
              <tbody>
                {legger?.rows.map((r, i) => (
                  <tr key={r.studentId} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-1.5 text-center">{i + 1}</td>
                    <td className="border border-slate-300 p-1.5 text-center">{r.nis}</td>
                    <td className="border border-slate-300 p-1.5 font-medium">{r.name}</td>
                    {legger.subjects.map((sub) => (
                      <td key={sub.id} className="border border-slate-300 p-1.5 text-center">
                        {r.scores[sub.id] != null ? Math.round(r.scores[sub.id]!) : '—'}
                      </td>
                    ))}
                    <td className="border border-slate-300 p-1.5 text-center font-bold bg-slate-50">{r.total ?? '—'}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold text-blue-700 bg-slate-50">{r.average ?? '—'}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold bg-slate-50">{r.rank}</td>
                  </tr>
                ))}
                {legger?.rows.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-slate-400">Belum ada siswa di kelas ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab: Rekap Presensi Semester */}
      {tab === 'attendance' && (
        <section className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 print:hidden">
            <h2 className="font-semibold text-slate-900">
              Rekapitulasi Presensi Semester: Kelas {semAtt?.class.name}
            </h2>
            <div className="flex gap-2">
              <button className="btn" onClick={() => window.print()}>Cetak Laporan</button>
              <button className="btn btn-primary" onClick={exportAttendanceExcel} disabled={!semAtt?.rows.length}>
                Unduh Excel (.xlsx)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200 p-4">
            <div className="mb-4 text-center">
              <h3 className="font-bold text-base text-slate-900 uppercase">REKAPITULASI PRESENSI PESERTA DIDIK</h3>
              <p className="text-xs text-slate-600">{unitSchoolName} · Kelas {semAtt?.class.name} ({activeJenjang}) · {semAtt?.semester.year_name}</p>
            </div>

            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-300 p-2 w-8">No</th>
                  <th className="border border-slate-300 p-2 w-20">NIS</th>
                  <th className="border border-slate-300 p-2 text-left">Nama Siswa</th>
                  <th className="border border-slate-300 p-2 w-16 text-emerald-800">Hadir</th>
                  <th className="border border-slate-300 p-2 w-16 text-sky-800">Izin</th>
                  <th className="border border-slate-300 p-2 w-16 text-amber-800">Sakit</th>
                  <th className="border border-slate-300 p-2 w-16 text-rose-800">Alpa</th>
                  <th className="border border-slate-300 p-2 w-24 bg-slate-200">% Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {semAtt?.rows.map((r, i) => (
                  <tr key={r.student_id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                    <td className="border border-slate-300 p-2 text-center">{r.nis}</td>
                    <td className="border border-slate-300 p-2 font-medium">{r.full_name}</td>
                    <td className="border border-slate-300 p-2 text-center font-semibold text-emerald-700">{r.hadir}</td>
                    <td className="border border-slate-300 p-2 text-center font-semibold text-sky-700">{r.izin}</td>
                    <td className="border border-slate-300 p-2 text-center font-semibold text-amber-700">{r.sakit}</td>
                    <td className="border border-slate-300 p-2 text-center font-semibold text-rose-700">{r.alpa}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold bg-slate-50">{r.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab: Lembar Absensi Cetak (Blank Sheet) */}
      {tab === 'blank_sheet' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-slate-900">Format Lembar Presensi Manual (Kertas)</h2>
              <input
                type="month"
                className="input w-36 text-xs py-1"
                value={blankMonth}
                onChange={(e) => setBlankMonth(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => window.print()}>
              🖨 Cetak Lembar Presensi (A4)
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl ring-1 ring-slate-200 print:ring-0 print:p-0">
            <div className="text-center border-b pb-3 mb-3">
              <h3 className="font-bold text-sm tracking-wide uppercase">{unitSchoolName}</h3>
              <p className="font-semibold text-xs uppercase">DAFTAR HADIR PESERTA DIDIK — BULAN {blankMonth}</p>
              <p className="text-[10px] text-slate-500">Kelas: {semAtt?.class.name} ({activeJenjang})</p>
            </div>

            <table className="w-full text-[10px] border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-400 p-1 w-6" rowSpan={2}>No</th>
                  <th className="border border-slate-400 p-1 w-14" rowSpan={2}>NIS</th>
                  <th className="border border-slate-400 p-1 text-left min-w-32" rowSpan={2}>Nama Lengkap</th>
                  <th className="border border-slate-400 p-0.5" colSpan={31}>Tanggal</th>
                  <th className="border border-slate-400 p-1" colSpan={3}>Rekap</th>
                </tr>
                <tr className="bg-slate-50 text-[8px] text-center">
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i} className="border border-slate-400 p-0.5 w-4 font-normal">{i + 1}</th>
                  ))}
                  <th className="border border-slate-400 p-0.5 w-4 font-bold">S</th>
                  <th className="border border-slate-400 p-0.5 w-4 font-bold">I</th>
                  <th className="border border-slate-400 p-0.5 w-4 font-bold">A</th>
                </tr>
              </thead>
              <tbody>
                {semAtt?.rows.map((r, i) => (
                  <tr key={r.student_id} className="h-6">
                    <td className="border border-slate-400 p-1 text-center">{i + 1}</td>
                    <td className="border border-slate-400 p-1 text-center font-mono">{r.nis}</td>
                    <td className="border border-slate-400 p-1 truncate font-medium">{r.full_name}</td>
                    {Array.from({ length: 31 }, (_, j) => (
                      <td key={j} className="border border-slate-400 p-0 text-center" />
                    ))}
                    <td className="border border-slate-400 p-0 text-center" />
                    <td className="border border-slate-400 p-0 text-center" />
                    <td className="border border-slate-400 p-0 text-center" />
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 flex justify-between text-xs px-8">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p>Kepala Sekolah {activeJenjang}</p>
                <div className="h-16" />
                <p className="font-bold underline">{unitPrincipalName}</p>
                {unitPrincipalNip && <p className="text-[10px]">NIP. {unitPrincipalNip}</p>}
              </div>
              <div className="text-center">
                <p>Wali Kelas</p>
                <div className="h-20" />
                <p className="font-bold underline">............................................</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tab: Kartu Peserta Ujian / Kartu Login */}
      {tab === 'cards' && (
        <section className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 print:hidden">
            <h2 className="font-semibold text-slate-900">
              Kartu Peserta Ujian / Kartu Login: Kelas {cards[0]?.class_name ?? ''} ({activeJenjang})
            </h2>
            <button className="btn btn-primary" onClick={() => window.print()}>
              🖨 Cetak Kartu (Grid 6 per lembar)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
            {cards.map((c) => (
              <div key={c.id} className="border-2 border-slate-800 rounded-lg p-3 bg-white space-y-2 text-xs">
                <div className="border-b-2 border-slate-800 pb-1 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900 uppercase tracking-wide">{unitSchoolName}</div>
                    <div className="text-[9px] text-slate-500 font-semibold">KARTU PESERTA UJIAN & LOGIN CBT — UNIT {activeJenjang}</div>
                  </div>
                  <div className="text-right text-[10px] font-bold text-slate-700">{c.class_name}</div>
                </div>

                <div className="grid grid-cols-[1fr_64px] gap-2 pt-1">
                  <div className="space-y-1">
                    <div className="grid grid-cols-[70px_1fr]">
                      <span className="text-slate-500">Nama</span>
                      <span className="font-bold text-slate-900 truncate">: {c.name}</span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr]">
                      <span className="text-slate-500">NIS</span>
                      <span className="font-mono">: {c.nis}</span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr]">
                      <span className="text-slate-500">Username</span>
                      <span className="font-mono font-bold text-blue-800">: {c.username}</span>
                    </div>
                    <div className="grid grid-cols-[70px_1fr]">
                      <span className="text-slate-500">Sandi Awal</span>
                      <span className="font-mono font-semibold text-slate-700">
                        : {c.must_change_password ? `${c.nis} (Sama dgn NIS)` : 'Sudah diganti siswa'}
                      </span>
                    </div>
                  </div>

                  <div className="border border-dashed border-slate-400 rounded flex items-center justify-center text-[9px] text-slate-400 text-center p-1">
                    Foto 2x3
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-1 text-[8px] text-slate-500 text-center italic">
                  Simpan kartu ini dengan baik. Gunakan username saat masuk ke aplikasi CBT.
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <p className="col-span-2 text-center text-sm text-slate-400 py-6">Tidak ada siswa berstatus akun di kelas ini.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
