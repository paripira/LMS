'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api-client';
import ApprovalTable, { type ApprovalRow } from '@/components/ApprovalTable';
import SchoolForm from '@/components/SchoolForm';

interface Analytics {
  semester: { id: string; label: string } | null;
  bySubject: { label: string; avg: number }[];
  byClass: { label: string; avg: number }[];
  distribution: { label: string; count: number }[];
  approval: ApprovalRow[];
  kpi: { avg_score: number | null; attendance_rate: number | null; students: number } | null;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card border-t-4 border-[#f5b800]">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-[#162d6e]">{value}</div>
    </div>
  );
}

function Chart({ title, data, xKey, yKey, domain }: { title: string; data: object[]; xKey: string; yKey: string; domain?: [number, number] }) {
  return (
    <section className="card">
      <h2 className="mb-2 text-sm font-bold text-[#162d6e]">{title}</h2>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">Belum ada nilai terkunci.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} domain={domain} />
              <Tooltip />
              <Bar dataKey={yKey} fill="#162d6e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default function KepsekPage() {
  const [jenjang, setJenjang] = useState<'' | 'SD' | 'SMP'>('');

  const { data } = useQuery({
    queryKey: ['analytics', 'active', jenjang],
    queryFn: () => api<Analytics>(`/api/kepsek/analytics${jenjang ? `?jenjang=${jenjang}` : ''}`),
  });

  if (!data) return <p className="text-slate-400">Memuat…</p>;
  if (!data.semester) return <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Belum ada semester aktif.</p>;

  const unitLabel = jenjang ? `Unit ${jenjang}` : 'Semua Jenjang (SD & SMP)';

  return (
    <div className="w-full space-y-6">
      <div className="teramia-banner p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f5b800]/50 bg-[#0f2154]/60 px-3 py-0.5 text-[11px] font-semibold text-[#f5b800] mb-1.5">
            <span>★</span>
            <span>Analitik Mutu Akademik · Sekolah Teramia</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Dashboard Kepala Sekolah · {unitLabel}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">{data.semester.label}</p>
        </div>
        <div className="flex gap-1.5 rounded-xl bg-white/10 p-1">
          {[
            { k: '', label: 'Semua Jenjang' },
            { k: 'SD', label: 'Unit SD' },
            { k: 'SMP', label: 'Unit SMP' },
          ].map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setJenjang(t.k as typeof jenjang)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition ${
                jenjang === t.k
                  ? 'bg-[#f5b800] text-[#102152]'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label={`Rerata Nilai (${unitLabel})`} value={data.kpi?.avg_score != null ? String(data.kpi.avg_score) : '—'} />
        <Kpi label={`Tingkat Kehadiran (${unitLabel})`} value={data.kpi?.attendance_rate != null ? `${data.kpi.attendance_rate}%` : '—'} />
        <Kpi label={`Siswa Aktif (${unitLabel})`} value={String(data.kpi?.students ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Chart title="Rerata nilai per mata pelajaran" data={data.bySubject} xKey="label" yKey="avg" domain={[0, 100]} />
        <Chart title="Rerata nilai per kelas" data={data.byClass} xKey="label" yKey="avg" domain={[0, 100]} />
        <Chart title="Sebaran predikat" data={data.distribution} xKey="label" yKey="count" />
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold text-[#162d6e]">Persetujuan e-Rapor ({unitLabel})</h2>
        <p className="text-xs text-slate-500">
          “Setujui semua” membekukan e-Rapor kelas menjadi arsip resmi yang otomatis menggunakan Kop & Tanda Tangan Kepala Sekolah sesuai jenjangnya (SD atau SMP).
        </p>
        <ApprovalTable rows={data.approval} semesterId={data.semester.id} canApprove />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-[#162d6e]">Profil Sekolah, Kepala Sekolah & Stempel Digital (SD & SMP)</h2>
        <SchoolForm />
      </section>
    </div>
  );
}
