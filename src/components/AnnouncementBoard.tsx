'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useMe, useLookups, today } from '@/lib/hooks';

interface Ann {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publish_at: string;
  author: string;
  mine: boolean;
  class_id?: string | null;
  teaching_assignment_id?: string | null;
  class_name?: string | null;
  jenjang?: string | null;
  subject_name?: string | null;
}
interface Ev { id: string; title: string; description: string | null; starts_on: string; ends_on: string; category: string }

const CAT_COLOR: Record<string, string> = { akademik: 'bg-blue-500', libur: 'bg-rose-500', ujian: 'bg-amber-500', kegiatan: 'bg-emerald-500' };
const fmt = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

function Calendar({ canEdit }: { canEdit: boolean }) {
  const qc = useQueryClient();
  const { data: events = [] } = useQuery({ queryKey: ['calendar'], queryFn: () => api<Ev[]>('/api/calendar') });
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [form, setForm] = useState({ title: '', startsOn: today(), endsOn: today(), category: 'akademik' });
  const [err, setErr] = useState<string | null>(null);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
  const ds = (d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const on = (d: number) => events.filter((e) => e.starts_on <= ds(d) && e.ends_on >= ds(d));
  const monthEvents = events.filter((e) => e.ends_on >= ds(1) && e.starts_on <= ds(days));

  const add = useMutation({
    mutationFn: () => api('/api/calendar', { method: 'POST', json: form }),
    onSuccess: () => { setForm({ ...form, title: '' }); setErr(null); qc.invalidateQueries({ queryKey: ['calendar'] }); },
    onError: (e) => setErr((e as Error).message),
  });
  const del = useMutation({ mutationFn: (id: string) => api(`/api/calendar?id=${id}`, { method: 'DELETE' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar'] }) });

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-[#162d6e]">Kalender Akademik</h2>
        <div className="flex items-center gap-1.5">
          <button className="btn px-3 py-1" aria-label="Bulan sebelumnya" onClick={() => setCursor(new Date(y, m - 1, 1))}>‹</button>
          <span className="min-w-[120px] text-center text-sm font-semibold text-slate-700">
            {cursor.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <button className="btn px-3 py-1" aria-label="Bulan berikutnya" onClick={() => setCursor(new Date(y, m + 1, 1))}>›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map((d) => (
          <div key={d} className="py-1 font-semibold text-slate-400">{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`o${i}`} />)}
        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
          <div
            key={d}
            className={`rounded-lg py-1.5 text-xs ${
              ds(d) === today()
                ? 'bg-[#162d6e] font-bold text-white ring-2 ring-[#f5b800]'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {d}
            <div className="mt-0.5 flex h-1.5 justify-center gap-0.5">
              {on(d).slice(0, 3).map((e) => (
                <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${CAT_COLOR[e.category] ?? 'bg-slate-400'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ul className="space-y-1.5 text-sm">
        {monthEvents.map((e) => (
          <li key={e.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs sm:text-sm">
            <span>
              <span className={`mr-2 inline-block h-2 w-2 rounded-full ${CAT_COLOR[e.category] ?? 'bg-slate-400'}`} />
              <b>{fmt(e.starts_on)}{e.ends_on !== e.starts_on && ` – ${fmt(e.ends_on)}`}</b> · {e.title}
            </span>
            {canEdit && (
              <button className="shrink-0 text-xs font-semibold text-rose-600 hover:underline" onClick={() => del.mutate(e.id)}>
                Hapus
              </button>
            )}
          </li>
        ))}
        {monthEvents.length === 0 && <li className="text-xs text-slate-400">Tidak ada agenda bulan ini.</li>}
      </ul>
      {canEdit && (
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <input
            aria-label="Judul agenda"
            className="input"
            placeholder="Judul agenda akademik…"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">Tanggal Mulai</label>
              <input
                aria-label="Mulai"
                type="date"
                className="input"
                value={form.startsOn}
                onChange={(e) =>
                  setForm({
                    ...form,
                    startsOn: e.target.value,
                    endsOn: e.target.value > form.endsOn ? e.target.value : form.endsOn,
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">Tanggal Selesai</label>
              <input
                aria-label="Selesai"
                type="date"
                className="input"
                value={form.endsOn}
                onChange={(e) => setForm({ ...form, endsOn: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <select
              aria-label="Kategori"
              className="input sm:w-44"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {Object.keys(CAT_COLOR).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              className="btn btn-primary w-full sm:w-auto whitespace-nowrap"
              disabled={!form.title.trim() || add.isPending}
              onClick={() => add.mutate()}
            >
              Tambah agenda
            </button>
          </div>
          {err && <p role="alert" className="text-sm text-rose-700">{err}</p>}
        </div>
      )}
    </section>
  );
}

export default function AnnouncementBoard() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const canPost = me?.role === 'admin' || me?.role === 'guru';
  const { data: lookups } = useQuery({
    queryKey: ['lookups'],
    enabled: canPost,
    queryFn: () => api<{
      classes: { id: string; name: string; jenjang: string; is_wali: boolean }[];
      assignments: { id: string; class_id: string; subject_id: string; jenjang?: string; label: string }[];
    }>('/api/lookups'),
  });

  const { data: list = [] } = useQuery({ queryKey: ['announcements'], queryFn: () => api<Ann[]>('/api/announcements') });
  const [f, setF] = useState({ title: '', body: '', pinned: false, target: '' });
  const [err, setErr] = useState<string | null>(null);

  const classes = lookups?.classes ?? [];
  const assignments = lookups?.assignments ?? [];

  // Default target: 'all' for admin, or first assignment/class for guru
  const defaultTarget =
    me?.role === 'admin'
      ? 'all'
      : assignments[0]
        ? `ta:${assignments[0].id}`
        : classes[0]
          ? `class:${classes[0].id}`
          : '';
  const selectedTarget = f.target || defaultTarget;

  const add = useMutation({
    mutationFn: () => {
      let classId: string | null = null;
      let teachingAssignmentId: string | null = null;
      if (selectedTarget.startsWith('ta:')) {
        teachingAssignmentId = selectedTarget.slice(3);
      } else if (selectedTarget.startsWith('class:')) {
        classId = selectedTarget.slice(6);
      }
      return api('/api/announcements', {
        method: 'POST',
        json: {
          title: f.title,
          body: f.body,
          pinned: f.pinned,
          classId,
          teachingAssignmentId,
        },
      });
    },
    onSuccess: () => {
      setF((prev) => ({ ...prev, title: '', body: '', pinned: false }));
      setErr(null);
      qc.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (e) => setErr((e as Error).message),
  });
  const del = useMutation({
    mutationFn: (id: string) => api(`/api/announcements?id=${id}`, { method: 'DELETE' }),
    onMutate: (id) => { qc.setQueryData<Ann[]>(['announcements'], (o) => (o ?? []).filter((a) => a.id !== id)); }, // optimistic
    onSettled: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });

  return (
    <div className="w-full space-y-5">
      <div className="teramia-banner p-4 sm:p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-white">Pengumuman &amp; Kalender Akademik</h1>
        <p className="text-xs text-slate-200 mt-0.5">
          Informasi resmi sekolah, pengumuman khusus kelas/mata pelajaran, serta jadwal agenda akademik Sekolah Teramia.
        </p>
      </div>

      <div className="grid w-full gap-5 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {canPost && (
            <div className="card space-y-3">
              <h2 className="text-sm font-bold text-[#162d6e]">Buat Pengumuman Baru</h2>

              <div>
                <label htmlFor="ann-target" className="mb-1 block text-xs font-semibold text-slate-600">
                  Sasaran Penerima Pengumuman
                </label>
                <select
                  id="ann-target"
                  aria-label="Sasaran Penerima Pengumuman"
                  className="input"
                  value={selectedTarget}
                  onChange={(e) => setF({ ...f, target: e.target.value })}
                >
                  {me?.role === 'admin' && (
                    <option value="all">🌐 Seluruh Sekolah (Semua Kelas &amp; Guru)</option>
                  )}
                  {assignments.length > 0 && (
                    <optgroup label="Khusus Mata Pelajaran & Kelas">
                      {assignments.map((a) => (
                        <option key={`ta:${a.id}`} value={`ta:${a.id}`}>
                          📚 Mapel: {a.label}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {classes.length > 0 && (
                    <optgroup label="Khusus Satu Kelas Penuh">
                      {classes.map((c) => (
                        <option key={`class:${c.id}`} value={`class:${c.id}`}>
                          🏫 Kelas {c.name} ({c.jenjang}){c.is_wali ? ' — Wali Kelas' : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {selectedTarget === 'all'
                    ? 'Pengumuman umum akan terlihat oleh seluruh warga sekolah.'
                    : 'Hanya siswa & orang tua di kelas terpilih yang dapat melihat pengumuman ini. Kelas lain tidak akan melihatnya.'}
                </p>
              </div>

              <input
                aria-label="Judul"
                className="input"
                placeholder="Judul pengumuman"
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
              <textarea
                aria-label="Isi"
                className="input min-h-28"
                placeholder="Isi pengumuman…"
                value={f.body}
                onChange={(e) => setF({ ...f, body: e.target.value })}
              />
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.pinned}
                    onChange={(e) => setF({ ...f, pinned: e.target.checked })}
                  />
                  <span>Sematkan di atas</span>
                </label>
                <button
                  className="btn btn-primary"
                  disabled={!f.title.trim() || !f.body.trim() || !selectedTarget || add.isPending}
                  onClick={() => add.mutate()}
                >
                  Terbitkan
                </button>
              </div>
              {err && <p role="alert" className="text-sm text-rose-700">{err}</p>}
            </div>
          )}
          {list.map((a) => (
            <article key={a.id} className="card space-y-1.5 border-l-4 border-[#162d6e]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {a.subject_name && a.class_name ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#162d6e] ring-1 ring-blue-200">
                      📚 {a.subject_name} — Kelas {a.class_name}
                    </span>
                  ) : a.class_name ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 ring-1 ring-amber-200">
                      🏫 Khusus Kelas {a.class_name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      🌐 Pengumuman Umum Sekolah
                    </span>
                  )}
                </div>
                {canPost && (a.mine || me?.role === 'admin') && (
                  <button
                    className="text-xs font-semibold text-rose-600 hover:underline"
                    onClick={() => confirm('Hapus pengumuman ini?') && del.mutate(a.id)}
                  >
                    Hapus
                  </button>
                )}
              </div>
              <h3 className="font-bold text-slate-900">{a.pinned && '📌 '}{a.title}</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{a.body}</p>
              <p className="text-xs text-slate-400 pt-1">{a.author} · {fmt(a.publish_at)}</p>
            </article>
          ))}
          {list.length === 0 && <p className="card text-center text-sm text-slate-400 py-8">Belum ada pengumuman untuk kelas Anda.</p>}
        </div>

        <div className="lg:col-span-5 xl:col-span-4 w-full">
          <Calendar canEdit={me?.role === 'admin'} />
        </div>
      </div>
    </div>
  );
}

