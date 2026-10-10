export interface TpScore {
  tp: string; // tujuan pembelajaran, e.g. "menjelaskan sifat-sifat cahaya"
  score: number;
}

// Final score = weighted mix of formative average and SAS/PAS. Adjust to school policy.
export const WEIGHT_FORMATIVE = 0.5;
export const WEIGHT_SAS = 0.5;

export function computeFinal(formative: number | null, sas: number): number {
  const f = formative ?? sas;
  return Math.round((f * WEIGHT_FORMATIVE + sas * WEIGHT_SAS) * 100) / 100;
}

export function predicateOf(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'D';
}

const listID = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} dan ${items[items.length - 1]}`;

const clean = (s: string) => s.trim().replace(/[.;]+$/, '').replace(/^peserta didik\s+(mampu\s+)?/i, '');

/**
 * Deterministic, teacher-editable narrative (no AI call, no cost, works offline).
 * Strong = top TPs at or above KKM + 10; needs-work = below KKM.
 */
export function generateNarasi(o: {
  studentName: string;
  subject: string;
  finalScore: number;
  kkm: number;
  tps: TpScore[];
}): string {
  const first = o.studentName.trim().split(/\s+/)[0];
  const level =
    o.finalScore >= 90
      ? 'menunjukkan penguasaan yang sangat baik'
      : o.finalScore >= 80
        ? 'menunjukkan penguasaan yang baik'
        : o.finalScore >= o.kkm
          ? 'menunjukkan penguasaan yang cukup'
          : 'masih memerlukan bimbingan';

  const parts = [`Ananda ${first} ${level} dalam mata pelajaran ${o.subject}.`];

  const sorted = [...o.tps].sort((a, b) => b.score - a.score);
  const strong = sorted.filter((t) => t.score >= o.kkm + 10).slice(0, 2).map((t) => clean(t.tp));
  const weak = sorted.filter((t) => t.score < o.kkm).slice(-2).map((t) => clean(t.tp));

  if (strong.length) parts.push(`Capaian menonjol terlihat pada kemampuan ${listID(strong)}.`);
  if (weak.length) parts.push(`Perlu bimbingan dan penguatan pada kemampuan ${listID(weak)}.`);
  if (!strong.length && !weak.length && o.tps.length) parts.push('Capaian pada seluruh tujuan pembelajaran berada pada kategori yang merata.');

  return parts.join(' ');
}
