'use client';
import { useEffect, useRef, useState } from 'react';
import { useSchool } from '@/lib/hooks';

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; expires_in?: number; error?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

export const APPS_SCRIPT_TEMPLATE = `// Tempel kode ini di https://script.google.com (Proyek Baru)
// Lalu klik: Terapkan (Deploy) -> Deployment Baru -> Jenis: Aplikasi Web (Web App)
// Jalankan sebagai: Saya (Me) | Siapa yang memiliki akses: Siapa saja (Anyone)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folderName = data.folderName || 'LMS Sekolah Teramia';
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    var blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType, data.fileName);
    var file = folder.createFile(blob);
    // Otomatis set ke "Siapa saja yang memiliki link dapat melihat"
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      id: file.getId(),
      name: file.getName(),
      url: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: String(err)
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

interface Props {
  value: string;
  onChange: (url: string, fileName?: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  folderSubpath?: string;
  accept?: string;
}

const TOKEN_STORAGE_KEY = 'lms_gdrive_oauth_token';
const LOCAL_CONFIG_KEY = 'lms_gdrive_local_config';

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window tidak tersedia'));
    if (window.google?.accounts?.oauth2) return resolve();
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Gagal memuat Google Identity Services')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Gagal memuat Google Identity Services'));
    document.head.appendChild(s);
  });
}

async function getGoogleAccessToken(clientId: string): Promise<string> {
  try {
    const cachedRaw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as { token: string; exp: number; cid: string };
      if (cached.cid === clientId && cached.exp > Date.now() + 30_000) {
        return cached.token;
      }
    }
  } catch {
    // ignore storage errors
  }

  await loadGsiScript();
  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) return reject(new Error('Layanan login Google belum siap. Coba muat ulang halaman.'));

    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error || 'Otorisasi Google Drive dibatalkan.'));
          return;
        }
        try {
          sessionStorage.setItem(
            TOKEN_STORAGE_KEY,
            JSON.stringify({
              token: resp.access_token,
              exp: Date.now() + (resp.expires_in ?? 3500) * 1000,
              cid: clientId,
            }),
          );
        } catch {
          // ignore
        }
        resolve(resp.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: '' });
  });
}

async function ensureDriveFolder(token: string, folderName: string): Promise<string> {
  const safeName = folderName.replace(/'/g, "\\'");
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${safeName}' and trashed=false`,
  );
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (searchRes.ok) {
    const data = (await searchRes.json()) as { files?: { id: string }[] };
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  if (!createRes.ok) {
    throw new Error('Gagal membuat folder di Google Drive Anda.');
  }
  const created = (await createRes.json()) as { id: string };
  return created.id;
}

function uploadMultipartToDrive(
  token: string,
  file: File,
  folderId: string,
  onProgress: (pct: number) => void,
): Promise<{ id: string; name: string; webViewLink?: string }> {
  return new Promise((resolve, reject) => {
    const metadata = {
      name: file.name,
      parents: [folderId],
    };
    const boundary = '-------lms_teramia_drive_boundary_' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const metaPart =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

    const body = new Blob([metaPart, file, closeDelim], {
      type: `multipart/related; boundary=${boundary}`,
    });

    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    );
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        onProgress(Math.min(95, Math.round((ev.loaded / ev.total) * 95)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Respons Google Drive tidak valid.'));
        }
      } else {
        if (xhr.status === 401) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        reject(new Error(`Gagal mengunggah ke Google Drive (HTTP ${xhr.status}).`));
      }
    };

    xhr.onerror = () => reject(new Error('Koneksi terputus saat mengunggah ke Google Drive.'));
    xhr.send(body);
  });
}

async function setPublicAnyoneReader(token: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });
  if (!res.ok) {
    throw new Error('File terunggah, namun gagal mengatur izin akses publik otomatis.');
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || '');
      const idx = res.indexOf(',');
      resolve(idx >= 0 ? res.slice(idx + 1) : res);
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
    reader.readAsDataURL(file);
  });
}

