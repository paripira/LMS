'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from './api-client';
import type { Role } from './server';

export interface Me { name: string; role: Role; isWali: boolean; mustChangePassword?: boolean }
export const useMe = () =>
  useQuery({ queryKey: ['me'], staleTime: 30 * 60_000, queryFn: () => api<Me>('/api/me') });

export interface Lookups {
  semester: { id: string; kind: 'ganjil' | 'genap'; year_name: string; starts_on: string; ends_on: string } | null;
  classes: { id: string; name: string; jenjang: string; is_wali: boolean }[];
  assignments: { id: string; class_id: string; subject_id: string; jenjang?: string; label: string }[];
}
export const useLookups = () =>
  useQuery({ queryKey: ['lookups'], queryFn: () => api<Lookups>('/api/lookups') });

export interface UnitSchoolProfile {
  name?: string | null;
  npsn?: string | null;
  address?: string | null;
  principalName?: string | null;
  principalNip?: string | null;
  stampDataUrl?: string | null;
}

export interface DriveIntegrationConfig {
  clientId?: string | null;
  appsScriptUrl?: string | null;
  folderName?: string | null;
}

export interface School {
  name: string;
  address: string;
  principalName: string;
  principalNip: string | null;
  stampDataUrl: string | null;
  units?: Partial<Record<'TK' | 'SD' | 'SMP', UnitSchoolProfile>>;
  drive?: DriveIntegrationConfig;
}
export const useSchool = () =>
  useQuery({ queryKey: ['school'], staleTime: 60 * 60_000, queryFn: () => api<School>('/api/school') });

export const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
