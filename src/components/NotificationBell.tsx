'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface Notif {
  id: string;
  title: string;
  body: string;
  link: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  presensi: '📅',
  tugas: '📝',
  ujian: '✏️',
  rapor: '📄',
  info: '🔔',
};

export default function NotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<{ notifications: Notif[]; unread: number }>('/api/notifications'),
    refetchInterval: 30_000, // Poll every 30s only when tab is active
    refetchIntervalInBackground: false,
    staleTime: 25_000,
  });

  const markAllRead = useMutation({
    mutationFn: () => api('/api/notifications', { method: 'PATCH', json: { all: true } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneRead = useMutation({
    mutationFn: (id: string) => api('/api/notifications', { method: 'PATCH', json: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = data?.notifications ?? [];
  const unread = data?.unread ?? 0;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
        aria-label="Notifikasi"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl ring-1 ring-black/10 z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
            <div className="font-semibold text-sm text-slate-800">
              Notifikasi {unread > 0 && `(${unread} baru)`}
            </div>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markOneRead.mutate(n.id)}
                className={`p-3 transition-colors ${n.is_read ? 'bg-white' : 'bg-blue-50/60 font-medium'}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900 font-semibold truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 line-clamp-2">{n.body}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setOpen(false)}
                        className="inline-block mt-1 text-blue-600 font-semibold hover:underline"
                      >
                        Buka tautan →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="p-6 text-center text-slate-400">Belum ada notifikasi.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