export default function DriveUploadBox({
  value,
  onChange,
  label = 'Lampiran File / Tautan Google Drive',
  placeholder = 'https://drive.google.com/file/d/... (Otomatis terisi saat upload file)',
  helperText,
  folderSubpath,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar,.txt',
}: Props) {
  const { data: school } = useSchool();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Local override config if user configures directly from modal
  const [localClientId, setLocalClientId] = useState('');
  const [localScriptUrl, setLocalScriptUrl] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { clientId?: string; appsScriptUrl?: string };
        if (parsed.clientId) setLocalClientId(parsed.clientId);
        if (parsed.appsScriptUrl) setLocalScriptUrl(parsed.appsScriptUrl);
      }
    } catch {
      // ignore
    }
  }, []);

  const activeClientId =
    school?.drive?.clientId?.trim() ||
    localClientId.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '';

  const activeScriptUrl =
    school?.drive?.appsScriptUrl?.trim() ||
    localScriptUrl.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ||
    '';

  const baseFolder = school?.drive?.folderName?.trim() || 'LMS Sekolah Teramia';
  const targetFolderName = folderSubpath ? `${baseFolder} - ${folderSubpath}` : baseFolder;

  function saveLocalConfig() {
    try {
      localStorage.setItem(
        LOCAL_CONFIG_KEY,
        JSON.stringify({
          clientId: localClientId.trim(),
          appsScriptUrl: localScriptUrl.trim(),
        }),
      );
      setShowSetup(false);
      setError(null);
    } catch {
      // ignore
    }
  }

  async function handleFileSelect(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (file.size > 35 * 1024 * 1024) {
      setError('Ukuran file maksimal 35 MB agar proses unggah ke Google Drive berjalan lancar.');
      return;
    }

    // Prefer Personal Google Drive OAuth (uploads directly to uploader's own Google Drive!)
    if (activeClientId) {
      setUploading(true);
      setProgress(5);
      try {
        const token = await getGoogleAccessToken(activeClientId);
        setProgress(15);
        const folderId = await ensureDriveFolder(token, targetFolderName);
        setProgress(25);
        const uploaded = await uploadMultipartToDrive(token, file, folderId, setProgress);
        setProgress(96);
        await setPublicAnyoneReader(token, uploaded.id);
        setProgress(100);

        const finalUrl =
          uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view?usp=sharing`;
        setUploadedFileName(uploaded.name || file.name);
        onChange(finalUrl, uploaded.name || file.name);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    // Fallback to Google Apps Script Bridge if configured
    if (activeScriptUrl) {
      setUploading(true);
      setProgress(20);
      try {
        const base64 = await fileToBase64(file);
        setProgress(55);
        const res = await fetch(activeScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            base64,
            folderName: targetFolderName,
          }),
        });
        setProgress(90);
        const json = (await res.json()) as { ok?: boolean; url?: string; name?: string; error?: string };
        if (!json.ok || !json.url) {
          throw new Error(json.error || 'Gagal mengunggah file melalui jembatan Google Drive.');
        }
        setProgress(100);
        setUploadedFileName(json.name || file.name);
        onChange(json.url, json.name || file.name);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    // Neither configured yet -> open quick setup helper
    setShowSetup(true);
    setError(
      'Koneksi Google Drive belum diaktifkan. Masukkan Google OAuth Client ID (untuk masuk ke Google Drive masing-masing pengupload) atau URL Google Apps Script di bawah ini (cukup diatur 1 kali di menu Admin > Pengaturan Sekolah).',
    );
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="label mb-0">{label}</label>
        <button
          type="button"
          onClick={() => setShowSetup((s) => !s)}
          className="text-[11px] font-semibold text-[#162d6e] hover:underline"
        >
          {activeClientId
            ? '✓ Terhubung: Google Drive Pengupload'
            : activeScriptUrl
              ? '✓ Terhubung: Jembatan Google Drive'
              : '⚙️ Pengaturan Google Drive'}
        </button>
      </div>

      {/* Direct Upload Box */}
      <div className="rounded-xl border-2 border-dashed border-[#162d6e]/25 bg-slate-50/80 p-3.5 transition hover:border-[#162d6e]/50">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-[#162d6e]">
              Upload File Langsung dari Perangkat ke Google Drive
            </div>
            <p className="text-[11px] text-slate-500">
              {helperText ??
                'Pilih file dari HP/Laptop Anda. Sistem otomatis mengunggah ke Google Drive, mengaktifkan akses "Siapa saja yang memiliki link", dan mengisi tautan di bawah.'}
            </p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-gold shrink-0 text-xs font-bold py-2 px-3.5"
          >
            {uploading ? `Mengunggah (${progress}%)…` : '📁 Pilih & Upload File'}
          </button>
        </div>

        {uploading && (
          <div className="mt-2.5 space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-[#162d6e] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[11px] font-medium text-slate-600">
              Mengunggah ke Google Drive & mengatur akses tautan publik otomatis… ({progress}%)
            </div>
          </div>
        )}

        {uploadedFileName && !uploading && (
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900">
            <span className="truncate font-semibold">
              ✓ {uploadedFileName} — Terupload ke Google Drive & akses publik otomatis aktif!
            </span>
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-bold text-[#162d6e] underline"
              >
                Cek File ↗
              </a>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
          {error}
        </div>
      )}

      {showSetup && (
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3 text-xs">
          <div className="font-bold text-[#162d6e]">
            Konfigurasi Upload Langsung Google Drive (Tanpa Beban Penyimpanan Server)
          </div>
          <p className="text-slate-600">
            Admin juga dapat menyimpan pengaturan ini secara permanen untuk seluruh Guru & Siswa di menu{' '}
            <b>Admin &rarr; Sekolah &rarr; Tab Integrasi Google Drive</b>.
          </p>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              Opsi 1: Google OAuth Client ID (Masuk ke Google Drive Masing-Masing Pengupload)
            </label>
            <input
              className="input text-xs"
              placeholder="Contoh: 1234567890-abcdefg.apps.googleusercontent.com"
              value={localClientId}
              onChange={(e) => setLocalClientId(e.target.value)}
            />
            <p className="text-[11px] text-slate-500">
              Menggunakan izin <code>drive.file</code>. Saat Guru/Siswa klik Upload, file langsung masuk ke Google Drive akun mereka masing-masing dan otomatis diset <i>&ldquo;Siapa saja yang memiliki link&rdquo;</i>.
            </p>
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-semibold text-slate-700">
                Opsi 2: URL Web App Google Apps Script (Tanpa Perlu Google Cloud Console)
              </label>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2500);
                }}
                className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-[#162d6e] hover:bg-slate-200"
              >
                {copiedScript ? '✓ Kode Script Disalin!' : '📋 Salin Kode Google Apps Script'}
              </button>
            </div>
            <input
              className="input text-xs"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={localScriptUrl}
              onChange={(e) => setLocalScriptUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn text-xs py-1" onClick={() => setShowSetup(false)}>
              Tutup
            </button>
            <button type="button" className="btn btn-primary text-xs py-1" onClick={saveLocalConfig}>
              Simpan di Perangkat Ini
            </button>
          </div>
        </div>
      )}

      {/* URL Input (Auto-filled by upload, or manually editable for YouTube/Docs/Web links) */}
      <div>
        <div className="mb-1 text-[11px] font-medium text-slate-500">
          Tautan File (Otomatis terisi setelah upload, atau tempel manual link YouTube / Google Docs / Web):
        </div>
        <input
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
