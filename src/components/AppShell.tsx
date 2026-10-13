'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api, logout } from '@/lib/api-client';
import { useMe } from '@/lib/hooks';
import type { Role } from '@/lib/server';
import NotificationBell from './NotificationBell';
import HelpModal from './HelpModal';
import TeramiaLogo from './TeramiaLogo';

interface NavItem {
  href: string;
  label: string;
  wali?: boolean;
  section?: string;
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  guru: 'Guru & Pendidik',
  siswa: 'Portal Siswa',
  orang_tua: 'Portal Orang Tua',
  kepala_sekolah: 'Kepala Sekolah',
};

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { href: '/admin/data/students', label: 'Siswa', section: 'Data Master' },
    { href: '/admin/data/teachers', label: 'Guru', section: 'Data Master' },
    { href: '/admin/data/parents', label: 'Orang Tua', section: 'Data Master' },
    { href: '/admin/data/classes', label: 'Kelas', section: 'Data Master' },
    { href: '/admin/data/subjects', label: 'Mata Pelajaran', section: 'Data Master' },
    { href: '/admin/data/assignments', label: 'Penugasan Guru', section: 'Data Master' },
    { href: '/admin/jadwal', label: 'Jadwal Pelajaran', section: 'Akademik & KBM' },
    { href: '/admin/presensi', label: 'Presensi & Izin', section: 'Akademik & KBM' },
    { href: '/admin/kesiswaan', label: 'Kesiswaan & BK', section: 'Akademik & KBM' },
    { href: '/pengumuman', label: 'Pengumuman', section: 'Akademik & KBM' },
    { href: '/admin/laporan', label: 'Laporan & Cetak', section: 'Laporan & e-Rapor' },
    { href: '/admin/semester', label: 'Semester & Rapor', section: 'Laporan & e-Rapor' },
    { href: '/admin/sekolah', label: 'Profil Sekolah', section: 'Pengaturan' },
    { href: '/admin/import', label: 'Impor Data Massal', section: 'Pengaturan' },
  ],
  guru: [
    { href: '/guru/presensi', label: 'Presensi & Jurnal' },
    { href: '/guru/materi', label: 'Materi & Tugas' },
    { href: '/guru/jadwal', label: 'Jadwal Mengajar' },
    { href: '/guru/soal', label: 'Bank Soal' },
    { href: '/guru/ujian', label: 'Ujian (CBT)' },
    { href: '/guru/nilai', label: 'Input Nilai' },
    { href: '/guru/kesiswaan', label: 'Kesiswaan & BK' },
    { href: '/guru/wali', label: 'Wali Kelas', wali: true },
    { href: '/pengumuman', label: 'Pengumuman' },
  ],
  siswa: [
    { href: '/siswa', label: 'Beranda' },
    { href: '/pengumuman', label: 'Pengumuman' },
  ],
  orang_tua: [
    { href: '/ortu', label: 'Anak Saya' },
    { href: '/pengumuman', label: 'Pengumuman' },
  ],
  kepala_sekolah: [
    { href: '/kepsek', label: 'Dashboard' },
    { href: '/admin/laporan', label: 'Laporan Sekolah' },
    { href: '/pengumuman', label: 'Pengumuman' },
  ],
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Warm the caches for the tabs this role opens first → instant first click.
  useEffect(() => {
    if (me?.role === 'admin' || me?.role === 'guru') {
      qc.prefetchQuery({ queryKey: ['lookups'], queryFn: () => api('/api/lookups') });
    }
    qc.prefetchQuery({ queryKey: ['school'], staleTime: 60 * 60_000, queryFn: () => api('/api/school') });
  }, [me?.role, qc]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Exam screen is chrome-free (no distractions, no accidental navigation).
  if (pathname.includes('/ujian/')) return <>{children}</>;

  const items = me ? NAV[me.role].filter((i) => !i.wali || me.isWali || me.role === 'admin') : [];

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f4f6fb]">
      {/* Top Website Navbar — Full Fluid Width */}
      <header className="sticky top-0 z-30 w-full bg-white shadow-xs">
        <div className="flex w-full items-center justify-between gap-3 px-3 py-2.5 sm:px-5 lg:px-8">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-[#162d6e] hover:bg-slate-50 md:hidden"
              aria-label="Menu navigasi"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <TeramiaLogo size="md" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {me && (
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-xs font-bold text-[#162d6e]">{me.name}</span>
                <span className="rounded-full bg-[#f5b800]/20 px-2 py-0.5 text-[10px] font-semibold text-[#162d6e]">
                  {ROLE_LABELS[me.role]}
                </span>
              </div>
            )}
            <NotificationBell />
            <Link
              href="/akun"
              className="hidden sm:inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Akun Saya
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center rounded-full bg-[#162d6e] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#0f2154]"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Website Motto Ticker Bar (Navy + Gold bottom border) — Full Fluid Width */}
        <div className="w-full bg-[#162d6e] border-b-2 border-[#f5b800] text-white">
          <div className="flex w-full items-center justify-between gap-4 overflow-x-auto px-3 py-1.5 text-[11px] sm:px-5 lg:px-8 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-[#f5b800]">★</span>
              <span className="font-medium italic">&ldquo;Beriman, Cerdas, dan Berkarakter&rdquo;</span>
              <span className="text-[#f5b800] hidden sm:inline">•</span>
              <span className="text-slate-200 hidden sm:inline">
                Sistem Informasi Akademik, CBT &amp; e-Rapor Kurikulum Merdeka
              </span>
            </div>
            {me && (
              <div className="text-[11px] font-medium text-[#f5b800] sm:hidden">
                {me.name} ({ROLE_LABELS[me.role]})
              </div>
            )}
          </div>
        </div>

        {/* Mobile Quick Horizontal Nav Bar */}
        <nav
          aria-label="Navigasi Cepat"
          className="flex w-full items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-1.5 md:hidden"
        >
          {items.map((i) => {
            const active = pathname === i.href || pathname.startsWith(i.href + '/');
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#162d6e] text-white shadow-2xs ring-2 ring-[#f5b800]/60'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile Slide-Over Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#0f2154]/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-50 flex w-72 max-w-[82vw] flex-col justify-between bg-white p-4 shadow-2xl">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <TeramiaLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1">
                {(() => {
                  let lastSection = '';
                  return items.map((i) => {
                    const active = pathname === i.href || pathname.startsWith(i.href + '/');
                    const showHeader = i.section && i.section !== lastSection;
                    if (i.section) lastSection = i.section;
                    return (
                      <div key={i.href}>
                        {showHeader && (
                          <div className="pt-2 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            {i.section}
                          </div>
                        )}
                        <Link
                          href={i.href}
                          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                            active
                              ? 'bg-[#162d6e] text-white border-l-4 border-[#f5b800]'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{i.label}</span>
                          {active && <span className="h-2 w-2 rounded-full bg-[#f5b800]" />}
                        </Link>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-1">
              <HelpModal />
              <Link
                href="/akun"
                className="block rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                ⚙️ Akun Saya
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Body Layout — Full Fluid Width across all monitor sizes */}
      <div className="flex w-full flex-1">
        {/* Desktop & Small/Large Monitor Sidebar */}
        <aside className="hidden md:flex md:w-56 lg:w-60 xl:w-64 md:shrink-0 md:flex-col md:justify-between border-r border-slate-200/80 bg-white p-3 overflow-y-auto max-h-[calc(100vh-60px)] sticky top-[60px]">
          <div className="space-y-1">
            <nav className="flex flex-col gap-0.5">
              {(() => {
                let lastSection = '';
                return items.map((i) => {
                  const active = pathname === i.href || pathname.startsWith(i.href + '/');
                  const showHeader = i.section && i.section !== lastSection;
                  if (i.section) lastSection = i.section;
                  return (
                    <div key={i.href}>
                      {showHeader && (
                        <div className="pt-2.5 pb-1 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {i.section}
                        </div>
                      )}
                      <Link
                        key={i.href}
                        href={i.href}
                        className={`flex items-center justify-between whitespace-nowrap rounded-xl px-3.5 py-2 text-sm transition ${
                          active
                            ? 'bg-[#162d6e] font-semibold text-white shadow-xs border-l-4 border-[#f5b800]'
                            : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-[#162d6e]'
                        }`}
                      >
                        <span>{i.label}</span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-[#f5b800]" />}
                      </Link>
                    </div>
                  );
                });
              })()}
            </nav>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-3 space-y-1">
            <HelpModal />
            <Link
              href="/akun"
              className={`block whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                pathname === '/akun'
                  ? 'bg-[#162d6e] text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#162d6e]'
              }`}
            >
              ⚙️ Akun Saya
            </Link>
          </div>
        </aside>

        {/* Page Content — Fluid width that adapts to HP, small, medium, and wide monitors */}
        <main className="min-w-0 flex-1 w-full p-3 sm:p-5 lg:p-6 xl:p-8 overflow-x-hidden">
          {me?.mustChangePassword && pathname !== '/akun' && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-950 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔐</span>
                <span>
                  <b>Keamanan Akun:</b> Anda masih menggunakan kata sandi awal bawaan sistem. Segera perbarui kata sandi Anda agar akun tetap aman.
                </span>
              </div>
              <Link
                href="/akun?wajib=1"
                className="rounded-lg bg-[#162d6e] px-3 py-1 font-bold text-white hover:bg-[#0f2154]"
              >
                Ganti Kata Sandi →
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

