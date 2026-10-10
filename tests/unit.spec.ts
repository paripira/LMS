import { test, expect } from '@playwright/test';
import { gradeExam, type KeyRow } from '../src/lib/cbt/grade';
import { computeFinal, predicateOf, generateNarasi } from '../src/lib/erapor/narasi';
import { validateRows } from '../src/lib/import/schemas';

const keys: KeyRow[] = [
  { id: 'q1', type: 'pilihan_ganda', points: 1, answer: 'B' },
  { id: 'q2', type: 'pg_kompleks', points: 2, answer: ['A', 'C'] },
  { id: 'q3', type: 'isian', points: 1, answer: ['Jakarta', 'DKI Jakarta'] },
  { id: 'q4', type: 'benar_salah', points: 1, answer: 'S' },
];

test.describe('gradeExam', () => {
  test('semua benar → 100', () => {
    const r = gradeExam(keys, { q1: 'B', q2: ['C', 'A'], q3: '  jakarta ', q4: 'S' });
    expect(r).toEqual({ score: 100, correct: 4, total: 4 });
  });
  test('pg kompleks: sebagian benar tidak mendapat poin; kosong dianggap salah', () => {
    const r = gradeExam(keys, { q1: 'A', q2: ['A'] });
    expect(r.correct).toBe(0);
    expect(r.score).toBe(0);
  });
  test('bobot poin dihitung proporsional', () => {
    const r = gradeExam(keys, { q2: ['A', 'C'] }); // 2 dari 5 poin
    expect(r.score).toBe(40);
  });
});

test.describe('e-Rapor narasi & nilai akhir', () => {
  test('nilai akhir & predikat', () => {
    expect(computeFinal(80, 90)).toBe(85);
    expect(computeFinal(null, 70)).toBe(70);
    expect(['A', 'B', 'C', 'D']).toEqual([95, 85, 75, 50].map(predicateOf));
  });
  test('narasi menyebut capaian menonjol & yang perlu penguatan', () => {
    const t = generateNarasi({
      studentName: 'Siti Aminah', subject: 'IPA', finalScore: 82, kkm: 75,
      tps: [{ tp: 'Peserta didik mampu menjelaskan gaya', score: 95 }, { tp: 'menghitung tekanan', score: 60 }],
    });
    expect(t).toContain('Ananda Siti');
    expect(t).toContain('menjelaskan gaya');
    expect(t).toMatch(/Perlu bimbingan.*menghitung tekanan/);
  });
});

test.describe('validasi impor', () => {
  test('menormalkan tanggal & JK, menolak data buruk dengan nomor baris', () => {
    const { valid, errors } = validateRows('students', [
      { nis: '1', nama: 'A', jk: 'Laki-laki', jenjang: 'sd', tanggal_lahir: '05/03/2014' },
      { nis: '', nama: 'B', jk: 'X', jenjang: 'SMA' },
    ]);
    expect(valid).toHaveLength(1);
    expect((valid[0].data as { jk: string; tanggal_lahir: string }).jk).toBe('L');
    expect((valid[0].data as { tanggal_lahir: string }).tanggal_lahir).toBe('2014-03-05');
    expect(errors[0].row).toBe(3);
    expect(errors[0].message).toMatch(/NIS wajib diisi/);
  });
});
