'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface StudentMaterial {
  id: string;
  title: string;
  description: string | null;
  url: string;
  published_at: string;
  subject_name: string;
  teacher_name: string;
}

export default function StudentMaterialsPanel() {
  const { data: materials = [] } = useQuery({
    queryKey: ['siswa-materials'],
    queryFn: () => api<StudentMaterial[]>('/api/siswa/materials'),
  });

  return (
    <div className="w-full space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {materials.map((m) => (
          <div key={m.id} className="card space-y-2">
            <div className="font-medium text-slate-900">{m.title}</div>
            <div className="text-xs text-slate-500 font-medium">{m.subject_name} · {m.teacher_name}</div>
            {m.description && <p className="text-xs text-slate-600">{m.description}</p>}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
              <span>{new Date(m.published_at).toLocaleDateString('id-ID')}</span>
              <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline">
                Buka Materi ↗
              </a>
            </div>
          </div>
        ))}
        {materials.length === 0 && (
          <p className="col-span-2 text-sm text-slate-400 py-3">Belum ada materi pembelajaran yang dibagikan guru.</p>
        )}
      </div>
    </div>
  );
}
