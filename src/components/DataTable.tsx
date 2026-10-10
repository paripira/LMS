'use client';
import { useMemo, useState, type ReactNode } from 'react';

// Layout contract: column widths come ONLY from the column config (table-fixed + <colgroup>),
// so a table's look never shifts with data. Change widths in the config file, in code review.
export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  search,
  actions,
  pageSize = 25,
}: {
  columns: Column<T>[];
  rows: T[];
  search?: (r: T) => string;
  actions?: (r: T) => ReactNode;
  pageSize?: number;
}) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n && search ? rows.filter((r) => search(r).toLowerCase().includes(n)) : rows;
  }, [rows, q, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * pageSize, (cur + 1) * pageSize);

  return (
    <div>
      {search && (
        <input
          className="input mb-3 w-full sm:max-w-xs"
          placeholder="Cari…"
          aria-label="Cari"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
        />
      )}
      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-slate-200">
        <table data-testid="data-table" className="w-full min-w-[560px] md:min-w-0 table-fixed text-sm">
          <colgroup>
            {columns.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
            {actions && <col style={{ width: '200px' }} />}
          </colgroup>
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 font-medium">{c.header}</th>
              ))}
              {actions && <th className="px-3 py-2" />}
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                {columns.map((c) => (
                  <td key={c.key} className="truncate px-3 py-2">
                    {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? '')}
                  </td>
                ))}
                {actions && <td className="px-3 py-2 text-right">{actions(r)}</td>}
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-3 py-8 text-center text-slate-400">
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>{filtered.length} data · halaman {cur + 1} dari {pages}</span>
          <div className="flex gap-2">
            <button className="btn" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Sebelumnya</button>
            <button className="btn" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Berikutnya</button>
          </div>
        </div>
      )}
    </div>
  );
}
