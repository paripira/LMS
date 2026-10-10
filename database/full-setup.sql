-- Berkas gabungan (schema.sql + 002_extras.sql) untuk dijalankan manual dengan psql di database KOSONG:
--   psql "$DATABASE_URL" -f database/full-setup.sql
-- Catatan: cara yang disarankan tetap 'npm run db:migrate' (mencatat versi migrasi).

-- =====================================================================
-- School LMS (TK / SD / SMP) - PostgreSQL 14+ schema
-- Conventions
--   * UUID PKs (gen_random_uuid), timestamptz everywhere
--   * Soft delete: deleted_at on every business table. Hard DELETE is blocked by trigger.
--   * FKs are ON DELETE RESTRICT (default). Uniqueness is enforced with PARTIAL indexes
--     (WHERE deleted_at IS NULL) so a soft-deleted row never blocks a re-insert.
--   * Business-rule violations RAISE short codes (SEMESTER_CLOSED, GRADE_LOCKED, ...)
--     which the API maps to friendly Indonesian messages (never shown raw).
-- =====================================================================
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ---------- ENUMS ----------
CREATE TYPE user_role         AS ENUM ('admin','guru','siswa','orang_tua','kepala_sekolah');
CREATE TYPE jenjang           AS ENUM ('TK','SD','SMP');
CREATE TYPE attendance_status AS ENUM ('hadir','izin','sakit','alpa');
CREATE TYPE semester_kind     AS ENUM ('ganjil','genap');
CREATE TYPE semester_status   AS ENUM ('upcoming','active','closed');
CREATE TYPE question_type     AS ENUM ('pilihan_ganda','pg_kompleks','benar_salah','isian');
CREATE TYPE exam_status       AS ENUM ('draft','published','archived');
CREATE TYPE session_status    AS ENUM ('in_progress','submitted');
CREATE TYPE report_status     AS ENUM ('draft','submitted','approved');
CREATE TYPE promotion_status  AS ENUM ('naik','tinggal','lulus','pindah');

-- ---------- GENERIC TRIGGER FUNCTIONS ----------
CREATE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

CREATE FUNCTION prevent_hard_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'HARD_DELETE_FORBIDDEN'; END $$;

-- ---------- IDENTITY ----------
CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username      citext NOT NULL,
  email         citext,
  password_hash text   NOT NULL,
  role          user_role NOT NULL,
  full_name     text   NOT NULL,
  is_active     boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX users_username_uq ON users (username) WHERE deleted_at IS NULL;
CREATE INDEX users_role_idx ON users (role) WHERE deleted_at IS NULL;

