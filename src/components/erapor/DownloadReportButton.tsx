'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ReportSnapshot, SchoolProfile } from './ReportCardPdf';

const loadRenderer = () => import('./render'); // one chunk: @react-pdf + document component

export function DownloadReportButton({ reportId, school }: { reportId: string; school: SchoolProfile }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Cached 5 min (matches server Cache-Control); the snapshot is frozen, so it's safe to cache longer.
  const { data } = useQuery({
    queryKey: ['report', reportId],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ReportSnapshot> => {
      const res = await fetch(`/api/reports/${reportId}`, { credentials: 'same-origin' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? 'Gagal memuat e-Rapor.');
      return body;
    },
  });

  return (
    <div>
      <button
        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={!data || busy}
        // Warm the heavy chunk before the click so the PDF appears almost instantly.
        onMouseEnter={loadRenderer}
        onTouchStart={loadRenderer}
        onClick={async () => {
          if (!data) return;
          setBusy(true);
          setErr(null);
          try {
            const { downloadSingle } = await loadRenderer();
            await downloadSingle(data, school);
          } catch {
            setErr('PDF gagal dibuat. Silakan coba lagi.');
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Membuat PDF…' : 'Unduh e-Rapor (PDF)'}
      </button>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
