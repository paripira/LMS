-- =====================================================================
-- 005_multi_jenjang.sql
-- Multi-unit school profile settings (SD & SMP separate header, NPSN, Principal & Stamp)
-- =====================================================================

BEGIN;

ALTER TABLE school_settings
  ADD COLUMN IF NOT EXISTS unit_profiles jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMIT;
