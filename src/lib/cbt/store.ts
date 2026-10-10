'use client';
import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

export type QuestionType = 'pilihan_ganda' | 'pg_kompleks' | 'benar_salah' | 'isian' | 'esai';
export type Answer = string | string[];
export type Phase = 'idle' | 'running' | 'sending' | 'queued' | 'done';

export interface PaperQuestion {
  id: string;
  type: QuestionType;
  body: string;
  media: { type: 'image' | 'audio'; url: string }[];
  options: { id: string; text: string }[];
  points: number;
}
export interface SubmitResult {
  score: number | null;
  correct: number | null;
  total: number;
}
export interface InitPayload {
  sessionId: string;
  examId: string;
  studentId: string;
  title: string;
  instructions: string | null;
  deadlineAt: number; // server epoch ms
  clockOffset: number; // serverNow - clientNow at start
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  questions: PaperQuestion[];
}

interface ExamState extends Partial<InitPayload> {
  answers: Record<string, Answer>;
  flagged: Record<string, true>;
  current: number;
  phase: Phase;
  result: SubmitResult | null;
  tabSwitches: number;
  init: (p: InitPayload) => void;
  setAnswer: (qid: string, a: Answer | undefined) => void;
  toggleFlag: (qid: string) => void;
  goTo: (i: number) => void;
  setPhase: (p: Phase) => void;
  setResult: (r: SubmitResult) => void;
  incTabSwitch: () => void;
  reset: () => void;
  remainingMs: () => number;
}

// ---- Debounced localStorage: one write per 250 ms burst, flushed when the tab hides/closes ----
let pending: { name: string; value: string } | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const flush = () => {
  if (!pending) return;
  try {
    localStorage.setItem(pending.name, pending.value);
  } catch {
    /* quota/private mode: answers stay in memory */
  }
  pending = null;
};
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
}
const debouncedStorage: StateStorage = {
  getItem: (n) => localStorage.getItem(n),
  setItem: (n, v) => {
    pending = { name: n, value: v };
    clearTimeout(timer);
    timer = setTimeout(flush, 250);
  },
  removeItem: (n) => {
    pending = null;
    localStorage.removeItem(n);
  },
};

const fresh = {
  answers: {},
  flagged: {},
  current: 0,
  phase: 'idle' as Phase,
  result: null,
  tabSwitches: 0,
};

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      ...fresh,

      // Same session (refresh / reconnect) → keep local answers & phase, only refresh the clock.
      // Different session → start clean (also covers a second student on a shared computer).
      init: (p) =>
        set((s) =>
          s.sessionId === p.sessionId && s.phase !== 'idle'
            ? { deadlineAt: p.deadlineAt, clockOffset: p.clockOffset }
            : { ...fresh, ...p, phase: 'running' },
        ),

      setAnswer: (qid, a) =>
        set((s) => {
          const answers = { ...s.answers };
          if (a == null || a === '' || (Array.isArray(a) && a.length === 0)) delete answers[qid];
          else answers[qid] = a;
          return { answers };
        }),

      toggleFlag: (qid) =>
        set((s) => {
          const flagged = { ...s.flagged };
          if (flagged[qid]) delete flagged[qid];
          else flagged[qid] = true;
          return { flagged };
        }),

      goTo: (i) => set({ current: i }),
      setPhase: (phase) => set({ phase }),
      setResult: (result) => set({ result }),
      incTabSwitch: () => set((s) => ({ tabSwitches: (s.tabSwitches ?? 0) + 1 })),
      reset: () => set({ ...fresh, sessionId: undefined, examId: undefined, questions: undefined }),

      // Server-anchored: offset captured at start, so refreshing can't extend the timer.
      remainingMs: () => {
        const { deadlineAt, clockOffset } = get();
        if (deadlineAt == null) return 0;
        return Math.max(0, deadlineAt - (Date.now() + (clockOffset ?? 0)));
      },
    }),
    {
      name: 'cbt-active-exam',
      version: 1,
      storage: createJSONStorage(() => debouncedStorage),
    },
  ),
);
