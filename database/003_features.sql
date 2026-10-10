BEGIN;

-- ---------- NOTIFIKASI DALAM APLIKASI ----------
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id),
  title      text NOT NULL,
  body       text NOT NULL,
  link       text,
  type       text NOT NULL DEFAULT 'info', -- 'info','tugas','ujian','presensi','rapor'
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS notif_user_idx ON notifications (user_id, is_read, created_at DESC) WHERE deleted_at IS NULL;

-- ---------- JADWAL PELAJARAN (LESSON SCHEDULES) ----------
CREATE TABLE IF NOT EXISTS schedules (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id       uuid NOT NULL REFERENCES academic_years(id),
  semester_id            uuid NOT NULL REFERENCES semesters(id),
  class_id               uuid NOT NULL REFERENCES classes(id),
  teaching_assignment_id uuid NOT NULL REFERENCES teaching_assignments(id),
  day_of_week            smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Senin, 2=Selasa, ..., 6=Sabtu, 7=Minggu
  start_time             time NOT NULL,
  end_time               time NOT NULL CHECK (end_time > start_time),
  room                   text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS schedules_class_idx ON schedules (class_id, semester_id, day_of_week) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS schedules_ta_idx ON schedules (teaching_assignment_id, semester_id, day_of_week) WHERE deleted_at IS NULL;

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_schedules_touch') THEN
    CREATE TRIGGER trg_schedules_touch BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_schedules_nodelete') THEN
    CREATE TRIGGER trg_schedules_nodelete BEFORE DELETE ON schedules FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notifications_nodelete') THEN
    CREATE TRIGGER trg_notifications_nodelete BEFORE DELETE ON notifications FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
  END IF;
END $$;

COMMIT;
