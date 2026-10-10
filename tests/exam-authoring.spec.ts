import { test, expect, type APIRequestContext } from '@playwright/test';
import { PASSWORD, ID } from '../scripts/seed-ids';

// API-level end-to-end test (no browser needed): teacher authoring → student sitting → teacher results.
async function as(playwright: { request: { newContext(o: { baseURL?: string }): Promise<APIRequestContext> } }, baseURL: string | undefined, username: string): Promise<APIRequestContext> {
  const ctx = await playwright.request.newContext({ baseURL });
  const r = await ctx.post('/api/auth/login', { data: { username, password: PASSWORD } });
  expect(r.ok()).toBeTruthy();
  return ctx;
}

test('guru menyusun soal & ujian, siswa mengerjakan, guru melihat hasil', async ({ playwright, baseURL }) => {
  const guru = await as(playwright, baseURL, 'guru1');
  const guru2 = await as(playwright, baseURL, 'guru2');
  const siswa = await as(playwright, baseURL, 'siswa3');

  // --- bank soal ---
  const bank = await (await guru.post('/api/banks', { data: { assignmentId: ID.taIPA, title: 'Bank Tes Otomatis' } })).json();
  expect(bank.id).toBeTruthy();
  expect((await guru2.get(`/api/questions?bankId=${bank.id}`)).status()).toBe(403); // bank milik guru lain

  const bad = await guru.post('/api/questions', { data: { bankId: bank.id, type: 'pilihan_ganda', body: 'Soal?', options: [{ id: 'A', text: 'x' }, { id: 'B', text: 'y' }], answer: 'Z', points: 1 } });
  expect(bad.status()).toBe(400); // kunci tidak ada di pilihan

  const mk = async (data: object) => (await (await guru.post('/api/questions', { data: { bankId: bank.id, points: 1, ...data } })).json()).id as string;
  const qPg = await mk({ type: 'pilihan_ganda', body: 'Ibu kota Indonesia?', options: [{ id: 'A', text: 'Bandung' }, { id: 'B', text: 'Jakarta' }, { id: 'C', text: 'Medan' }], answer: 'B' });
  const qBs = await mk({ type: 'benar_salah', body: 'Matahari terbit dari barat.', answer: 'S' });
  const qFill = await mk({ type: 'isian', body: '5 x 2 = ?', answer: ['10', 'sepuluh'] });
  const list = await (await guru.get(`/api/questions?bankId=${bank.id}`)).json();
  expect(list).toHaveLength(3);
  expect(list.find((q: { id: string }) => q.id === qBs).options).toEqual([{ id: 'B', text: 'Benar' }, { id: 'S', text: 'Salah' }]);

  // --- ujian: draf → terbit ---
  const now = Date.now();
  const exam = {
    assignmentId: ID.taIPA, title: 'Ujian Otomatis', durationMinutes: 20,
    opensAt: new Date(now - 3600_000).toISOString(), closesAt: new Date(now + 2 * 3600_000).toISOString(),
    shuffleQuestions: true, shuffleOptions: true, showScore: true, passingScore: 60, questionIds: [qPg, qBs, qFill],
  };
  expect((await guru2.post('/api/exams', { data: exam })).status()).toBe(403); // bukan pengampu
  expect((await guru.post('/api/exams', { data: { ...exam, closesAt: exam.opensAt } })).status()).toBe(400); // jadwal terbalik
  const created = await (await guru.post('/api/exams', { data: exam })).json();
  const examId = created.id as string;

  const startDraft = await siswa.post(`/api/exams/${examId}/start`);
  expect(startDraft.status()).toBe(403); // draf belum dibuka untuk siswa
  expect((await guru.patch(`/api/exams/${examId}`, { data: { action: 'publish' } })).ok()).toBeTruthy();

  // soal yang sudah dipakai ujian terbit dibekukan
  expect((await guru.put(`/api/questions/${qPg}`, { data: { type: 'pilihan_ganda', body: 'Diubah', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }], answer: 'A', points: 1 } })).status()).toBe(409);
  expect((await guru.delete(`/api/questions/${qBs}`)).status()).toBe(409);
  expect((await guru.patch(`/api/exams/${examId}`, { data: { action: 'update', ...exam, assignmentId: undefined } })).status()).toBe(409);

  // --- siswa mengerjakan ---
  const start = await siswa.post(`/api/exams/${examId}/start`);
  expect(start.ok()).toBeTruthy();
  const paper = await start.json();
  expect(paper.questions).toHaveLength(3);
  expect(JSON.stringify(paper)).not.toMatch(/"answer"|explanation/);
  const sub = await (await siswa.post(`/api/exams/${examId}/submit`, {
    data: { sessionId: paper.session.id, answers: { [qPg]: 'B', [qBs]: 'B', [qFill]: '  SEPULUH ' } }, // BS salah, 2 dari 3 benar
  })).json();
  expect(sub).toMatchObject({ ok: true, score: 66.67, correct: 2, total: 3 });

  // --- hasil untuk guru ---
  expect((await siswa.get(`/api/exams/${examId}/results`)).status()).toBe(403);
  const res = await (await guru.get(`/api/exams/${examId}/results`)).json();
  expect(res.summary).toMatchObject({ enrolled: 3, submitted: 1, avg: 66.67, passed: 1 });
  expect(res.rows.find((r: { name: string }) => r.name === 'Siswa Tiga')).toMatchObject({ status: 'submitted', score: 66.67 });
  expect(res.stats.map((s: { correctPct: number }) => s.correctPct)).toEqual([100, 0, 100]);

  // --- izinkan ulang → sesi baru ---
  expect((await guru.post(`/api/exams/${examId}/results`, { data: { action: 'retake', sessionId: res.rows.find((r: { name: string }) => r.name === 'Siswa Tiga').session_id } })).ok()).toBeTruthy();
  const again = await siswa.post(`/api/exams/${examId}/start`);
  expect(again.ok()).toBeTruthy();
  expect((await again.json()).session.id).not.toBe(paper.session.id);

  // --- arsip → siswa tidak bisa mulai; hapus ujian terbit ditolak ---
  expect((await guru.delete(`/api/exams/${examId}`)).status()).toBe(409);
  expect((await guru.patch(`/api/exams/${examId}`, { data: { action: 'archive' } })).ok()).toBeTruthy();
  expect((await siswa.post(`/api/exams/${examId}/start`)).status()).toBe(403);

  // draf baru bisa dihapus
  const draft = await (await guru.post('/api/exams', { data: exam })).json();
  expect((await guru.delete(`/api/exams/${draft.id}`)).ok()).toBeTruthy();
});
