export type QuestionType = 'pilihan_ganda' | 'pg_kompleks' | 'benar_salah' | 'isian' | 'esai';
export type Answer = string | string[];

export interface KeyRow {
  id: string;
  type: QuestionType;
  points: number;
  answer: unknown; // JSONB from question_keys
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export function isCorrect(k: KeyRow, a: Answer | undefined): boolean {
  if (a == null) return false;
  switch (k.type) {
    case 'pilihan_ganda':
    case 'benar_salah':
      return typeof a === 'string' && a === String(k.answer);

    case 'pg_kompleks': {
      // all-or-nothing; swap for partial credit here if the school prefers it
      const want = [...(k.answer as string[])].sort();
      const got = Array.isArray(a) ? [...a].sort() : [];
      return want.length === got.length && want.every((v, i) => v === got[i]);
    }

    case 'isian': {
      const accepted = (Array.isArray(k.answer) ? k.answer : [k.answer]).map((x) => norm(String(x)));
      return typeof a === 'string' && accepted.includes(norm(a));
    }

    case 'esai':
      return false; // Graded manually by teacher via essay_scores
  }
}

export function gradeExam(
  keys: KeyRow[],
  answers: Record<string, Answer>,
  essayScores: Record<string, number> = {},
) {
  let earned = 0;
  let total = 0;
  let correct = 0;
  for (const k of keys) {
    total += k.points;
    if (k.type === 'esai') {
      const raw = Number(essayScores[k.id] ?? 0);
      const pts = Number.isFinite(raw) ? Math.min(k.points, Math.max(0, raw)) : 0;
      earned += pts;
      if (pts >= k.points && k.points > 0) correct++;
    } else if (isCorrect(k, answers[k.id])) {
      earned += k.points;
      correct++;
    }
  }
  return {
    score: total > 0 ? Math.round((earned / total) * 10000) / 100 : 0, // 0–100, 2 dp
    correct,
    total: keys.length,
  };
}
