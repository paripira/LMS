'use client';
// Loaded ONLY via dynamic import() so @react-pdf (~500 KB) never touches the initial bundle.
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { ReportCardPdf, type ReportSnapshot, type SchoolProfile } from './ReportCardPdf';

export async function renderReportBlob(data: ReportSnapshot, school: SchoolProfile): Promise<Blob> {
  const el = <ReportCardPdf data={data} school={school} /> as unknown as ReactElement<DocumentProps>;
  return pdf(el).toBlob();
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const safe = (s: string) => s.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60);

export async function downloadSingle(data: ReportSnapshot, school: SchoolProfile) {
  const blob = await renderReportBlob(data, school);
  saveBlob(blob, `Rapor_${safe(data.student.name)}_${data.semester.kind}_${safe(data.semester.year)}.pdf`);
}

/** Admin: one request → N PDFs rendered locally one at a time (bounded memory) → single ZIP. */
export async function downloadClassZip(
  classId: string,
  semesterId: string,
  school: SchoolProfile,
  onProgress?: (done: number, total: number) => void,
) {
  const res = await fetch(`/api/reports/bulk?classId=${classId}&semesterId=${semesterId}`, { credentials: 'same-origin' });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Gagal mengambil data e-Rapor.');
  const rows = body as { id: string; snapshot: ReportSnapshot }[];
  if (rows.length === 0) throw new Error('Belum ada e-Rapor yang disetujui untuk kelas ini.');

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  for (let i = 0; i < rows.length; i++) {
    const { snapshot } = rows[i];
    const blob = await renderReportBlob(snapshot, school);
    zip.file(`${safe(snapshot.student.nis)}_${safe(snapshot.student.name)}.pdf`, blob);
    onProgress?.(i + 1, rows.length);
    await new Promise((r) => setTimeout(r)); // yield to the UI thread so the progress bar paints
  }
  const out = await zip.generateAsync({ type: 'blob', compression: 'STORE' }); // PDFs are already compressed
  saveBlob(out, `e-Rapor_${safe(rows[0].snapshot.class.name)}_${rows[0].snapshot.semester.kind}.zip`);
}
