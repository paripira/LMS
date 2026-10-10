'use client';
import { useExamStore } from './store';

class FatalError extends Error {}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let inflight = false;

/**
 * Sends ALL answers in ONE request. Safe to call repeatedly (server is idempotent).
 * Network/5xx/429 → exponential backoff with jitter, then parks in 'queued' until back online.
 * Other 4xx → throws FatalError with a user-friendly message.
 */
export async function submitExam(): Promise<void> {
  if (inflight) return;
  const s = useExamStore.getState();
  if (!s.sessionId || !s.examId || s.phase === 'done') return;

  inflight = true;
  s.setPhase('sending');
  try {
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const curState = useExamStore.getState();
        const res = await fetch(`/api/exams/${s.examId}/submit`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: s.sessionId,
            answers: curState.answers,
            tabSwitches: curState.tabSwitches ?? 0,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const st = useExamStore.getState();
          st.setResult({ score: data.score, correct: data.correct, total: data.total });
          st.setPhase('done');
          return;
        }
        if (res.status < 500 && res.status !== 429 && res.status !== 408) {
          const body = await res.json().catch(() => ({}));
          throw new FatalError(body.message ?? 'Jawaban tidak dapat dikirim.');
        }
      } catch (e) {
        if (e instanceof FatalError) throw e;
        // Network error: tell the student right away that answers are safe; the runner retries
        // on the browser 'online' event and every 15 s while in 'queued'.
        useExamStore.getState().setPhase('queued');
        return;
      }
      await sleep(Math.min(1000 * 2 ** attempt, 15000) + Math.random() * 500);
    }
    useExamStore.getState().setPhase('queued'); // answers stay safe in localStorage
  } catch (e) {
    useExamStore.getState().setPhase('queued');
    throw e;
  } finally {
    inflight = false;
  }
}
