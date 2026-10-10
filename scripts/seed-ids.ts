// Fixed UUIDs so Playwright tests can address seeded records directly.
export const PASSWORD = 'Passw0rd!';
export const uid = (n: number) => `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;

export const ID = {
  year: uid(1),
  semGanjil: uid(2),
  semGenap: uid(3),
  userAdmin: uid(10),
  userGuru1: uid(11),
  userGuru2: uid(12),
  userKepsek: uid(13),
  userOrtu: uid(14),
  userS1: uid(15),
  userS2: uid(16),
  userS3: uid(17),
  teacher1: uid(20),
  teacher2: uid(21),
  s1: uid(30),
  s2: uid(31),
  s3: uid(32),
  class7A: uid(40),
  subjIPA: uid(50),
  subjMTK: uid(51),
  taIPA: uid(60),
  taMTK: uid(61),
  bank: uid(70),
  exam: uid(80),
};

export const QUESTION_IDS = [uid(101), uid(102), uid(103), uid(104), uid(105)];

/** Demo logins (all share PASSWORD): admin, guru1 (wali 7A, IPA), guru2 (MTK), siswa1..3, ortu1, kepsek */
export const USERS = {
  admin: 'admin',
  guru1: 'guru1',
  guru2: 'guru2',
  siswa1: 'siswa1',
  ortu1: 'ortu1',
  kepsek: 'kepsek',
};
