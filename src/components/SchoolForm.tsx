'use client';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useSchool, type School, type UnitSchoolProfile, type DriveIntegrationConfig } from '@/lib/hooks';
import { APPS_SCRIPT_TEMPLATE } from './DriveUploadBox';

const MAX_STAMP_BYTES = 150_000;

export default function SchoolForm() {
  const qc = useQueryClient();
  const { data } = useSchool();
  const [f, setF] = useState<School | null>(null);
  const [activeTab, setActiveTab] = useState<'umum' | 'SD' | 'SMP' | 'drive'>('umum');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    if (data && !f) setF({ ...data, units: data.units ?? {}, drive: data.drive ?? {} });
  }, [data, f]);
  if (!f) return <p className="text-slate-400">Memuat…</p>;

  const set = <K extends keyof School>(k: K, v: School[K]) => setF({ ...f, [k]: v });

  const getUnit = (jenjang: 'SD' | 'SMP'): UnitSchoolProfile => f.units?.[jenjang] ?? {};
  const setUnit = <K extends keyof UnitSchoolProfile>(
    jenjang: 'SD' | 'SMP',
    k: K,
    v: UnitSchoolProfile[K],
  ) => {
    setF({
      ...f,
      units: {
        ...(f.units ?? {}),
        [jenjang]: {
          ...(f.units?.[jenjang] ?? {}),
          [k]: v,
        },
      },
    });
  };

  const setDrive = <K extends keyof DriveIntegrationConfig>(k: K, v: DriveIntegrationConfig[K]) => {
    setF({
      ...f,
      drive: {
        ...(f.drive ?? {}),
        [k]: v,
      },
    });
  };

  function onStamp(file: File | undefined, target: 'umum' | 'SD' | 'SMP') {
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type))
      return setMsg({ ok: false, text: 'Stempel harus berupa gambar PNG atau JPG.' });
    if (file.size > MAX_STAMP_BYTES)
      return setMsg({ ok: false, text: 'Ukuran gambar maksimal 150 KB.' });
    const r = new FileReader();
    r.onload = () => {
      if (target === 'umum') set('stampDataUrl', String(r.result));
      else setUnit(target, 'stampDataUrl', String(r.result));
    };
    r.readAsDataURL(file);
  }

  async function save() {
    try {
      await api('/api/school', { method: 'PUT', json: f });
      qc.setQueryData(['school'], f);
      setMsg({ ok: true, text: 'Profil sekolah & integrasi Google Drive berhasil disimpan.' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  }

  const unit = activeTab === 'SD' || activeTab === 'SMP' ? getUnit(activeTab) : null;

  return (
    <div className="card w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-[#162d6e]">
            Identitas Sekolah per Jenjang (SD & SMP) & Integrasi Google Drive
          </h3>
          <p className="text-xs text-slate-500">
            Atur kop nama sekolah, NPSN, Kepala Sekolah, stempel e-Rapor, serta koneksi upload otomatis ke Google Drive.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1">
          {[
            { k: 'umum', label: 'Umum / Yayasan' },
            { k: 'SD', label: 'Unit SD' },
            { k: 'SMP', label: 'Unit SMP' },
            { k: 'drive', label: 'Integrasi Google Drive' },
          ].map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => {
                setActiveTab(t.k as typeof activeTab);
                setMsg(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === t.k
                  ? 'bg-[#162d6e] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#162d6e]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'umum' && (
        <div className="space-y-3">
          <p className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
            <b>Profil Umum / Yayasan</b> dipakai sebagai nilai *default* apabila profil spesifik Unit SD atau Unit SMP belum diisi.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sn" className="label">Nama Sekolah / Yayasan (Default)</label>
              <input id="sn" className="input" value={f.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label htmlFor="sa" className="label">Alamat Sekolah</label>
              <input id="sa" className="input" value={f.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="pn" className="label">Nama Kepala Sekolah (Default)</label>
              <input id="pn" className="input" value={f.principalName} onChange={(e) => set('principalName', e.target.value)} />
            </div>
            <div>
              <label htmlFor="pi" className="label">NIP</label>
              <input id="pi" className="input" value={f.principalNip ?? ''} onChange={(e) => set('principalNip', e.target.value || null)} />
            </div>
          </div>
          <div>
            <label htmlFor="st" className="label">Tanda tangan / stempel digital Default (PNG/JPG, maks 150 KB)</label>
            <input id="st" type="file" accept="image/png,image/jpeg" className="input" onChange={(e) => onStamp(e.target.files?.[0], 'umum')} />
            {f.stampDataUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.stampDataUrl} alt="Pratinjau stempel" className="h-16 rounded border bg-white p-1" />
                <button type="button" className="btn" onClick={() => set('stampDataUrl', null)}>Hapus</button>
              </div>
            )}
          </div>
        </div>
      )}

      {(activeTab === 'SD' || activeTab === 'SMP') && (
        <div className="space-y-3">
          <p className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-2.5 text-xs text-amber-900">
            Pengaturan khusus <b>Unit {activeTab}</b> ini akan otomatis tercetak pada kop dan blok tanda tangan <b>e-Rapor PDF</b> untuk seluruh kelas jenjang <b>{activeTab}</b> ({activeTab === 'SD' ? 'Kelas 1 s/d 6' : 'Kelas 7 s/d 9'}).
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Nama Sekolah Unit {activeTab}</label>
              <input
                className="input"
                placeholder={`Contoh: ${activeTab} Teramia`}
                value={unit?.name ?? ''}
                onChange={(e) => setUnit(activeTab, 'name', e.target.value || null)}
              />
            </div>
            <div>
              <label className="label">NPSN Unit {activeTab}</label>
              <input
                className="input"
                placeholder="Contoh: 2010xxxx"
                value={unit?.npsn ?? ''}
                onChange={(e) => setUnit(activeTab, 'npsn', e.target.value || null)}
              />
            </div>
            <div>
              <label className="label">Alamat Unit {activeTab} (Opsional)</label>
              <input
                className="input"
                placeholder={f.address || 'Kosongkan jika sama dengan alamat utama'}
                value={unit?.address ?? ''}
                onChange={(e) => setUnit(activeTab, 'address', e.target.value || null)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Nama Kepala Sekolah {activeTab}</label>
              <input
                className="input"
                placeholder={`Nama Kepala ${activeTab} Teramia`}
                value={unit?.principalName ?? ''}
                onChange={(e) => setUnit(activeTab, 'principalName', e.target.value || null)}
              />
            </div>
            <div>
              <label className="label">NIP / NIY Kepala Sekolah {activeTab}</label>
              <input
                className="input"
                placeholder="Kosongkan jika belum ada"
                value={unit?.principalNip ?? ''}
                onChange={(e) => setUnit(activeTab, 'principalNip', e.target.value || null)}
              />
            </div>
          </div>
          <div>
            <label className="label">Tanda tangan & stempel digital Kepala Sekolah {activeTab} (PNG/JPG, maks 150 KB)</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="input"
              onChange={(e) => onStamp(e.target.files?.[0], activeTab)}
            />
            {unit?.stampDataUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={unit.stampDataUrl} alt={`Stempel ${activeTab}`} className="h-16 rounded border bg-white p-1" />
                <button type="button" className="btn" onClick={() => setUnit(activeTab, 'stampDataUrl', null)}>
                  Hapus Stempel {activeTab}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'drive' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-[#162d6e]">
              Upload File Langsung dari Sistem ke Google Drive (Tanpa Beban Penyimpanan Server)
            </div>
            <p>
              Dengan fitur ini, <b>Guru, Siswa, dan Orang Tua</b> dapat langsung memilih file dari HP/Laptop di dalam halaman Tugas/Materi. Sistem akan <b>otomatis mengunggah file ke Google Drive</b>, <b>otomatis mengaktifkan akses publik (&ldquo;Siapa saja yang memiliki link dapat melihat&rdquo;)</b>, dan <b>otomatis menempelkan link-nya</b> tanpa perlu buka aplikasi Google Drive secara manual.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#162d6e]">
                Mode 1: Masuk ke Google Drive Masing-Masing Pengupload (Rekomendasi)
              </div>
              <p className="text-xs text-slate-600">
                Menggunakan <b>Google OAuth 2.0 Web Client ID</b> (scope <code>drive.file</code>). Setiap Guru atau Siswa yang mengunggah file akan otomatis menyimpannya ke <b>Google Drive milik akun mereka masing-masing</b> dan akses link otomatis diset publik.
              </p>
              <div>
                <label className="label">Google OAuth Client ID</label>
                <input
                  className="input text-xs"
                  placeholder="1234567890-abcdefg.apps.googleusercontent.com"
                  value={f.drive?.clientId ?? ''}
                  onChange={(e) => setDrive('clientId', e.target.value || null)}
                />
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Cara membuat Client ID (Gratis di Google Cloud):</div>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Buka <code>console.cloud.google.com</code> &rarr; <b>APIs &amp; Services</b> &rarr; <b>Library</b> &rarr; Aktifkan <b>Google Drive API</b>.</li>
                  <li>Buka <b>Credentials</b> &rarr; <b>Create Credentials</b> &rarr; <b>OAuth client ID</b> (Web application).</li>
                  <li>Masukkan domain/URL website LMS ini pada <b>Authorized JavaScript origins</b>, lalu salin <b>Client ID</b> ke kolom di atas.</li>
                </ol>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#162d6e]">
                  Mode 2: Jembatan Google Apps Script (Tanpa Login Siswa)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2500);
                  }}
                  className="rounded-lg bg-[#f5b800] px-2.5 py-1 text-[11px] font-bold text-[#102152]"
                >
                  {copiedScript ? '✓ Kode Script Disalin!' : '📋 Salin Kode Apps Script'}
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Alternatif instan (1 menit) tanpa Google Cloud Console. Siswa/Guru bahkan tidak perlu login Google saat upload karena file langsung diteruskan lewat Web App Script ke Google Drive dan otomatis diset <i>Anyone with link</i>.
              </p>
              <div>
                <label className="label">URL Web App Google Apps Script</label>
                <input
                  className="input text-xs"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={f.drive?.appsScriptUrl ?? ''}
                  onChange={(e) => setDrive('appsScriptUrl', e.target.value || null)}
                />
              </div>
              <div>
                <label className="label">Nama Folder Utama di Google Drive</label>
                <input
                  className="input text-xs"
                  placeholder="LMS Sekolah Teramia"
                  value={f.drive?.folderName ?? ''}
                  onChange={(e) => setDrive('folderName', e.target.value || null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {msg && <p role="status" className={`text-sm font-medium ${msg.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{msg.text}</p>}
      <div className="flex justify-end pt-1">
        <button type="button" className="btn btn-primary" onClick={save}>
          Simpan Pengaturan Sekolah & Google Drive
        </button>
      </div>
    </div>
  );
}
