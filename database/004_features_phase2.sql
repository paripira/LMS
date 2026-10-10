-- =====================================================================
-- Migration 004: Phase 2 Features
-- 1. CBT Essay ('esai') question type & manual essay_scores on exam_sessions
-- 2. Online Leave / Sick Requests (leave_requests) from Parents
-- 3. Teacher Daily Teaching Journal / Berita Acara KBM (teaching_journals)
-- 4. Student Achievements, Discipline Points & Counseling / BK (student_records)
-- =====================================================================

ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'esai';

BEGIN;

ALTER TABLE exam_sessions
  ADD COLUMN IF NOT EXISTS essay_scores jsonb NOT NULL DEFAULT '{}';

-- ---------- PENGAJUAN IZIN / SAKIT ONLINE ORANG TUA ----------
CREATE TABLE IF NOT EXISTS leave_requests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES students(id),
  requested_by   uuid NOT NULL REFERENCES users(id),
  kind           text NOT NULL CHECK (kind IN ('izin', 'sakit')),
  starts_on      date NOT NULL,
  ends_on        date NOT NULL CHECK (ends_on >= starts_on),
  reason         text NOT NULL,
  attachment_url text CHECK (attachment_url IS NULL OR attachment_url ~* '^https?://'),
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by    uuid REFERENCES users(id),
  reviewed_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  deleted_at     timestamptz
);
CREATE INDEX IF NOT EXISTS leave_requests_student_idx ON leave_requests (student_id, starts_on DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS leave_requests_dates_idx   ON leave_requests (starts_on, ends_on, status) WHERE deleted_at IS NULL;

-- ---------- JURNAL MENGAJAR GURU (BERITA ACARA KBM) ----------
CREATE TABLE IF NOT EXISTS teaching_journals (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teaching_assignment_id uuid NOT NULL REFERENCES teaching_assignments(id),
  journal_date           date NOT NULL DEFAULT CURRENT_DATE,
  topic                  text NOT NULL,
  method                 text,
  student_activity       text,
  present_count          int  NOT NULL DEFAULT 0,
  absent_count           int  NOT NULL DEFAULT 0,
  created_by             uuid NOT NULL REFERENCES users(id),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  deleted_at             timestamptz
);
CREATE INDEX IF NOT EXISTS teaching_journals_ta_idx ON teaching_journals (teaching_assignment_id, journal_date DESC) WHERE deleted_at IS NULL;

-- ---------- PRESTASI, POIN KEDISIPLINAN & KONSELING (BK) ----------
CREATE TABLE IF NOT EXISTS student_records (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES students(id),
  semester_id uuid NOT NULL REFERENCES semesters(id),
  kind        text NOT NULL CHECK (kind IN ('prestasi', 'kedisiplinan', 'konseling')),
  category    text NOT NULL,
  title       text NOT NULL,
  description text,
  points      int  NOT NULL DEFAULT 0,
  follow_up   text,
  recorded_on date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid NOT NULL REFERENCES users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS student_records_student_idx ON student_records (student_id, semester_id, recorded_on DESC) WHERE deleted_at IS NULL;

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_leave_requests_touch') THEN
    CREATE TRIGGER trg_leave_requests_touch BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_leave_requests_nodelete') THEN
    CREATE TRIGGER trg_leave_requests_nodelete BEFORE DELETE ON leave_requests FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_teaching_journals_touch') THEN
    CREATE TRIGGER trg_teaching_journals_touch BEFORE UPDATE ON teaching_journals FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_teaching_journals_nodelete') THEN
    CREATE TRIGGER trg_teaching_journals_nodelete BEFORE DELETE ON teaching_journals FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_student_records_touch') THEN
    CREATE TRIGGER trg_student_records_touch BEFORE UPDATE ON student_records FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_student_records_nodelete') THEN
    CREATE TRIGGER trg_student_records_nodelete BEFORE DELETE ON student_records FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
  END IF;
END $$;

COMMIT;
