'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useSchool } from '@/lib/hooks';

export interface ApprovalRow { class_id: string; name: string; total: number; approved: number; submitted: number }

export default function ApprovalTable({ rows, semesterId, canApprove }: { rows: ApprovalRow[]; semesterId: string; canApprove: boolean }) {
  const qc = useQueryClient();
  const { data: school } = useSchool();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function approve(r: ApprovalRow) {
    setBusy(r.class_id);
    setMsg(null);
    try {
      const res = await api<{ approved: number; pending: number }>('/api/reports/approve', { method: 'POST', json: { classId: r.class_id, semesterId } });
      setMsg({ ok: true, text: `Kelas ${r.name}: ${res.approved} e-Rapor disetujui${res.pending ? `, ${res.pending} belum siap` : ''}.` });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function zip(r: ApprovalRow) {
    if (!school) return;
    setBusy(r.class_id);
    setMsg(null);
    try {
      const { downloadClassZip } = await import('@/components/erapor/render'); // lazy: PDF engine only when needed
      await downloadClassZip(r.class_id, semesterId, school, (d, t) => setMsg({ ok: true, text: `Kelas ${r.name}: membuat PDF ${d}/${t}…` }));
      setMsg({ ok: true, text: `ZIP e-Rapor kelas ${r.name} selesai diunduh.` });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{msg.text}</p>}
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
        <table className="w-full table-fixed text-sm">
          <colgroup><col style={{ width: '90px' }} /><col style={{ width: '90px' }} /><col style={{ width: '110px' }} /><col style={{ width: '110px' }} /><col /></colgroup>
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr><th className="px-3 py-2">Kelas</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Menunggu</th><th className="px-3 py-2">Disetujui</th><th className="px-3 py-2" /></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.class_id} className="border-t border-slate-100">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.total}</td>
                <td className="px-3 py-2">{r.submitted}</td>
                <td className="px-3 py-2">{r.approved}</td>
                <td className="flex justify-end gap-2 px-3 py-2">
                  {canApprove && <button className="btn btn-primary" disabled={busy !== null || r.submitted === 0} onClick={() => approve(r)}>Setujui semua</button>}
                  <button className="btn" disabled={busy !== null || r.approved === 0 || !school} onClick={() => zip(r)}>Unduh ZIP</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-400">Belum ada e-Rapor pada semester ini.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
