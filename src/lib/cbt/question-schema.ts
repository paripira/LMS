// Isomorphic: the form validates instantly in the browser, the API re-validates before saving.
import { z } from 'zod';

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type QType = 'pilihan_ganda' | 'pg_kompleks' | 'benar_salah' | 'isian' | 'esai';
export const TYPE_LABEL: Record<QType, string> = {
  pilihan_ganda: 'Pilihan ganda',
  pg_kompleks: 'Pilihan ganda kompleks',
  benar_salah: 'Benar / Salah',
  isian: 'Isian singkat',
  esai: 'Esai / Uraian',
};

const option = z.object({
  id: z.enum(LETTERS),
  text: z.string().trim().min(1, 'Teks pilihan wajib diisi').max(500),
});
// Zero-upload architecture: images are external links, never files on our server.
const httpUrl = z.string().trim().max(500).regex(/^https?:\/\//i, 'Alamat gambar harus diawali http:// atau https://');

export const questionInput = z
  .object({
    type: z.enum(['pilihan_ganda', 'pg_kompleks', 'benar_salah', 'isian', 'esai']),
    body: z.string().trim().min(1, 'Teks soal wajib diisi').max(4000),
    imageUrl: httpUrl.nullish().transform((v) => v || null),
    options: z.array(option).max(6).default([]),
    answer: z.union([z.string().max(2000), z.array(z.string().trim().min(1).max(200)).max(10)]).default(''),
    points: z.number().min(0.5, 'Poin minimal 0,5').max(100, 'Poin maksimal 100'),
    explanation: z.string().trim().max(1000).nullish().transform((v) => v || null),
  })
  .superRefine((q, ctx) => {
    const bad = (message: string, path: (string | number)[] = ['answer']) => ctx.addIssue({ code: 'custom', message, path });
    const ids: string[] = q.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) return bad('Huruf pilihan tidak boleh ganda', ['options']);
    switch (q.type) {
      case 'pilihan_ganda':
        if (q.options.length < 2) bad('Minimal 2 pilihan jawaban', ['options']);
        else if (typeof q.answer !== 'string' || !ids.includes(q.answer)) bad('Pilih satu jawaban yang benar');
        break;
      case 'pg_kompleks':
        if (q.options.length < 3) bad('Minimal 3 pilihan jawaban', ['options']);
        else if (!Array.isArray(q.answer) || q.answer.length < 1 || !q.answer.every((a) => ids.includes(a))) bad('Pilih minimal satu jawaban yang benar');
        break;
      case 'benar_salah':
        if (q.answer !== 'B' && q.answer !== 'S') bad('Pilih Benar atau Salah');
        break;
      case 'isian':
        if (!Array.isArray(q.answer) || q.answer.length < 1) bad('Isi minimal satu jawaban yang diterima');
        break;
      case 'esai':
        // Essay rubric/key is optional text for teacher reference during manual grading
        break;
    }
  });

export type QuestionInput = z.input<typeof questionInput>;

/** Shape persisted in `questions` (+ answer key in `question_keys`). */
export function toStored(q: z.output<typeof questionInput>) {
  return {
    type: q.type,
    body: q.body,
    media: q.imageUrl ? [{ type: 'image', url: q.imageUrl }] : [],
    options:
      q.type === 'benar_salah'
        ? [{ id: 'B', text: 'Benar' }, { id: 'S', text: 'Salah' }]
        : q.type === 'isian' || q.type === 'esai'
        ? []
        : q.options,
    key: q.type === 'esai' ? (typeof q.answer === 'string' ? q.answer : '') : q.answer,
  };
}
