'use client';
import type { Column } from '@/components/DataTable';

// Each master-data screen is defined ONCE here. Table layout (columns/widths) changes only by editing this file.
export interface Field {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
  createOnly?: boolean; // shown disabled when editing, never sent on update
  options?: { value: string; label: string }[];
  from?: { entity: string; label: (r: any) => string }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface EntityConfig {
  entity: string;
  title: string;
  columns: Column<any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  fields: Field[];
  search: (r: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any
  canReset?: boolean;
  resetLabel?: string;
}

const JENJANG = ['TK', 'SD', 'SMP'].map((v) => ({ value: v, label: v }));

export const CONFIGS: Record<string, EntityConfig> = {
  students: {
    entity: 'students',
    title: 'Data Siswa',
    canReset: true,
    resetLabel: 'Akun / Sandi',
    search: (r) => `${r.nis} ${r.full_name} ${r.class_name ?? ''}`,
    columns: [
      { key: 'nis', header: 'NIS', width: '100px' },
      { key: 'full_name', header: 'Nama', width: '240px' },
      { key: 'gender', header: 'JK', width: '50px' },
      { key: 'jenjang', header: 'Jenjang', width: '80px' },
      { key: 'class_name', header: 'Kelas', width: '90px', render: (r) => r.class_name ?? '—' },
      { key: 'status', header: 'Status', width: '80px', render: (r) => r.status ?? 'aktif' },
      { key: 'has_account', header: 'Akun', width: '70px', render: (r) => (r.has_account ? 'Ada' : '—') },
    ],
    fields: [
      { name: 'nis', label: 'NIS', required: true },
      { name: 'nisn', label: 'NISN' },
      { name: 'full_name', label: 'Nama lengkap', required: true },
      { name: 'gender', label: 'Jenis kelamin', type: 'select', required: true, options: [{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }] },
      { name: 'birth_date', label: 'Tanggal lahir', type: 'date' },
      { name: 'jenjang', label: 'Jenjang', type: 'select', required: true, options: JENJANG },
      { name: 'class_id', label: 'Kelas', type: 'select', from: { entity: 'classes', label: (r) => `[${r.jenjang}] ${r.name} (${r.year_name})` } },
    ],
  },
  teachers: {
    entity: 'teachers',
    title: 'Data Guru',
    canReset: true,
    resetLabel: 'Reset Sandi',
    search: (r) => `${r.full_name} ${r.nip ?? ''} ${r.username}`,
    columns: [
      { key: 'full_name', header: 'Nama', width: '260px' },
      { key: 'nip', header: 'NIP', width: '140px', render: (r) => r.nip ?? '—' },
      { key: 'username', header: 'Nama pengguna', width: '160px' },
      { key: 'phone', header: 'Telepon', width: '140px', render: (r) => r.phone ?? '—' },
    ],
    fields: [
      { name: 'full_name', label: 'Nama lengkap', required: true },
      { name: 'username', label: 'Nama pengguna (login)', required: true, createOnly: true },
      { name: 'nip', label: 'NIP' },
      { name: 'phone', label: 'Telepon' },
    ],
  },
  classes: {
    entity: 'classes',
    title: 'Data Kelas',
    search: (r) => `${r.name} ${r.jenjang} ${r.year_name} ${r.homeroom_name ?? ''}`,
    columns: [
      { key: 'name', header: 'Kelas', width: '90px' },
      { key: 'year_name', header: 'Tahun ajaran', width: '120px' },
      { key: 'jenjang', header: 'Jenjang', width: '80px' },
      { key: 'grade_level', header: 'Tingkat', width: '80px' },
      { key: 'homeroom_name', header: 'Wali kelas', width: '220px', render: (r) => r.homeroom_name ?? '—' },
      { key: 'student_count', header: 'Siswa', width: '70px' },
    ],
    fields: [
      { name: 'academic_year_id', label: 'Tahun ajaran', type: 'select', required: true, from: { entity: 'years', label: (r) => r.name } },
      { name: 'jenjang', label: 'Jenjang', type: 'select', required: true, options: JENJANG },
      { name: 'grade_level', label: 'Tingkat (SD: 1–6, SMP: 7–9)', type: 'number', required: true },
      { name: 'name', label: 'Nama kelas (mis. 1A atau 7A)', required: true },
      { name: 'homeroom_teacher_id', label: 'Wali kelas', type: 'select', from: { entity: 'teachers', label: (r) => r.full_name } },
    ],
  },
  subjects: {
    entity: 'subjects',
    title: 'Mata Pelajaran',
    search: (r) => `${r.code} ${r.name} ${r.jenjang}`,
    columns: [
      { key: 'code', header: 'Kode', width: '100px' },
      { key: 'name', header: 'Nama', width: '300px' },
      { key: 'jenjang', header: 'Jenjang', width: '90px' },
      { key: 'kkm', header: 'KKM', width: '80px' },
    ],
    fields: [
      { name: 'jenjang', label: 'Jenjang', type: 'select', required: true, options: JENJANG },
      { name: 'code', label: 'Kode', required: true },
      { name: 'name', label: 'Nama mata pelajaran', required: true },
      { name: 'kkm', label: 'KKM', type: 'number' },
    ],
  },
  assignments: {
    entity: 'assignments',
    title: 'Penugasan Guru',
    search: (r) => `${r.teacher_name} ${r.subject_name} ${r.class_name} ${r.jenjang ?? ''}`,
    columns: [
      { key: 'semester_name', header: 'Semester', width: '140px' },
      { key: 'jenjang', header: 'Jenjang', width: '80px' },
      { key: 'class_name', header: 'Kelas', width: '90px' },
      { key: 'subject_name', header: 'Mata pelajaran', width: '240px' },
      { key: 'teacher_name', header: 'Guru', width: '220px' },
    ],
    fields: [
      { name: 'semester_id', label: 'Semester', type: 'select', required: true, from: { entity: 'semesters', label: (r) => r.label } },
      { name: 'class_id', label: 'Kelas', type: 'select', required: true, from: { entity: 'classes', label: (r) => `[${r.jenjang}] ${r.name} (${r.year_name})` } },
      { name: 'subject_id', label: 'Mata pelajaran', type: 'select', required: true, from: { entity: 'subjects', label: (r) => `[${r.jenjang}] ${r.name}` } },
      { name: 'teacher_id', label: 'Guru', type: 'select', required: true, from: { entity: 'teachers', label: (r) => r.full_name } },
    ],
  },
  parents: {
    entity: 'parents',
    title: 'Data Orang Tua',
    canReset: true,
    resetLabel: 'Reset Sandi',
    search: (r) => `${r.full_name} ${r.username} ${r.email ?? ''}`,
    columns: [
      { key: 'full_name', header: 'Nama Lengkap', width: '240px' },
      { key: 'username', header: 'Nama Pengguna', width: '160px' },
      { key: 'email', header: 'Email', width: '200px', render: (r) => r.email ?? '—' },
      { key: 'children_count', header: 'Jumlah Anak', width: '100px', render: (r) => `${r.children_count ?? 0} anak` },
    ],
    fields: [
      { name: 'full_name', label: 'Nama lengkap orang tua', required: true },
      { name: 'username', label: 'Nama pengguna (login)', required: true, createOnly: true },
      { name: 'email', label: 'Alamat Email' },
    ],
  },
};

