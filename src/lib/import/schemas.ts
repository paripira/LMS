// Isomorphic: the browser validates for instant feedback, the server re-validates before writing.
import { z } from 'zod';

export type ImportEntity = 'students' | 'teachers' | 'classes' | 'subjects' | 'assignments' | 'enrollments';
export const IMPORT_ENTITIES: ImportEntity[] = ['students', 'teachers', 'classes', 'subjects', 'assignments', 'enrollments'];
export const ENTITY_LABEL: Record<ImportEntity, string> = {
  students: 'Siswa',
  teachers: 'Guru',
  classes: 'Kelas',
  subjects: 'Mata Pelajaran',
  assignments: 'Penugasan Guru',
  enrollments: 'Penempatan Siswa ke Kelas',
};

const txt = (max = 120) => z.preprocess((v) => (v == null ? '' : String(v).trim()), z.string().max(max));
const req = (msg: string, max = 120) => txt(max).pipe(z.string().min(1, msg));
const optional = (max = 120) => txt(max).transform((v) => v || undefined);

const dateIso = z.preprocess(
  (v) => {
    const s = v == null ? '' : String(v).trim();
    const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/); // DD/MM/YYYY or DD-MM-YYYY
    return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : s;
  },
  z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, 'format tanggal harus DD/MM/YYYY').transform((v) => v || undefined),
);

export const studentRow = z.object({
  nis: req('NIS wajib diisi', 30),
  nisn: optional(20),
  nama: req('nama wajib diisi'),
  jk: z.preprocess((v) => String(v ?? '').trim().toUpperCase().charAt(0), z.enum(['L', 'P'], { errorMap: () => ({ message: 'harus L atau P' }) })),
  tanggal_lahir: dateIso,
  jenjang: z.preprocess((v) => String(v ?? '').trim().toUpperCase(), z.enum(['TK', 'SD', 'SMP'], { errorMap: () => ({ message: 'harus TK, SD, atau SMP' }) })),
  kelas: optional(30),
  ortu_username: z.preprocess((v) => String(v ?? '').trim().toLowerCase(), z.string().regex(/^([a-z0-9._-]{3,30})?$/, '3–30 karakter huruf kecil/angka').transform((v) => v || undefined)),
  ortu_nama: optional(),
});

export const teacherRow = z.object({
  username: z.preprocess((v) => String(v ?? '').trim().toLowerCase(), z.string().regex(/^[a-z0-9._-]{3,30}$/, '3–30 karakter huruf kecil/angka')),
  nama: req('nama wajib diisi'),
  nip: optional(30),
  telepon: optional(30),
});

export const classRow = z.object({
  nama: req('nama kelas wajib diisi', 30),
  jenjang: z.preprocess((v) => String(v ?? '').trim().toUpperCase(), z.enum(['TK', 'SD', 'SMP'], { errorMap: () => ({ message: 'harus TK, SD, atau SMP' }) })),
  tingkat: z.preprocess((v) => (v === '' || v == null ? NaN : Number(v)), z.number({ invalid_type_error: 'tingkat harus angka 0–9' }).int().min(0).max(9)),
  wali_nip: optional(30),
});

export const subjectRow = z.object({
  kode: req('kode mata pelajaran wajib diisi', 30),
  nama: req('nama mata pelajaran wajib diisi'),
  jenjang: z.preprocess((v) => String(v ?? '').trim().toUpperCase(), z.enum(['TK', 'SD', 'SMP'], { errorMap: () => ({ message: 'harus TK, SD, atau SMP' }) })),
  kkm: z.preprocess((v) => (v === '' || v == null ? 75 : Number(v)), z.number().min(0).max(100).default(75)),
});

export const assignmentRow = z.object({
  guru: req('username atau NIP guru wajib diisi', 50),
  kode_mapel: req('kode mata pelajaran wajib diisi', 30),
  nama_kelas: req('nama kelas wajib diisi', 30),
});

export const enrollmentRow = z.object({
  nis: req('NIS siswa wajib diisi', 30),
  nama_kelas: req('nama kelas wajib diisi', 30),
});

export type StudentRow = z.infer<typeof studentRow>;
export type TeacherRow = z.infer<typeof teacherRow>;
export type ClassRow = z.infer<typeof classRow>;
export type SubjectRow = z.infer<typeof subjectRow>;
export type AssignmentRow = z.infer<typeof assignmentRow>;
export type EnrollmentRow = z.infer<typeof enrollmentRow>;

export const ROW_SCHEMAS = {
  students: studentRow,
  teachers: teacherRow,
  classes: classRow,
  subjects: subjectRow,
  assignments: assignmentRow,
  enrollments: enrollmentRow,
} as const;

export const TEMPLATES: Record<ImportEntity, { headers: string[]; sample: string[] }> = {
  students: {
    headers: ['nis', 'nisn', 'nama', 'jk', 'tanggal_lahir', 'jenjang', 'kelas', 'ortu_username', 'ortu_nama'],
    sample: ['1001', '0012345678', 'Budi Santoso', 'L', '15/03/2014', 'SD', '5A', 'ortu.budi', 'Bapak Santoso'],
  },
  teachers: {
    headers: ['username', 'nama', 'nip', 'telepon'],
    sample: ['bu.sari', 'Sari Wulandari, S.Pd', '198001012005012001', '081234567890'],
  },
  classes: {
    headers: ['nama', 'jenjang', 'tingkat', 'wali_nip'],
    sample: ['5A', 'SD', '5', '198001012005012001'],
  },
  subjects: {
    headers: ['kode', 'nama', 'jenjang', 'kkm'],
    sample: ['MAT-7', 'Matematika Kelas 7', 'SMP', '75'],
  },
  assignments: {
    headers: ['guru', 'kode_mapel', 'nama_kelas'],
    sample: ['bu.sari', 'MAT-7', '7A'],
  },
  enrollments: {
    headers: ['nis', 'nama_kelas'],
    sample: ['1001', '7A'],
  },
};

const ALIASES: Record<string, string> = {
  nama_lengkap: 'nama', nama_siswa: 'nama', nama_guru: 'nama', jenis_kelamin: 'jk', l_p: 'jk',
  tgl_lahir: 'tanggal_lahir', tanggal_lahir_siswa: 'tanggal_lahir', nama_kelas: 'nama', rombel: 'nama_kelas',
  tingkat_kelas: 'tingkat', no_hp: 'telepon', hp: 'telepon', nama_pengguna: 'username',
  kode: 'kode', kode_pelajaran: 'kode', kode_mata_pelajaran: 'kode', mapel: 'kode_mapel',
  mata_pelajaran: 'kode_mapel', nip_guru: 'guru', username_guru: 'guru',
  kelas: 'nama_kelas',
};

export const normHeader = (h: string) => {
  const k = h.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return ALIASES[k] ?? k;
};

export interface RowIssue { row: number; message: string }

/** Row numbers are spreadsheet rows (header = row 1, first data row = 2). */
export function validateRows(entity: ImportEntity, rows: Record<string, unknown>[]) {
  const schema = ROW_SCHEMAS[entity];
  const valid: { row: number; data: unknown }[] = [];
  const errors: RowIssue[] = [];
  rows.forEach((r, i) => {
    const p = schema.safeParse(r);
    if (p.success) valid.push({ row: i + 2, data: p.data });
    else errors.push({ row: i + 2, message: p.error.issues.map((x) => `${String(x.path[0])}: ${x.message}`).join('; ') });
  });
  return { valid, errors };
}
