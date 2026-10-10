'use client';
import { useState } from 'react';
import { api } from '@/lib/api-client';
import { TeramiaEmblem } from '@/components/TeramiaLogo';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ home: string; mustChange: boolean }>('/api/auth/login', {
        method: 'POST',
        json: { username, password },
      });
      const next = new URLSearchParams(location.search).get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      location.href = r.mustChange ? '/akun?wajib=1' : (safeNext ?? r.home); // full load → middleware re-evaluates
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#162d6e] p-4 sm:p-6">
      <img
        src="/images/bg-sekolah.jpeg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* Deep Navy Blue Translucent Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#162d6e]/80 via-[#162d6e]/75 to-[#0f2154]/90 backdrop-blur-[1px]" />

      {/* Centered Login Card */}
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-[420px] rounded-3xl bg-white p-7 sm:p-10 shadow-2xl ring-1 ring-white/20"
      >
        <div className="flex flex-col items-center text-center">
          <TeramiaEmblem className="h-20 w-auto drop-shadow-xs" />
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#162d6e]">
            Admin Panel
          </h1>
          <p className="mt-0.5 text-sm font-medium text-slate-500">Sekolah Teramia</p>
        </div>

        <div className="mt-7 space-y-4">
          <div>
            <label htmlFor="u" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Username
            </label>
            <input
              id="u"
              aria-label="Nama pengguna"
              placeholder="Masukkan username"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#162d6e] focus:outline-none focus:ring-2 focus:ring-[#162d6e]/15"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="p" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Password
            </label>
            <input
              id="p"
              type="password"
              aria-label="Kata sandi"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-[#162d6e] focus:outline-none focus:ring-2 focus:ring-[#162d6e]/15"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#162d6e] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0f2154] active:scale-[0.99] disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
              />
            </svg>
            <span>{busy ? 'Memproses…' : 'Masuk'}</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://sekolahteramia.sch.id"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-[#162d6e]"
          >
            <span aria-hidden="true">←</span>
            <span>Kembali ke website</span>
          </a>
        </div>
      </form>
    </main>
  );
}