CREATE TABLE academic_years (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name      text NOT NULL,                       -- '2025/2026'
  starts_on date NOT NULL,
  ends_on   date NOT NULL CHECK (ends_on > starts_on),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX academic_years_name_uq   ON academic_years (name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX academic_years_active_uq ON academic_years ((true)) WHERE is_active AND deleted_at IS NULL;

CREATE TABLE semesters (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  kind             semester_kind NOT NULL,
  starts_on        date NOT NULL,
  ends_on          date NOT NULL CHECK (ends_on > starts_on),
  status           semester_status NOT NULL DEFAULT 'upcoming',
  closed_at        timestamptz,
  closed_by        uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX semesters_year_kind_uq ON semesters (academic_year_id, kind) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX semesters_active_uq    ON semesters ((true)) WHERE status = 'active' AND deleted_at IS NULL;

CREATE TABLE teachers (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES users(id),
  nip       text,
  full_name text NOT NULL,
  phone     text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX teachers_user_uq ON teachers (user_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX teachers_nip_uq  ON teachers (nip) WHERE nip IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE students (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id),
  nis        text NOT NULL,
  nisn       text,
  full_name  text NOT NULL,
  gender     char(1) NOT NULL CHECK (gender IN ('L','P')),
  birth_date date,
  jenjang    jenjang NOT NULL,
  status     text NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','lulus','pindah','keluar')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX students_nis_uq  ON students (nis)  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX students_nisn_uq ON students (nisn) WHERE nisn IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX students_user_uq ON students (user_id) WHERE user_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX students_name_idx ON students (lower(full_name)) WHERE deleted_at IS NULL;

-- Parent <-> child (multi-child switcher reads this table)
CREATE TABLE parent_students (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL REFERENCES users(id),
  student_id     uuid NOT NULL REFERENCES students(id),
  relation       text NOT NULL DEFAULT 'wali',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX parent_students_uq ON parent_students (parent_user_id, student_id) WHERE deleted_at IS NULL;
CREATE INDEX parent_students_student_idx ON parent_students (student_id) WHERE deleted_at IS NULL;

-- ---------- CLASSES & ENROLLMENT ----------
CREATE TABLE classes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id    uuid NOT NULL REFERENCES academic_years(id),
  jenjang             jenjang NOT NULL,
  grade_level         smallint NOT NULL CHECK (grade_level BETWEEN 0 AND 9),  -- TK A/B = 0/1 by convention
  name                text NOT NULL,                                          -- '7A'
  homeroom_teacher_id uuid REFERENCES teachers(id),                           -- = Wali Kelas
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX classes_year_name_uq ON classes (academic_year_id, name) WHERE deleted_at IS NULL;
CREATE INDEX classes_homeroom_idx ON classes (homeroom_teacher_id) WHERE deleted_at IS NULL;

CREATE TABLE enrollments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       uuid NOT NULL REFERENCES students(id),
  class_id         uuid NOT NULL REFERENCES classes(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  promotion_status promotion_status,           -- set by Wali Kelas at end of even semester
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX enrollments_student_year_uq ON enrollments (student_id, academic_year_id) WHERE deleted_at IS NULL;
CREATE INDEX enrollments_class_idx ON enrollments (class_id) WHERE deleted_at IS NULL;

CREATE TABLE subjects (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jenjang jenjang NOT NULL,
  code    text NOT NULL,
  name    text NOT NULL,
  kkm     numeric(5,2) NOT NULL DEFAULT 75,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX subjects_code_uq ON subjects (jenjang, code) WHERE deleted_at IS NULL;

CREATE TABLE teaching_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES teachers(id),
  subject_id  uuid NOT NULL REFERENCES subjects(id),
  class_id    uuid NOT NULL REFERENCES classes(id),
  semester_id uuid NOT NULL REFERENCES semesters(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX ta_uq ON teaching_assignments (subject_id, class_id, semester_id) WHERE deleted_at IS NULL;
CREATE INDEX ta_teacher_idx ON teaching_assignments (teacher_id, semester_id) WHERE deleted_at IS NULL;

-- ---------- ATTENDANCE ----------
CREATE TABLE attendance_daily (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid NOT NULL REFERENCES students(id),
  class_id        uuid NOT NULL REFERENCES classes(id),
  attendance_date date NOT NULL,
  status          attendance_status NOT NULL,
  note            text,
  marked_by       uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX att_daily_uq  ON attendance_daily (student_id, attendance_date) WHERE deleted_at IS NULL;
CREATE INDEX att_daily_class_idx  ON attendance_daily (class_id, attendance_date) WHERE deleted_at IS NULL;

CREATE TABLE attendance_subject (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id             uuid NOT NULL REFERENCES students(id),
  teaching_assignment_id uuid NOT NULL REFERENCES teaching_assignments(id),
  attendance_date        date NOT NULL,
  status                 attendance_status NOT NULL,
  note                   text,
  marked_by              uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX att_subject_uq ON attendance_subject (student_id, teaching_assignment_id, attendance_date) WHERE deleted_at IS NULL;
CREATE INDEX att_subject_ta_idx    ON attendance_subject (teaching_assignment_id, attendance_date) WHERE deleted_at IS NULL;

-- ---------- QUESTION BANK & CBT ----------
CREATE TABLE question_banks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES teachers(id),
  subject_id  uuid NOT NULL REFERENCES subjects(id),
  grade_level smallint NOT NULL,
  title       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX question_banks_owner_idx ON question_banks (teacher_id, subject_id) WHERE deleted_at IS NULL;

-- options JSON convention: [{"id":"A","text":"...","media":null}, ...]
--   benar_salah  -> options [{"id":"B","text":"Benar"},{"id":"S","text":"Salah"}]
-- media JSON convention:   [{"type":"image","url":"https://..."}]
CREATE TABLE questions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id    uuid NOT NULL REFERENCES question_banks(id),
  type       question_type NOT NULL DEFAULT 'pilihan_ganda',
  body       text NOT NULL,
  media      jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(media)   = 'array'),
  options    jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(options) = 'array'),
  points     numeric(6,2) NOT NULL DEFAULT 1 CHECK (points >= 0),
  difficulty smallint CHECK (difficulty BETWEEN 1 AND 5),
  tags       text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX questions_bank_idx ON questions (bank_id) WHERE deleted_at IS NULL;

-- Answer keys live in their OWN table so no student-facing query can leak them by accident.
-- answer JSON: pilihan_ganda/benar_salah -> "A" ; pg_kompleks -> ["A","C"] ; isian -> ["jakarta","DKI Jakarta"]
CREATE TABLE question_keys (
  question_id uuid PRIMARY KEY REFERENCES questions(id),
  answer      jsonb NOT NULL,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);

CREATE TABLE exams (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teaching_assignment_id uuid NOT NULL REFERENCES teaching_assignments(id),
  semester_id            uuid NOT NULL REFERENCES semesters(id),
  title                  text NOT NULL,
  instructions           text,
  duration_minutes       int  NOT NULL CHECK (duration_minutes BETWEEN 1 AND 300),
  opens_at               timestamptz NOT NULL,
  closes_at              timestamptz NOT NULL,
  shuffle_questions      boolean NOT NULL DEFAULT true,
  shuffle_options        boolean NOT NULL DEFAULT true,
  passing_score          numeric(5,2),
  status                 exam_status NOT NULL DEFAULT 'draft',
  settings               jsonb NOT NULL DEFAULT '{"show_score": false}',
  created_by             uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  CHECK (closes_at > opens_at)
);
CREATE INDEX exams_ta_idx     ON exams (teaching_assignment_id, status) WHERE deleted_at IS NULL;
CREATE INDEX exams_window_idx ON exams (opens_at, closes_at) WHERE status = 'published' AND deleted_at IS NULL;

CREATE TABLE exam_questions (
  exam_id     uuid NOT NULL REFERENCES exams(id),
  question_id uuid NOT NULL REFERENCES questions(id),
  position    int  NOT NULL,
  points      numeric(6,2),                       -- optional override of questions.points
  PRIMARY KEY (exam_id, question_id),
  UNIQUE (exam_id, position) DEFERRABLE INITIALLY DEFERRED
);

-- One row per student per exam. Written TWICE total: at start (deadline) and at submit (answers).
CREATE TABLE exam_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         uuid NOT NULL REFERENCES exams(id),
  student_id      uuid NOT NULL REFERENCES students(id),
  started_at      timestamptz NOT NULL DEFAULT now(),
  deadline_at     timestamptz NOT NULL,           -- server-authoritative
  submitted_at    timestamptz,
  status          session_status NOT NULL DEFAULT 'in_progress',
  answers         jsonb NOT NULL DEFAULT '{}',    -- {"<question_uuid>": "A" | ["A","C"] | "text"}
  score           numeric(5,2),
  correct_count   int,
  total_questions int,
  is_late         boolean NOT NULL DEFAULT false, -- submitted after deadline + grace; teacher reviews
  client_meta     jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
-- A teacher grants a re-take by soft-deleting the old session.
CREATE UNIQUE INDEX exam_sessions_uq ON exam_sessions (exam_id, student_id) WHERE deleted_at IS NULL;
CREATE INDEX exam_sessions_student_idx ON exam_sessions (student_id) WHERE deleted_at IS NULL;

-- ---------- MATERIALS & ASSIGNMENTS (external URLs only) ----------
CREATE TABLE materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teaching_assignment_id uuid NOT NULL REFERENCES teaching_assignments(id),
  title text NOT NULL, description text,
  url text NOT NULL CHECK (url ~* '^https?://'),
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX materials_ta_idx ON materials (teaching_assignment_id, published_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teaching_assignment_id uuid NOT NULL REFERENCES teaching_assignments(id),
  title text NOT NULL, instructions text,
  url text CHECK (url IS NULL OR url ~* '^https?://'),
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX assignments_ta_idx ON assignments (teaching_assignment_id, due_at) WHERE deleted_at IS NULL;

CREATE TABLE assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id),
  student_id    uuid NOT NULL REFERENCES students(id),
  url  text NOT NULL CHECK (url ~* '^https?://'),
  note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  score numeric(5,2), feedback text, graded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX submissions_uq ON assignment_submissions (assignment_id, student_id) WHERE deleted_at IS NULL;

-- ---------- DEVELOPMENT NOTES, ANNOUNCEMENTS, CALENDAR ----------
CREATE TABLE development_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES students(id),
  semester_id uuid NOT NULL REFERENCES semesters(id),
  author_id   uuid NOT NULL REFERENCES teachers(id),
  aspect      text NOT NULL CHECK (aspect IN ('agama_budi_pekerti','jati_diri','literasi','sosial_emosional','motorik','karakter','lainnya')),
  narrative   text NOT NULL,
  observed_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX dev_notes_student_idx ON development_notes (student_id, semester_id, observed_on DESC) WHERE deleted_at IS NULL;

CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, body text NOT NULL,
  audience user_role[] NOT NULL DEFAULT '{admin,guru,siswa,orang_tua,kepala_sekolah}',
  pinned boolean NOT NULL DEFAULT false,
  publish_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  author_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX announcements_idx ON announcements (pinned DESC, publish_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text,
  starts_on date NOT NULL, ends_on date NOT NULL CHECK (ends_on >= starts_on),
  category text NOT NULL DEFAULT 'akademik',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX calendar_range_idx ON calendar_events (starts_on, ends_on) WHERE deleted_at IS NULL;

-- ---------- GRADES & E-RAPOR ----------
CREATE TABLE grades (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id          uuid NOT NULL REFERENCES enrollments(id),
  teaching_assignment_id uuid NOT NULL REFERENCES teaching_assignments(id),
  semester_id            uuid NOT NULL REFERENCES semesters(id),
  formative_score        numeric(5,2) CHECK (formative_score BETWEEN 0 AND 100),
  sas_score              numeric(5,2) CHECK (sas_score BETWEEN 0 AND 100),   -- SAS / PAS
  final_score            numeric(5,2),
  predicate              char(1),
  tp_scores              jsonb NOT NULL DEFAULT '[]',   -- [{"tp":"menjelaskan ...","score":88}]
  narrative              text,                          -- auto-generated, teacher-editable until locked
  locked_at              timestamptz,
  locked_by              uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX grades_uq ON grades (enrollment_id, teaching_assignment_id) WHERE deleted_at IS NULL;
CREATE INDEX grades_ta_idx    ON grades (teaching_assignment_id) WHERE deleted_at IS NULL;
CREATE INDEX grades_sem_idx   ON grades (semester_id) WHERE deleted_at IS NULL;

CREATE TABLE report_cards (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id      uuid NOT NULL REFERENCES enrollments(id),
  semester_id        uuid NOT NULL REFERENCES semesters(id),
  homeroom_notes     text,
  attendance_summary jsonb NOT NULL DEFAULT '{"hadir":0,"izin":0,"sakit":0,"alpa":0}',
  extracurriculars   jsonb NOT NULL DEFAULT '[]',    -- [{"name":"Pramuka","grade":"A","description":"..."}]
  status             report_status NOT NULL DEFAULT 'draft',
  submitted_at       timestamptz,
  approved_by        uuid REFERENCES users(id),
  approved_at        timestamptz,
  snapshot           jsonb,                          -- frozen copy at approval = archive-safe e-Rapor
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX report_cards_uq     ON report_cards (enrollment_id, semester_id) WHERE deleted_at IS NULL;
CREATE INDEX report_cards_status_idx    ON report_cards (semester_id, status) WHERE deleted_at IS NULL;

CREATE TABLE audit_log (
  id         bigserial PRIMARY KEY,
  actor_id   uuid REFERENCES users(id),
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  uuid,
  detail     jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_entity_idx ON audit_log (entity, entity_id, created_at DESC);

-- ---------- BUSINESS-RULE GUARDS ----------
CREATE FUNCTION guard_grades() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE s semester_status;
BEGIN
  SELECT status INTO s FROM semesters WHERE id = NEW.semester_id;
  IF s = 'closed' THEN RAISE EXCEPTION 'SEMESTER_CLOSED'; END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.locked_at IS NOT NULL AND NEW.locked_at IS NOT NULL THEN
      RAISE EXCEPTION 'GRADE_LOCKED';       -- must be unlocked (locked_at = NULL) first
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_grades_guard BEFORE INSERT OR UPDATE ON grades
  FOR EACH ROW EXECUTE FUNCTION guard_grades();

CREATE FUNCTION guard_report_cards() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE s semester_status;
BEGIN
  SELECT status INTO s FROM semesters WHERE id = NEW.semester_id;
  IF s = 'closed' THEN RAISE EXCEPTION 'SEMESTER_CLOSED'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_report_cards_guard BEFORE INSERT OR UPDATE ON report_cards
  FOR EACH ROW EXECUTE FUNCTION guard_report_cards();

-- Apply updated_at + hard-delete protection to all soft-delete tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','academic_years','semesters','teachers','students','parent_students','classes','enrollments',
    'subjects','teaching_assignments','attendance_daily','attendance_subject','question_banks','questions',
    'question_keys','exams','exam_sessions','materials','assignments','assignment_submissions',
    'development_notes','announcements','calendar_events','grades','report_cards'
  ] LOOP
    EXECUTE format('CREATE TRIGGER trg_%1$s_touch BEFORE UPDATE ON %1$I FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_nodelete BEFORE DELETE ON %1$I FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete()', t);
  END LOOP;
END $$;

-- ---------- WORKFLOW FUNCTIONS (each runs as ONE transaction) ----------

-- Attendance aggregation for any date range (monthly export, semester total for rapor)
CREATE FUNCTION attendance_range(p_class_id uuid, p_from date, p_to date)
RETURNS TABLE (student_id uuid, nis text, full_name text, hadir int, izin int, sakit int, alpa int)
LANGUAGE sql STABLE AS $$
  SELECT s.id, s.nis, s.full_name,
         count(*) FILTER (WHERE a.status = 'hadir')::int,
         count(*) FILTER (WHERE a.status = 'izin')::int,
         count(*) FILTER (WHERE a.status = 'sakit')::int,
         count(*) FILTER (WHERE a.status = 'alpa')::int
  FROM enrollments e
  JOIN students s ON s.id = e.student_id AND s.deleted_at IS NULL
  LEFT JOIN attendance_daily a
         ON a.student_id = s.id AND a.deleted_at IS NULL
        AND a.attendance_date >= p_from AND a.attendance_date < p_to
  WHERE e.class_id = p_class_id AND e.deleted_at IS NULL
  GROUP BY s.id, s.nis, s.full_name
  ORDER BY s.full_name
$$;
-- Monthly:  SELECT * FROM attendance_range($class, '2026-09-01', '2026-10-01');

-- Class promotion at academic-year end.
-- p_mapping: [{"from_class":"<uuid>","to_class":"<uuid>","repeat_class":"<uuid>"}, ...]
-- 'naik' -> to_class, 'tinggal' -> repeat_class, 'lulus'/'pindah' -> student status updated.
CREATE FUNCTION promote_students(p_from_year uuid, p_to_year uuid, p_mapping jsonb)
RETURNS TABLE (enrolled int, graduated int, transferred int)
LANGUAGE plpgsql AS $$
DECLARE v_enrolled int; v_grad int; v_trf int;
BEGIN
  IF EXISTS (SELECT 1 FROM enrollments
             WHERE academic_year_id = p_from_year AND deleted_at IS NULL AND promotion_status IS NULL) THEN
    RAISE EXCEPTION 'PROMOTION_INCOMPLETE';
  END IF;

  INSERT INTO enrollments (student_id, class_id, academic_year_id)
  SELECT e.student_id,
         CASE e.promotion_status WHEN 'naik' THEN m.to_class ELSE m.repeat_class END,
         p_to_year
  FROM enrollments e
  JOIN (SELECT (x->>'from_class')::uuid AS from_class, (x->>'to_class')::uuid AS to_class,
               (x->>'repeat_class')::uuid AS repeat_class
        FROM jsonb_array_elements(p_mapping) x) m ON m.from_class = e.class_id
  WHERE e.academic_year_id = p_from_year AND e.deleted_at IS NULL
    AND e.promotion_status IN ('naik','tinggal')
  ON CONFLICT (student_id, academic_year_id) WHERE deleted_at IS NULL DO NOTHING;
  GET DIAGNOSTICS v_enrolled = ROW_COUNT;

  UPDATE students SET status = 'lulus'
   WHERE id IN (SELECT student_id FROM enrollments
                WHERE academic_year_id = p_from_year AND promotion_status = 'lulus' AND deleted_at IS NULL);
  GET DIAGNOSTICS v_grad = ROW_COUNT;

  UPDATE students SET status = 'pindah'
   WHERE id IN (SELECT student_id FROM enrollments
                WHERE academic_year_id = p_from_year AND promotion_status = 'pindah' AND deleted_at IS NULL);
  GET DIAGNOSTICS v_trf = ROW_COUNT;

  RETURN QUERY SELECT v_enrolled, v_grad, v_trf;
END $$;

-- "Tutup Semester & Buka Semester Baru": old data stays in DB, becomes read-only via guards above.
CREATE FUNCTION close_semester_and_open_next(p_semester_id uuid, p_next_semester_id uuid, p_actor uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM report_cards
             WHERE semester_id = p_semester_id AND status <> 'approved' AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'REPORTS_NOT_APPROVED';
  END IF;

  UPDATE semesters SET status = 'closed', closed_at = now(), closed_by = p_actor
   WHERE id = p_semester_id AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'SEMESTER_NOT_ACTIVE'; END IF;

  UPDATE semesters SET status = 'active' WHERE id = p_next_semester_id AND status = 'upcoming';
  IF NOT FOUND THEN RAISE EXCEPTION 'NEXT_SEMESTER_NOT_READY'; END IF;

  UPDATE exams SET status = 'archived' WHERE semester_id = p_semester_id AND status <> 'archived';

  INSERT INTO audit_log (actor_id, action, entity, entity_id, detail)
  VALUES (p_actor, 'semester.close', 'semesters', p_semester_id,
          jsonb_build_object('next_semester_id', p_next_semester_id));
END $$;

COMMIT;

BEGIN;

-- Accounts created by import / admin get a random password and must change it on first login.
ALTER TABLE users ADD COLUMN must_change_password boolean NOT NULL DEFAULT false;

-- Single-row school profile (used on e-Rapor header and principal stamp).
CREATE TABLE school_settings (
  id             boolean PRIMARY KEY DEFAULT true CHECK (id),
  name           text NOT NULL DEFAULT 'Nama Sekolah',
  address        text NOT NULL DEFAULT '',
  principal_name text NOT NULL DEFAULT '',
  principal_nip  text,
  stamp_data_url text CHECK (stamp_data_url IS NULL OR length(stamp_data_url) < 400000),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
INSERT INTO school_settings DEFAULT VALUES;

COMMIT;

BEGIN;

-- ---------- NOTIFIKASI DALAM APLIKASI ----------
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id),
  title      text NOT NULL,
  body       text NOT NULL,
  link       text,
  type       text NOT NULL DEFAULT 'info',
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
  day_of_week            smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time             time NOT NULL,
  end_time               time NOT NULL CHECK (end_time > start_time),
  room                   text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS schedules_class_idx ON schedules (class_id, semester_id, day_of_week) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS schedules_ta_idx ON schedules (teaching_assignment_id, semester_id, day_of_week) WHERE deleted_at IS NULL;

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



-- =====================================================================
-- 004_features_phase2.sql
-- =====================================================================
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'esai';

BEGIN;

ALTER TABLE exam_sessions
  ADD COLUMN IF NOT EXISTS essay_scores jsonb NOT NULL DEFAULT '{}';

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


-- =====================================================================
-- 005_multi_jenjang.sql
-- =====================================================================
BEGIN;

ALTER TABLE school_settings
  ADD COLUMN IF NOT EXISTS unit_profiles jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMIT;
