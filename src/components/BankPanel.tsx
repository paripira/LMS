'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useLookups } from '@/lib/hooks';
import { LETTERS, TYPE_LABEL, questionInput, type QType } from '@/lib/cbt/question-schema';
import { exportRows, readSheet } from '@/lib/import/parse';
import DriveUploadBox from './DriveUploadBox';

export interface Bank { id: string; title: string; grade_level: number; subject_id: string; subject: string; question_count: number }
export interface Q {
  id: string; type: QType; body: string; media: { type: string; url: string }[];
  options: { id: string; text: string }[]; points: number; answer: string | string[] | null; explanation: string | null; locked: boolean;
}

const answerText = (q: Q) => (Array.isArray(q.answer) ? q.answer.join(', ') : (q.answer || '—'));

function QuestionModal({ bankId, initial, onClose }: { bankId: string; initial?: Q; onClose: () => void }) {
  const qc = useQueryClient();
  const [type, setType] = useState<QType>(initial?.type ?? 'pilihan_ganda');
  const [body, setBody] = useState(initial?.body ?? '');
  const [image, setImage] = useState(initial?.media?.[0]?.url ?? '');
  const [opts, setOpts] = useState<string[]>(
    initial?.options.length && initial.type !== 'benar_salah' && initial.type !== 'esai'
      ? initial.options.map((o) => o.text)
      : ['', '', '', ''],
  );
  const [single, setSingle] = useState(typeof initial?.answer === 'string' ? initial.answer : '');
  const [multi, setMulti] = useState<string[]>(initial?.type === 'pg_kompleks' && Array.isArray(initial.answer) ? initial.answer : []);
  const [fill, setFill] = useState(initial?.type === 'isian' && Array.isArray(initial.answer) ? initial.answer.join('\n') : '');
  const [rubric, setRubric] = useState(initial?.type === 'esai' && typeof initial.answer === 'string' ? initial.answer : '');
  const [points, setPoints] = useState(String(initial?.points ?? 1));
  const [expl, setExpl] = useState(initial?.explanation ?? '');
  const [err, setErr] = useState<string | null>(null);

  const choice = type === 'pilihan_ganda' || type === 'pg_kompleks';
  const resetAnswers = () => { setSingle(''); setMulti([]); };

  const save = useMutation({
    mutationFn: (payload: object) =>
      initial
        ? api(`/api/questions/${initial.id}`, { method: 'PUT', json: payload })
        : api('/api/questions', { method: 'POST', json: { bankId, ...payload } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions', bankId] }); qc.invalidateQueries({ queryKey: ['banks'] }); onClose(); },
    onError: (e) => setErr((e as Error).message),
  });

  function submit() {
    const payload = {
      type,
      body,
      imageUrl: image.trim() || null,
      options: choice ? opts.map((t, i) => ({ id: LETTERS[i], text: t })) : [],
      answer:
        type === 'isian'
          ? fill.split('\n').map((s) => s.trim()).filter(Boolean)
          : type === 'pg_kompleks'
          ? multi
          : type === 'esai'
          ? rubric.trim()
          : single,
      points: Number(points),
      explanation: expl.trim() || null,
    };
    const p = questionInput.safeParse(payload); // instant, same rules as the server
    if (!p.success) return setErr(p.error.issues[0].message);
    setErr(null);
    save.mutate(payload);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-label="Form soal" className="max-h-[92vh] w-full max-w-xl space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold text-[#162d6e]">{initial ? 'Ubah soal' : 'Tambah soal'}</h2>
        <div>
          <label htmlFor="qt" className="label">Tipe soal</label>
          <select id="qt" className="input" value={type} onChange={(e) => { setType(e.target.value as QType); resetAnswers(); }}>
            {(Object.keys(TYPE_LABEL) as QType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="qb" className="label">Teks soal</label>
          <textarea id="qb" className="input min-h-24" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <DriveUploadBox
          label="Gambar Soal (Opsional)"
          folderSubpath="Gambar Soal CBT"
          value={image}
          onChange={(url) => setImage(url)}
          helperText="Upload gambar atau diagram langsung ke Google Drive Anda (otomatis diset publik agar dapat dilihat siswa saat ujian)."
        />

        {choice && (
          <fieldset className="space-y-2">
            <legend className="label">Pilihan jawaban ({type === 'pg_kompleks' ? 'centang semua yang benar' : 'pilih satu yang benar'})</legend>
            {opts.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                {type === 'pg_kompleks' ? (
                  <input type="checkbox" aria-label={`Jawaban benar ${LETTERS[i]}`} checked={multi.includes(LETTERS[i])}
                    onChange={() => setMulti(multi.includes(LETTERS[i]) ? multi.filter((x) => x !== LETTERS[i]) : [...multi, LETTERS[i]])} />
                ) : (
                  <input type="radio" name="correct" aria-label={`Jawaban benar ${LETTERS[i]}`} checked={single === LETTERS[i]} onChange={() => setSingle(LETTERS[i])} />
                )}
                <b className="w-5">{LETTERS[i]}.</b>
                <input aria-label={`Pilihan ${LETTERS[i]}`} className="input" value={t} onChange={(e) => setOpts(opts.map((x, j) => (j === i ? e.target.value : x)))} />
                {opts.length > 2 && <button className="btn" aria-label={`Hapus pilihan ${LETTERS[i]}`} onClick={() => { setOpts(opts.filter((_, j) => j !== i)); resetAnswers(); }}>✕</button>}
              </div>
            ))}
            {opts.length < 6 && <button className="btn" onClick={() => setOpts([...opts, ''])}>+ Pilihan</button>}
          </fieldset>
        )}

        {type === 'benar_salah' && (
          <fieldset className="flex gap-4">
            <legend className="label">Jawaban yang benar</legend>
            {[['B', 'Benar'], ['S', 'Salah']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-sm"><input type="radio" name="bs" checked={single === v} onChange={() => setSingle(v)} /> {l}</label>
            ))}
          </fieldset>
        )}

        {type === 'isian' && (
          <div>
            <label htmlFor="qf" className="label">Jawaban yang diterima (satu per baris; huruf besar/kecil diabaikan)</label>
            <textarea id="qf" className="input min-h-20" value={fill} onChange={(e) => setFill(e.target.value)} />
          </div>
        )}

        {type === 'esai' && (
          <div>
            <label htmlFor="qr" className="label">Pedoman Penskoran / Rubrik Jawaban Esai (acuan koreksi guru)</label>
            <textarea
              id="qr"
              className="input min-h-20"
              placeholder="Tuliskan poin-poin kunci jawaban untuk pedoman saat guru menilai jawaban siswa…"
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-[100px_1fr] gap-3">
          <div><label htmlFor="qp" className="label">Poin</label><input id="qp" type="number" step="0.5" min="0.5" className="input" value={points} onChange={(e) => setPoints(e.target.value)} /></div>
          <div><label htmlFor="qe" className="label">Pembahasan (opsional)</label><input id="qe" className="input" value={expl} onChange={(e) => setExpl(e.target.value)} /></div>
        </div>

        {err && <p role="alert" className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{err}</p>}
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" disabled={save.isPending} onClick={submit}>{save.isPending ? 'Menyimpan…' : 'Simpan soal'}</button>
        </div>
      </div>
    </div>
  );
}

export default function BankPanel() {
  const qc = useQueryClient();
  const { data: lk } = useLookups();
  const { data: banks = [] } = useQuery({ queryKey: ['banks'], queryFn: () => api<Bank[]>('/api/banks') });
  const [bankId, setBankId] = useState('');
  const [editing, setEditing] = useState<Q | 'new' | null>(null);
  const [newBank, setNewBank] = useState({ assignmentId: '', title: '' });
  const [renamingBank, setRenamingBank] = useState<{ id: string; title: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const currentBank = banks.find((b) => b.id === bankId);

  useEffect(() => { if (!bankId && banks[0]) setBankId(banks[0].id); }, [banks, bankId]);
  useEffect(() => { if (!newBank.assignmentId && lk?.assignments[0]) setNewBank((n) => ({ ...n, assignmentId: lk.assignments[0].id })); }, [lk, newBank.assignmentId]);

  const { data: qs = [] } = useQuery({ queryKey: ['questions', bankId], enabled: !!bankId, queryFn: () => api<Q[]>(`/api/questions?bankId=${bankId}`) });

  const createBank = useMutation({
    mutationFn: () => api<{ id: string }>('/api/banks', { method: 'POST', json: newBank }),
    onSuccess: (r) => { setNewBank({ ...newBank, title: '' }); setErr(null); setBankId(r.id); qc.invalidateQueries({ queryKey: ['banks'] }); },
    onError: (e) => setErr((e as Error).message),
  });

  const updateBank = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api('/api/banks', { method: 'PATCH', json: { id, title } }),
    onSuccess: () => {
      setErr(null);
      setRenamingBank(null);
      qc.invalidateQueries({ queryKey: ['banks'] });
    },
    onError: (e) => setErr((e as Error).message),
  });

  const deleteBank = useMutation({
    mutationFn: (id: string) => api(`/api/banks?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      setErr(null);
      setBankId('');
      qc.invalidateQueries({ queryKey: ['banks'] });
    },
    onError: (e) => setErr((e as Error).message),
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/questions/${id}`, { method: 'DELETE' }),
    onSuccess: () => { setErr(null); qc.invalidateQueries({ queryKey: ['questions', bankId] }); qc.invalidateQueries({ queryKey: ['banks'] }); },
    onError: (e) => setErr((e as Error).message),
  });

  async function downloadQuestionTemplate() {
    await exportRows(
      [
        {
          tipe: 'pilihan_ganda',
          pertanyaan: 'Berapakah hasil dari 12 x 5?',
          opsi_a: '50',
          opsi_b: '60',
          opsi_c: '70',
          opsi_d: '80',
          kunci: 'B',
          poin: 2,
          pembahasan: '12 dikali 5 sama dengan 60',
        },
        {
          tipe: 'esai',
          pertanyaan: 'Jelaskan 3 contoh penerapan sila ke-3 Pancasila di lingkungan sekolah!',
          opsi_a: '',
          opsi_b: '',
          opsi_c: '',
          opsi_d: '',
          kunci: '1. Mengikuti upacara bendera, 2. Berteman tanpa membedakan suku, 3. Menjaga kerukunan kelas',
          poin: 10,
          pembahasan: '',
        },
      ],
      [
        { header: 'Tipe (pilihan_ganda/pg_kompleks/benar_salah/isian/esai)', key: 'tipe' },
        { header: 'Pertanyaan', key: 'pertanyaan' },
        { header: 'Opsi A', key: 'opsi_a' },
        { header: 'Opsi B', key: 'opsi_b' },
        { header: 'Opsi C', key: 'opsi_c' },
        { header: 'Opsi D', key: 'opsi_d' },
        { header: 'Kunci Jawaban', key: 'kunci' },
        { header: 'Poin', key: 'poin' },
        { header: 'Pembahasan', key: 'pembahasan' },
      ],
      'template-bank-soal.xlsx',
    );
  }

  async function onImportExcel(file?: File) {
    if (!file || !bankId) return;
    setErr(null);
    setImportMsg(null);
    setImporting(true);
    try {
      const rows = await readSheet(file);
      if (rows.length === 0) throw new Error('File Excel kosong.');
      const items = rows.map((r, idx) => {
        const vals = Object.values(r);
        const rawType = String(r['Tipe (pilihan_ganda/pg_kompleks/benar_salah/isian/esai)'] ?? r['Tipe'] ?? vals[0] ?? 'pilihan_ganda')
          .trim()
          .toLowerCase() as QType;
        const body = String(r['Pertanyaan'] ?? vals[1] ?? '').trim();
        const optA = String(r['Opsi A'] ?? vals[2] ?? '').trim();
        const optB = String(r['Opsi B'] ?? vals[3] ?? '').trim();
        const optC = String(r['Opsi C'] ?? vals[4] ?? '').trim();
        const optD = String(r['Opsi D'] ?? vals[5] ?? '').trim();
        const rawKey = String(r['Kunci Jawaban'] ?? vals[6] ?? '').trim();
        const pts = Number(r['Poin'] ?? vals[7] ?? 1) || 1;
        const expl = String(r['Pembahasan'] ?? vals[8] ?? '').trim() || null;

        const options = [
          optA && { id: 'A' as const, text: optA },
          optB && { id: 'B' as const, text: optB },
          optC && { id: 'C' as const, text: optC },
          optD && { id: 'D' as const, text: optD },
        ].filter(Boolean) as { id: 'A' | 'B' | 'C' | 'D'; text: string }[];

        const answer =
          rawType === 'pg_kompleks'
            ? rawKey.split(/[,;]/).map((s) => s.trim().toUpperCase()).filter(Boolean)
            : rawType === 'isian'
            ? rawKey.split(/[|;\n]/).map((s) => s.trim()).filter(Boolean)
            : rawType === 'esai'
            ? rawKey
            : rawKey.toUpperCase();

        const parsed = questionInput.safeParse({
          type: rawType,
          body,
          options,
          answer,
          points: pts,
          explanation: expl,
        });
        if (!parsed.success) {
          throw new Error(`Baris ${idx + 2}: ${parsed.error.issues[0].message}`);
        }
        return parsed.data;
      });

      const res = await api<{ inserted: number }>('/api/questions', {
        method: 'POST',
        json: { bankId, items },
      });
      setImportMsg(`Berhasil mengimpor ${res.inserted} soal ke bank soal ini.`);
      qc.invalidateQueries({ queryKey: ['questions', bankId] });
      qc.invalidateQueries({ queryKey: ['banks'] });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="teramia-banner p-4 sm:p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-white">Bank Soal CBT (Termasuk Esai &amp; Impor Excel)</h1>
        <p className="text-xs text-slate-200 mt-0.5">Kelola koleksi soal Pilihan Ganda, PG Kompleks, Benar/Salah, Isian Singkat, dan Esai/Uraian.</p>
      </div>

      <div className="card space-y-2">
        <h2 className="text-sm font-semibold">Buat bank soal baru</h2>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select aria-label="Mata pelajaran" className="input" value={newBank.assignmentId} onChange={(e) => setNewBank({ ...newBank, assignmentId: e.target.value })}>
            {lk?.assignments.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <input aria-label="Judul bank soal" className="input" placeholder="mis. Bab 1: Gaya & Gerak" value={newBank.title} onChange={(e) => setNewBank({ ...newBank, title: e.target.value })} />
          <button className="btn btn-primary" disabled={!newBank.title.trim() || !newBank.assignmentId || createBank.isPending} onClick={() => createBank.mutate()}>Buat</button>
        </div>
      </div>

      {err && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
      {importMsg && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{importMsg}</p>}

      {banks.length === 0 ? (
        <p className="text-slate-400">Belum ada bank soal. Buat satu di atas.</p>
      ) : (
        <>
          <div className="card flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
              <select aria-label="Pilih bank soal" className="input sm:max-w-sm" value={bankId} onChange={(e) => setBankId(e.target.value)}>
                {banks.map((b) => <option key={b.id} value={b.id}>{b.subject} · {b.title} ({b.question_count} soal)</option>)}
              </select>
              <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Tambah soal</button>
              {currentBank && (
                <>
                  <button
                    type="button"
                    className="btn text-xs font-semibold text-[#162d6e]"
                    onClick={() => setRenamingBank({ id: currentBank.id, title: currentBank.title })}
                  >
                    Ubah Nama
                  </button>
                  <button
                    type="button"
                    className="btn text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    disabled={deleteBank.isPending}
                    onClick={() => {
                      if (confirm(`Hapus bank soal "${currentBank.title}" beserta seluruh soal di dalamnya?`)) {
                        deleteBank.mutate(currentBank.id);
                      }
                    }}
                  >
                    Hapus Bank
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn text-xs" onClick={downloadQuestionTemplate}>
                📥 Template Excel Soal
              </button>
              <label className="btn btn-gold text-xs cursor-pointer">
                <span>{importing ? 'Mengimpor…' : '📤 Impor Soal (.xlsx)'}</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  disabled={importing}
                  onChange={(e) => {
                    onImportExcel(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>

          <ol className="space-y-2">
            {qs.map((q, i) => (
              <li key={q.id} className="card space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="mr-2 rounded bg-[#162d6e]/10 text-[#162d6e] font-semibold px-2 py-0.5 text-xs">{TYPE_LABEL[q.type]}</span>
                    <span className="text-xs text-slate-400">{q.points} poin</span>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{i + 1}. {q.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="btn" disabled={q.locked} title={q.locked ? 'Sudah dipakai ujian yang diterbitkan' : ''} onClick={() => setEditing(q)}>Ubah</button>
                    <button className="btn" disabled={q.locked} onClick={() => confirm('Hapus soal ini?') && del.mutate(q.id)}>Hapus</button>
                  </div>
                </div>
                {q.options.length > 0 && q.type !== 'benar_salah' && q.type !== 'esai' && (
                  <ul className="pl-4 text-sm text-slate-600">{q.options.map((o) => <li key={o.id}>{o.id}. {o.text}</li>)}</ul>
                )}
                <p className="text-xs text-emerald-700">
                  {q.type === 'esai' ? `Rubrik Esai: ${answerText(q)}` : `Kunci: ${answerText(q)}`}
                  {q.locked && ' · 🔒 terpakai di ujian'}
                </p>
              </li>
            ))}
            {qs.length === 0 && <li className="text-sm text-slate-400">Bank ini belum berisi soal.</li>}
          </ol>
        </>
      )}

      {editing && bankId && <QuestionModal key={editing === 'new' ? 'new' : editing.id} bankId={bankId} initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}

      {renamingBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-[#162d6e]">Ubah Nama Bank Soal</h2>
            <div>
              <label className="label">Nama / Judul Bank Soal</label>
              <input
                className="input"
                value={renamingBank.title}
                onChange={(e) => setRenamingBank({ ...renamingBank, title: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn" onClick={() => setRenamingBank(null)}>Batal</button>
              <button
                className="btn btn-primary"
                disabled={!renamingBank.title.trim() || updateBank.isPending}
                onClick={() => updateBank.mutate({ id: renamingBank.id, title: renamingBank.title })}
              >
                {updateBank.isPending ? 'Menyimpan…' : 'Simpan Nama'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
