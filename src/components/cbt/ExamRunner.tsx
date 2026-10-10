'use client';
import { useEffect, useMemo, useState } from 'react';
import { useExamStore, type PaperQuestion, type Answer } from '@/lib/cbt/store';
import { submitExam } from '@/lib/cbt/submit';

// ---------- seeded shuffle: stable across refreshes for the same session ----------
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const r = mulberry32(hash(seed));
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`;
};

export default function ExamRunner({ examId, studentId }: { examId: string; studentId: string }) {
  const [mounted, setMounted] = useState(false); // avoid SSR/localStorage hydration mismatch
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [remaining, setRemaining] = useState(0);

  const st = useExamStore();

  // ---- Start / resume ----
  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    (async () => {
      const local = useExamStore.getState();
      const resumable = local.examId === examId && local.studentId === studentId && !!local.sessionId && local.phase !== 'idle';
      if (local.phase === 'done' && resumable) return;
      try {
        const res = await fetch(`/api/exams/${examId}/start`, { method: 'POST', credentials: 'same-origin' });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          if (data.code === 'ALREADY_SUBMITTED') {
            useExamStore.getState().setPhase('done');
            return;
          }
          if (!resumable) setError(data.message);
          return;
        }
        useExamStore.getState().init({
          sessionId: data.session.id,
          examId,
          studentId,
          title: data.exam.title,
          instructions: data.exam.instructions,
          deadlineAt: data.session.deadlineAt,
          clockOffset: data.session.serverNow - Date.now(),
          shuffleQuestions: data.exam.shuffleQuestions,
          shuffleOptions: data.exam.shuffleOptions,
          questions: data.questions,
        });
      } catch {
        // Offline: if we have a local session we simply keep going from localStorage.
        if (!resumable && !cancelled) setError('Tidak dapat terhubung ke server. Periksa koneksi internet lalu muat ulang halaman.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examId, studentId]);

  // ---- Countdown (1 s tick; derived from server deadline, so it survives refresh) ----
  useEffect(() => {
    if (st.phase !== 'running') return;
    const tick = () => setRemaining(useExamStore.getState().remainingMs());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [st.phase, st.deadlineAt]);

  // ---- Auto-submit at 0, with 0–3 s jitter so 400 clients don't fire in the same millisecond ----
  useEffect(() => {
    if (st.phase !== 'running' || remaining > 0 || st.deadlineAt == null) return;
    const t = setTimeout(() => submitExam().catch(() => {}), Math.random() * 3000);
    return () => clearTimeout(t);
  }, [remaining, st.phase, st.deadlineAt]);

  // ---- Network drop protection: retry when back online, and every 15 s while queued ----
  useEffect(() => {
    const retry = () => {
      if (useExamStore.getState().phase === 'queued') submitExam().catch(() => {});
    };
    window.addEventListener('online', retry);
    const id = setInterval(retry, 15000);
    return () => {
      window.removeEventListener('online', retry);
      clearInterval(id);
    };
  }, []);

  // ---- Warn before accidental close & track tab switches while taking the exam ----
  const MAX_TAB_SWITCHES = 3;
  useEffect(() => {
    if (st.phase !== 'running') return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const onVisChange = () => {
      if (document.visibilityState === 'hidden' && useExamStore.getState().phase === 'running') {
        useExamStore.getState().incTabSwitch();
        if ((useExamStore.getState().tabSwitches ?? 0) > MAX_TAB_SWITCHES) {
          submitExam().catch(() => {});
        }
      }
    };
    window.addEventListener('beforeunload', h);
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      window.removeEventListener('beforeunload', h);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [st.phase]);

  // ---- Auto-submit safeguard if tabSwitches > MAX_TAB_SWITCHES ----
  useEffect(() => {
    if (st.phase === 'running' && (st.tabSwitches ?? 0) > MAX_TAB_SWITCHES) {
      submitExam().catch(() => {});
    }
  }, [st.phase, st.tabSwitches]);

  // ---- Deterministic ordering ----
  const questions = useMemo<PaperQuestion[]>(() => {
    if (!st.questions || !st.sessionId) return [];
    let qs = st.shuffleQuestions ? seededShuffle(st.questions, st.sessionId) : st.questions;
    if (st.shuffleOptions) {
      qs = qs.map((q) =>
        q.type === 'benar_salah' || q.type === 'isian' ? q : { ...q, options: seededShuffle(q.options, st.sessionId + q.id) },
      );
    }
    return qs;
  }, [st.questions, st.sessionId, st.shuffleQuestions, st.shuffleOptions]);

  if (!mounted) return null;
  if (error) return <Notice tone="error" title="Ujian tidak dapat dibuka" text={error} />;

  if (st.phase === 'done') {
    const autoSubmittedByTab = (st.tabSwitches ?? 0) > MAX_TAB_SWITCHES;
    const baseText =
      st.result?.score != null
        ? `Nilai Anda: ${st.result.score} (${st.result.correct}/${st.result.total} benar).`
        : 'Terima kasih. Hasil akan diumumkan oleh guru.';
    return (
      <Notice
        tone={autoSubmittedByTab ? 'error' : 'ok'}
        title={
          autoSubmittedByTab
            ? 'Ujian Dikumpulkan Otomatis (Melebihi Batas Pindah Tab)'
            : 'Jawaban berhasil dikumpulkan'
        }
        text={
          autoSubmittedByTab
            ? `Anda tercatat berpindah tab/meninggalkan layar ujian lebih dari ${MAX_TAB_SWITCHES} kali sehingga lembar jawaban langsung dikumpulkan otomatis. ${baseText}`
            : baseText
        }
        action={{ label: 'Kembali ke beranda', onClick: () => { st.reset(); window.location.href = '/siswa'; } }}
      />
    );
  }

  if (st.phase === 'idle' || questions.length === 0) {
    return <div className="p-8 text-center text-slate-500">Menyiapkan lembar ujian…</div>;
  }

  const q = questions[Math.min(st.current, questions.length - 1)];
  const answered = questions.filter((x) => st.answers[x.id] != null).length;
  const unanswered = questions.length - answered;
  const lowTime = remaining < 5 * 60_000;
  const locked = st.phase === 'sending';

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-4 md:flex-row">
      {/* ---------- main ---------- */}
      <main className="flex-1 space-y-4">
        <header className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{st.title}</h1>
            <p className="text-sm text-slate-500">
              Soal {st.current + 1} dari {questions.length} · Terjawab {answered}
            </p>
          </div>
          <div
            role="timer"
            aria-live="off"
            className={`rounded-lg px-4 py-2 font-mono text-xl tabular-nums ${lowTime ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'}`}
          >
            {fmt(remaining)}
          </div>
        </header>

        {(st.tabSwitches ?? 0) > 0 && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-800">
            ⚠️ <b>Pengawasan Ujian ({st.tabSwitches}/{MAX_TAB_SWITCHES}):</b> Tercatat <b>{st.tabSwitches} kali</b> berpindah tab/meninggalkan layar ujian (batas maksimal {MAX_TAB_SWITCHES} kali). Jika melebihi {MAX_TAB_SWITCHES} kali, ujian akan <b>OTOMATIS DIKUMPULKAN</b>!
          </div>
        )}

        {st.phase === 'queued' && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Koneksi terputus. <b>Jawaban Anda aman di perangkat ini</b> dan akan dikirim otomatis saat internet kembali.
            <button className="ml-2 underline" onClick={() => submitExam().catch(() => {})}>
              Coba kirim sekarang
            </button>
          </div>
        )}

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <p className="whitespace-pre-wrap text-slate-900">{q.body}</p>
          {q.media.map((m, i) =>
            m.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={m.url} alt="" className="mt-3 max-h-64 rounded border" loading="lazy" />
            ) : (
              <audio key={i} src={m.url} controls className="mt-3 w-full" />
            ),
          )}
          <div className="mt-4 space-y-2">
            <AnswerInput q={q} value={st.answers[q.id]} onChange={(a) => st.setAnswer(q.id, a)} disabled={locked} />
          </div>
        </section>

        <footer className="flex items-center justify-between">
          <button
            className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
            disabled={st.current === 0}
            onClick={() => st.goTo(st.current - 1)}
          >
            ← Sebelumnya
          </button>
          <button
            className={`rounded-lg border px-4 py-2 ${st.flagged[q.id] ? 'border-amber-400 bg-amber-100' : 'bg-white'}`}
            onClick={() => st.toggleFlag(q.id)}
          >
            {st.flagged[q.id] ? '⚑ Ditandai ragu-ragu' : '⚐ Tandai ragu-ragu'}
          </button>
          {st.current < questions.length - 1 ? (
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={() => st.goTo(st.current + 1)}>
              Selanjutnya →
            </button>
          ) : (
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white" onClick={() => setConfirming(true)}>
              Selesai & Kumpulkan
            </button>
          )}
        </footer>
      </main>

      {/* ---------- question navigator ---------- */}
      <aside className="w-full rounded-xl bg-white p-4 shadow-sm md:w-64">
        <div className="grid grid-cols-6 gap-2 md:grid-cols-5">
          {questions.map((x, i) => {
            const isAnswered = st.answers[x.id] != null;
            const cls = i === st.current
              ? 'ring-2 ring-blue-500'
              : '';
            const bg = st.flagged[x.id] ? 'bg-amber-300' : isAnswered ? 'bg-emerald-500 text-white' : 'bg-slate-100';
            return (
              <button key={x.id} onClick={() => st.goTo(i)} className={`h-9 rounded text-sm ${bg} ${cls}`}>
                {i + 1}
              </button>
            );
          })}
        </div>
        <button
          className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-white disabled:opacity-50"
          disabled={locked}
          onClick={() => setConfirming(true)}
        >
          {locked ? 'Mengirim…' : 'Selesai & Kumpulkan'}
        </button>
      </aside>

      {/* ---------- confirm dialog ---------- */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Kumpulkan jawaban?</h2>
            <p className="mt-2 text-sm text-slate-600">
              {unanswered > 0 ? `Masih ada ${unanswered} soal belum dijawab. ` : 'Semua soal sudah dijawab. '}
              Setelah dikumpulkan, jawaban tidak dapat diubah.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-lg border px-4 py-2" onClick={() => setConfirming(false)}>
                Kembali
              </button>
              <button
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
                onClick={() => {
                  setConfirming(false);
                  submitExam().catch((e) => setError(e.message));
                }}
              >
                Ya, kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- answer widgets ----------
function AnswerInput({
  q,
  value,
  onChange,
  disabled,
}: {
  q: PaperQuestion;
  value: Answer | undefined;
  onChange: (a: Answer | undefined) => void;
  disabled: boolean;
}) {
  if (q.type === 'isian') {
    return (
      <input
        className="w-full rounded-lg border p-3"
        placeholder="Ketik jawaban singkat Anda"
        value={typeof value === 'string' ? value : ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (q.type === 'esai') {
    return (
      <textarea
        rows={6}
        className="w-full rounded-lg border p-3 text-sm leading-relaxed"
        placeholder="Tuliskan jawaban uraian / esai Anda secara lengkap di sini…"
        value={typeof value === 'string' ? value : ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  const multi = q.type === 'pg_kompleks';
  const selected = multi ? (Array.isArray(value) ? value : []) : value;
  return (
    <>
      {q.options.map((o) => {
        const checked = multi ? (selected as string[]).includes(o.id) : selected === o.id;
        return (
          <label
            key={o.id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${checked ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
          >
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={q.id}
              className="mt-1"
              checked={checked}
              disabled={disabled}
              onChange={() => {
                if (multi) {
                  const cur = selected as string[];
                  onChange(checked ? cur.filter((x) => x !== o.id) : [...cur, o.id]);
                } else onChange(o.id);
              }}
            />
            <span>
              <b className="mr-2">{o.id}.</b>
              {o.text}
            </span>
          </label>
        );
      })}
    </>
  );
}

function Notice({
  tone,
  title,
  text,
  action,
}: {
  tone: 'ok' | 'error';
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl bg-white p-8 text-center shadow">
      <h1 className={`text-xl font-semibold ${tone === 'ok' ? 'text-emerald-700' : 'text-red-700'}`}>{title}</h1>
      <p className="mt-2 text-slate-600">{text}</p>
      {action && (
        <button className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
