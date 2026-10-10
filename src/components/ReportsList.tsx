'use client';
import { DownloadReportButton } from '@/components/erapor/DownloadReportButton';
import { useSchool } from '@/lib/hooks';

export default function ReportsList({ reports }: { reports: { id: string; label: string }[] }) {
  const { data: school } = useSchool();
  if (reports.length === 0) return <p className="text-sm text-slate-400">Belum ada e-Rapor yang disetujui.</p>;
  return (
    <ul className="space-y-2">
      {reports.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3">
          <span className="text-sm">e-Rapor Semester {r.label}</span>
          {school ? <DownloadReportButton reportId={r.id} school={school} /> : <span className="text-xs text-slate-400">Memuat…</span>}
        </li>
      ))}
    </ul>
  );
}
