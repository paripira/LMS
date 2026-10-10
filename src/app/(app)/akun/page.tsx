'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export default function AccountPage() {
  const qc = useQueryClient();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const forced = typeof window !== 'undefined' && new URLSearchParams(location.search).has('wajib');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/api/auth/password', { method: 'POST', json: { current, next } });
      await qc.invalidateQueries({ queryKey: ['me'] });
      setMsg({ ok: true, text: 'Kata sandi berhasil diganti.' });
      setCurrent('');
      setNext('');
      if (forced) setTimeout(() => (location.href = '/'), 800);
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="teramia-banner p-4 sm:p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-white">Akun Saya</h1>
        <p className="text-xs text-slate-200 mt-0.5">Kelola keamanan akun dan pembaruan kata sandi Anda di Sekolah Teramia.</p>
      </div>
      {forced && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">Demi keamanan, silakan ganti kata sandi awal Anda terlebih dahulu.</p>}
      <form onSubmit={submit} className="card w-full max-w-xl space-y-3">
        <div>
          <label htmlFor="c" className="label">Kata sandi saat ini</label>
          <input id="c" type="password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="n" className="label">Kata sandi baru (minimal 8 karakter)</label>
          <input id="n" type="password" className="input" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
        </div>
        {msg && <p role="status" className={`text-sm ${msg.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{msg.text}</p>}
        <button className="btn btn-primary">Simpan</button>
      </form>
    </div>
  );
}
