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
  nama: req('Nama siswa wajib diisi'),
  kelas: req('Kelas siswa wajib diisi', 30),
  nis: optional(30),
  nisn: optional(20),
  jk: z.preprocess((v) => {
    const s = String(v ?? '').trim().toUpperCase().charAt(0);
    return s === 'P' ? 'P' : 'L';
  }, z.enum(['L', 'P'])).default('L'),
  tanggal_lahir: dateIso,
  jenjang: z.preprocess((v) => {
    const s = String(v ?? '').trim().toUpperCase();
    return ['TK', 'SD', 'SMP'].includes(s) ? s : undefined;
  }, z.enum(['TK', 'SD', 'SMP']).optional()),
  ortu_username: z.preprocess((v) => String(v ?? '').trim().toLowerCase(), z.string().regex(/^([a-z0-9._-]{3,30})?$/, '3–30 karakter huruf kecil/angka').transform((v) => v || undefined)),
  ortu_nama: optional(),
});

export const teacherRow = z.object({
  nama: req('nama guru wajib diisi'),
  username: z.preprocess(
    (v) => (v == null ? '' : String(v).trim().toLowerCase()),
    z.string().regex(/^([a-z0-9._-]{3,30})?$/, 'username harus 3–30 karakter huruf kecil/angka').transform((v) => v || undefined),
  ),
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
    headers: ['nama', 'kelas', 'jk', 'nis', 'nisn', 'tanggal_lahir', 'jenjang', 'ortu_username', 'ortu_nama'],
    sample: ['Budi Santoso', '7A', 'L', '7A01', '0012345678', '15/03/2014', 'SMP', 'ortu.budi', 'Bapak Santoso'],
  },
  teachers: {
    headers: ['nama', 'username', 'nip', 'telepon'],
    sample: ['Sari Wulandari, S.Pd', 'sari.wulandari', '198001012005012001', '081234567890'],
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
  tgl_lahir: 'tanggal_lahir', tanggal_lahir_siswa: 'tanggal_lahir',
  tingkat_kelas: 'tingkat', no_hp: 'telepon', hp: 'telepon', nomor_telepon: 'telepon', nomor_hp: 'telepon', telp: 'telepon',
  nama_pengguna: 'username',
  kode: 'kode', kode_pelajaran: 'kode', kode_mata_pelajaran: 'kode', mapel: 'kode_mapel',
  mata_pelajaran: 'kode_mapel',
  rombel: 'kelas',
};

export const normHeader = (h: string) => {
  const k = h.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return ALIASES[k] ?? k;
};

// Helper to clean Indonesian titles and generate a clean, professional username for teachers
export function cleanTeacherUsername(nama: string, used: Set<string>): string {
  // 1. Remove prefixes repeatedly from the beginning of the name
  let s = nama.trim();
  const prefixRegex = /^(dra|drs|prof|dr|ir|kh|k\.h|h|hj|ust|ustadz)\b\.?\s*/i;
  while (prefixRegex.test(s)) {
    s = s.replace(prefixRegex, '').trim();
  }

  // 2. Remove degree suffixes after comma or at the end
  s = s.replace(/,\s*.*$/gi, '');
  s = s.replace(/\b(s\.pd(\.[a-z]+)?|m\.pd(\.[a-z]+)?|s\.si|m\.si|s\.kom|m\.kom|s\.ag|m\.ag|s\.pd\.i|s\.t|m\.t|s\.e|m\.m|s\.sos|m\.sos|s\.ked|gr|ph\.?d|m\.sc|b\.sc)\b\.?/gi, '');

  // 3. Extract alphanumeric tokens
  const tokens = s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  let base = '';
  if (tokens.length >= 2) {
    base = `${tokens[0]}.${tokens[1]}`;
  } else if (tokens.length === 1) {
    base = tokens[0];
  } else {
    base = 'guru';
  }

  if (base.length < 3) {
    base = `guru.${base}`;
  }
  base = base.slice(0, 25);

  let candidate = base;
  let counter = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base}${counter}`;
    counter++;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

export interface RowIssue { row: number; message: string }

/** Row numbers are spreadsheet rows (header = row 1, first data row = 2). */
export function validateRows(entity: ImportEntity, rows: Record<string, unknown>[]) {
  const schema = ROW_SCHEMAS[entity];
  const valid: { row: number; data: unknown }[] = [];
  const errors: RowIssue[] = [];
  rows.forEach((r, i) => {
    const row: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) {
      row[normHeader(k)] = v;
    }
    if (row.nama_kelas && !row.kelas) row.kelas = row.nama_kelas;
    if (row.kelas && !row.nama_kelas) row.nama_kelas = row.kelas;
    if (row.nip && !row.guru) row.guru = row.nip;
    if (row.username && !row.guru) row.guru = row.username;
    if (row.nip_guru) {
      if (!row.nip) row.nip = row.nip_guru;
      if (!row.guru) row.guru = row.nip_guru;
    }
    const p = schema.safeParse(row);
    if (p.success) valid.push({ row: i + 2, data: p.data });
    else errors.push({ row: i + 2, message: p.error.issues.map((x) => `${String(x.path[0])}: ${x.message}`).join('; ') });
  });
  return { valid, errors };
}
