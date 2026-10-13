--
-- PostgreSQL database dump
--

-- \restrict HbdqMf6u3jym19cUHIdH7xDMD08GZ3hPA5imZrJVQ9e4eXgqquLTyVYGGauNCNI

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.teaching_journals DROP CONSTRAINT IF EXISTS teaching_journals_teaching_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teaching_journals DROP CONSTRAINT IF EXISTS teaching_journals_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.teaching_assignments DROP CONSTRAINT IF EXISTS teaching_assignments_teacher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teaching_assignments DROP CONSTRAINT IF EXISTS teaching_assignments_subject_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teaching_assignments DROP CONSTRAINT IF EXISTS teaching_assignments_semester_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teaching_assignments DROP CONSTRAINT IF EXISTS teaching_assignments_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.teachers DROP CONSTRAINT IF EXISTS teachers_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.students DROP CONSTRAINT IF EXISTS students_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.student_records DROP CONSTRAINT IF EXISTS student_records_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.student_records DROP CONSTRAINT IF EXISTS student_records_semester_id_fkey;
ALTER TABLE IF EXISTS ONLY public.student_records DROP CONSTRAINT IF EXISTS student_records_recorded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.semesters DROP CONSTRAINT IF EXISTS semesters_closed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.semesters DROP CONSTRAINT IF EXISTS semesters_academic_year_id_fkey;
ALTER TABLE IF EXISTS ONLY public.schedules DROP CONSTRAINT IF EXISTS schedules_teaching_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.schedules DROP CONSTRAINT IF EXISTS schedules_semester_id_fkey;
ALTER TABLE IF EXISTS ONLY public.schedules DROP CONSTRAINT IF EXISTS schedules_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.schedules DROP CONSTRAINT IF EXISTS schedules_academic_year_id_fkey;
ALTER TABLE IF EXISTS ONLY public.report_cards DROP CONSTRAINT IF EXISTS report_cards_semester_id_fkey;
ALTER TABLE IF EXISTS ONLY public.report_cards DROP CONSTRAINT IF EXISTS report_cards_enrollment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.report_cards DROP CONSTRAINT IF EXISTS report_cards_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.questions DROP CONSTRAINT IF EXISTS questions_bank_id_fkey;
ALTER TABLE IF EXISTS ONLY public.question_keys DROP CONSTRAINT IF EXISTS question_keys_question_id_fkey;
ALTER TABLE IF EXISTS ONLY public.question_banks DROP CONSTRAINT IF EXISTS question_banks_teacher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.question_banks DROP CONSTRAINT IF EXISTS question_banks_subject_id_fkey;
ALTER TABLE IF EXISTS ONLY public.parent_students DROP CONSTRAINT IF EXISTS parent_students_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.parent_students DROP CONSTRAINT IF EXISTS parent_students_parent_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_teaching_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_requested_by_fkey;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_teaching_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_semester_id_fkey;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_locked_by_fkey;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_enrollment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.exams DROP CONSTRAINT IF EXISTS exams_teaching_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.exams DROP CONSTRAINT IF EXISTS exams_semester_id_fkey;
ALTER TABLE IF EXISTS ONLY public.exams DROP CONSTRAINT IF EXISTS exams_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.exam_sessions DROP CONSTRAINT IF EXISTS exam_sessions_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.exam_sessions DROP CONSTRAINT IF EXISTS exam_sessions_exam_id_fkey;
ALTER TABLE IF EXISTS ONLY public.exam_questions DROP CONSTRAINT IF EXISTS exam_questions_question_id_fkey;
ALTER TABLE IF EXISTS ONLY public.exam_questions DROP CONSTRAINT IF EXISTS exam_questions_exam_id_fkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_academic_year_id_fkey;
ALTER TABLE IF EXISTS ONLY public.development_notes DROP CONSTRAINT IF EXISTS development_notes_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.development_notes DROP CONSTRAINT IF EXISTS development_notes_semester_id_fkey;
ALTER TABLE IF EXISTS ONLY public.development_notes DROP CONSTRAINT IF EXISTS development_notes_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_homeroom_teacher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_academic_year_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_subject DROP CONSTRAINT IF EXISTS attendance_subject_teaching_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_subject DROP CONSTRAINT IF EXISTS attendance_subject_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_subject DROP CONSTRAINT IF EXISTS attendance_subject_marked_by_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_daily DROP CONSTRAINT IF EXISTS attendance_daily_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_daily DROP CONSTRAINT IF EXISTS attendance_daily_marked_by_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_daily DROP CONSTRAINT IF EXISTS attendance_daily_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS assignments_teaching_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assignment_submissions DROP CONSTRAINT IF EXISTS assignment_submissions_student_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assignment_submissions DROP CONSTRAINT IF EXISTS assignment_submissions_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_teaching_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_class_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_author_id_fkey;
DROP TRIGGER IF EXISTS trg_users_touch ON public.users;
DROP TRIGGER IF EXISTS trg_users_nodelete ON public.users;
DROP TRIGGER IF EXISTS trg_teaching_journals_touch ON public.teaching_journals;
DROP TRIGGER IF EXISTS trg_teaching_journals_nodelete ON public.teaching_journals;
DROP TRIGGER IF EXISTS trg_teaching_assignments_touch ON public.teaching_assignments;
DROP TRIGGER IF EXISTS trg_teaching_assignments_nodelete ON public.teaching_assignments;
DROP TRIGGER IF EXISTS trg_teachers_touch ON public.teachers;
DROP TRIGGER IF EXISTS trg_teachers_nodelete ON public.teachers;
DROP TRIGGER IF EXISTS trg_subjects_touch ON public.subjects;
DROP TRIGGER IF EXISTS trg_subjects_nodelete ON public.subjects;
DROP TRIGGER IF EXISTS trg_students_touch ON public.students;
DROP TRIGGER IF EXISTS trg_students_nodelete ON public.students;
DROP TRIGGER IF EXISTS trg_student_records_touch ON public.student_records;
DROP TRIGGER IF EXISTS trg_student_records_nodelete ON public.student_records;
DROP TRIGGER IF EXISTS trg_semesters_touch ON public.semesters;
DROP TRIGGER IF EXISTS trg_semesters_nodelete ON public.semesters;
DROP TRIGGER IF EXISTS trg_schedules_touch ON public.schedules;
DROP TRIGGER IF EXISTS trg_schedules_nodelete ON public.schedules;
DROP TRIGGER IF EXISTS trg_report_cards_touch ON public.report_cards;
DROP TRIGGER IF EXISTS trg_report_cards_nodelete ON public.report_cards;
DROP TRIGGER IF EXISTS trg_report_cards_guard ON public.report_cards;
DROP TRIGGER IF EXISTS trg_questions_touch ON public.questions;
DROP TRIGGER IF EXISTS trg_questions_nodelete ON public.questions;
DROP TRIGGER IF EXISTS trg_question_keys_touch ON public.question_keys;
DROP TRIGGER IF EXISTS trg_question_keys_nodelete ON public.question_keys;
DROP TRIGGER IF EXISTS trg_question_banks_touch ON public.question_banks;
DROP TRIGGER IF EXISTS trg_question_banks_nodelete ON public.question_banks;
DROP TRIGGER IF EXISTS trg_parent_students_touch ON public.parent_students;
DROP TRIGGER IF EXISTS trg_parent_students_nodelete ON public.parent_students;
DROP TRIGGER IF EXISTS trg_notifications_nodelete ON public.notifications;
DROP TRIGGER IF EXISTS trg_materials_touch ON public.materials;
DROP TRIGGER IF EXISTS trg_materials_nodelete ON public.materials;
DROP TRIGGER IF EXISTS trg_leave_requests_touch ON public.leave_requests;
DROP TRIGGER IF EXISTS trg_leave_requests_nodelete ON public.leave_requests;
DROP TRIGGER IF EXISTS trg_grades_touch ON public.grades;
DROP TRIGGER IF EXISTS trg_grades_nodelete ON public.grades;
DROP TRIGGER IF EXISTS trg_grades_guard ON public.grades;
DROP TRIGGER IF EXISTS trg_exams_touch ON public.exams;
DROP TRIGGER IF EXISTS trg_exams_nodelete ON public.exams;
DROP TRIGGER IF EXISTS trg_exam_sessions_touch ON public.exam_sessions;
DROP TRIGGER IF EXISTS trg_exam_sessions_nodelete ON public.exam_sessions;
DROP TRIGGER IF EXISTS trg_enrollments_touch ON public.enrollments;
DROP TRIGGER IF EXISTS trg_enrollments_nodelete ON public.enrollments;
DROP TRIGGER IF EXISTS trg_development_notes_touch ON public.development_notes;
DROP TRIGGER IF EXISTS trg_development_notes_nodelete ON public.development_notes;
DROP TRIGGER IF EXISTS trg_classes_touch ON public.classes;
DROP TRIGGER IF EXISTS trg_classes_nodelete ON public.classes;
DROP TRIGGER IF EXISTS trg_calendar_events_touch ON public.calendar_events;
DROP TRIGGER IF EXISTS trg_calendar_events_nodelete ON public.calendar_events;
DROP TRIGGER IF EXISTS trg_attendance_subject_touch ON public.attendance_subject;
DROP TRIGGER IF EXISTS trg_attendance_subject_nodelete ON public.attendance_subject;
DROP TRIGGER IF EXISTS trg_attendance_daily_touch ON public.attendance_daily;
DROP TRIGGER IF EXISTS trg_attendance_daily_nodelete ON public.attendance_daily;
DROP TRIGGER IF EXISTS trg_assignments_touch ON public.assignments;
DROP TRIGGER IF EXISTS trg_assignments_nodelete ON public.assignments;
DROP TRIGGER IF EXISTS trg_assignment_submissions_touch ON public.assignment_submissions;
DROP TRIGGER IF EXISTS trg_assignment_submissions_nodelete ON public.assignment_submissions;
DROP TRIGGER IF EXISTS trg_announcements_touch ON public.announcements;
DROP TRIGGER IF EXISTS trg_announcements_nodelete ON public.announcements;
DROP TRIGGER IF EXISTS trg_academic_years_touch ON public.academic_years;
DROP TRIGGER IF EXISTS trg_academic_years_nodelete ON public.academic_years;
DROP INDEX IF EXISTS public.users_username_uq;
DROP INDEX IF EXISTS public.users_role_idx;
DROP INDEX IF EXISTS public.teaching_journals_ta_idx;
DROP INDEX IF EXISTS public.teachers_user_uq;
DROP INDEX IF EXISTS public.teachers_nip_idx;
DROP INDEX IF EXISTS public.ta_uq;
DROP INDEX IF EXISTS public.ta_teacher_idx;
DROP INDEX IF EXISTS public.submissions_uq;
DROP INDEX IF EXISTS public.subjects_code_uq;
DROP INDEX IF EXISTS public.students_user_uq;
DROP INDEX IF EXISTS public.students_nisn_uq;
DROP INDEX IF EXISTS public.students_nis_uq;
DROP INDEX IF EXISTS public.students_name_idx;
DROP INDEX IF EXISTS public.student_records_student_idx;
DROP INDEX IF EXISTS public.semesters_year_kind_uq;
DROP INDEX IF EXISTS public.semesters_active_uq;
DROP INDEX IF EXISTS public.schedules_ta_idx;
DROP INDEX IF EXISTS public.schedules_class_idx;
DROP INDEX IF EXISTS public.report_cards_uq;
DROP INDEX IF EXISTS public.report_cards_status_idx;
DROP INDEX IF EXISTS public.questions_bank_idx;
DROP INDEX IF EXISTS public.question_banks_owner_idx;
DROP INDEX IF EXISTS public.parent_students_uq;
DROP INDEX IF EXISTS public.parent_students_student_idx;
DROP INDEX IF EXISTS public.notif_user_idx;
DROP INDEX IF EXISTS public.materials_ta_idx;
DROP INDEX IF EXISTS public.leave_requests_student_idx;
DROP INDEX IF EXISTS public.leave_requests_dates_idx;
DROP INDEX IF EXISTS public.grades_uq;
DROP INDEX IF EXISTS public.grades_ta_idx;
DROP INDEX IF EXISTS public.grades_sem_idx;
DROP INDEX IF EXISTS public.exams_window_idx;
DROP INDEX IF EXISTS public.exams_ta_idx;
DROP INDEX IF EXISTS public.exam_sessions_uq;
DROP INDEX IF EXISTS public.exam_sessions_student_idx;
DROP INDEX IF EXISTS public.enrollments_student_year_uq;
DROP INDEX IF EXISTS public.enrollments_class_idx;
DROP INDEX IF EXISTS public.dev_notes_student_idx;
DROP INDEX IF EXISTS public.classes_year_name_uq;
DROP INDEX IF EXISTS public.classes_homeroom_idx;
DROP INDEX IF EXISTS public.calendar_range_idx;
DROP INDEX IF EXISTS public.audit_entity_idx;
DROP INDEX IF EXISTS public.att_subject_uq;
DROP INDEX IF EXISTS public.att_subject_ta_idx;
DROP INDEX IF EXISTS public.att_daily_uq;
DROP INDEX IF EXISTS public.att_daily_class_idx;
DROP INDEX IF EXISTS public.assignments_ta_idx;
DROP INDEX IF EXISTS public.announcements_ta_idx;
DROP INDEX IF EXISTS public.announcements_idx;
DROP INDEX IF EXISTS public.announcements_class_idx;
DROP INDEX IF EXISTS public.academic_years_name_uq;
DROP INDEX IF EXISTS public.academic_years_active_uq;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.teaching_journals DROP CONSTRAINT IF EXISTS teaching_journals_pkey;
ALTER TABLE IF EXISTS ONLY public.teaching_assignments DROP CONSTRAINT IF EXISTS teaching_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.teachers DROP CONSTRAINT IF EXISTS teachers_pkey;
ALTER TABLE IF EXISTS ONLY public.subjects DROP CONSTRAINT IF EXISTS subjects_pkey;
ALTER TABLE IF EXISTS ONLY public.students DROP CONSTRAINT IF EXISTS students_pkey;
ALTER TABLE IF EXISTS ONLY public.student_records DROP CONSTRAINT IF EXISTS student_records_pkey;
ALTER TABLE IF EXISTS ONLY public.semesters DROP CONSTRAINT IF EXISTS semesters_pkey;
ALTER TABLE IF EXISTS ONLY public.school_settings DROP CONSTRAINT IF EXISTS school_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.schedules DROP CONSTRAINT IF EXISTS schedules_pkey;
ALTER TABLE IF EXISTS ONLY public.report_cards DROP CONSTRAINT IF EXISTS report_cards_pkey;
ALTER TABLE IF EXISTS ONLY public.questions DROP CONSTRAINT IF EXISTS questions_pkey;
ALTER TABLE IF EXISTS ONLY public.question_keys DROP CONSTRAINT IF EXISTS question_keys_pkey;
ALTER TABLE IF EXISTS ONLY public.question_banks DROP CONSTRAINT IF EXISTS question_banks_pkey;
ALTER TABLE IF EXISTS ONLY public.parent_students DROP CONSTRAINT IF EXISTS parent_students_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_pkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.grades DROP CONSTRAINT IF EXISTS grades_pkey;
ALTER TABLE IF EXISTS ONLY public.exams DROP CONSTRAINT IF EXISTS exams_pkey;
ALTER TABLE IF EXISTS ONLY public.exam_sessions DROP CONSTRAINT IF EXISTS exam_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.exam_questions DROP CONSTRAINT IF EXISTS exam_questions_pkey;
ALTER TABLE IF EXISTS ONLY public.exam_questions DROP CONSTRAINT IF EXISTS exam_questions_exam_id_position_key;
ALTER TABLE IF EXISTS ONLY public.enrollments DROP CONSTRAINT IF EXISTS enrollments_pkey;
ALTER TABLE IF EXISTS ONLY public.development_notes DROP CONSTRAINT IF EXISTS development_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.classes DROP CONSTRAINT IF EXISTS classes_pkey;
ALTER TABLE IF EXISTS ONLY public.calendar_events DROP CONSTRAINT IF EXISTS calendar_events_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_log DROP CONSTRAINT IF EXISTS audit_log_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance_subject DROP CONSTRAINT IF EXISTS attendance_subject_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance_daily DROP CONSTRAINT IF EXISTS attendance_daily_pkey;
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.assignment_submissions DROP CONSTRAINT IF EXISTS assignment_submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS ONLY public.academic_years DROP CONSTRAINT IF EXISTS academic_years_pkey;
ALTER TABLE IF EXISTS public.audit_log ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.teaching_journals;
DROP TABLE IF EXISTS public.teaching_assignments;
DROP TABLE IF EXISTS public.teachers;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.students;
DROP TABLE IF EXISTS public.student_records;
DROP TABLE IF EXISTS public.semesters;
DROP TABLE IF EXISTS public.school_settings;
DROP TABLE IF EXISTS public.schema_migrations;
DROP TABLE IF EXISTS public.schedules;
DROP TABLE IF EXISTS public.report_cards;
DROP TABLE IF EXISTS public.questions;
DROP TABLE IF EXISTS public.question_keys;
DROP TABLE IF EXISTS public.question_banks;
DROP TABLE IF EXISTS public.parent_students;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.materials;
DROP TABLE IF EXISTS public.leave_requests;
DROP TABLE IF EXISTS public.grades;
DROP TABLE IF EXISTS public.exams;
DROP TABLE IF EXISTS public.exam_sessions;
DROP TABLE IF EXISTS public.exam_questions;
DROP TABLE IF EXISTS public.enrollments;
DROP TABLE IF EXISTS public.development_notes;
DROP TABLE IF EXISTS public.classes;
DROP TABLE IF EXISTS public.calendar_events;
DROP SEQUENCE IF EXISTS public.audit_log_id_seq;
DROP TABLE IF EXISTS public.audit_log;
DROP TABLE IF EXISTS public.attendance_subject;
DROP TABLE IF EXISTS public.attendance_daily;
DROP TABLE IF EXISTS public.assignments;
DROP TABLE IF EXISTS public.assignment_submissions;
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS public.academic_years;
DROP FUNCTION IF EXISTS public.touch_updated_at();
DROP FUNCTION IF EXISTS public.promote_students(p_from_year uuid, p_to_year uuid, p_mapping jsonb);
DROP FUNCTION IF EXISTS public.prevent_hard_delete();
DROP FUNCTION IF EXISTS public.guard_report_cards();
DROP FUNCTION IF EXISTS public.guard_grades();
DROP FUNCTION IF EXISTS public.close_semester_and_open_next(p_semester_id uuid, p_next_semester_id uuid, p_actor uuid);
DROP FUNCTION IF EXISTS public.attendance_range(p_class_id uuid, p_from date, p_to date);
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.session_status;
DROP TYPE IF EXISTS public.semester_status;
DROP TYPE IF EXISTS public.semester_kind;
DROP TYPE IF EXISTS public.report_status;
DROP TYPE IF EXISTS public.question_type;
DROP TYPE IF EXISTS public.promotion_status;
DROP TYPE IF EXISTS public.jenjang;
DROP TYPE IF EXISTS public.exam_status;
DROP TYPE IF EXISTS public.attendance_status;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS citext;
--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: attendance_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.attendance_status AS ENUM (
    'hadir',
    'izin',
    'sakit',
    'alpa'
);


--
-- Name: exam_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.exam_status AS ENUM (
    'draft',
    'published',
    'archived'
);


--
-- Name: jenjang; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.jenjang AS ENUM (
    'TK',
    'SD',
    'SMP'
);


--
-- Name: promotion_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.promotion_status AS ENUM (
    'naik',
    'tinggal',
    'lulus',
    'pindah'
);


--
-- Name: question_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_type AS ENUM (
    'pilihan_ganda',
    'pg_kompleks',
    'benar_salah',
    'isian',
    'esai'
);


--
-- Name: report_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_status AS ENUM (
    'draft',
    'submitted',
    'approved'
);


--
-- Name: semester_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.semester_kind AS ENUM (
    'ganjil',
    'genap'
);


--
-- Name: semester_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.semester_status AS ENUM (
    'upcoming',
    'active',
    'closed'
);


--
-- Name: session_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.session_status AS ENUM (
    'in_progress',
    'submitted'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'guru',
    'siswa',
    'orang_tua',
    'kepala_sekolah'
);


--
-- Name: attendance_range(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.attendance_range(p_class_id uuid, p_from date, p_to date) RETURNS TABLE(student_id uuid, nis text, full_name text, hadir integer, izin integer, sakit integer, alpa integer)
    LANGUAGE sql STABLE
    AS $$
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


--
-- Name: close_semester_and_open_next(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.close_semester_and_open_next(p_semester_id uuid, p_next_semester_id uuid, p_actor uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: guard_grades(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.guard_grades() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: guard_report_cards(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.guard_report_cards() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE s semester_status;
BEGIN
  SELECT status INTO s FROM semesters WHERE id = NEW.semester_id;
  IF s = 'closed' THEN RAISE EXCEPTION 'SEMESTER_CLOSED'; END IF;
  RETURN NEW;
END $$;


--
-- Name: prevent_hard_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_hard_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN RAISE EXCEPTION 'HARD_DELETE_FORBIDDEN'; END $$;


--
-- Name: promote_students(uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.promote_students(p_from_year uuid, p_to_year uuid, p_mapping jsonb) RETURNS TABLE(enrolled integer, graduated integer, transferred integer)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.academic_years (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT academic_years_check CHECK ((ends_on > starts_on))
);


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    audience public.user_role[] DEFAULT '{admin,guru,siswa,orang_tua,kepala_sekolah}'::public.user_role[] NOT NULL,
    pinned boolean DEFAULT false NOT NULL,
    publish_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    author_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    class_id uuid,
    teaching_assignment_id uuid
);


--
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignment_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    url text NOT NULL,
    note text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    score numeric(5,2),
    feedback text,
    graded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT assignment_submissions_url_check CHECK ((url ~* '^https?://'::text))
);


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teaching_assignment_id uuid NOT NULL,
    title text NOT NULL,
    instructions text,
    url text,
    due_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT assignments_url_check CHECK (((url IS NULL) OR (url ~* '^https?://'::text)))
);


--
-- Name: attendance_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_daily (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    attendance_date date NOT NULL,
    status public.attendance_status NOT NULL,
    note text,
    marked_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: attendance_subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_subject (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    teaching_assignment_id uuid NOT NULL,
    attendance_date date NOT NULL,
    status public.attendance_status NOT NULL,
    note text,
    marked_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id bigint NOT NULL,
    actor_id uuid,
    action text NOT NULL,
    entity text NOT NULL,
    entity_id uuid,
    detail jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    category text DEFAULT 'akademik'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT calendar_events_check CHECK ((ends_on >= starts_on))
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    academic_year_id uuid NOT NULL,
    jenjang public.jenjang NOT NULL,
    grade_level smallint NOT NULL,
    name text NOT NULL,
    homeroom_teacher_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT classes_grade_level_check CHECK (((grade_level >= 0) AND (grade_level <= 9)))
);


--
-- Name: development_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.development_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    author_id uuid NOT NULL,
    aspect text NOT NULL,
    narrative text NOT NULL,
    observed_on date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT development_notes_aspect_check CHECK ((aspect = ANY (ARRAY['agama_budi_pekerti'::text, 'jati_diri'::text, 'literasi'::text, 'sosial_emosional'::text, 'motorik'::text, 'karakter'::text, 'lainnya'::text])))
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    academic_year_id uuid NOT NULL,
    promotion_status public.promotion_status,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: exam_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_questions (
    exam_id uuid NOT NULL,
    question_id uuid NOT NULL,
    "position" integer NOT NULL,
    points numeric(6,2)
);


--
-- Name: exam_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    exam_id uuid NOT NULL,
    student_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    deadline_at timestamp with time zone NOT NULL,
    submitted_at timestamp with time zone,
    status public.session_status DEFAULT 'in_progress'::public.session_status NOT NULL,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    score numeric(5,2),
    correct_count integer,
    total_questions integer,
    is_late boolean DEFAULT false NOT NULL,
    client_meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    essay_scores jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: exams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teaching_assignment_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    title text NOT NULL,
    instructions text,
    duration_minutes integer NOT NULL,
    opens_at timestamp with time zone NOT NULL,
    closes_at timestamp with time zone NOT NULL,
    shuffle_questions boolean DEFAULT true NOT NULL,
    shuffle_options boolean DEFAULT true NOT NULL,
    passing_score numeric(5,2),
    status public.exam_status DEFAULT 'draft'::public.exam_status NOT NULL,
    settings jsonb DEFAULT '{"show_score": false}'::jsonb NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT exams_check CHECK ((closes_at > opens_at)),
    CONSTRAINT exams_duration_minutes_check CHECK (((duration_minutes >= 1) AND (duration_minutes <= 300)))
);


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    teaching_assignment_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    formative_score numeric(5,2),
    sas_score numeric(5,2),
    final_score numeric(5,2),
    predicate character(1),
    tp_scores jsonb DEFAULT '[]'::jsonb NOT NULL,
    narrative text,
    locked_at timestamp with time zone,
    locked_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT grades_formative_score_check CHECK (((formative_score >= (0)::numeric) AND (formative_score <= (100)::numeric))),
    CONSTRAINT grades_sas_score_check CHECK (((sas_score >= (0)::numeric) AND (sas_score <= (100)::numeric)))
);


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    requested_by uuid NOT NULL,
    kind text NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    reason text NOT NULL,
    attachment_url text,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT leave_requests_attachment_url_check CHECK (((attachment_url IS NULL) OR (attachment_url ~* '^https?://'::text))),
    CONSTRAINT leave_requests_check CHECK ((ends_on >= starts_on)),
    CONSTRAINT leave_requests_kind_check CHECK ((kind = ANY (ARRAY['izin'::text, 'sakit'::text]))),
    CONSTRAINT leave_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teaching_assignment_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    url text NOT NULL,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT materials_url_check CHECK ((url ~* '^https?://'::text))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    link text,
    type text DEFAULT 'info'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: parent_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_user_id uuid NOT NULL,
    student_id uuid NOT NULL,
    relation text DEFAULT 'wali'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: question_banks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_banks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    grade_level smallint NOT NULL,
    title text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: question_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_keys (
    question_id uuid NOT NULL,
    answer jsonb NOT NULL,
    explanation text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bank_id uuid NOT NULL,
    type public.question_type DEFAULT 'pilihan_ganda'::public.question_type NOT NULL,
    body text NOT NULL,
    media jsonb DEFAULT '[]'::jsonb NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    points numeric(6,2) DEFAULT 1 NOT NULL,
    difficulty smallint,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT questions_difficulty_check CHECK (((difficulty >= 1) AND (difficulty <= 5))),
    CONSTRAINT questions_media_check CHECK ((jsonb_typeof(media) = 'array'::text)),
    CONSTRAINT questions_options_check CHECK ((jsonb_typeof(options) = 'array'::text)),
    CONSTRAINT questions_points_check CHECK ((points >= (0)::numeric))
);


--
-- Name: report_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    homeroom_notes text,
    attendance_summary jsonb DEFAULT '{"alpa": 0, "izin": 0, "hadir": 0, "sakit": 0}'::jsonb NOT NULL,
    extracurriculars jsonb DEFAULT '[]'::jsonb NOT NULL,
    status public.report_status DEFAULT 'draft'::public.report_status NOT NULL,
    submitted_at timestamp with time zone,
    approved_by uuid,
    approved_at timestamp with time zone,
    snapshot jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    academic_year_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    class_id uuid NOT NULL,
    teaching_assignment_id uuid NOT NULL,
    day_of_week smallint NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    room text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT schedules_check CHECK ((end_time > start_time)),
    CONSTRAINT schedules_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    name text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: school_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_settings (
    id boolean DEFAULT true NOT NULL,
    name text DEFAULT 'Nama Sekolah'::text NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    principal_name text DEFAULT ''::text NOT NULL,
    principal_nip text,
    stamp_data_url text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    unit_profiles jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT school_settings_id_check CHECK (id),
    CONSTRAINT school_settings_stamp_data_url_check CHECK (((stamp_data_url IS NULL) OR (length(stamp_data_url) < 400000)))
);


--
-- Name: semesters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.semesters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    academic_year_id uuid NOT NULL,
    kind public.semester_kind NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    status public.semester_status DEFAULT 'upcoming'::public.semester_status NOT NULL,
    closed_at timestamp with time zone,
    closed_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT semesters_check CHECK ((ends_on > starts_on))
);


--
-- Name: student_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    kind text NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    description text,
    points integer DEFAULT 0 NOT NULL,
    follow_up text,
    recorded_on date DEFAULT CURRENT_DATE NOT NULL,
    recorded_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT student_records_kind_check CHECK ((kind = ANY (ARRAY['prestasi'::text, 'kedisiplinan'::text, 'konseling'::text])))
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    nis text NOT NULL,
    nisn text,
    full_name text NOT NULL,
    gender character(1) NOT NULL,
    birth_date date,
    jenjang public.jenjang NOT NULL,
    status text DEFAULT 'aktif'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT students_gender_check CHECK ((gender = ANY (ARRAY['L'::bpchar, 'P'::bpchar]))),
    CONSTRAINT students_status_check CHECK ((status = ANY (ARRAY['aktif'::text, 'lulus'::text, 'pindah'::text, 'keluar'::text])))
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    jenjang public.jenjang NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    kkm numeric(5,2) DEFAULT 75 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teachers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    nip text,
    full_name text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: teaching_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teaching_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    class_id uuid NOT NULL,
    semester_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: teaching_journals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teaching_journals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teaching_assignment_id uuid NOT NULL,
    journal_date date DEFAULT CURRENT_DATE NOT NULL,
    topic text NOT NULL,
    method text,
    student_activity text,
    present_count integer DEFAULT 0 NOT NULL,
    absent_count integer DEFAULT 0 NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username public.citext NOT NULL,
    email public.citext,
    password_hash text NOT NULL,
    role public.user_role NOT NULL,
    full_name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    must_change_password boolean DEFAULT false NOT NULL
);


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Data for Name: academic_years; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.academic_years VALUES ('00000000-0000-4000-8000-000000000001', '2026/2027', '2026-07-01', '2027-06-30', true, '2026-10-05 11:34:24.536+07', '2026-10-05 11:34:24.536+07', NULL);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: attendance_daily; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: attendance_subject; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.classes VALUES ('6365650c-9f28-4b88-a657-2a7b98e88451', '00000000-0000-4000-8000-000000000001', 'SMP', 7, '7A', NULL, '2026-10-14 00:59:18.940602+07', '2026-10-14 01:00:50.683694+07', '2026-10-14 01:00:50.683694+07');
INSERT INTO public.classes VALUES ('c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', 'SD', 1, '1A', NULL, '2026-10-14 01:35:27.885788+07', '2026-10-14 01:35:27.885788+07', NULL);
INSERT INTO public.classes VALUES ('dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', 'SD', 1, '1B', NULL, '2026-10-14 01:35:39.722078+07', '2026-10-14 01:35:39.722078+07', NULL);
INSERT INTO public.classes VALUES ('b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', 'SD', 1, '1C', NULL, '2026-10-14 01:35:48.565941+07', '2026-10-14 01:35:48.565941+07', NULL);
INSERT INTO public.classes VALUES ('d78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', 'SD', 2, '2A', NULL, '2026-10-14 01:36:02.87867+07', '2026-10-14 01:36:02.87867+07', NULL);
INSERT INTO public.classes VALUES ('e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', 'SD', 2, '2B', NULL, '2026-10-14 01:36:09.921742+07', '2026-10-14 01:36:09.921742+07', NULL);
INSERT INTO public.classes VALUES ('64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', 'SD', 3, '3A', NULL, '2026-10-14 01:36:20.943569+07', '2026-10-14 01:36:20.943569+07', NULL);
INSERT INTO public.classes VALUES ('48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', 'SD', 2, '2C', NULL, '2026-10-14 01:36:26.99789+07', '2026-10-14 01:36:26.99789+07', NULL);
INSERT INTO public.classes VALUES ('5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', 'SD', 3, '3B', NULL, '2026-10-14 01:36:37.731965+07', '2026-10-14 01:36:37.731965+07', NULL);
INSERT INTO public.classes VALUES ('47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', 'SD', 3, '3C', NULL, '2026-10-14 01:36:46.005588+07', '2026-10-14 01:36:46.005588+07', NULL);
INSERT INTO public.classes VALUES ('64dc3079-dbd4-46cd-9a2a-f41b6459dea7', '00000000-0000-4000-8000-000000000001', 'SD', 4, '4A', NULL, '2026-10-14 01:36:54.120875+07', '2026-10-14 01:36:54.120875+07', NULL);
INSERT INTO public.classes VALUES ('4f6d0791-7b88-47f8-b53d-c5b6e3ddce88', '00000000-0000-4000-8000-000000000001', 'SD', 4, '4B', NULL, '2026-10-14 01:37:01.978267+07', '2026-10-14 01:37:01.978267+07', NULL);
INSERT INTO public.classes VALUES ('1b2a61f9-3290-4c01-aa76-768e1d991948', '00000000-0000-4000-8000-000000000001', 'SD', 4, '4C', NULL, '2026-10-14 01:37:08.501828+07', '2026-10-14 01:37:08.501828+07', NULL);
INSERT INTO public.classes VALUES ('c9205162-31ab-421b-965a-8df46b5152b8', '00000000-0000-4000-8000-000000000001', 'SD', 5, '5A', NULL, '2026-10-14 01:37:16.566477+07', '2026-10-14 01:37:16.566477+07', NULL);
INSERT INTO public.classes VALUES ('fe06761f-583c-4d1b-b262-31a946d1a557', '00000000-0000-4000-8000-000000000001', 'SD', 5, '5B', NULL, '2026-10-14 01:37:23.901809+07', '2026-10-14 01:37:23.901809+07', NULL);
INSERT INTO public.classes VALUES ('dd0884e3-40c1-47ed-aa56-cf309063e9f3', '00000000-0000-4000-8000-000000000001', 'SD', 5, '5C', NULL, '2026-10-14 01:37:30.190669+07', '2026-10-14 01:37:30.190669+07', NULL);
INSERT INTO public.classes VALUES ('b5fc871c-17fd-4868-8bf5-23cc043c97fc', '00000000-0000-4000-8000-000000000001', 'SD', 6, '6A', NULL, '2026-10-14 01:37:43.934679+07', '2026-10-14 01:37:43.934679+07', NULL);
INSERT INTO public.classes VALUES ('6e0f7316-b5e8-476e-8921-bb67826b5f7b', '00000000-0000-4000-8000-000000000001', 'SD', 6, '6B', NULL, '2026-10-14 01:37:52.542724+07', '2026-10-14 01:37:52.542724+07', NULL);
INSERT INTO public.classes VALUES ('e91ae7db-a870-4284-b486-424fb109ac53', '00000000-0000-4000-8000-000000000001', 'SD', 6, '6C', NULL, '2026-10-14 01:38:01.579438+07', '2026-10-14 01:38:01.579438+07', NULL);


--
-- Data for Name: development_notes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.enrollments VALUES ('e3652d09-74e8-4d8c-96cb-45f7198fd0d1', 'cd211d72-cefb-4d86-93b8-3ae02a2c6f85', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('b02c3477-d65a-485f-8c6f-847a175e2f1d', '2ed36834-900e-42e8-a941-cd8e634e1498', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('ddf31610-f8dd-4853-a3f2-b4d7959d4fa0', 'c1d5a670-9957-453d-8101-c38f237ecacc', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('e529b2cc-9373-4453-921e-1317aa2ece89', 'fb7dd65c-b0cf-4bc6-8f05-d2b1836dd2d5', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('e06fd03f-5015-46e6-8af2-4138b8a7512a', 'f21f01f5-68dc-46c4-a619-15322cfed0b0', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('18ccc19b-52dd-4aca-ba19-58b76824c0b6', '576c1dfb-e763-4b27-9df7-55d2f0fd1c17', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('a068b595-2802-4831-a45c-bc3ecdfc73d8', '34910ee3-7577-48a5-b6b3-e801e711b8b4', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('8f1f0dcc-81dc-4102-b52b-b80e79adc53b', 'c871aeb5-1799-493c-9015-1b58567d1ecf', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('617cfd8b-466d-458f-97f0-cd9b81d2ff30', 'bc30c0a4-d480-4601-897e-5a09b6b253e9', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('dae237fd-38eb-4490-9e75-01e73f989507', '2c35e285-c9ca-4fc7-a110-045fa84b3b65', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('9912698f-4ef2-43b3-87f9-fd8577ba89c9', '5005fd3e-f5b8-42ab-912e-80deded8c632', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('5fcc8cc8-e4f2-45ac-b913-c31673954557', '34cc88ee-95e7-4f48-bd00-7bd9b412d5c3', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('ac406f54-6f01-44e3-9adb-f517054bf213', 'a49df12e-e138-4b50-8f97-57042f21aa0d', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('fcf98894-d79a-4d11-adcb-1c2f8e3b28fa', '149d5d00-817c-4eae-b2a0-cf214e238e7a', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('82bec011-84c3-44fe-9aa6-e9a2f2c6b006', '073fb1b6-a659-423c-8ac0-ef8acb9c0741', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('35d8d21d-fc55-4580-82a4-b729dac9a461', '5cbb3c3c-38e5-49a7-8ee8-8f36c52dee6c', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('f12d36b2-a35f-467f-ad88-e99c376fe308', 'd7223776-5b81-4b33-bc20-6793a59af894', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('36c921ca-2f85-439a-9c52-7cbfb5298362', 'a605ba0b-3043-4045-8140-792a188bf929', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('fffb0843-2f0e-4c02-b06a-11b1ea02c208', 'e5719813-eda6-47eb-a3a1-8922145abe6b', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('d4fbf1b1-81ce-4f37-ab52-87cb0d47eced', '1a56352d-be2e-47b9-aecc-e14f7c0181fd', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('0156fd0c-919f-4ed3-90a6-d4932f8bfca4', '623ae2c3-79f3-4bdd-b167-357091b30bca', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('57809905-bbc0-421f-be66-2974d16d6af0', '2faf6a2d-4eb3-4306-bb34-1f90687e869b', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('7386860b-1884-4526-ad06-384b2c421e19', 'da185f50-76c3-4397-b307-43972537d2f6', 'c638281f-9d4f-4eaf-b956-4fd8bac6efac', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('be40ae57-089f-41bd-9b81-5a292b0fcbe1', 'd3ae8662-e773-4955-bfa7-bd4372048f3b', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('32923903-77bb-4ac3-b8af-64a9e07072c3', '1ecb87bd-1eeb-4c27-820f-2116d487c53c', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('72bea4f8-5cd4-4ef1-8d7f-0d6e45e015a8', '59e67841-080a-4bc9-a52e-dae7c8e180a6', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('c158cc0c-af04-4e95-a144-78fe9447935b', '69aee04d-59b4-4027-bcb7-005550ed7c0a', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('5f1222ff-7dcc-4867-b648-81284c1ba4be', '11e8bee6-0bb5-407e-81f6-466a2b722875', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('5b4ca267-5356-48d2-a5d8-53c47a4b97e4', 'd69be816-c8d8-44d8-9111-f0599c6b5567', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('0355ddb0-3356-48f9-888b-b8ba8dcf0bb0', '0a649c87-8bc1-40df-9917-b99617471fc3', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('3f2dfa7e-bda1-4781-b164-7e68c87aa9e7', 'ff3c93f4-d335-4f97-9bb2-3d408c8da83c', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('cfd0f4c4-c217-4e01-b462-c4a1963e70d7', 'c141bd3e-a99a-49b3-9e1e-ac64a0a96286', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('44f7e402-5144-4a0e-8bd2-add32246e025', 'd218ac31-7095-45f7-83d1-f88b60d6f64c', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('3cbc09f3-0614-417d-82f8-0ff289f2c867', '5db98519-63d3-4948-8404-f64ccf2c68cf', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('1d002657-a9cf-4375-be27-070be694a51f', '7a55d5e3-2072-4498-aebf-582c407887d7', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('b1fda802-43d5-4365-ac0f-64ca8afee036', 'd18b5aab-4c8a-4cbc-af6e-1a32abf4ceb6', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('1f416270-a10c-40e0-8fd2-33382160b57a', '350e1645-a0d5-426f-b224-290ff48cd6fa', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('f87a874f-f8cd-4064-93cc-ff840e05a5ee', '2b41642b-ca4e-4db3-af0f-fded3896b1b2', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('80a6d5be-ef19-41c7-9e49-52c1c4e9504d', '211bfa7b-c857-459f-a7f4-06f0052caa2a', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('b0216867-0194-419c-9b49-897584f318b1', '9c50e732-5380-41df-baae-43c5c38c54d2', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('bcece62a-9adf-4762-82f8-b92d3324875d', '3f666f09-76c1-4628-8415-e8faac0a8a18', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('88bcc3a2-3a5a-4edc-b7ec-d22f9e8bd31e', 'e3aaec36-8d66-4d40-94ad-76b902b1ec59', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('b47cd154-caf9-4275-9ec3-1fd4edcb2280', '81da85b4-7434-4214-900b-6f082840cb7f', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('23860008-1159-4a7f-9553-f05168c419da', '83fdef06-0885-4426-a231-87d5145623ef', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('0907fb77-2963-437d-9903-49659f11bbf4', 'e014cb56-4532-476b-a996-df1a00019376', 'dff47b7e-e5c6-4933-ae1b-2f24c437a41e', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('92e48207-267e-4cf9-8372-1f8006da23de', '4f0aeb99-991b-468a-9be9-cfc478369955', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('8a9c26be-340c-4acc-92e9-8b7564e18c07', '4b7d8bdd-c47c-486d-bc7e-35fd5aa02c1e', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('d413e7c9-a31b-4d3b-845f-f43fc0a3a942', 'a1102278-8734-437b-95d8-7ee44aa1df7f', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('675897c3-8d09-4958-8be0-346a270fc912', 'bcd81be6-0650-4be1-bdb1-41360763963a', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('5de53991-e426-4e7c-8435-ed0f2c19e37b', '21163dc0-561d-4a42-832c-7dbb8283c58d', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.enrollments VALUES ('ff97a78d-dd32-4059-a611-ff56aec02dcc', '370b9d05-8380-4851-a1d1-40b36116df68', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('bccd0b66-fe89-4c81-8d5a-906889c92998', '681e676c-83bf-413c-86c8-014d5704bfc4', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('66584cfc-4e18-49e1-ab80-7339536809bc', 'cda6b0b4-18e5-4b72-bc74-4a50aa485045', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('8f432cd4-9683-4346-9320-8baefea4fdea', '3691a0cc-fa98-47e5-b8b9-2f0f91806523', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('dcbfe06e-17cd-430f-b2c9-88fb95dc1df9', '2c34c2e2-6b58-4958-89a7-0cb8dfb8df0d', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('5f8cd64b-b735-435b-b807-8471a767a8c9', '6880fd02-ecae-42fc-a9b7-ee858bb2b272', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('83b8ad87-e818-4eaa-b588-b13517c23cc8', 'b8ae5ba3-f850-4cfa-a898-3548f675524a', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('853c33f0-75ae-489c-a1e8-d7801ceff256', 'f44e3828-95eb-4c25-845c-fa73e213adad', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('6f131fbd-620b-4a15-97b2-8bd37f42ac26', '7247033b-db3f-4c49-95b2-1befd44e8f11', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('96370e33-4c2d-4334-8231-ab819b3ee32b', '513d6236-6ed6-462d-99ff-369176f4f53d', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('2f2b2a02-0fd4-43b7-bce9-fe0cf93e1cb8', '2c33c0a6-5eae-4139-b71b-f9d94dcddf66', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('e2cd19ef-3a53-4f12-9385-adb36a306357', '218568c5-7f9b-47e3-aa00-ba90ff9d25ce', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('a4b4f2b3-7a71-41bd-821d-929b7fceee80', '59fed2e5-9be6-438e-8316-e90083e1bd13', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('f3bbb7de-057b-4a53-b2e0-271231833607', '8247671e-ac6c-49e7-b413-507a920a95ce', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('5112231f-bf14-40a5-a7e9-b4ce12d7e83e', '86ff7c0e-b1ca-4331-9d1a-b37428f952a6', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('fc105966-0de9-48a5-8eb3-379f10ed79b1', 'e0e064c7-ead0-407e-90a2-ef4c66618c91', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('44493685-8741-4d17-aaec-58e375d78b55', 'c0ebb79e-b1b8-4f8e-9644-9f08a837a29d', 'b8121357-4451-4e5a-8d72-e37d48bf3db7', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('829eab53-be4a-40bb-b463-5e070aa40995', '26515efe-89f6-4e75-8f5a-63b3ddcbed2c', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('be54fbec-8f43-45dd-8f23-88a45a1be00b', 'e5a2d45f-6e3e-442b-8021-bdda9dbeeb12', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('9d82461e-8a3e-458e-ae21-e3075aa7aa4b', '494bf00b-d1fd-4cc4-8253-de8b49a1951b', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('e4fc315f-eaab-4495-a96a-347c97454f86', 'f4cf58f0-0367-4f44-b3b9-f8a8209aea64', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('5688dcec-7066-4960-98f9-692fc4ab9519', '49421e60-4662-4deb-9949-78695f96c409', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('4919aaa0-397e-4532-8f1f-0e9f74ace5e2', '34e44a37-388d-4cc5-a8df-28b76399e171', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('e171e40a-3b50-4455-a74c-23ccf519bab4', '7765c400-7d1f-4fc6-989b-a74522a41812', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('904696aa-d1d2-4979-bce9-4c7a14a10ceb', 'aceb5124-3b85-49cf-b290-5b2bed171be2', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('3f3d58be-9396-4fec-b976-962980a3b104', '1a088461-09bd-4cf3-aebb-26a9ed8b4162', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('dad19cab-f8ad-46d9-b89d-4b33020c8bb4', '56eedf90-eaf5-4343-99ec-6252093bd00b', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('81c0bb54-8279-4989-b804-d0b0a8b1552b', 'fd14dc60-35f8-49bd-aff2-c6dbbda04df3', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('aa6d009d-d7e1-4068-a461-9b2c92902420', 'f8abe522-73d2-4744-a335-45e363adcfd5', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('cf0b1d8c-fedc-47aa-b025-94ca76edb4e4', 'b5a8d6cc-1fa5-4f82-a73c-17e78a8e9834', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('9375787d-ac62-49b7-b259-44ceee4805bf', 'f034ef69-f41e-4cb8-b489-fdb55e9b9a28', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('7a5d0f12-ee27-4d26-bb6a-14bdb4f24900', '83eb8254-61a0-446c-915c-bf55c6edf085', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('0d62cb32-5db9-4070-ada4-b078226ade80', '2b0364ad-ddd5-4092-a556-d76bdf86c2e4', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('89519742-69dc-4348-bf6d-f74c1961a377', 'fc24a6ee-d5b7-4c46-8a94-faf0803a9d16', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('58eda0c6-1bb5-470d-affb-51ca38de727d', 'da544ece-ac6d-4750-a1fe-1be2af44bf44', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('30ef6436-9cef-40eb-af30-334609399b2e', '587ee5ad-2d6b-47f4-b4b3-89b1e5eaa6c3', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('27404d09-5331-47a4-9bad-13ec39268a6c', '0682b526-5c2e-40fc-b9a9-e5945c08b68a', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('c3131dd2-c5cd-4090-8396-da3551232f52', '33f8775c-0f9a-4ffe-9094-8dd2ef8c825b', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('366120a8-0438-423b-9c82-f4367c737750', '3b380b44-521a-413a-b65c-5ffccc6232b6', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('12fe3493-e9d0-433c-9002-a8bc215dbb11', 'ae1fa08f-3424-43af-a741-3c8dd04a022b', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('48abcdc8-222a-48ab-8681-576a72cf234d', '19c0c97f-6f81-470b-8b85-9e5a567189f2', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('f5866af0-df21-4866-b40e-191b5f392b2e', 'dc34d299-fa83-4c26-99cc-2accd57b6a10', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('b272d18d-8518-4aae-8372-8a975846158d', '39fcbbd9-cb03-40f8-b1f9-15d7254bd10f', 'd78087f6-1431-44b2-8fe9-4924710a2616', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('6af4e2e3-1df7-41c0-abf1-26cf31b3b9cc', '5ae8ec88-64e6-4efe-8790-9e0e472d939b', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('fbf4a256-03f5-45cb-ae18-534db7d5fe04', '40bb128d-3f13-4678-961a-c7a1d47a1ddc', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('ffa1844f-dc4f-4db7-bfc7-fbfbdd429c50', '508f0518-6994-4601-ad4c-0f92ad46ccd4', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('e047747b-f2fe-4019-98b3-45893af071a7', '183bd2c8-8e68-4435-b678-52a82d230208', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('795fbd21-90ca-4434-bab4-1d15a9c0442f', 'da541a9e-cdc7-400d-bf0a-c17e1f9ddace', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('0b68049a-36fd-4e24-ad83-601bd9dc6b3f', '7829db25-bc85-40cc-8ae3-c55639654c7a', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('b413312e-74bd-4eca-8c60-60608d6def94', '157c7f75-82cf-4396-9cd8-4f34439f13f2', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.enrollments VALUES ('17cb907c-0b42-478f-bacc-02a98b13baa5', 'c67cba66-291b-4a1b-8bdc-0cf7017a279b', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('6657322b-b009-4fc9-b42c-c684bcafa1ea', 'ae7142fd-b8fe-4a35-a69d-d11dce834675', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('e6da693a-8e6d-4bc7-9fa7-2169d05ac6bd', '92a60bc3-30e4-438e-a4c2-b61447b085fc', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('4db5e501-11a9-44e8-b80c-6296c7d1d458', 'e5a5339b-cf22-4f30-824a-5fdc1b5f03bf', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('fa8eb0ee-a06a-440a-8d66-b3ef925c3b30', 'c6c8eae8-988a-4dc6-9f29-493d8b044011', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('879fc110-eae9-4c78-b57c-a6a4e0d1333c', 'c14d2359-75ce-4d81-a69c-1f4693105131', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('eb81dfd3-9820-4760-894f-5a43a5515cd6', '056e8040-6d3f-45e5-9089-6251890b8268', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('c071bd82-c87c-4ea5-b27d-50b6de994f8f', '5dc30a1b-2a15-409d-86e5-1b3cb390d40e', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('193b794e-eeae-4ad3-876f-11a7a95649fa', '0b6eda98-cce1-4cb2-9f86-7236c6e0748d', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('7743c845-2098-4fe5-a192-c1efff7c03e3', '7fbeff46-d3ca-400b-863f-987f3875e387', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('5da3ea2b-0461-458c-8232-a9982042d990', 'f46308cc-e0b6-4d76-a938-1e54e1ae40d0', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('8656b494-6a9b-4acf-8ec7-80af91cf689f', '043d2dd2-9eea-4feb-8f73-8babdeebeddc', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('5b49229f-0d72-40e4-8a2c-ca657ed942d5', '18dca2a2-447f-440b-899a-36f0c3d31cc4', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('7960ed2d-124e-4fe7-a026-9dbf29f15dda', 'f56399a1-0358-4115-be2d-8dc6a72ca647', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('8637b4a4-c0a2-41be-9131-f41cd8cdaf8e', '6afdb9e6-be2e-44b2-9ee5-8348fbd72b94', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('07679180-b6b1-4f59-96bb-b4dfb3de6fa1', '8e5fd565-a95c-4d78-83db-920b871a5cfe', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('dbf3473a-ded8-4c0c-976c-026a67cba9c7', 'dc870580-f2b1-44d0-a63f-b9d18088f5b1', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('e19956bf-2ca3-4554-9496-462d05bcf9ac', '40a8851d-d67f-44f5-a2b0-440dd5cf740c', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('38e0158c-f7bc-44d0-9b62-64be9b8d5fb8', '3018f359-21d5-481c-ba9f-5a9ae04926ed', 'e8809cc3-ce4f-4231-87d6-b62dec32d203', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('e7b8dd58-a93e-4c83-91c7-559ffc14e94e', '3fd79085-27c6-44b5-a384-05d5c5d6e97a', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('1a4a818d-3892-432b-bd6a-6fd1527e1d38', '1b8a03cb-5dc0-440d-830e-fc257cdc9f38', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('849d0028-c70f-4282-ae7f-0f3e30891da9', '41fc89d6-8a2b-4004-8862-592a4b5a54d9', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('0c58cbf6-5b46-411b-9911-85cdd52e4b53', 'a88a4961-9986-43b7-8b91-cdbc57c738c7', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('724ab9f0-4b48-4dbf-8baa-79ad5b9c6463', 'd9788a32-0a1e-4c40-b1a6-54c9ef4da025', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('a07ce1a4-39e9-4bef-b61e-5662c5d5ed90', '2930373c-aa43-4075-bb37-e20528202d11', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('c6010eee-a76c-413a-a370-d070356ca4b9', 'c776a02d-f960-44f5-9e6c-ca0604feef81', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('04aadaff-263b-4229-a9c5-c7fa4ad0b08e', 'e093aaec-16d6-41e2-8b58-5dc590085325', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('1925c389-3bc2-46dc-948b-3c7251c66a7d', 'a4befd10-8dbf-4266-bb11-b5ea7e60142c', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('223b3a80-ac88-4766-ac00-534763f62893', '2df44fdf-1fd1-499a-bb2d-c3495f29327f', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('e800db77-5dde-4a92-a0a6-43fb93e1254b', '48dc1b87-f3b3-4cd9-9465-4e623bc0a46c', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('451fbaaa-e2c7-4b15-88a0-662d41c3c218', '8efcea56-0c29-40c2-aaed-c130e4afbfaf', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('04fa5067-8fb0-49ef-a0b1-b635dfdb729d', '28d0ff4e-5504-4f65-a371-351ca5aec824', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('365c48ca-28fa-41eb-abed-6c15f764e8de', '62ea5b9a-ca06-496d-9345-8b4537918a77', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('52ac94fe-0562-429b-b6b5-d263d9563294', '0ff345f8-e85e-416a-bf7d-c0c833484bef', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('4da8a1e6-46b2-4ec3-a1b2-afb7457e73fe', '99b47e7e-59c8-4e17-a220-2321a274bd0d', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('66a7fbbc-2afc-4999-b3c5-1bd8bed77e2a', 'c57af4e5-a63d-4662-b3c0-26ec9319a5ef', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('65e60816-5c86-4060-9a7a-aa85460fa9b6', '7aea0389-45dc-4caf-80a4-ce7b833e3b5b', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('9dbf2740-c046-4f4e-b471-c0125d33aa6c', '280158a5-2c8f-4c9e-ab1b-d9bad90ee979', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('bdb74d99-0b6d-449c-931e-cc69cc303b1a', '161848d9-fa20-43fb-ba34-0f94d45fdec1', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('38b03d1a-4300-4a25-aca5-a5e18ffeb27f', '202dc0ea-02d3-4994-ad49-189a7ef19383', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('dc43c46d-19e8-42c1-8fad-b66da84caeb7', '4068a18d-6c04-459a-8ffd-a5c9ba844da0', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('6d2c777d-b89c-4c99-9741-d36c6375aa08', '4969a6a1-08e1-43d5-b89d-665e49897bf4', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('2dd2070c-e5bf-4ac4-be32-4c053c72d9d1', '535f2cc1-03cf-44c7-89ac-53577892a27a', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('2aa72bcb-6e2e-4941-921d-c42c4aeefee0', '661fcb6b-a7eb-4cc5-ada4-7d655d427e99', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('d1a17d36-694b-4449-9200-57eeb83e65b3', 'c5599258-dcfb-43a9-b954-6d38f9e7571b', '48c00114-feb7-4c87-9351-b563cd22649b', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('9dc6102a-21a7-4c71-88e9-ab4559692888', 'b7e4e017-96a8-463c-8968-507cdb94b3ed', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('dac1f6af-1a13-48ec-9817-7f56ed238f0e', '9ffd25e4-c4fd-456b-8dd6-5ac679aec4ae', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('97612835-b7b3-4efc-8a13-980c877d3101', 'fb3eeb33-6955-440d-b090-9f13f208c9d1', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('3b5c5ef3-4867-41cd-a76b-73aaa101ce6f', '7b8a627b-dd4a-4d99-a595-29ed770555ba', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('109690c1-11d2-45bf-8bfa-af308f360b4b', '873e000f-4467-4c37-90c3-4ddafc743d10', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.enrollments VALUES ('38501121-82c0-4ad8-aa67-57c8edf39cc7', 'a65703dc-d705-4811-af78-7923078aca5b', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('91e41764-c19e-47a5-aa5b-8aa9f69c9825', '452efd6c-ccc0-465e-8f85-3d62878bd9cd', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('76543580-4331-4037-beec-afeaad29ef9e', '66f1c2b0-b303-4285-b409-94ab6d0c1028', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('3ea3e1ac-87f9-4aaa-b7c7-0a85015f8fbd', '2c755ec4-7e8f-45d3-90a4-c6fd2bf3e1bc', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('c6a3e8b5-56f1-4fd4-97be-6c3b2667768d', '4a52d226-56fe-47a7-87ad-592ad4f0240b', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('8bd19730-5349-42d0-86d5-486222471043', 'e7a96317-26cf-4f32-a243-c7bf4f74fd7b', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('b625c34c-820c-44db-9d06-96c911c1ada6', '938cebff-9f17-4249-a968-a68ed24152f6', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('57c8eb9c-12e1-4f9d-b002-756d0a4e555f', 'eef0dbb4-b8ec-4eee-b391-8b87cd978f93', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('8756e969-4bd4-4230-a100-fa338772f949', 'd50f3b48-6cd7-49bc-aa15-928c7db67324', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('11228481-5ac0-4350-8dd3-52e83de42aed', '2cde5d72-ea3e-4b75-9526-7d9d063f0af6', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('8a26c192-eb2b-4844-92d9-f2f621050ac9', '589bf067-2b85-4d54-b521-696aa8e45abd', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('88fc5baa-131c-493d-b758-a00479020b9e', 'd7cd3e0a-0a5b-4d1c-9cc9-2641ffa31097', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('0a90c8d2-7fde-45f9-8753-cb320fcfd45b', 'c9dc32e5-b54b-47ad-ae4a-3d9019b6bfba', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('0e8baad6-8ab7-48bd-a8a8-b83b4794ff65', '2ad0ece8-ab70-4f2f-be1d-5cd83999c334', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('b01b002d-22e7-43b9-bae4-a19ad0f51384', '3b980178-7065-4c5e-9ea7-5d232560eed5', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('8ac657df-338b-478d-976c-25c774178313', '241cb1fa-9e3e-4d91-94e4-3262faf46380', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('ccee871a-b40e-4b68-ac02-584147a6a0a0', '6c2513b3-be78-4de2-935c-c8e56968b8b1', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('a89afe55-2570-427e-9c12-8e3fb928f9a0', '917ac7bd-a22c-4640-b236-74be2e9675b8', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('839beb48-b24e-4585-99b6-5d481147370e', 'e7cfef42-4d04-48b2-b484-f68b06581e17', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('a5b80645-f86b-4220-8cbd-0327e23c42a7', '993b1d4d-3082-4f47-b761-99be2594946b', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('7b605e93-6376-4523-b317-791c91ce6abb', '97c9bf5c-9f76-4949-8e9f-8efc0ee5f019', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('efc08053-b0ac-4c36-839a-812ad6808483', '1c148d51-2691-4ee1-bf57-f38f2fe7bacc', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('67737527-b1ea-41c8-9ed6-1344755e30e4', '58debd64-bd65-4242-8c35-df4163e0c1d0', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('4e1afdf7-b54c-4144-94d6-f6f37f72598b', 'a28cdfcb-7723-40be-a8e2-850fc49921eb', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('19e614d4-cf2f-447d-94d5-8d029a1cdc88', '80362aae-00bc-47ff-a504-dbe8cf53b404', '64f8e029-6940-467e-93b4-7c6080bcfd3c', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('69e397a8-1ebb-4395-8853-1e97660f7c01', '7b455262-73a2-42f9-ac7f-377dce7f372f', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('7d603070-0db6-4824-b34e-3483127d5d2d', 'f3b6e698-e416-422e-a732-7681d2d2ce31', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('c88a9fc0-4cd1-471b-a9e5-f097f56b91bd', '63938a80-6528-45bf-8837-3cd605688ca6', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('a0f202a0-7a88-4490-92b2-c8de5b20c8f1', 'cbb43922-93c6-4fba-b89f-88e9e4993841', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('953bd464-8658-4dd7-a569-c2a66e913df0', '62e19b59-f95b-46c5-92f5-b6b94c1fcdf3', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('4caf9655-2fe3-49c7-bcee-25b7c1e13cc0', '9c977b54-cd64-4381-a7a0-fcf77299cb3d', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('8b332eea-e3b4-425f-a899-0f85a9be8981', '1f5a5b14-5615-42cb-8226-5df7211162e7', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('a58a31bb-3c89-435d-9095-f1fe269986ff', '198880cf-6baf-4a81-9ac1-d39379a0dc40', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('ec72066f-159c-4f63-9744-4842cfa16737', '09874e5b-68ab-488e-a7ce-0dc230721f6f', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('02144c88-f5f0-4fd0-9d63-c1701a150dd8', '1783e2e4-7bcf-4981-9e17-c3ff225dcbbd', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('56ff5628-0185-4084-9934-9260d3fd890d', 'af191215-db33-4aa6-9251-b083626f6fdc', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('926f4c77-0079-4583-99e5-30bc461bba1e', '0b07a1dc-ca1d-48e1-80e0-6709fbcd9208', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('90e40f75-e680-414a-b7fe-71a43ec81d71', '8e756993-57e4-46ce-9279-1b9d05fd551a', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('21b95a61-7faf-428f-b7e6-b7c76b53abe3', 'f91f108d-4606-422f-9ca8-54482f9f234c', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('39feecf5-e97f-4761-9414-e7c63a1365f7', 'e3e88afc-c985-445d-aaf3-555dcba131d9', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('99aea826-0bac-4648-a296-a1ae435d1f88', 'e2c0bb70-80df-471a-aa7c-8ffea1fdd0e3', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('1f822af4-a827-4b20-a8c3-b9b70c6f0310', 'b62bd388-4957-4987-b261-fbe7914d9d2c', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('e8d09ab7-2dbc-49be-8ce9-e287783ed4ca', '5eaebc62-1f9c-4eea-93f6-bc589b2832df', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('f28d92ab-c2a2-42f4-b029-bd49b55671b4', '5141c8b4-e5fa-499b-baa2-a98e515fec64', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('d1fc25de-5c13-4f19-822e-767916f245c9', '7491714a-fb1c-47ab-a20e-2e1a98ac4e29', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('42f06781-78cb-4f58-8cbb-95153b78af14', '7176720a-eeca-40fb-a69c-5149ebf5b63f', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('88c7cbc5-cb25-441b-8647-29b053979bcc', 'cdc66cb9-45fa-48c9-a40a-f46002806049', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('fb634a5c-fcb9-48d0-83eb-8dbf6f010c5d', '51b236a7-f781-4a50-9bb2-1ffa5f9dbbdb', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('8937347b-d209-4855-a02e-9c11c4136388', '52a85bd2-270e-4f89-b0f3-6e734f07824a', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('4321e540-e402-44e3-8c70-1cb5bdde5952', '37f94055-a3c6-4c8c-845b-d509e666c0c3', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.enrollments VALUES ('911ce5e0-0763-4900-adaf-38ba5349493f', 'd74bbca2-b375-4184-9c72-ec7a1491a386', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('0812e907-dea2-4fbd-b65f-d6698f07a3b0', '4138efad-cafa-4218-8ed2-c6e65bf449c3', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('980e784b-915e-456f-88fb-e17e950f7e07', '559d3a00-71a4-4865-84e5-94e2a7eb1546', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('d7897aca-6e37-4f06-8008-8f4344091ada', '9931289e-23a9-4f25-aed0-b4ed046e92f1', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('5064582e-257b-4f8f-8377-7e675323b69d', '0ea0095e-30e4-45ba-878a-b58567c48de1', '5acb527d-5c70-4fd1-b0ac-838fad5673ab', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('a00042a4-8bf8-43d6-96e1-46ebd46f2aab', '802ad8e5-bb95-4798-9116-80f1ff495c36', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('fb2a7b03-8795-455c-80bd-2e57f174f36a', '34b1d027-0b50-46c5-bc06-f0c9289c1c95', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('f207f947-eb90-4784-ae8a-196aaf02b147', 'fad12229-f00f-4ac1-a3fe-c6d095ce7eae', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('eee1a001-0dc6-4004-916c-4c6ca3588c2c', '8a69eb71-5f9f-4408-915d-a8e093d28cc0', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('e9c581f4-468f-4844-8cb8-2119c6db40aa', '9c04bb8b-238f-432b-98f0-24fc51b35653', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('0274309c-f676-41a4-afa6-d8ab67303e0e', '6ed97510-45ae-4c96-bceb-debbc5976f77', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('21b5b660-62e7-4ce4-b28b-925c935c5da2', '340f0d04-35fe-43c5-8cdf-875b69890d05', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('148aac70-e04b-466a-881f-c4df7b410aca', '65de37fa-b446-47a5-80d1-d9de0f024edb', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('c24e5c92-288a-4dfd-b96e-8d22876cb91a', 'e4f96a46-e82b-45bd-bb30-71a75178c855', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('fa9183ef-09c6-428e-835c-2ed3d977aaf9', 'ecd793cc-3ae6-4ad8-8f9f-f2c5f6e82797', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('39ddf6fe-513e-4a1f-a6c5-fa0f70cd4489', 'a32ddd0f-5901-4b89-9ffc-5b71656a6ca6', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('a88a1b98-0552-496e-aaa3-ecdab0e96144', 'a9ffa2db-f060-4168-bfc0-d34dafdc7287', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('f2c75aa1-8cbd-4cc7-bae7-4f5ec334da4f', 'dd974eca-d72d-4485-b7c7-d39bb8ffdba9', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('43b2881f-9737-4bbf-893e-4b66eb586f65', 'd0070391-bae4-403b-ba35-9d122301fad6', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('b4af830b-6cfd-405c-b2c4-3a4185beae11', 'b8de63f8-69d3-40e7-9a83-05fea54bde69', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('d24570f5-0c81-4de5-a799-1eb684c110b8', '46739305-afbb-4b1f-9fba-61c32bcbdaa3', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('abb406c0-b880-4316-85a0-58d7de7cee10', '0440bf9d-fd90-450f-b8d1-a2578a075965', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('83f65d99-9fe1-4543-b58d-7f1768e33a17', 'cc6333ba-3088-464b-9213-8b0ac26a0b20', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('30ba9ab4-803e-4fa5-9db4-ae2d4acd629e', '5ae4c0c5-deb1-4e51-ad4b-40539ab7aa58', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('7c5ddd94-3558-4ab0-a344-a68574ffe52b', '6e35402f-6b4a-4685-9ddb-0e5b349ca708', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('df58fa16-2164-41ec-9ca3-922a93b1c45b', 'f35b4e35-52c5-4de9-a2db-bf64689407eb', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('372d158b-a539-41c1-be48-e7c982dfe21f', '572dad63-7243-40f4-893a-ccb0683d272b', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('6478ee67-16fc-4b86-a9ba-7ed6ef01e45d', '2c1f8a9f-5d11-4ca6-a5ba-d5e1fc47433e', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('2b945083-4b47-4eb6-b98d-1716d7eb2664', '274aaa89-9cb0-4d6d-82f3-01d00fb74ffa', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('ebf3e5d2-3bd2-43f6-b41b-7dbed5fa81fe', '1a5ff66b-220a-4995-9d3e-6b4c19720e8b', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('e23bf9a4-0fbf-4aa9-8303-25250373c62a', '28e5740a-b4d5-45dd-9a89-d7a3d46a84fe', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('d4d420cb-3b4d-4646-b4d8-b4b59e9a3ca6', '62d67d6e-a3f8-437e-aa91-a3e29cd04d88', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('77353386-65e1-4b26-b1a9-3655479621f7', '46dec4a1-093f-469a-80bd-355be720739f', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.enrollments VALUES ('ff9657a8-1e53-4140-ad1f-7c55069aec46', '582a43ce-3793-4147-8165-d7590d034c7c', '47af4486-d6e9-440f-ac6b-066a3dd4fffb', '00000000-0000-4000-8000-000000000001', NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);


--
-- Data for Name: exam_questions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: exam_sessions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: parent_students; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: question_banks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: question_keys; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: report_cards; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.schema_migrations VALUES ('schema.sql', '2026-10-05 08:10:52.080528+07');
INSERT INTO public.schema_migrations VALUES ('002_extras.sql', '2026-10-05 08:10:52.099747+07');
INSERT INTO public.schema_migrations VALUES ('003_features.sql', '2026-10-05 08:25:57.057307+07');
INSERT INTO public.schema_migrations VALUES ('004_features_phase2.sql', '2026-10-05 13:03:04.303953+07');
INSERT INTO public.schema_migrations VALUES ('005_multi_jenjang.sql', '2026-10-06 07:45:45.961585+07');
INSERT INTO public.schema_migrations VALUES ('006_targeted_announcements.sql', '2026-10-14 02:12:31.796929+07');
INSERT INTO public.schema_migrations VALUES ('007_flexible_teacher_nip.sql', '2026-10-14 02:12:31.798958+07');


--
-- Data for Name: school_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.school_settings VALUES (true, 'SMP Contoh Nusantara', 'Jl. Pendidikan No. 1, Batam', 'Dra. Kepala Sekolah, M.Pd', '19700101 199501 2 001', NULL, '2026-10-07 10:14:10.882+07', '{"drive": {"clientId": null, "folderName": "LMS", "appsScriptUrl": "https://script.google.com/macros/s/AKfycbxzuRD5u7x8ODtswd0a5oETy4VWhfO1Y4L1KfeZuk_S_jUyUNOG8WDeBYOtuZq1HE8e/exec"}}');


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.semesters VALUES ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'ganjil', '2026-07-01', '2026-12-31', 'active', NULL, NULL, '2026-10-05 11:34:24.538+07', '2026-10-05 11:34:24.538+07', NULL);
INSERT INTO public.semesters VALUES ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'genap', '2027-01-01', '2027-06-30', 'upcoming', NULL, NULL, '2026-10-05 11:34:24.538+07', '2026-10-05 11:34:24.538+07', NULL);


--
-- Data for Name: student_records; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.students VALUES ('cd211d72-cefb-4d86-93b8-3ae02a2c6f85', '14a9f845-4393-4852-b270-495910e3528d', '1A01', NULL, 'ACELLINE BELVANIA SILITONGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('2ed36834-900e-42e8-a941-cd8e634e1498', 'c6505dc2-6f86-49fb-b57c-656308f4e17f', '1A02', NULL, 'AMELIE GWYNETH BR SEBAYANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('c1d5a670-9957-453d-8101-c38f237ecacc', '6d6dc9d3-32cb-47dc-880e-69fe98cc880f', '1A03', NULL, 'ARTHUR LEENDEN BONATURE MANALU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('fb7dd65c-b0cf-4bc6-8f05-d2b1836dd2d5', 'a86c8e13-c56e-4539-836f-5eabb6028007', '1A04', NULL, 'ARUNA LETYCIA PASARIBU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('f21f01f5-68dc-46c4-a619-15322cfed0b0', '7f2eb13f-db88-488d-a360-4cdacd209b67', '1A05', NULL, 'BRIGHT ISAIAH AGAVE MARPAUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('576c1dfb-e763-4b27-9df7-55d2f0fd1c17', '2992baa6-f19b-4e40-94ff-1f43472f8a8a', '1A06', NULL, 'CHRISTA LADRESI PANE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('34910ee3-7577-48a5-b6b3-e801e711b8b4', '9a02fb78-8c30-4986-812c-d7aebaf327ea', '1A07', NULL, 'DEWA AYU KETUT ACHIERA ADARA PRAMESWARI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('c871aeb5-1799-493c-9015-1b58567d1ecf', '6c920e16-224f-4f84-8ec9-6be54be76ef2', '1A08', NULL, 'EDGARDO SETIA MANURUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('bc30c0a4-d480-4601-897e-5a09b6b253e9', '6f0255b2-3618-44fb-bd36-edd0670b9085', '1A09', NULL, 'ELVANO HEBER NAINGGOLAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('2c35e285-c9ca-4fc7-a110-045fa84b3b65', '60fd46bc-2363-4710-b619-0d6f6bafab6b', '1A10', NULL, 'GRACE KHAIROZ ABIGAEL SIBUEA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('5005fd3e-f5b8-42ab-912e-80deded8c632', 'd7739bba-b835-4803-b089-fe0ec0827886', '1A11', NULL, 'HANSEL WILLIAM SINAGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('34cc88ee-95e7-4f48-bd00-7bd9b412d5c3', '89a2cdab-44ee-4c5c-81b7-d88dc1c82860', '1A12', NULL, 'JHON FELIX SAMUELO PANJAITAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('a49df12e-e138-4b50-8f97-57042f21aa0d', '816e01e9-b49c-416b-9be6-992da5067f3a', '1A13', NULL, 'JOANA GIANIRA ELEANORE BUTAR BUTAR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('149d5d00-817c-4eae-b2a0-cf214e238e7a', '6efc52c1-6859-470c-b12a-91f4df87aacd', '1A14', NULL, 'KENWARD LEANDRA JULIUS MANGESA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('073fb1b6-a659-423c-8ac0-ef8acb9c0741', '058e014a-1495-4583-803a-f87dc3de4dc1', '1A15', NULL, 'KLARA DAME ALVENA HARIANJA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('5cbb3c3c-38e5-49a7-8ee8-8f36c52dee6c', '5c659a51-1160-4fc8-9757-e89fe1b5d1b4', '1A16', NULL, 'MORA LATISHA SHALOM MANALU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('d7223776-5b81-4b33-bc20-6793a59af894', '03fcc33a-8c32-4191-a85f-2d41fe4dae72', '1A17', NULL, 'MOSES DIMITRI SIPAHUTAR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('a605ba0b-3043-4045-8140-792a188bf929', '26da2bd1-72ec-4669-9ac2-b8981b38ec8e', '1A18', NULL, 'NATHANIA JOVANKA MARITO NAINGGOLAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('e5719813-eda6-47eb-a3a1-8922145abe6b', '8ffc6e08-f1e2-4f06-92c1-976a52cbcf75', '1A19', NULL, 'TRISTAN OTHNIEL SINAGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('1a56352d-be2e-47b9-aecc-e14f7c0181fd', 'a0ae1360-0647-45c5-985d-c2de9320feff', '1A20', NULL, 'VEBY YAP', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('623ae2c3-79f3-4bdd-b167-357091b30bca', 'feb7e59e-eba9-499b-b7cb-01def3ab107a', '1A21', NULL, 'YOBEL ELVANO SILALAHI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('2faf6a2d-4eb3-4306-bb34-1f90687e869b', 'd436f3dc-a410-4d4b-bff5-d548c8d10bb1', '1A22', NULL, 'ZEFANO AZURA SIRAIT', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('da185f50-76c3-4397-b307-43972537d2f6', '9efa3a45-4615-4b92-b940-3d334f6a6705', '1A23', NULL, 'ZERIKO CHRISTIAN SIMBOLON', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('d3ae8662-e773-4955-bfa7-bd4372048f3b', '1f7e72c0-1a38-4e57-9453-54a59e603dc0', '1B01', NULL, 'AGNES LYDIA ANGGRAENI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('1ecb87bd-1eeb-4c27-820f-2116d487c53c', '192be6dd-7fe5-42f2-a7cc-b7505b135c85', '1B02', NULL, 'ALEXANDRIA MANUELA SONDAKH', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('59e67841-080a-4bc9-a52e-dae7c8e180a6', '469739e2-aa53-4a1a-a778-c7e21773f052', '1B03', NULL, 'ALICIA ELISABETH METI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('69aee04d-59b4-4027-bcb7-005550ed7c0a', 'cc751d62-e6a1-4ccd-80b4-5727f62e8f60', '1B04', NULL, 'ARON RAFHAEL MANURUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('11e8bee6-0bb5-407e-81f6-466a2b722875', '7a65f7ae-e303-46e1-95f1-64673e770eb2', '1B05', NULL, 'DEAN MATTHEW SIMANUNGKALIT', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('d69be816-c8d8-44d8-9111-f0599c6b5567', '872e8a40-3784-4f72-87eb-a9052f87da16', '1B06', NULL, 'DEO SEAN VINSENTIUS SIMANJUNTAK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('0a649c87-8bc1-40df-9917-b99617471fc3', '80477645-f2dd-41e1-bde6-39556bc714e2', '1B07', NULL, 'ELRICH ROWAN SINTONG SITORUS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('ff3c93f4-d335-4f97-9bb2-3d408c8da83c', '7b04f003-41b5-488c-9211-47f1dd6bc7a7', '1B08', NULL, 'GILBERT NATHANAEL SINUHAJI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('c141bd3e-a99a-49b3-9e1e-ac64a0a96286', 'ccf3dd81-afd9-4915-81dd-a4c5504abdb4', '1B09', NULL, 'GRISELLA AULIA HUTAURUK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('d218ac31-7095-45f7-83d1-f88b60d6f64c', 'c6ec7e88-9b16-458f-820c-dee26b6b3ff4', '1B10', NULL, 'JEREMIA DEO SIANTURI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('5db98519-63d3-4948-8404-f64ccf2c68cf', '3782ebbd-6658-4b53-ab30-ab64cc15d40a', '1B11', NULL, 'JONATHAN ABIGAEL DOLOKSARIBU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('7a55d5e3-2072-4498-aebf-582c407887d7', 'a09eea33-810f-4fb5-b4fb-b3d4aeb2535a', '1B12', NULL, 'JOURELL NATHANAEL HARIANJA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('d18b5aab-4c8a-4cbc-af6e-1a32abf4ceb6', '6de93ef8-b216-47db-b68d-46239d14c489', '1B13', NULL, 'KAMAYA RATU PARUNTUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('350e1645-a0d5-426f-b224-290ff48cd6fa', '162bb99c-1b9c-4336-9898-7dc707817311', '1B14', NULL, 'LAVINA KAINOSSIE SINAGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('2b41642b-ca4e-4db3-af0f-fded3896b1b2', '2f1da6bb-6401-4890-aab4-6c4b6bf632c7', '1B15', NULL, 'LYODRA SIHOL MARITO SITORUS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('211bfa7b-c857-459f-a7f4-06f0052caa2a', '84badea7-3236-47bd-ab57-9b16b17c0387', '1B16', NULL, 'MAHABATARA GURU MANURUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('9c50e732-5380-41df-baae-43c5c38c54d2', 'ab577dc7-5991-4c01-be31-14d6724c1f83', '1B17', NULL, 'MUTIARA RAPMA ELDA PASARIBU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('3f666f09-76c1-4628-8415-e8faac0a8a18', 'cc537987-6403-43e1-a49f-6d2548f0aa94', '1B18', NULL, 'NATHANIA TRI RUMINTANG SITUMEANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('e3aaec36-8d66-4d40-94ad-76b902b1ec59', 'c8778efb-18d6-424b-9268-ccb1d993ad22', '1B19', NULL, 'NOAH GENJIRO RYANKA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('81da85b4-7434-4214-900b-6f082840cb7f', '18f09b07-d1c7-42dd-96fd-b44fe8dc989e', '1B20', NULL, 'PUTRI SARI TELAUMBANUA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('83fdef06-0885-4426-a231-87d5145623ef', '6389a7a1-9e36-4111-bf8d-74758dad7cac', '1B21', NULL, 'YAP WEL CHAI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('e014cb56-4532-476b-a996-df1a00019376', 'a86d2e77-da2d-4ec9-81d8-0ed670c1110d', '1B22', NULL, 'YOHANA ELISIANA MARBUN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('4f0aeb99-991b-468a-9be9-cfc478369955', '220bebf0-f5f7-40c1-b542-60e6d56a90e0', '1C01', NULL, 'ABSALOM VIANJU PANJAITAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('4b7d8bdd-c47c-486d-bc7e-35fd5aa02c1e', '859c9dac-3eab-42ff-b41c-59152478c63e', '1C02', NULL, 'ALBERT VIEZAR SIREGAR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('a1102278-8734-437b-95d8-7ee44aa1df7f', '65b8f71e-32d6-4e5e-ba85-d64a2a7d5d82', '1C03', NULL, 'AMORA VALENTYN HALAWA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('bcd81be6-0650-4be1-bdb1-41360763963a', 'ff8c5908-cd61-4805-9a6b-324e0cd94d76', '1C04', NULL, 'ARSEN ELEAZAR GEVARIEL DAMANIK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('21163dc0-561d-4a42-832c-7dbb8283c58d', '412ddbe1-7b30-424d-8455-c8100583444a', '1C05', NULL, 'AZRIEL GEVAREL SHILOH SIAGIAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL);
INSERT INTO public.students VALUES ('370b9d05-8380-4851-a1d1-40b36116df68', '756d5a34-c11c-4e91-ad68-b2bf7897ba4e', '1C06', NULL, 'CELLINE YOVELLA BR BUKIT', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('681e676c-83bf-413c-86c8-014d5704bfc4', '47e2fd30-5d4c-4935-853f-0d079a7b6d1b', '1C07', NULL, 'DELY MANUELA SIMANJUNTAK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('cda6b0b4-18e5-4b72-bc74-4a50aa485045', '44c514d5-8c8d-4105-a3ed-dffab864352d', '1C08', NULL, 'EDWARD OTHNIEL SITORUS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('3691a0cc-fa98-47e5-b8b9-2f0f91806523', '7d16b9f6-36df-427f-878b-eca69736ee08', '1C09', NULL, 'FEODORA EVELINA SUDARWANTO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('2c34c2e2-6b58-4958-89a7-0cb8dfb8df0d', '6c5832f0-96b2-42b5-943e-f152ca41518f', '1C10', NULL, 'FIDELIS CALVIN APRILIO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('6880fd02-ecae-42fc-a9b7-ee858bb2b272', '5c9989c8-a269-4abb-ad17-de2443584c4f', '1C11', NULL, 'HENG CASSANDRA LIORA POMALI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('b8ae5ba3-f850-4cfa-a898-3548f675524a', '318795f6-36ab-4041-8f52-b616453a96a6', '1C12', NULL, 'KAYLA YEHEZKIEL RITONGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('f44e3828-95eb-4c25-845c-fa73e213adad', '34830f4a-2373-4681-8e65-8a57c6de5ad4', '1C13', NULL, 'KENDRIK IGNASIUS ZEGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('7247033b-db3f-4c49-95b2-1befd44e8f11', '5f1066dd-7553-469b-81ff-ce27cffedc12', '1C14', NULL, 'KENNETH LEANDRO JULIUS MANGESA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('513d6236-6ed6-462d-99ff-369176f4f53d', '27f98ad9-46c1-4226-bc43-bfb17691ec9e', '1C15', NULL, 'KEYTRISAN SABOU SARAGIH', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('2c33c0a6-5eae-4139-b71b-f9d94dcddf66', '4ef6d3f8-2cd1-4b39-a85d-768df2f007b9', '1C16', NULL, 'KIREI FAYVEL GULTOM', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('218568c5-7f9b-47e3-aa00-ba90ff9d25ce', 'a916f050-0da9-436b-b333-72e9230d3273', '1C17', NULL, 'KYANDRA LOUISA HENGKENGBALA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('59fed2e5-9be6-438e-8316-e90083e1bd13', '907ed518-9f2b-4c8a-a01a-4f0e5805f5da', '1C18', NULL, 'NATHANIA OLIVIA SIREGAR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('8247671e-ac6c-49e7-b413-507a920a95ce', '187e052a-4098-4575-a194-09fe9d66938d', '1C19', NULL, 'RAFAEL ALIANDO LUBIS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('86ff7c0e-b1ca-4331-9d1a-b37428f952a6', 'c6ec443f-9fa5-4b00-a416-8ca9779074d1', '1C20', NULL, 'REREY THARA NAILAH', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('e0e064c7-ead0-407e-90a2-ef4c66618c91', 'f0b9b004-64fd-4169-a94f-a2be99940721', '1C21', NULL, 'SOPHIA SUN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('c0ebb79e-b1b8-4f8e-9644-9f08a837a29d', '8b5f5ff5-6183-41c4-8a7d-3b1ce5223969', '1C22', NULL, 'VALONIA GRIMONIA SANTOSO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('26515efe-89f6-4e75-8f5a-63b3ddcbed2c', '6b2181b6-e0d4-4ef4-9978-4373a1e51448', '2A01', NULL, 'ALFARO BINSAR DONGARI RAJAGUKGUK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('e5a2d45f-6e3e-442b-8021-bdda9dbeeb12', 'a13973ee-24b1-4917-926c-5c76c210cbfd', '2A02', NULL, 'ANNAMARIE HASIHOLAN NABABAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('494bf00b-d1fd-4cc4-8253-de8b49a1951b', '9f6e7226-cc70-4ad5-b055-9802f8abb5b5', '2A03', NULL, 'CHANIA SHWELIN CRISTABELL', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('f4cf58f0-0367-4f44-b3b9-f8a8209aea64', '5950cc68-873c-4a68-914d-ac83430db986', '2A04', NULL, 'CHARLES HOSEA SITORUS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('49421e60-4662-4deb-9949-78695f96c409', '457692de-42f8-41e6-ba25-253d314c491a', '2A05', NULL, 'DAVINE SHAAN RAFAEL PANJAITAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('34e44a37-388d-4cc5-a8df-28b76399e171', '41322bd1-d51f-4bc3-845a-cc9e112ddd3b', '2A06', NULL, 'DEBORA OKTA ULI HUTAGALUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('7765c400-7d1f-4fc6-989b-a74522a41812', 'ea377795-044c-4abe-b30d-6a34dff5aa4f', '2A07', NULL, 'ELISABETH LOVRIANI SINAGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('aceb5124-3b85-49cf-b290-5b2bed171be2', '321a9f30-9069-489c-b51c-ba9107828d82', '2A08', NULL, 'EZRA NATHANAEL L. TOBING', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('1a088461-09bd-4cf3-aebb-26a9ed8b4162', 'a004ba27-077e-48c2-98a8-5395336c1bc6', '2A09', NULL, 'GABRIEL ALMENDO MADUWU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('56eedf90-eaf5-4343-99ec-6252093bd00b', '98a2ab9e-d1a2-4b7a-b5f4-ef3eea4efade', '2A10', NULL, 'GABRIEL HEINZE BAKARA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('fd14dc60-35f8-49bd-aff2-c6dbbda04df3', '70e1c397-7d14-4e28-978c-1dbbc5c167a9', '2A11', NULL, 'GARRY ALVERDO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('f8abe522-73d2-4744-a335-45e363adcfd5', 'e1bc68fe-bb11-4aea-bd2f-09ede8837482', '2A12', NULL, 'GEVARIEL REZKY PURBA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('b5a8d6cc-1fa5-4f82-a73c-17e78a8e9834', '3fded03e-9c7f-498d-8c17-d55462c134cd', '2A13', NULL, 'IVANNA IDA PUTRI WIDIA SITORUS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('f034ef69-f41e-4cb8-b489-fdb55e9b9a28', 'ca7d03b8-53cf-4fd3-b3e3-e789051a13a7', '2A14', NULL, 'JORDAN MILJENKO SIMANJUNTAK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('83eb8254-61a0-446c-915c-bf55c6edf085', '7a629a02-9f10-4986-ad0e-feb2ea375b94', '2A15', NULL, 'KENZIE JOANTIN TELAUMBANUA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('2b0364ad-ddd5-4092-a556-d76bdf86c2e4', 'b3d919d7-e1a4-45a6-92e7-a70aab782c8d', '2A16', NULL, 'LIONEL ERZIDIN NABABAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('fc24a6ee-d5b7-4c46-8a94-faf0803a9d16', '52669d81-47fa-46b6-ad46-5f398e8bd65f', '2A17', NULL, 'MERCIA CLARA HUTAGAOL', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('da544ece-ac6d-4750-a1fe-1be2af44bf44', 'e9cf002a-959b-43bc-8648-660b640e2ae5', '2A18', NULL, 'NANDITO SIAHAAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('587ee5ad-2d6b-47f4-b4b3-89b1e5eaa6c3', '2e72219c-87ca-4078-b973-3364eb80a446', '2A19', NULL, 'PRINCES DAVINA BR GINTING', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('0682b526-5c2e-40fc-b9a9-e5945c08b68a', 'fbd427be-c96a-4301-af5b-d5d6ad3bb631', '2A20', NULL, 'RADOTH JEVANO LUBIS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('33f8775c-0f9a-4ffe-9094-8dd2ef8c825b', '35ffb5f5-fbb4-4107-a2f6-c9ffc95999c6', '2A21', NULL, 'REYVAND RAJA JOSIAH HUTAPEA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('3b380b44-521a-413a-b65c-5ffccc6232b6', '3cc74fcd-6878-4749-8eb1-9f7b9a4fc80a', '2A22', NULL, 'SELONA CIKITA FEMILA TARIGAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('ae1fa08f-3424-43af-a741-3c8dd04a022b', 'fc190077-bfed-4dcb-a520-e3c70182b643', '2A23', NULL, 'SONYA YOVELLA RIEL SILITONGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('19c0c97f-6f81-470b-8b85-9e5a567189f2', 'eadb9f52-b007-45fa-af7c-fc2d0939080f', '2A24', NULL, 'VICTORIA EFATA MARPAUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('dc34d299-fa83-4c26-99cc-2accd57b6a10', 'ab37c00c-a8da-4a5e-8120-cd6156adb32d', '2A25', NULL, 'WILLIAM JAMES HULU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('39fcbbd9-cb03-40f8-b1f9-15d7254bd10f', '5f7ede64-2e42-437d-8a19-a8cf5642ceee', '2A26', NULL, 'YABES HASIHOLAN TEULAMBANUA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('5ae8ec88-64e6-4efe-8790-9e0e472d939b', '04413920-0258-4cdc-a22d-02b6e58002ab', '2B01', NULL, 'AL KRISTA RISKY MARTUA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('40bb128d-3f13-4678-961a-c7a1d47a1ddc', 'b579114f-0c56-4da5-b77c-a26b1c6779b9', '2B02', NULL, 'ALDRICH BARRY BAGO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('508f0518-6994-4601-ad4c-0f92ad46ccd4', 'c661583d-9543-4d32-bcb0-e725c1581c2a', '2B03', NULL, 'ALEEZA MICHAELA SIAGIAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('183bd2c8-8e68-4435-b678-52a82d230208', '385d705c-c405-4831-bb07-104e2bc30687', '2B04', NULL, 'BAGAS RAJA MANALU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('da541a9e-cdc7-400d-bf0a-c17e1f9ddace', '5fb37f42-469a-430c-ba4b-b9fabc860e56', '2B05', NULL, 'CHYNTIA VIONA NAINGGOLAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('7829db25-bc85-40cc-8ae3-c55639654c7a', 'b4ef6236-f88c-4579-bd2c-f2ec266d9bda', '2B06', NULL, 'DYMPHNA CAHAYA NINGRUM WIBOWO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('157c7f75-82cf-4396-9cd8-4f34439f13f2', '58e2267a-9bde-4856-bf38-7a6a57393fd7', '2B07', NULL, 'EFREN YEREMIA NABABAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL);
INSERT INTO public.students VALUES ('c67cba66-291b-4a1b-8bdc-0cf7017a279b', '87850fa3-3782-4d5c-893b-3964b1eaaa5c', '2B08', NULL, 'ERLAND JOHANNES NATHANAEL NAPITUPULU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('ae7142fd-b8fe-4a35-a69d-d11dce834675', '3baba964-9b9a-4c1f-951a-d7da7093d274', '2B09', NULL, 'FAYOLA CICILIA NASUTION', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('92a60bc3-30e4-438e-a4c2-b61447b085fc', 'b6143a37-d737-44d5-87d4-aa2e934b0fdf', '2B10', NULL, 'GIDEON PEDOLI SINABANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('e5a5339b-cf22-4f30-824a-5fdc1b5f03bf', '8e49bf3e-5f8b-43f0-bdfc-e2da239d84c0', '2B11', NULL, 'GISEL GIVEN LANGI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('c6c8eae8-988a-4dc6-9f29-493d8b044011', '3dfd8255-1638-4910-a103-06a29d9f3253', '2B12', NULL, 'GITHA ALISYA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('c14d2359-75ce-4d81-a69c-1f4693105131', '45c1fa8a-fb04-4a82-b411-97d6430c8415', '2B13', NULL, 'GWEN FELICIA ANTICA SITUMORANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('056e8040-6d3f-45e5-9089-6251890b8268', '827e1964-20bf-4189-96c8-fe20576bc7bd', '2B14', NULL, 'HANNY ASHWINY PUTRI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('5dc30a1b-2a15-409d-86e5-1b3cb390d40e', 'cf6abea3-cc34-4299-b31c-1a471c00bac0', '2B15', NULL, 'HANSSEN DAWAI ANJU JAVERA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('0b6eda98-cce1-4cb2-9f86-7236c6e0748d', '0af7695f-59a0-415e-a528-949d6370ad7c', '2B16', NULL, 'HARUN MISAEL SIMANJUNTAK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('7fbeff46-d3ca-400b-863f-987f3875e387', '3c9cbdee-bfd0-4873-8019-a4d232505dfc', '2B17', NULL, 'IMANUEL FANDESTA SILALAHI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('f46308cc-e0b6-4d76-a938-1e54e1ae40d0', '945068aa-ec32-4aa4-a066-01c475251880', '2B18', NULL, 'KAIROS TIMOTHY SIMATUPANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('043d2dd2-9eea-4feb-8f73-8babdeebeddc', '1ff8abf9-c85d-48ae-bb45-daccca41c07e', '2B19', NULL, 'LEMUEL ELKANA CHARIS MANUHUTU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('18dca2a2-447f-440b-899a-36f0c3d31cc4', '627c6862-cb82-44c4-907c-b8a7d3a40a3f', '2B20', NULL, 'MANUEL HACYAN LUBIS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('f56399a1-0358-4115-be2d-8dc6a72ca647', '2ed54fe5-bf0e-4529-bd95-29e961101395', '2B21', NULL, 'MILKA SEPTIANA SIHALOHO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('6afdb9e6-be2e-44b2-9ee5-8348fbd72b94', 'dcddd7bc-44a7-40bd-8cdc-3610a3cf06d4', '2B22', NULL, 'MIRAI AKWILA SIDAURUK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('8e5fd565-a95c-4d78-83db-920b871a5cfe', 'f4a661fa-c3b4-483b-9a27-828ae462fd33', '2B23', NULL, 'PAULINA SHANEVITA PANGGABEAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('dc870580-f2b1-44d0-a63f-b9d18088f5b1', 'e3514acb-1ae1-4a3d-9a9d-c06a8a001649', '2B24', NULL, 'PRISCILLA CLARALY MIAN TAMPUBOLON', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('40a8851d-d67f-44f5-a2b0-440dd5cf740c', 'd99c6c07-05b8-4a2e-91bc-2928c5fa5027', '2B25', NULL, 'RAFAEL ALVARO SIREGAR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('3018f359-21d5-481c-ba9f-5a9ae04926ed', '4d68c6f3-d1cc-4d27-81d4-610283586a1c', '2B26', NULL, 'RICHARD GABRIEL HOTMAULI TAMBUNAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('3fd79085-27c6-44b5-a384-05d5c5d6e97a', '3050dcc9-9049-41cf-827c-62e387b73a1a', '2C01', NULL, 'AGUSTINUS HERI NAIBAHO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('1b8a03cb-5dc0-440d-830e-fc257cdc9f38', '317756fe-c6fe-44b5-a72b-1d48f40c8e0c', '2C02', NULL, 'ANETA CINTA MARITO LUMBANTORUAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('41fc89d6-8a2b-4004-8862-592a4b5a54d9', '186b5c57-d5c4-49b6-afc5-74baeee2255a', '2C03', NULL, 'ARBINA EAGINTA KARO KARO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('a88a4961-9986-43b7-8b91-cdbc57c738c7', 'e232695c-5e92-425d-b192-3a8633b6251d', '2C04', NULL, 'CLEONA PEPAYOSA TURNIP', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('d9788a32-0a1e-4c40-b1a6-54c9ef4da025', 'bbaaa6f7-3794-4d89-b71c-9cdee9939647', '2C05', NULL, 'DARREL DEAN SIMANJUNTAK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('2930373c-aa43-4075-bb37-e20528202d11', 'd957653f-c7c3-40f0-8619-6938e316954c', '2C06', NULL, 'GIDEON GIAN MARSHALL PARDEDE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('c776a02d-f960-44f5-9e6c-ca0604feef81', '687f958d-0b96-4db4-a8d8-931ceeea10a9', '2C07', NULL, 'GRACE OLIVIA PANGGABEAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('e093aaec-16d6-41e2-8b58-5dc590085325', '0e59e509-f409-4842-8c6b-ed22c6179371', '2C08', NULL, 'HOSEA GEVARIEL SIMBOLON', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('a4befd10-8dbf-4266-bb11-b5ea7e60142c', '2aa0450f-ad31-4859-8441-6ca3886a436f', '2C09', NULL, 'JEANETE ALONA BIU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('2df44fdf-1fd1-499a-bb2d-c3495f29327f', '9c09c2a2-fdf9-47ae-b015-60bfbe97678a', '2C10', NULL, 'JOHN ANTONY SIMATUPANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('48dc1b87-f3b3-4cd9-9465-4e623bc0a46c', '21e4ba55-451e-4cf0-8d60-7172fbff2e4f', '2C11', NULL, 'LUCIA AMEY JHONLY SAMOSIR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('8efcea56-0c29-40c2-aaed-c130e4afbfaf', '9a034845-5792-42d2-934a-1966faf26cdd', '2C12', NULL, 'MARVIN ALVIANO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('28d0ff4e-5504-4f65-a371-351ca5aec824', '515234b2-9eb9-4b3e-85c7-9f2f4fe0b702', '2C13', NULL, 'MATTHEW PURNAMA PRADIPTA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('62ea5b9a-ca06-496d-9345-8b4537918a77', 'd89a6aed-463c-4409-b859-dd9035f309a4', '2C14', NULL, 'MIKHAYLA ADELIA NAPITUPULU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('0ff345f8-e85e-416a-bf7d-c0c833484bef', '7954d5d8-9dda-4e2c-b1fc-823a60555059', '2C15', NULL, 'NANIA EKKLESIA TERESA SIPAYUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('99b47e7e-59c8-4e17-a220-2321a274bd0d', 'd54b1b1e-962b-4aa3-a6f0-90c56d4d10a8', '2C16', NULL, 'NATHAN ABIGAIL PASARIBU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('c57af4e5-a63d-4662-b3c0-26ec9319a5ef', '0c41fab4-a63d-4f41-946e-8837735b719d', '2C17', NULL, 'ODILIA ANINDY NATALI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('7aea0389-45dc-4caf-80a4-ce7b833e3b5b', 'e3f92076-c93d-450a-9756-386f05bc2dc4', '2C18', NULL, 'QIANNA ELDORA BR TARIGAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('280158a5-2c8f-4c9e-ab1b-d9bad90ee979', 'b26a71a3-b12d-402d-aebd-b1ae34fc16c4', '2C19', NULL, 'RAPPATAR JANSEN SIHOMBING', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('161848d9-fa20-43fb-ba34-0f94d45fdec1', '87b70440-100d-4819-a6b6-09f7460b91d9', '2C20', NULL, 'REFAN RICARDO TELAUMBANUA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('202dc0ea-02d3-4994-ad49-189a7ef19383', '6773d0bd-ddbe-487a-a6a8-896ff127b9c7', '2C21', NULL, 'REHUEL AGATHA SIBUEA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('4068a18d-6c04-459a-8ffd-a5c9ba844da0', '56cc6fe8-74fd-4905-ba35-2453f649c2ab', '2C22', NULL, 'RUBEN NOEL PINOT SIHOTANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('4969a6a1-08e1-43d5-b89d-665e49897bf4', '30f6eab9-4d4a-4337-b428-0a76fba93cff', '2C23', NULL, 'VALERIE MARION TELUSSA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('535f2cc1-03cf-44c7-89ac-53577892a27a', '73833801-3586-4bd5-b345-9cd263da4db5', '2C24', NULL, 'VANNESA HUTABARAT', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('661fcb6b-a7eb-4cc5-ada4-7d655d427e99', '7d0ba861-a2d0-4139-99cc-5bb7bc3a6da0', '2C25', NULL, 'VELLVINA FLORENSIA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('c5599258-dcfb-43a9-b954-6d38f9e7571b', 'e5079f0a-3de5-4d21-a85c-01b2df5897fb', '2C26', NULL, 'ZATRA ZEFANO GEVARIEL HUTAGALUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('b7e4e017-96a8-463c-8968-507cdb94b3ed', '33f29806-6ec4-48b8-b298-d92ddbce9383', '3A01', NULL, 'ADRIELLA SAPHIRA NASUTION', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('9ffd25e4-c4fd-456b-8dd6-5ac679aec4ae', '576cb26a-c8a4-4257-a500-667fc9c0fdb3', '3A02', NULL, 'AMOUREYZA SILAEN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('fb3eeb33-6955-440d-b090-9f13f208c9d1', '66805b69-d61e-49bc-a2b1-fbbf10555ab9', '3A03', NULL, 'ANITA PURBA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('7b8a627b-dd4a-4d99-a595-29ed770555ba', 'c979d2d0-2a8c-4c4d-9a6b-94e98ea019c9', '3A04', NULL, 'ATARIYEVI GRATIA NAPITUPULU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('873e000f-4467-4c37-90c3-4ddafc743d10', 'b163506c-5799-45e1-8c5d-b83462364d82', '3A05', NULL, 'DEVON FEBRIAN RENGKE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL);
INSERT INTO public.students VALUES ('a65703dc-d705-4811-af78-7923078aca5b', '035c3257-e528-44cb-aa02-fcb1b35e1b80', '3A06', NULL, 'EIRENE CHRISTIA HUTAGALUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('452efd6c-ccc0-465e-8f85-3d62878bd9cd', '58c9fe86-8510-461e-840d-0b2bcbcc6a87', '3A07', NULL, 'ELGRETTA GRACE THEOFANY MANURUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('66f1c2b0-b303-4285-b409-94ab6d0c1028', 'e9c533e5-b4ce-4b8e-ba63-82a30032c3f1', '3A08', NULL, 'ENZO DOMINIC SIHALOHO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('2c755ec4-7e8f-45d3-90a4-c6fd2bf3e1bc', 'ac26b553-eaa1-4ba3-b49e-5ca92f45fb2d', '3A09', NULL, 'EVAN ROGANS NG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('4a52d226-56fe-47a7-87ad-592ad4f0240b', '8a067f9e-476d-4675-947f-e5fc5ce29a27', '3A10', NULL, 'FENINA SELOMITHA PARDEDE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('e7a96317-26cf-4f32-a243-c7bf4f74fd7b', '4ea0de69-7424-44fc-9e59-d03d6f23e31c', '3A11', NULL, 'GAVRIELA CATALINA PANGKE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('938cebff-9f17-4249-a968-a68ed24152f6', 'b3c10347-c1a4-4de0-89b0-ef86bca23bd8', '3A12', NULL, 'GERALDO THIMOTHI SILALAHI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('eef0dbb4-b8ec-4eee-b391-8b87cd978f93', '24cb11c9-ff8f-46ad-a1c7-f7761bbed4b1', '3A13', NULL, 'GREGORIUS JECONIO ETHAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('d50f3b48-6cd7-49bc-aa15-928c7db67324', 'fd6451ad-9982-4e86-b84e-0549b0cf4855', '3A14', NULL, 'HANS CORLEONE SINAGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('2cde5d72-ea3e-4b75-9526-7d9d063f0af6', 'd421aff4-47da-4dc6-bd6b-51299392abf9', '3A15', NULL, 'JOANNA ILELA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('589bf067-2b85-4d54-b521-696aa8e45abd', '4f070309-9039-477f-903c-961a217dba15', '3A16', NULL, 'KENZIE LEONARD SINURAYA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('d7cd3e0a-0a5b-4d1c-9cc9-2641ffa31097', '70c8c804-17ab-49f6-80fd-2f5b1d7eb3ec', '3A17', NULL, 'KENZO VALEROS JUARA SIALLAGAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('c9dc32e5-b54b-47ad-ae4a-3d9019b6bfba', '85d046ea-a156-499f-b38b-3430efd6a7a2', '3A18', NULL, 'MARCELLO IZUAN BIN MAROP', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('2ad0ece8-ab70-4f2f-be1d-5cd83999c334', 'f1c9711d-16a1-4315-9e36-04ec832a8906', '3A19', NULL, 'MARTHA HELLEN DWI IVANA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('3b980178-7065-4c5e-9ea7-5d232560eed5', '6b8c6db0-f841-4f8f-a75a-926fb6d82d2a', '3A20', NULL, 'MATTHEW TIMOTY MALAU', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('241cb1fa-9e3e-4d91-94e4-3262faf46380', 'e113c9bf-f285-4388-97dd-4c8e1764543d', '3A21', NULL, 'MELKI PUTRA ZEGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('6c2513b3-be78-4de2-935c-c8e56968b8b1', '4ab8ebb4-0f72-4846-aba0-940a2ffdd145', '3A22', NULL, 'NESYA GRACIA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('917ac7bd-a22c-4640-b236-74be2e9675b8', 'e9f0980d-514a-4f6b-b41c-157020a6e9fb', '3A23', NULL, 'OYKU YESENIA SIMBOLON', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('e7cfef42-4d04-48b2-b484-f68b06581e17', 'c9b5e922-3e61-45f9-97c9-353925fdbabb', '3A24', NULL, 'RACHEL ZILEYNA SINURAYA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('993b1d4d-3082-4f47-b761-99be2594946b', '92e753ce-5e28-4c90-9316-025d9520b6aa', '3A25', NULL, 'REMITA LAMRIA MANULLANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('97c9bf5c-9f76-4949-8e9f-8efc0ee5f019', '4e16fff2-f9db-4c7e-ab2c-43b58a903427', '3A26', NULL, 'REY NANDO DIKA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('1c148d51-2691-4ee1-bf57-f38f2fe7bacc', '285e60a8-5d64-4359-a9a7-3ed54d7d0b74', '3A27', NULL, 'SEAN ZIONATHAN SIREGAR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('58debd64-bd65-4242-8c35-df4163e0c1d0', 'd35f703f-3b00-41ca-bcdc-a653d4fb06da', '3A28', NULL, 'SHALLVYN VALERIE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('a28cdfcb-7723-40be-a8e2-850fc49921eb', 'c90325f8-d73e-4e62-b60e-c089f54a5c25', '3A29', NULL, 'STEFEN SINAGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('80362aae-00bc-47ff-a504-dbe8cf53b404', '8deced1f-313e-4e02-a5dc-c5400ef37174', '3A30', NULL, 'STEVANY APRILYA TAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('7b455262-73a2-42f9-ac7f-377dce7f372f', '83e30fc0-0800-454a-8d8c-fc693ff1ae29', '3B01', NULL, 'ALDRICK TIMOTY', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('f3b6e698-e416-422e-a732-7681d2d2ce31', '3292bfe6-bcc5-44f7-a27c-ea913058ddd9', '3B02', NULL, 'AMOREIZA MELINDA MANURUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('63938a80-6528-45bf-8837-3cd605688ca6', 'c1f0c764-7413-4ac0-917c-af3f286c44f3', '3B03', NULL, 'ANDREAS CHRISTOPHER SIBUEA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('cbb43922-93c6-4fba-b89f-88e9e4993841', 'a1b7fdb8-f61a-4df9-8790-fe20cdc7b2ac', '3B04', NULL, 'ANDRIEL SEAN IHOT MAJU SIAGIAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('62e19b59-f95b-46c5-92f5-b6b94c1fcdf3', '4b086d72-254d-42c5-8681-a0ca45eb8448', '3B05', NULL, 'ANGEL REBEKA ENG MARTIN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('9c977b54-cd64-4381-a7a0-fcf77299cb3d', '1325f445-a9c9-49b0-88cf-63cd14e4fe8f', '3B06', NULL, 'ATIRA FELICIA SILABAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('1f5a5b14-5615-42cb-8226-5df7211162e7', '25fd920c-fe91-449e-acb2-0563fdac77ee', '3B07', NULL, 'BINTANG ANGKASA SEMBIRING', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('198880cf-6baf-4a81-9ac1-d39379a0dc40', '6c1e9fef-bf77-4197-8f33-f5378daea4e6', '3B08', NULL, 'BOY BATARA SITORUS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('09874e5b-68ab-488e-a7ce-0dc230721f6f', '4b7a9cfd-bcc4-4220-b031-bb55d8e081b1', '3B09', NULL, 'DANNY EFRAN SIAHAAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('1783e2e4-7bcf-4981-9e17-c3ff225dcbbd', '43b7d544-5acc-429f-b7b8-fbd586b770bc', '3B10', NULL, 'ETHAN ABSALOM SILITONGA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('af191215-db33-4aa6-9251-b083626f6fdc', 'fe00e9e3-dce8-4fe9-ad4a-41104bd0a18d', '3B11', NULL, 'FERONICA AGUSTINA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('0b07a1dc-ca1d-48e1-80e0-6709fbcd9208', '3a336c9a-e7f0-4e1c-8d44-e55575294ead', '3B12', NULL, 'FREDERICA QUINN SIMANGUNSONG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('8e756993-57e4-46ce-9279-1b9d05fd551a', '4b416ef1-2f76-4853-8c62-95eed3a7ce1c', '3B13', NULL, 'GYTA AMELIYA HUTAURUK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('f91f108d-4606-422f-9ca8-54482f9f234c', '7204562f-45a6-4481-a503-e029b230ecc0', '3B14', NULL, 'HARVEY JOACHIM PANGALILA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('e3e88afc-c985-445d-aaf3-555dcba131d9', '3bb91fdf-d215-461a-9796-651a35f3b0da', '3B15', NULL, 'INGGRID REBECCA WIZZYLIONA. S', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('e2c0bb70-80df-471a-aa7c-8ffea1fdd0e3', '5e95cc5f-f66b-43c4-990e-9407899adee4', '3B16', NULL, 'JOAN SAPUTRA WILLIAM WIDI SITORUS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('b62bd388-4957-4987-b261-fbe7914d9d2c', 'a5e3a3f9-f960-48c8-97df-010266a9ab43', '3B17', NULL, 'JUAN TARA MANURUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('5eaebc62-1f9c-4eea-93f6-bc589b2832df', '82a62afe-038b-4937-a3b6-cbf9922a45d9', '3B18', NULL, 'KEYTHIRD RAJA SARAGIH', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('5141c8b4-e5fa-499b-baa2-a98e515fec64', '3d8eb397-6204-405a-a550-cf923d990683', '3B19', NULL, 'LOVIAN FANECIA PANJAITAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('7491714a-fb1c-47ab-a20e-2e1a98ac4e29', 'dda1a20d-a90a-48e4-9ce2-fa4599ff2ebe', '3B20', NULL, 'MIKKO BENJAMIN NADAPDAP', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('7176720a-eeca-40fb-a69c-5149ebf5b63f', '76ed4319-c2ce-40d7-a2c0-519482789726', '3B21', NULL, 'NOVIA HENNELA HASIBUAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('cdc66cb9-45fa-48c9-a40a-f46002806049', 'f3c50200-b799-42d3-856a-44ed4c943e9a', '3B22', NULL, 'PANDU TIMOTI TUA NAINGGOLAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('51b236a7-f781-4a50-9bb2-1ffa5f9dbbdb', '0e563c4c-c109-4e55-8a57-c8ae8535021e', '3B23', NULL, 'QUEENIRA VIONETA BR SEBAYANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('52a85bd2-270e-4f89-b0f3-6e734f07824a', 'af1c321c-8d60-4912-8d17-deb2cbd7d142', '3B24', NULL, 'QUEENZY ANGELIKA LIM', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('37f94055-a3c6-4c8c-845b-d509e666c0c3', 'ad73c085-4418-4748-b6ff-39f3785b93d2', '3B25', NULL, 'RACHEL KRISTEN PRAHASTRA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL);
INSERT INTO public.students VALUES ('d74bbca2-b375-4184-9c72-ec7a1491a386', '9d659ae2-a378-438c-9160-fd040fe3fabf', '3B26', NULL, 'RAMOSTA ANABEL SITORUS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('4138efad-cafa-4218-8ed2-c6e65bf449c3', 'bf2560eb-fa88-4cff-b250-60bb43e06540', '3B27', NULL, 'SARA SELOMITHA ULI SIMANJUNTAK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('559d3a00-71a4-4865-84e5-94e2a7eb1546', '0592025f-e447-4532-9d03-08e22efbb52f', '3B28', NULL, 'YERIKHO TANDIONO', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('9931289e-23a9-4f25-aed0-b4ed046e92f1', '4a3b13ab-5458-4ba0-a8e7-fd5f962cd9ad', '3B29', NULL, 'YOCELIN KASSIA BEATA LASE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('0ea0095e-30e4-45ba-878a-b58567c48de1', '1d8c743c-0b99-44cb-a7c7-2798d9911e43', '3B30', NULL, 'YOHANNA FELICIA SEMBIRING', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('802ad8e5-bb95-4798-9116-80f1ff495c36', 'a076e0b2-630e-4764-977e-5e9837f871be', '3C01', NULL, 'ADELINA HUTAGALUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('34b1d027-0b50-46c5-bc06-f0c9289c1c95', 'f8100f80-4664-4644-bc27-4e96f4477f50', '3C02', NULL, 'ADRIELL TUA TAMBA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('fad12229-f00f-4ac1-a3fe-c6d095ce7eae', '78e6190b-02fe-476a-908e-c7c38274f181', '3C03', NULL, 'AUDY RENATA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('8a69eb71-5f9f-4408-915d-a8e093d28cc0', '7c95f7cc-b00d-42d3-98e4-d57680d46d3f', '3C04', NULL, 'BAGAS MARASI LUBIS', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('9c04bb8b-238f-432b-98f0-24fc51b35653', '70eab42a-874d-470b-bbdc-ecad86974881', '3C05', NULL, 'CARISSA CAROLINE SIAHAAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('6ed97510-45ae-4c96-bceb-debbc5976f77', '6954a363-9720-4284-b8d1-9b98786bd970', '3C06', NULL, 'CLEON CRISTIANO BANJARNAHOR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('340f0d04-35fe-43c5-8cdf-875b69890d05', 'eb97afe9-aa63-4aac-8948-9d72037208fa', '3C07', NULL, 'FELICIA BRIELLE KIRANA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('65de37fa-b446-47a5-80d1-d9de0f024edb', '5660b830-0704-4370-b1e5-daf100ac2615', '3C08', NULL, 'FIDELIS GRACIO PARULIAN KALANGIE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('e4f96a46-e82b-45bd-bb30-71a75178c855', '27cb04cc-a3fb-4bd0-aab8-ac05653b657d', '3C09', NULL, 'GITA OLIVIA SAMOSIR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('ecd793cc-3ae6-4ad8-8f9f-f2c5f6e82797', '01e6bc0d-0bb1-4ce8-b0fd-0dc0e1c4a977', '3C10', NULL, 'GRACE CELLY  MANURUNG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('a32ddd0f-5901-4b89-9ffc-5b71656a6ca6', '3ba4903f-9234-4f5d-9f68-bc46f15525fe', '3C11', NULL, 'HELDA RIA HUTAPEA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('a9ffa2db-f060-4168-bfc0-d34dafdc7287', '3230e5b2-6da6-4643-8201-3b6b97680893', '3C12', NULL, 'IGNASIUS OKA SIGALINGGING', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('dd974eca-d72d-4485-b7c7-d39bb8ffdba9', '7c1c19be-c996-4e28-b321-475ec8fd19e1', '3C13', NULL, 'JEVIER IFANDER PURBA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('d0070391-bae4-403b-ba35-9d122301fad6', '3bc71459-d44b-48a3-908e-f20367ace311', '3C14', NULL, 'JOSHUA GRACIO HAMONANGAN BUTAR BUTAR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('b8de63f8-69d3-40e7-9a83-05fea54bde69', '261a5de7-5373-4225-9ac1-2e2ebed38c95', '3C15', NULL, 'JUANOBED HAGA HERMAWAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('46739305-afbb-4b1f-9fba-61c32bcbdaa3', '8f5bd87b-11cd-4a47-a9b6-71f3650e2ae3', '3C16', NULL, 'MIKAEL LUCIO SIREGAR', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('0440bf9d-fd90-450f-b8d1-a2578a075965', '1a7dc510-69c9-449e-bae0-58cd0b4ed3be', '3C17', NULL, 'NATASHA KIMBERLY GUNAWAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('cc6333ba-3088-464b-9213-8b0ac26a0b20', '3eae82d3-83ba-4907-a61a-e821d9a69626', '3C18', NULL, 'NATHALY MARIBEL TAMBUNAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('5ae4c0c5-deb1-4e51-ad4b-40539ab7aa58', 'a0a06297-1601-412c-80fb-c383ed7fb40b', '3C19', NULL, 'PETRA TIMOTHY SARAGIH', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('6e35402f-6b4a-4685-9ddb-0e5b349ca708', '84562088-9218-4a2c-b35c-e7eda63ac79d', '3C20', NULL, 'RACHEL KEDZRA NAMORAI TAMPUBOLON', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('f35b4e35-52c5-4de9-a2db-bf64689407eb', '9c496bb8-aa87-4098-ba48-b05fd11d631a', '3C21', NULL, 'RAINA APRILICIA PURBA', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('572dad63-7243-40f4-893a-ccb0683d272b', '47f234c6-c5b9-4de0-88fc-e4e3ae199e1a', '3C22', NULL, 'REHAND LUTTER TAMPUBOLON', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('2c1f8a9f-5d11-4ca6-a5ba-d5e1fc47433e', '508dabcc-0ec6-476d-93c1-74b38162e0b7', '3C23', NULL, 'ROULINA MANULLANG', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('274aaa89-9cb0-4d6d-82f3-01d00fb74ffa', '8eac8e3c-d5bb-4edf-bd64-9450b6c8e4fe', '3C24', NULL, 'SANTA DAVINA SIHOMBING', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('1a5ff66b-220a-4995-9d3e-6b4c19720e8b', '017906f9-d70f-477b-a767-8e766e34cf7d', '3C25', NULL, 'SILVYA ELISABET SIDAURUK', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('28e5740a-b4d5-45dd-9a89-d7a3d46a84fe', '45584083-2540-4943-a42f-4850f4c116e7', '3C26', NULL, 'STEFANUS ERLAND SIMANUNGKALIT', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('62d67d6e-a3f8-437e-aa91-a3e29cd04d88', 'd59e7df6-f06d-4478-b15f-9f03ce20839f', '3C27', NULL, 'SYALOM BRYAN HASIHOLAN NAINGGOLAN', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('46dec4a1-093f-469a-80bd-355be720739f', '8ffab813-964e-44b4-bc4e-93d1087d55b3', '3C28', NULL, 'VANNESA CAROLINE SIBARANI', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);
INSERT INTO public.students VALUES ('582a43ce-3793-4147-8165-d7590d034c7c', '08e0ccad-944b-4dd6-8ef1-d9783ce06400', '3C29', NULL, 'ZADKIEL CONSTANTINE', 'L', NULL, 'SD', 'aktif', '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL);


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.teachers VALUES ('d954d9ee-b2d3-441f-a961-fb0134bc0231', 'c0e83b15-13d5-462b-b2fa-cc0a9d4bccb7', '14072015', 'Maruba Parningotan Habeahan, S.Th', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('250e7ab0-3839-497d-abbf-2529880f4886', 'caabcb97-914d-4066-b089-bb29749b550e', '13112017', 'Jon Sader Saragih, S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('0b0bb4ca-fcc5-4a56-b577-c557c8648816', '7c463431-6a12-489e-8dce-1e453791cba2', '14072015', 'Kefmi D. Sinaga, S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('9030bde2-4537-4fd4-89f2-be7eab29ec2c', 'a0f8b4b9-82ef-4c81-a6e6-e811be439ce4', '16072018', 'Mega Sarianti Pandiangan, S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('42ef80ad-c720-45a0-92aa-1280b876a589', '0f4cc807-86f2-4426-be30-25cb14bb090b', '25082016', 'Hendrik P. Simangunsong, S.Tr M.M', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('55b7caff-44c0-4f4c-9ce5-944c46fc2b8b', 'c46911b9-ae9b-4c7f-8dbf-622f62e8c07b', '17072017', 'Reski Cetrin Pertiwi Turnip S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('f2a18fe8-8102-4573-b3dc-325654f42285', '8d817585-0409-4133-9c70-4b8b93ed488a', '27092018', 'Agustian Bandaso S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('7513a6b8-f20b-42b6-b2ad-9da85e72c668', 'b630661e-995e-425d-a2ca-6f868b3edb01', '19072019', 'Marista Silitonga S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('0b493549-0ec3-4ead-93c8-5e7c716a75cd', '397b8f09-2a29-47e3-8941-4d4b328e995d', '19072019', 'Marista Silitonga S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('5bae0fcc-c9a6-4c7e-a834-034cebcd4b19', '8e33bff3-e38c-42dc-9d73-f482c271ea19', '06012020', 'Yenni Sitorus, S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('818cb4ec-9133-4023-8716-2e8ed7c2898b', '94f7c3ac-12f7-4bf3-8c30-695cfaa32406', '2052023', 'Evan Sandiman Butar-Butar, S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('b67a7678-f431-4b19-85fe-4854f2ae5292', '6f87b2cd-e46d-4790-b006-250fc3dbefc6', '25072024', 'Ita Lamtiur Manurung, S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('df040ad6-84ce-4004-b341-3d04edcd1b74', '78710273-e7cb-4b4f-9bf1-ed68dd98beba', '01072025', 'Tri Doni Arsiwendo Purba, S.Mat', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('8b32c731-c5c2-4fb6-9419-229ccbf2fe25', 'e95d74d1-ae47-4b45-b5f7-1e7dc61f7d44', '01072026', 'Doni G Tampubolon, S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('1776cab0-51ef-4828-a5bd-17f49120f660', 'a43c0ada-a666-4f95-8635-28703cf3c6f4', '01072026', 'Indah Ramayanti Berutu, S.Pd', NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL);
INSERT INTO public.teachers VALUES ('70e5fb2e-f729-4964-8f08-f67195c29640', 'a7c663df-a081-4311-a197-c60e058cbc42', '06012020', 'Yenni Sitorus, S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('a20c60c9-02d1-4a30-af64-0a921dcad917', 'e589c48e-87be-4a1c-9e75-8141be96c56f', '2052023', 'Evan Sandiman Butar-Butar, S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('097313a7-cbec-4950-bbea-f4a1db882133', '10a84c04-0bbd-4d4b-b945-cf0224e7fc34', '14072015', 'Maruba Parningotan Habeahan, S.Th', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('29441b52-9943-4189-ae19-8dd35efa8439', 'fa78e53a-ff3d-450e-a493-3d163ad92cb5', '13112017', 'Jon Sader Saragih, S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('6d93c7b4-1c3c-487b-87e5-94dfeee0d675', '7de00245-6bc5-4a29-88a6-2edf1d65a9ff', '14072015', 'Kefmi D. Sinaga, S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('550e51d3-b5ef-4e91-8458-96835ad4ef11', '0caa2ae3-6a62-4bd3-8db0-21eea07c624e', '16072018', 'Mega Sarianti Pandiangan, S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('16fd9a45-1b27-48c2-8fb7-b8260edec485', 'c6a8fc9b-fdb2-43bc-aeb4-25d087334beb', '25082016', 'Hendrik P. Simangunsong, S.Tr M.M', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('517b9baf-ced4-4e33-b94f-65bbadbb3eaa', '3cc7479f-0338-482c-b606-6c0892c8a650', '17072017', 'Reski Cetrin Pertiwi Turnip S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('52b8a51a-6de4-4959-aa6b-fd1348f5067e', '1a3385c7-32fb-4063-b4ba-350e5282a04a', '27092018', 'Agustian Bandaso S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('3404e79b-9891-4e59-8f7e-6915be1e25bb', 'ca841845-c6ee-46f6-a1c8-5fcfbae188a9', '01072026', 'Doni G Tampubolon, S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('788e0221-ae57-42e7-83e3-177e408a09c1', 'e1522dc9-6bb6-487a-bfc1-e98a584d63af', '25072024', 'Ita Lamtiur Manurung, S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('768de53a-8553-4e03-aeb7-6174984e49f3', '40d6dc96-b8ab-42a3-9e3c-0f422b2db3a2', '01072025', 'Tri Doni Arsiwendo Purba, S.Mat', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('d7633e51-e4cc-4a33-b92b-096f85279fd3', '8872b4e7-0fca-4608-8348-7f6e502ee218', '01072026', 'Indah Ramayanti Berutu, S.Pd', NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('eda24295-c074-433a-9fff-5b8703477f6f', 'd70d7dc5-321a-4eec-add2-95e23a77fd19', '14072015', 'Maruba Parningotan Habeahan, S.Th', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('132b2647-becb-481b-b03e-85c971c38073', '678d5acf-38fd-470e-8e36-c36ea579e97f', '13112017', 'Jon Sader Saragih, S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('10a1841f-a9a4-4634-9039-3d792006ab41', '00018a4f-7520-4c3d-b6aa-606be8c82dee', '14072015', 'Kefmi D. Sinaga, S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('1f478413-00d9-48e9-bcfc-19be9f50cd12', '9f1eaee8-29bb-4376-b90b-5c85a14f0a87', '16072018', 'Mega Sarianti Pandiangan, S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('3c128eb9-aa41-4294-ac76-efcdb08736d2', '73528d4a-67f7-4edf-b132-fec62d1a315c', '25082016', 'Hendrik P. Simangunsong, S.Tr M.M', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('48a99e14-f9d4-4c66-838f-b812af81cd45', 'f39faca4-cba3-48ce-8ea2-6200a506507d', '27092018', 'Agustian Bandaso S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('0990aa6c-4fbb-43dc-8e25-e657062bd0c8', 'fd3be31a-b6e5-4c8f-bc0f-d885947b7759', '17072017', 'Reski Cetrin Pertiwi Turnip S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('72d529bb-232f-471c-aa22-084dbf046274', '038690ce-b248-45e0-a99c-ac5b59bda1b4', '19072019', 'Marista Silitonga S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('5002ccac-c19d-42dd-9dfb-ffea6ac01d2d', '841206ff-9da3-4a2f-b90d-1e14b326383a', '06012020', 'Yenni Sitorus, S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('5e2267ab-4183-42f0-bb14-9ff971c75944', '733c5104-5d5c-4c99-9942-51800734d66c', '2052023', 'Evan Sandiman Butar-Butar, S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('4e31727a-94a0-4f61-913e-f49f96938d69', '328f21dd-6cab-4049-8308-65dd1c305c61', '25072024', 'Ita Lamtiur Manurung, S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('af58098c-8cd3-45b9-bea7-6c872c95106c', 'd926a3a6-3f71-4a71-8bcc-f11454a5c8c0', '01072025', 'Tri Doni Arsiwendo Purba, S.Mat', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('a2907df0-01a9-4e57-9821-8cae9251ad3e', 'eaf6bc70-a647-461b-a561-1506aff0aae2', '01072026', 'Doni G Tampubolon, S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('6db91046-09c8-48cc-802d-fdc061564402', 'e90d26c9-9957-41a5-9233-a362bfc966a6', '01072026', 'Indah Ramayanti Berutu, S.Pd', NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('982a0a02-4f70-417b-9597-3c72792b609b', '9a749f7a-5799-4e67-9748-e7f2f21492e9', '14072015', 'Maruba Parningotan Habeahan, S.Th', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('9f18ba37-8030-44e7-9118-0c85cde12261', '53fb0b2f-6b68-45bc-a608-588cb0650400', '13112017', 'Jon Sader Saragih, S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('4282d290-0428-4b47-877a-473bd8f23208', '48a08319-9851-46d3-a662-af79e8860250', '14072015', 'Kefmi D. Sinaga, S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('1aa2a842-8dbd-4f1c-a623-e3960fec64ce', 'c8371f58-e5c5-4f2d-a610-2feb4dc9a72e', '16072018', 'Mega Sarianti Pandiangan, S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('d432fa87-9c07-4e93-a64a-1b9a14585c81', 'e3349684-96e9-41df-9914-280339456472', '25082016', 'Hendrik P. Simangunsong, S.Tr M.M', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('8551d6d1-4668-4e83-9b41-70d12a520141', '30328e4a-676a-4828-b5b7-606467970a18', '17072017', 'Reski Cetrin Pertiwi Turnip S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('f9a7d90c-1f39-4a05-937a-0565fa7f7591', 'c8522f36-ca2f-428b-8bb3-392267b42d62', '27092018', 'Agustian Bandaso S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('70ec5b3d-a1b8-4933-adfd-685489be6736', '7da4c9ba-23cc-4ce5-b310-75b2090a1e5a', '19072019', 'Marista Silitonga S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('89292515-018e-4704-b408-897a646a2ead', '490d3c2c-b774-462d-bedc-17fc6bce02b9', '06012020', 'Yenni Sitorus, S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('2ef61d99-c47f-415d-822d-650cf861a2a2', '91598b43-2d45-49de-b704-43a3a25ecc06', '2052023', 'Evan Sandiman Butar-Butar, S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('bbf230de-7e1d-4a62-8797-a6651852774f', 'c134e145-7ce6-4e30-bf54-ad2e97e0292a', '25072024', 'Ita Lamtiur Manurung, S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('930b855b-aec5-4ed4-b77d-0f44ca531434', 'ded02ce8-30cb-4403-9532-ed3cc1bc4872', '01072025', 'Tri Doni Arsiwendo Purba, S.Mat', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('78ec4b8e-2f33-44a1-b608-0fc45d5c03cc', '71c1fee7-c47a-4f4b-888c-87d5dc9c8e2c', '01072026', 'Doni G Tampubolon, S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('c90afc48-7389-40eb-ad5a-9b83c3ca19aa', '8765f0ac-85a4-49f7-880e-fe29fb1f8091', '01072026', 'Indah Ramayanti Berutu, S.Pd', NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('9129460a-9798-4687-986e-7f61818d727f', '17302c9a-5e14-438c-8262-1e14a78ba83f', '14072015', 'Maruba Parningotan Habeahan, S.Th', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('79c23d00-1d06-409f-a8cb-dce56cf28267', 'cb23bfc5-3e92-4352-8dcc-59e213ea0cd6', '13112017', 'Jon Sader Saragih, S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('fb03eec7-4ab7-4d90-8549-ff8015fc8b32', '5ab0dbc4-b654-46da-bba3-1689161b6789', '14072015', 'Kefmi D. Sinaga, S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('62dcc186-ccd2-4da6-89f1-aa82d84d56c8', '665a7a2c-a997-41d6-a53f-3c214ff83139', '16072018', 'Mega Sarianti Pandiangan, S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('c9130cab-5278-4636-9c4e-593da306a73e', '96138508-4293-4d75-a8ab-5a962599cfa5', '25082016', 'Hendrik P. Simangunsong, S.Tr M.M', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('07440fd4-a834-4d13-955b-63ccc8f70801', 'ad5bc4df-bd66-432f-a3a7-a13a5b25796f', '17072017', 'Reski Cetrin Pertiwi Turnip S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('c5434ba0-be65-46ba-9d7d-6056c6da874f', 'f401c15e-113b-490d-91e1-0abcb561236e', '27092018', 'Agustian Bandaso S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('801815de-d477-40d8-be66-e75f14ba6903', '54ee5d90-69a6-4718-b838-fea6071f6872', '19072019', 'Marista Silitonga S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('7d318ee4-bf2a-4685-9c65-dcbfa9c91c7b', 'f8272bf9-be5e-4653-9c6d-7a981f71b4b5', '06012020', 'Yenni Sitorus, S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('27386db0-1eea-416e-8941-0b6748424280', 'c4606402-1796-4daf-829d-c35e5d8282fa', '2052023', 'Evan Sandiman Butar-Butar, S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('09dcdaf9-c4ef-4621-9cbd-4eee0feba892', '67131652-7a51-45ca-ba54-bf5025d80400', '25072024', 'Ita Lamtiur Manurung, S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('781bc3e1-1116-4abf-81be-df42093e3de8', 'b302ac9e-0c77-4197-802c-df7e72201081', '01072025', 'Tri Doni Arsiwendo Purba, S.Mat', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('3387294d-e2f7-47a3-8eb8-a32e98312efe', 'cc567ad0-8bd9-4be9-83c8-24d46bd66933', '01072026', 'Doni G Tampubolon, S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');
INSERT INTO public.teachers VALUES ('ac695316-817f-43ee-97fb-a66b93293695', 'f0e64658-479d-4aff-8acd-2a4e96e64c6c', '01072026', 'Indah Ramayanti Berutu, S.Pd', NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.916617+07', '2026-10-14 02:13:00.916617+07');


--
-- Data for Name: teaching_assignments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: teaching_journals; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('c0e83b15-13d5-462b-b2fa-cc0a9d4bccb7', 'maruba.parningotan', NULL, 's1$ckFunwQUPDQtg1/LBlZjaw==$PcT/55Z7ZLO/zMlgLDesMxDH6NLCH7IJv7975cjQ7Ug=', 'guru', 'Maruba Parningotan Habeahan, S.Th', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('caabcb97-914d-4066-b089-bb29749b550e', 'jon.sader', NULL, 's1$qSLl0o8oMDaSQi0oXKwylQ==$ArBjScLPrc3frTTAhJdh6Qy6bvUy8oP/3M7LvSKLKyg=', 'guru', 'Jon Sader Saragih, S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('7c463431-6a12-489e-8dce-1e453791cba2', 'kefmi.d', NULL, 's1$vTVAr/A4Iz8hILGyO/Xjhg==$/R2+qapIPMeobqpVU4Ya5VhjT+7avo5iZbAH9byZD+U=', 'guru', 'Kefmi D. Sinaga, S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('a0f8b4b9-82ef-4c81-a6e6-e811be439ce4', 'mega.sarianti', NULL, 's1$OTjswxnajH4bBkof//01hQ==$uhq2SeJF866yUxIPEscqHNziPfpwnvDs1YkR/5UKMnM=', 'guru', 'Mega Sarianti Pandiangan, S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('0f4cc807-86f2-4426-be30-25cb14bb090b', 'hendrik.p', NULL, 's1$IsnePNh10Ad7fcYEtGdHxg==$KoxhXZEJ7bGBvULMex4rKTtRsjb07wR4lLIMnBH5fVI=', 'guru', 'Hendrik P. Simangunsong, S.Tr M.M', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('c46911b9-ae9b-4c7f-8dbf-622f62e8c07b', 'reski.cetrin', NULL, 's1$3rW8pEQ+HfDsOMywpYv0TA==$7BjD4De4PIkV2u3uD4+GiZjhj6UxPqyI+dISLNRCZdg=', 'guru', 'Reski Cetrin Pertiwi Turnip S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('8d817585-0409-4133-9c70-4b8b93ed488a', 'agustian.bandaso', NULL, 's1$ihrUrM9Ueh9HmsGrNTtuEA==$akWz6bA05f11kP+aGOrAtwxptl2TgCaj0i5JBg8Jzlo=', 'guru', 'Agustian Bandaso S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('00000000-0000-4000-8000-00000000000a', 'admin', NULL, 's1$CFw5YuVZraDZs7+YzFo1AA==$sGDDVFiTzQNxOR1wCLtlPyeKUs6udDwcB+aZ9aPJynI=', 'admin', 'Admin Sekolah', true, '2026-10-14 01:26:22.047871+07', '2026-10-05 11:34:24.541+07', '2026-10-14 01:26:22.047871+07', NULL, false);
INSERT INTO public.users VALUES ('b630661e-995e-425d-a2ca-6f868b3edb01', 'marista.silitonga', NULL, 's1$QoANBdMEhl0ahC9xeX2czA==$G1FMbTpMNNe2LiDbG3DhC1rKYce7UUJL8R0pEbbEzTk=', 'guru', 'Marista Silitonga S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('8e33bff3-e38c-42dc-9d73-f482c271ea19', 'yenni.sitorus', NULL, 's1$EyRptUs53Ik1ZVzwvfMoxQ==$Z4XjHzozWFcekyJpbrxsSmq0RIJZOT54YJ09BRYqO9g=', 'guru', 'Yenni Sitorus, S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('94f7c3ac-12f7-4bf3-8c30-695cfaa32406', 'evan.sandiman', NULL, 's1$WMbi22cD+QtALM1slVWM0A==$9GeXiwsPc+Dsffz3q7uP9O/3V4MA7aLylnggkbO1z3M=', 'guru', 'Evan Sandiman Butar-Butar, S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('6f87b2cd-e46d-4790-b006-250fc3dbefc6', 'ita.lamtiur', NULL, 's1$x4QShs6CgOhUsIolwap6Ig==$H/R4m12Pnrl399m3iI/2iKx++NcESIlDrc9ghHym29c=', 'guru', 'Ita Lamtiur Manurung, S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('78710273-e7cb-4b4f-9bf1-ed68dd98beba', 'tri.doni', NULL, 's1$nEm+aukUgsNe3xlGcS45RA==$J3abA3GwGH4grfoYyXgDJITDHfixYdmFxm457ogZ3m8=', 'guru', 'Tri Doni Arsiwendo Purba, S.Mat', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('e95d74d1-ae47-4b45-b5f7-1e7dc61f7d44', 'doni.g', NULL, 's1$wZ2Vyktequ4K0sxnkktwqw==$g+ice4fXBEko2pn6pafpfNHriE6eyDDj7LeWXnvaDGg=', 'guru', 'Doni G Tampubolon, S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('a43c0ada-a666-4f95-8635-28703cf3c6f4', 'indah.ramayanti', NULL, 's1$Gy95+7UdKxGU7trtMZWPfA==$6o+Uj8+Q0eJU2SxEEZG8wIqHJaYfhf57hVI73ZsxxOo=', 'guru', 'Indah Ramayanti Berutu, S.Pd', true, NULL, '2026-10-14 02:14:06.442729+07', '2026-10-14 02:14:06.442729+07', NULL, true);
INSERT INTO public.users VALUES ('e1bc68fe-bb11-4aea-bd2f-09ede8837482', '2A12', NULL, 's1$VUZUfHSV7+ieazLUprdDwQ==$bLfoquHY3x6aZpIw0Im4s7Rqpyw0qoJFUQjrPdNU+5w=', 'siswa', 'GEVARIEL REZKY PURBA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('3fded03e-9c7f-498d-8c17-d55462c134cd', '2A13', NULL, 's1$QdV1RMtJvkHbIAdMKWrrCw==$Blwkc2I/RNrYXamQ1OOV/n6vg+4Z2nEbkrXWnsr9qqQ=', 'siswa', 'IVANNA IDA PUTRI WIDIA SITORUS', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('ca7d03b8-53cf-4fd3-b3e3-e789051a13a7', '2A14', NULL, 's1$Ub1Pn3RTqsWBHARYNqGm3A==$oKFDFQ7Z6EEZ6QYfpRkvSUkEQo+s+8eah4/azPRwtgE=', 'siswa', 'JORDAN MILJENKO SIMANJUNTAK', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('7a629a02-9f10-4986-ad0e-feb2ea375b94', '2A15', NULL, 's1$mUDG+/LUCTRfW9fVk5VIbw==$G3DUa3Wh6HkuKOss37S2DUdTGxZ/1GaXRHe34tpiVpc=', 'siswa', 'KENZIE JOANTIN TELAUMBANUA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('b3d919d7-e1a4-45a6-92e7-a70aab782c8d', '2A16', NULL, 's1$hcLyaYbn8GikWuNG5vZ6pA==$GZt5LLN8ogl+EOa6awpWH00wPHfM7miwnPOr9RZEcS4=', 'siswa', 'LIONEL ERZIDIN NABABAN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('52669d81-47fa-46b6-ad46-5f398e8bd65f', '2A17', NULL, 's1$Dyhf9b34Yq1JDsCltYouvQ==$pjiOKQuqwuDgXQYvm5VhxwO0KBUGDnAG8DN0NwVrq8w=', 'siswa', 'MERCIA CLARA HUTAGAOL', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('e9cf002a-959b-43bc-8648-660b640e2ae5', '2A18', NULL, 's1$eM4MgjeXb6g8YuzIQqxaJQ==$fjUokHPyj893/fKktBpUpX+0eGxc7Mm3XFvDSyQOGfo=', 'siswa', 'NANDITO SIAHAAN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('2e72219c-87ca-4078-b973-3364eb80a446', '2A19', NULL, 's1$NbhYZuxAojw56sSxWPGC2g==$9/zWSxvC0VOn708sLbdVENRNTVaTTYIfYZ0UEwpG+5U=', 'siswa', 'PRINCES DAVINA BR GINTING', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('fbd427be-c96a-4301-af5b-d5d6ad3bb631', '2A20', NULL, 's1$U8t/zvV2EoG4Uo4/Gs3tRA==$XSbj+Xm0+j94wp4zgrBkNmwRErT7ymq1Al9CgqBYqT0=', 'siswa', 'RADOTH JEVANO LUBIS', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('35ffb5f5-fbb4-4107-a2f6-c9ffc95999c6', '2A21', NULL, 's1$YK2qWwWhKzPL9kezhQI1dg==$RI3C8pps41qbpKkLefn41W9Ofr2ykVszNo4/4NvQ1Gg=', 'siswa', 'REYVAND RAJA JOSIAH HUTAPEA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('3cc74fcd-6878-4749-8eb1-9f7b9a4fc80a', '2A22', NULL, 's1$WMr84WriO9+We8Uuae/mIA==$ipanlwnUUOK1yU8aqnXP5drSiS4nCaEViR2vpwwtrrA=', 'siswa', 'SELONA CIKITA FEMILA TARIGAN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('fc190077-bfed-4dcb-a520-e3c70182b643', '2A23', NULL, 's1$NfO5QnCi7Ifk1LdEaPZrDg==$FTTZLaAlZHne41fROFR18lFaT4rk3zSLw9xVIP6Y73w=', 'siswa', 'SONYA YOVELLA RIEL SILITONGA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('eadb9f52-b007-45fa-af7c-fc2d0939080f', '2A24', NULL, 's1$6PNvu+NPhko9EeX1HR1YMQ==$rNjOmr0r+jcjsRj/qO2nO7cowRrWaQozi0yBgVF/zt0=', 'siswa', 'VICTORIA EFATA MARPAUNG', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('ab37c00c-a8da-4a5e-8120-cd6156adb32d', '2A25', NULL, 's1$IHpIe/tHZl3ib7HDXfXJOg==$BT7eVxTw3DZv96/jA4H+t2PU2o1l3p0GLKBH4xfaLsM=', 'siswa', 'WILLIAM JAMES HULU', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('397b8f09-2a29-47e3-8941-4d4b328e995d', 'marista.silitonga', NULL, 's1$TTrr5+/9gcAX/Ovedx7kig==$1r72UA4ScrZqnxhQCKK06LMLV78GYZ+zaOusxnPu5hE=', 'guru', 'Marista Silitonga S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('a7c663df-a081-4311-a197-c60e058cbc42', 'yenni.sitorus', NULL, 's1$eQ1TOX2j7fu4RqHDSO6VQA==$iT4AHjuCouC+SZk6FPn0Y692Y6y7o/2GAFpi5sINP24=', 'guru', 'Yenni Sitorus, S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('e589c48e-87be-4a1c-9e75-8141be96c56f', 'evan.sandiman', NULL, 's1$FS0l3a4gpSKYW4jt8H+lYA==$+AkOAoLqvNgNu1/G0d9TN1rLxcwLHjojuSFut+a7CaM=', 'guru', 'Evan Sandiman Butar-Butar, S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('10a84c04-0bbd-4d4b-b945-cf0224e7fc34', 'maruba.parningotan', NULL, 's1$H0mo0wxrL7sqsJmrtlAi4w==$7lYxwOdvN6lqGx5aOYBFW6LyFD1/liVBQhcgqfgV5vg=', 'guru', 'Maruba Parningotan Habeahan, S.Th', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('fa78e53a-ff3d-450e-a493-3d163ad92cb5', 'jon.sader', NULL, 's1$ToRx0OYm3bS6CHRfONY7xw==$W7zRh6xSOiR892b/0ct4W9sYlqA+hGHSsMZ2CNkRXhM=', 'guru', 'Jon Sader Saragih, S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('7de00245-6bc5-4a29-88a6-2edf1d65a9ff', 'kefmi.d', NULL, 's1$eIVQP1LSE82v1GwxAMQEtA==$V6ta/fR5XLRLSWXxXd86TIoF60aR/PMxkd9E/4bEaXo=', 'guru', 'Kefmi D. Sinaga, S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('0caa2ae3-6a62-4bd3-8db0-21eea07c624e', 'mega.sarianti', NULL, 's1$ZJG4eBdOsTU7J4sLrCc8nQ==$Se+2I7NQoFlzi3p7fJl9k0N5FlBiu/g5tSiaACZK5dw=', 'guru', 'Mega Sarianti Pandiangan, S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('c6a8fc9b-fdb2-43bc-aeb4-25d087334beb', 'hendrik.p', NULL, 's1$J3RqtwmKUCg/qMTQigOqRg==$ANXH8GxpihiJbAiDg6SIVSXuZzPp/04qPzIVMYLaiow=', 'guru', 'Hendrik P. Simangunsong, S.Tr M.M', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('3cc7479f-0338-482c-b606-6c0892c8a650', 'reski.cetrin', NULL, 's1$NxRDxi43mvd/OsY9S/Sk7w==$PnISpAw+eCChSRVkj+GHwoOm8hbtcjJ84QgUhL/2SXs=', 'guru', 'Reski Cetrin Pertiwi Turnip S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('1a3385c7-32fb-4063-b4ba-350e5282a04a', 'agustian.bandaso', NULL, 's1$70Bo6svqXCcK4gWqTZPlrw==$B9AZBLD6d6gsAdCv6uDoNfeLqOP0HYf2Ljz5C3qWchA=', 'guru', 'Agustian Bandaso S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('ca841845-c6ee-46f6-a1c8-5fcfbae188a9', 'doni.g', NULL, 's1$xveTGlvUhmAiD7UEsSz+bw==$ACmFW/WZpmlNEcNcL7NSU2xpat3M0ZeZe/9mkxuLQG0=', 'guru', 'Doni G Tampubolon, S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('14a9f845-4393-4852-b270-495910e3528d', '1A01', NULL, 's1$mND8SbJCUX/pUZJL8BfPIA==$9Bf2LbFi0F1vVHURktVSTrlSo1QudaSg4S+Y3TPrhPs=', 'siswa', 'ACELLINE BELVANIA SILITONGA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('c6505dc2-6f86-49fb-b57c-656308f4e17f', '1A02', NULL, 's1$haiG1tl9EQF7E5nFyy37VQ==$KB/Y62xhinzP2OnBSax36J52ut25+F6oOhKwFyw/4Fc=', 'siswa', 'AMELIE GWYNETH BR SEBAYANG', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('6d6dc9d3-32cb-47dc-880e-69fe98cc880f', '1A03', NULL, 's1$zLMhdTWuq0ff/2602HJgyQ==$fF+hLpQvMHq6D8Li/zoh58ANe58GlVnf3tVHW8Ld93s=', 'siswa', 'ARTHUR LEENDEN BONATURE MANALU', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('a86c8e13-c56e-4539-836f-5eabb6028007', '1A04', NULL, 's1$u68zpacPLgUyLP9Hu4N9rg==$Ya8fU12EgguONeObD2nu8UUg4cdPdBbSk7DacXslIFg=', 'siswa', 'ARUNA LETYCIA PASARIBU', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('7f2eb13f-db88-488d-a360-4cdacd209b67', '1A05', NULL, 's1$dGYAmy/ovPeAg8k9ym4/AQ==$uaNXQk85jDNzxMxISuLsJoWeT3pj263ukcMApAIBC8w=', 'siswa', 'BRIGHT ISAIAH AGAVE MARPAUNG', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('2992baa6-f19b-4e40-94ff-1f43472f8a8a', '1A06', NULL, 's1$I4sUssthQtSzqbHtnBGtdw==$quhCRdvlBoGqN6e+QmMJGO0hCuXfiF7JOS6K9zYkMKI=', 'siswa', 'CHRISTA LADRESI PANE', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('9a02fb78-8c30-4986-812c-d7aebaf327ea', '1A07', NULL, 's1$4JWUFmK9/QZUAo+TZ38Fmg==$f6YdFCTB6rAfAekDozcmeG7qjZALW19fJ38CT+asWl4=', 'siswa', 'DEWA AYU KETUT ACHIERA ADARA PRAMESWARI', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('6c920e16-224f-4f84-8ec9-6be54be76ef2', '1A08', NULL, 's1$j5CtdVgxrmPkzK0zBTFipQ==$gPFAHjbzAdB4TKjZc0H9gFkmMNbv16eroQs0scfDNDM=', 'siswa', 'EDGARDO SETIA MANURUNG', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('6f0255b2-3618-44fb-bd36-edd0670b9085', '1A09', NULL, 's1$5swL7MGGLyOce1Q3CfoASg==$e5gQWsGfkz2vTvcK99tgSqMcX0IbLoCYvBczhhQOlhg=', 'siswa', 'ELVANO HEBER NAINGGOLAN', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('60fd46bc-2363-4710-b619-0d6f6bafab6b', '1A10', NULL, 's1$lIHRHb3g+v2C3rIL0/bPuQ==$l94pKDejDvwNoHxZilhHvDU0IBqpjwIhZdyy5iQgv+E=', 'siswa', 'GRACE KHAIROZ ABIGAEL SIBUEA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('d7739bba-b835-4803-b089-fe0ec0827886', '1A11', NULL, 's1$s4Wx0bDrDAEGnRboYxoGoA==$/1qqKBZ2/JoIcemAeKI1NVDmluwxBM+Nl0ZeSShvdAY=', 'siswa', 'HANSEL WILLIAM SINAGA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('89a2cdab-44ee-4c5c-81b7-d88dc1c82860', '1A12', NULL, 's1$Uy7K4tN1b5m4Jp8CS/BgBQ==$xWA0wjRmswwcAHGUMFX1sJrNwYEoXPRo4SB5n4Jyi/8=', 'siswa', 'JHON FELIX SAMUELO PANJAITAN', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('816e01e9-b49c-416b-9be6-992da5067f3a', '1A13', NULL, 's1$zNX53VSiM0AZuOztaNVnhg==$hN8OJbClOooKn66+M+di+X0mr1tQ9E8TP6e/8GqB6Ag=', 'siswa', 'JOANA GIANIRA ELEANORE BUTAR BUTAR', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('6efc52c1-6859-470c-b12a-91f4df87aacd', '1A14', NULL, 's1$CfakSfG8RtwgYmrRPFbL4g==$DD8AGl11+7zcVSzXVeLjsNMNqQ4BPfBNqvGtiFXndqs=', 'siswa', 'KENWARD LEANDRA JULIUS MANGESA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('058e014a-1495-4583-803a-f87dc3de4dc1', '1A15', NULL, 's1$LrH42j8Orh+zuqGGq5/bfw==$2BxEw3ULb3Mpmf0vajqD06CDE9UAc5ySNuVnl8zvHvQ=', 'siswa', 'KLARA DAME ALVENA HARIANJA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('5c659a51-1160-4fc8-9757-e89fe1b5d1b4', '1A16', NULL, 's1$MrdIp56ZKBBS3oUXgma3+g==$DvA5z2frfdiRVrkK0aYbonsB9XxYCu8PfgR/7EK3Ysc=', 'siswa', 'MORA LATISHA SHALOM MANALU', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('03fcc33a-8c32-4191-a85f-2d41fe4dae72', '1A17', NULL, 's1$AIcJh9aikn+xtROtIUeC+A==$vxCaaznCtib/eZ9+JJ0xrMoZDkI6E4xmlM1uM1Tv5xw=', 'siswa', 'MOSES DIMITRI SIPAHUTAR', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('26da2bd1-72ec-4669-9ac2-b8981b38ec8e', '1A18', NULL, 's1$R6XzGFneVTh5SfC3Kpja9Q==$TmYa9el8TP+obQbx6BMwv9ITDpjhLrrQHjJWNPcXHnk=', 'siswa', 'NATHANIA JOVANKA MARITO NAINGGOLAN', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('8ffc6e08-f1e2-4f06-92c1-976a52cbcf75', '1A19', NULL, 's1$9hQogFd3GQJfmx8OX3HhAg==$1r6sgX559suflZVsmw2eqJpWiNYlnTuOu6s+lFBGZhw=', 'siswa', 'TRISTAN OTHNIEL SINAGA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('a0ae1360-0647-45c5-985d-c2de9320feff', '1A20', NULL, 's1$hONjFzt/sUIGRj1mHcwyZw==$0h21uIjqSWh/qDu/PP8AGi6nvTdK9GA0KXhqxmYiXck=', 'siswa', 'VEBY YAP', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('feb7e59e-eba9-499b-b7cb-01def3ab107a', '1A21', NULL, 's1$XKdGLPFZ1bu6fARSHpxXXg==$QpfFwKHaQN6Ljh2fl2pNxfuAS9i1lZaaJpYnTnK4Pv0=', 'siswa', 'YOBEL ELVANO SILALAHI', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('d436f3dc-a410-4d4b-bff5-d548c8d10bb1', '1A22', NULL, 's1$4f8JkLruLFkpRNpwc4JYRA==$rDooN9EJMZL2PLbk1thC04KTtssWnYwK/OM15sADqPc=', 'siswa', 'ZEFANO AZURA SIRAIT', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('9efa3a45-4615-4b92-b940-3d334f6a6705', '1A23', NULL, 's1$R3989gZvMwdHlzOk6/mknw==$VH+LX3UsJJD6DoNCVfL47XHfMi831nC7ZlvqS+GfQ5Q=', 'siswa', 'ZERIKO CHRISTIAN SIMBOLON', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('1f7e72c0-1a38-4e57-9453-54a59e603dc0', '1B01', NULL, 's1$daAsgZcWta1ouG8mD36x3Q==$OUqdJB8BpNqo2C8SUnPUtg/gECksjU5mtDTIcLXUeII=', 'siswa', 'AGNES LYDIA ANGGRAENI', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('192be6dd-7fe5-42f2-a7cc-b7505b135c85', '1B02', NULL, 's1$OTKVtS2InyOyHWqYM0rp9Q==$sy4bGRv6ntQhHu+hcw4Iq1AXt7+G8WmKIuq+raIyLoQ=', 'siswa', 'ALEXANDRIA MANUELA SONDAKH', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('469739e2-aa53-4a1a-a778-c7e21773f052', '1B03', NULL, 's1$y7VpCzum45IUxgboSkhrWg==$9OwHczs3MG/ELuc8wkf/CpusMCYxXNtETlepiqTfoUY=', 'siswa', 'ALICIA ELISABETH METI', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('cc751d62-e6a1-4ccd-80b4-5727f62e8f60', '1B04', NULL, 's1$ivuLGts3cJy90kMAfWPxww==$TlZghmnrw4dM67pscqXJ/yKtyKaWs/CXmxb1ESuVkNw=', 'siswa', 'ARON RAFHAEL MANURUNG', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('7a65f7ae-e303-46e1-95f1-64673e770eb2', '1B05', NULL, 's1$eJ1dxoy+bkVnRrVUE6oz1A==$q1UF9WBPBuC7ZajWl5Lwjnw4JHSFQx6/RbVzhfY/lVo=', 'siswa', 'DEAN MATTHEW SIMANUNGKALIT', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('872e8a40-3784-4f72-87eb-a9052f87da16', '1B06', NULL, 's1$Hpe+RryJlpK58lnGU3WbeA==$TOBcH7O7luuLx2dr5SSgPoxhzKj7yCxgVVSkXE0cFII=', 'siswa', 'DEO SEAN VINSENTIUS SIMANJUNTAK', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('80477645-f2dd-41e1-bde6-39556bc714e2', '1B07', NULL, 's1$CQkB4UHzChKUXL4njbJipA==$YswUHGJTQjJRhUb/Z8oGCZiumzxE9NEdS/LL4ZxcUi4=', 'siswa', 'ELRICH ROWAN SINTONG SITORUS', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('7b04f003-41b5-488c-9211-47f1dd6bc7a7', '1B08', NULL, 's1$1fqZTKFvVDrN53mYQKvBxg==$1ay8BrZ5FBGoE0Z2hLPW2Cynx5JOKoqSwPmefYwpMm8=', 'siswa', 'GILBERT NATHANAEL SINUHAJI', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('ccf3dd81-afd9-4915-81dd-a4c5504abdb4', '1B09', NULL, 's1$q0isgVtgWzoUoajnqIB5Cw==$bjcRD+29QMfJPf1B5IXX3rOBnJYbA28MgeAndKVne14=', 'siswa', 'GRISELLA AULIA HUTAURUK', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('c6ec7e88-9b16-458f-820c-dee26b6b3ff4', '1B10', NULL, 's1$4WhC6gUrGcw5KncTP5jQQA==$NL3s+1l187VSNoT4ZZeX1m878j/OjRxzOQDcJjuj6CE=', 'siswa', 'JEREMIA DEO SIANTURI', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('3782ebbd-6658-4b53-ab30-ab64cc15d40a', '1B11', NULL, 's1$FtEOpLcnMfcHneVGFZtnOw==$ssvIVew8nfU1gvWFS0fsJfrP/c1WEuH9cDbAjNq0XTI=', 'siswa', 'JONATHAN ABIGAEL DOLOKSARIBU', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('a09eea33-810f-4fb5-b4fb-b3d4aeb2535a', '1B12', NULL, 's1$MVDGOJjhmM3pSpvl9FRbDA==$+Yp4uDA4aVpgMxscs1jRVMNy0FWNkgjUEj/2wr+HNWY=', 'siswa', 'JOURELL NATHANAEL HARIANJA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('6de93ef8-b216-47db-b68d-46239d14c489', '1B13', NULL, 's1$ftjdvtN6XErmE5uybQoOWw==$w11m/UQVPo65M3bwtVY6a4v9ccFdtvt1ZF3yjK+Ocrs=', 'siswa', 'KAMAYA RATU PARUNTUNG', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('162bb99c-1b9c-4336-9898-7dc707817311', '1B14', NULL, 's1$T+Tgh/9WjdVmiU7LnD2gCw==$Lrks/N1Kcl4y2A7Mtc1hUWlvfp+8WdzLZmzaDzsULI4=', 'siswa', 'LAVINA KAINOSSIE SINAGA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('2f1da6bb-6401-4890-aab4-6c4b6bf632c7', '1B15', NULL, 's1$jWemm2Nb/O2IK3FWS8t5pQ==$T54feEHU8ZN5B1uV7A/jaPv9FyYsNtMm2+WHR2DqLnw=', 'siswa', 'LYODRA SIHOL MARITO SITORUS', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('84badea7-3236-47bd-ab57-9b16b17c0387', '1B16', NULL, 's1$Wm7laF/pikvhR2ofD0jwJA==$2AFo972XSSranV2NlLiV6WdEcTBAdo26H3f13VRTIRg=', 'siswa', 'MAHABATARA GURU MANURUNG', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('ab577dc7-5991-4c01-be31-14d6724c1f83', '1B17', NULL, 's1$cxV4PtVr0mv2JdBo7tKbhQ==$ZkN9U0KuW54NxWYYPVDw/uujDGgvXuYap2uAWAKqQIU=', 'siswa', 'MUTIARA RAPMA ELDA PASARIBU', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('cc537987-6403-43e1-a49f-6d2548f0aa94', '1B18', NULL, 's1$Hev+Rs9xlQ3OfbGWLylttw==$ZxVczO5pKC8UwKRTkh2TJf1FroVBhXObQU4rBBcYhv4=', 'siswa', 'NATHANIA TRI RUMINTANG SITUMEANG', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('c8778efb-18d6-424b-9268-ccb1d993ad22', '1B19', NULL, 's1$lFzhd6UpTdhk+5u+fI/sOg==$UNk8p0teXO8moe1dkfq5S8FNRhRDl3xq8OIAexhocFU=', 'siswa', 'NOAH GENJIRO RYANKA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('18f09b07-d1c7-42dd-96fd-b44fe8dc989e', '1B20', NULL, 's1$+vjcxIUUPQ/f3ZCrXgb4pg==$bVE9YhqKC6vtx+OljP8JQ51jcSV2Ee0rW7YWO+ccNdY=', 'siswa', 'PUTRI SARI TELAUMBANUA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('6389a7a1-9e36-4111-bf8d-74758dad7cac', '1B21', NULL, 's1$ZrpxImbEla+iRLtTs8m7pw==$dJVj7QLPkvLZN2wdbn6QHYI/BeSK2/llU/NhqzeRmHo=', 'siswa', 'YAP WEL CHAI', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('a86d2e77-da2d-4ec9-81d8-0ed670c1110d', '1B22', NULL, 's1$JwGJgSild2gRJc6CNYfwcA==$wylhtcuYRL4W4FLZRBO9HS2NFX9T5g2S1N1Ddp+o6fg=', 'siswa', 'YOHANA ELISIANA MARBUN', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('220bebf0-f5f7-40c1-b542-60e6d56a90e0', '1C01', NULL, 's1$Jhp1Ws4qUkLrchfVJsjLhA==$PGNR7LTSO+voGQxxlmKqBKVnmZbqi+UwHnJCiLdm9r4=', 'siswa', 'ABSALOM VIANJU PANJAITAN', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('859c9dac-3eab-42ff-b41c-59152478c63e', '1C02', NULL, 's1$gAXYMs/S2IuBwwMEYXfrUQ==$b3vet8/ns+FJ9Vt0TqPdqLCh9cjSIdb39N0AnMQUxeM=', 'siswa', 'ALBERT VIEZAR SIREGAR', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('e1522dc9-6bb6-487a-bfc1-e98a584d63af', 'ita.lamtiur', NULL, 's1$wF7B2WQaKrLCs9HL0prZyQ==$uzQtMBLVjefnJgIRXuXxarwKUgxFlWRBEkr2t2aS6h4=', 'guru', 'Ita Lamtiur Manurung, S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('40d6dc96-b8ab-42a3-9e3c-0f422b2db3a2', 'tri.doni', NULL, 's1$9AsYYSZvpmFJ8hgBtDHeqA==$Fz828I7HLdXyRAKFaRdjZrDpsZebQo+31hPmmvbVziQ=', 'guru', 'Tri Doni Arsiwendo Purba, S.Mat', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('8872b4e7-0fca-4608-8348-7f6e502ee218', 'indah.ramayanti', NULL, 's1$YJEitlTmXBAAF0Bag23jpA==$rNg+ZcdS5LRkrSx0avMh+au4O9YmR2bkyFC2mrkG3Vg=', 'guru', 'Indah Ramayanti Berutu, S.Pd', true, NULL, '2026-10-14 02:09:34.090207+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('d70d7dc5-321a-4eec-add2-95e23a77fd19', 'maruba.parningotan2', NULL, 's1$VHkg0pKKUilWMA7/lIBAbw==$qiv/mmbmKEslWrHalRd/0tUcULvM0nJ3p9Eef/B5Jfs=', 'guru', 'Maruba Parningotan Habeahan, S.Th', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('678d5acf-38fd-470e-8e36-c36ea579e97f', 'jon.sader2', NULL, 's1$85Yjv+5S9JNqPtL0mo3YVg==$fpYwIOLnNARryJd4qMmAsIKA+oEeXljGMO8Owgn1sb8=', 'guru', 'Jon Sader Saragih, S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('00018a4f-7520-4c3d-b6aa-606be8c82dee', 'kefmi.d2', NULL, 's1$GPdr1DMczdgkFlSKutVNkg==$NdJktRFI2m2j4NNR7+Js/YeElrc6yNzDzX5eWJZT/Rk=', 'guru', 'Kefmi D. Sinaga, S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('9f1eaee8-29bb-4376-b90b-5c85a14f0a87', 'mega.sarianti2', NULL, 's1$9i1E5IPpJ1FQVCQZGUxb3g==$ZRXj06MjrpF1vtihTNDDGKZ8+XovLdhw0Pif9YdWsVA=', 'guru', 'Mega Sarianti Pandiangan, S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('73528d4a-67f7-4edf-b132-fec62d1a315c', 'hendrik.p2', NULL, 's1$vHm05IILGXpQvNYB8twXCA==$5FNFM0BClzUGdU4T9meFs5A758uiD1befcxoY0Vaebk=', 'guru', 'Hendrik P. Simangunsong, S.Tr M.M', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('fd3be31a-b6e5-4c8f-bc0f-d885947b7759', 'reski.cetrin2', NULL, 's1$lbpiyG7XBoXvf9DoAWePSw==$TF+NcEjeq+73MaiSgKcSaatYYqXsikcqPcKqt3o7r1Q=', 'guru', 'Reski Cetrin Pertiwi Turnip S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('f39faca4-cba3-48ce-8ea2-6200a506507d', 'agustian.bandaso2', NULL, 's1$bjZkldS1zPxN6Y6H55nWMQ==$cA0Eozu0WwgoHxXevMaC0gAAggB4cAIYg5YoL+619mM=', 'guru', 'Agustian Bandaso S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('038690ce-b248-45e0-a99c-ac5b59bda1b4', 'marista.silitonga2', NULL, 's1$6us0bBDdQh510KzYmEtykg==$G1R9R+lInQcUGZ+18ZDluU9i3CyVrBKQz9EHqU6C7gY=', 'guru', 'Marista Silitonga S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('841206ff-9da3-4a2f-b90d-1e14b326383a', 'yenni.sitorus2', NULL, 's1$si9hDrF1JnROWLP9VcvJqw==$F4Cw/8GCWVhMJ1+sIY9gAiRddMrq8+KcRyOfIlcMQ8A=', 'guru', 'Yenni Sitorus, S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('733c5104-5d5c-4c99-9942-51800734d66c', 'evan.sandiman2', NULL, 's1$SnyPoluyCYU+XLHDGSHd5A==$zAIWHjJvPkCr1kQLLMqnnlI+wZvehnLBu8tap9PihMk=', 'guru', 'Evan Sandiman Butar-Butar, S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('328f21dd-6cab-4049-8308-65dd1c305c61', 'ita.lamtiur2', NULL, 's1$ha37OpggT4tKRXGy/aGQqA==$7VAyMIdggJblZzJSbA+vcjvqdAE1OQgavt9SpXxoBCQ=', 'guru', 'Ita Lamtiur Manurung, S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('d926a3a6-3f71-4a71-8bcc-f11454a5c8c0', 'tri.doni2', NULL, 's1$4cRpZDI+4WvlLiHPLmXDag==$yclypp9TT6CIPHoiAgTI5J3ye4FHGvXJhSLJ9U6UO8M=', 'guru', 'Tri Doni Arsiwendo Purba, S.Mat', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('eaf6bc70-a647-461b-a561-1506aff0aae2', 'doni.g2', NULL, 's1$/wi/95IOk3tLUmQsPwyowA==$TyIVAVwQBfuUOOPXerXD2dtmuSnjGfRfU3ZsdGVP6uw=', 'guru', 'Doni G Tampubolon, S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('e90d26c9-9957-41a5-9233-a362bfc966a6', 'indah.ramayanti2', NULL, 's1$7JdH8s+4NqzJnrm726O1gQ==$pdsKJsitfjYzbYzGqFs4TyuyUXTDWFfjsT6v4z3NElA=', 'guru', 'Indah Ramayanti Berutu, S.Pd', true, NULL, '2026-10-14 02:09:45.418267+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('9a749f7a-5799-4e67-9748-e7f2f21492e9', 'maruba.parningotan', NULL, 's1$/n6Hq2xv1YpiPuJhFJSp1g==$TDvvkgZ+DIidOPC/3rfvohwljqDkvhvVRHK+UIo1niQ=', 'guru', 'Maruba Parningotan Habeahan, S.Th', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('53fb0b2f-6b68-45bc-a608-588cb0650400', 'jon.sader', NULL, 's1$ljfhIHDbTF9T0I9ESrDR1g==$dlJHsGd9JmUF8l3JNUtEe6gObjJOBrhpEnQ7PJxBi8c=', 'guru', 'Jon Sader Saragih, S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('48a08319-9851-46d3-a662-af79e8860250', 'kefmi.d', NULL, 's1$K3L6nW/JIA7rjI2i5BAo/Q==$MvYGZX0wLLs0QARBBlYQSIPUDSYA42HofQJw+nULgTQ=', 'guru', 'Kefmi D. Sinaga, S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('c8371f58-e5c5-4f2d-a610-2feb4dc9a72e', 'mega.sarianti', NULL, 's1$6Tfji14m/B0M3G9+SJcNmg==$wEEObtVhKLQuXxP3VRqEMMmfNDHdaTOs1v9MsxY685U=', 'guru', 'Mega Sarianti Pandiangan, S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('e3349684-96e9-41df-9914-280339456472', 'hendrik.p', NULL, 's1$+Ux52AYiHsKjhSN2z7jhIw==$sJ+V6Tu0qxdrnc3HtIIoqrFS9h0N9ZP4wc+HQNBmyb4=', 'guru', 'Hendrik P. Simangunsong, S.Tr M.M', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('30328e4a-676a-4828-b5b7-606467970a18', 'reski.cetrin', NULL, 's1$ChIYtJ+bGg7O5q7Bw6hiEA==$7rMYjYsPUKxvhe8xMhNRizNchfsFRWjbjr4ywTLSAgs=', 'guru', 'Reski Cetrin Pertiwi Turnip S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('c8522f36-ca2f-428b-8bb3-392267b42d62', 'agustian.bandaso', NULL, 's1$nR53BQlAF+xHM3j78K+1CA==$aS5LPlxUGBEPsCYgDcyiQDvzGPz6VgMvLLHTUsSDhuo=', 'guru', 'Agustian Bandaso S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('7da4c9ba-23cc-4ce5-b310-75b2090a1e5a', 'marista.silitonga', NULL, 's1$FJ/Cd+Wm3ITUnL7yhPAQsw==$uzvqUg0W0DtyawHdwj5UAW78WTxhZwIf353cCaIAhMU=', 'guru', 'Marista Silitonga S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('490d3c2c-b774-462d-bedc-17fc6bce02b9', 'yenni.sitorus', NULL, 's1$eKYgGIZ7T/Ny9Xi1+w74dg==$5oJTEbJSeVp30Yh0aE03Vot6cAfGnX2iwOe3ubfmkUs=', 'guru', 'Yenni Sitorus, S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('91598b43-2d45-49de-b704-43a3a25ecc06', 'evan.sandiman', NULL, 's1$ezpRenU7JVxgMaZcQoyTXA==$hzPEPx3ZGbTh1FDEW58oOGu8l7IPriY4cYPJNkhxzy4=', 'guru', 'Evan Sandiman Butar-Butar, S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('c134e145-7ce6-4e30-bf54-ad2e97e0292a', 'ita.lamtiur', NULL, 's1$uAItRbJ9NhKYfdVDYGhZ9A==$975LOtw9K5XBmpUI+8IxS/03MosnFwBfY1AzFfgUUvc=', 'guru', 'Ita Lamtiur Manurung, S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('ded02ce8-30cb-4403-9532-ed3cc1bc4872', 'tri.doni', NULL, 's1$zjt7ULpdHHeiSptPFdIcoQ==$vKflRjrJyNWTZESIcnOhrbKW/DYqpXrj27m6ul2Zrsk=', 'guru', 'Tri Doni Arsiwendo Purba, S.Mat', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('71c1fee7-c47a-4f4b-888c-87d5dc9c8e2c', 'doni.g', NULL, 's1$BcHgPiqUjJxv51/zF3YmSg==$CmXDPqEU6VKLm0ZvM5GF+qiR+6/WVAUAAkC6kv0r1rA=', 'guru', 'Doni G Tampubolon, S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('8765f0ac-85a4-49f7-880e-fe29fb1f8091', 'indah.ramayanti', NULL, 's1$u9+M/npWQYnyW9ukwsQpnw==$XhS8pRX0dQ8lJga8JsVUYyZaeKOXzKqb2WcPQssZmeI=', 'guru', 'Indah Ramayanti Berutu, S.Pd', true, NULL, '2026-10-14 02:12:39.766006+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('17302c9a-5e14-438c-8262-1e14a78ba83f', 'maruba.parningotan2', NULL, 's1$fagrJSCxQiybehCOxNTxaw==$073U1set+hZyV02IYCAtilJOYSdIHnCWPqu9rQsKW6k=', 'guru', 'Maruba Parningotan Habeahan, S.Th', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('cb23bfc5-3e92-4352-8dcc-59e213ea0cd6', 'jon.sader2', NULL, 's1$I2A3Uap002Z0/B390eAO5w==$lYNWk1Nk0cUVEAMGqhmUhqDHNb0pe6P8ofE6wytRGnQ=', 'guru', 'Jon Sader Saragih, S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('5ab0dbc4-b654-46da-bba3-1689161b6789', 'kefmi.d2', NULL, 's1$OpasfNDMswo2hy2EpztrQw==$XX7shBJ+VzEMzlkE/t8Jjbg1Y4L/47kyyN9F93BW4Q8=', 'guru', 'Kefmi D. Sinaga, S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('665a7a2c-a997-41d6-a53f-3c214ff83139', 'mega.sarianti2', NULL, 's1$0hQFPY2RR+vbwfJel+o+Qg==$IitUU6sH5C+5onsTnwTIr8EWhi+tPS8ykEng/2xLIOU=', 'guru', 'Mega Sarianti Pandiangan, S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('96138508-4293-4d75-a8ab-5a962599cfa5', 'hendrik.p2', NULL, 's1$GKg034YGXqDt7mhf/MBoOg==$TA0mMTv3FIKyoeAvAbKfUvQKGBZiSSA/PqAraeDJNIs=', 'guru', 'Hendrik P. Simangunsong, S.Tr M.M', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('ad5bc4df-bd66-432f-a3a7-a13a5b25796f', 'reski.cetrin2', NULL, 's1$SaG3R2wYDZNjx83h9CsW4A==$FntOPdSuyM552GYitbU4ZrEVP0sMgE0n9PbV8RTX1pI=', 'guru', 'Reski Cetrin Pertiwi Turnip S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('f401c15e-113b-490d-91e1-0abcb561236e', 'agustian.bandaso2', NULL, 's1$pRAez+hsumwMl1V81H/b2Q==$Nsuk2RUB7PsnshuS1cKBIX3SoYvd/KpW/LQtwzMzplE=', 'guru', 'Agustian Bandaso S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('54ee5d90-69a6-4718-b838-fea6071f6872', 'marista.silitonga2', NULL, 's1$Wehq1dUtxenK3bQvGTAhPw==$iFzodCGHRIzB+e0NvmOFNVQKW00CsmfRqtKO7LshXD4=', 'guru', 'Marista Silitonga S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('f8272bf9-be5e-4653-9c6d-7a981f71b4b5', 'yenni.sitorus2', NULL, 's1$iDlveehjDHO8BvZYd44fDw==$4i+JFWRJnkus2rIQNK1kJuirOaBsJw/O10lZ4o7U7Yo=', 'guru', 'Yenni Sitorus, S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('c4606402-1796-4daf-829d-c35e5d8282fa', 'evan.sandiman2', NULL, 's1$XiGupAQkl/Qsd2oBPU97Ow==$uMnWBacoo9EK7GVu3p0BDvqbC+32B5qOQK4ordR0S9k=', 'guru', 'Evan Sandiman Butar-Butar, S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('67131652-7a51-45ca-ba54-bf5025d80400', 'ita.lamtiur2', NULL, 's1$5LxM32EZMW/dOBz2yeXFuA==$xmUynDSonUdAiGwlY2KnTazbkv/qgtjWInFo12Tm7Do=', 'guru', 'Ita Lamtiur Manurung, S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('b302ac9e-0c77-4197-802c-df7e72201081', 'tri.doni2', NULL, 's1$TvrLoh1WkjBwJPG5okHMqQ==$eOUJpeJTVmcRQmTCC7/TNelKtgWRbQ6CNTYwUKamUI8=', 'guru', 'Tri Doni Arsiwendo Purba, S.Mat', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('cc567ad0-8bd9-4be9-83c8-24d46bd66933', 'doni.g2', NULL, 's1$Nf7AOWgEhw2/t45HtshO6A==$66RV62RYIMV9g5MJTu37Z5C3Dw2pvNfnUsoyesMu5As=', 'guru', 'Doni G Tampubolon, S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('f0e64658-479d-4aff-8acd-2a4e96e64c6c', 'indah.ramayanti2', NULL, 's1$HGK4Gaalmv+kSmJTcUSm/g==$tfmu2WYOgosd9AjTUDZt6Kqt75H6Cah41BF6RS0oT/A=', 'guru', 'Indah Ramayanti Berutu, S.Pd', true, NULL, '2026-10-14 02:12:47.961852+07', '2026-10-14 02:13:00.937921+07', '2026-10-14 02:13:00.937921+07', true);
INSERT INTO public.users VALUES ('65b8f71e-32d6-4e5e-ba85-d64a2a7d5d82', '1C03', NULL, 's1$FTVE9vEDvGlUGq2X3rS3Mg==$+8ni2W3JoJrTFupNb6isW9CazCPUlswan1fOrIIg+S0=', 'siswa', 'AMORA VALENTYN HALAWA', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('ff8c5908-cd61-4805-9a6b-324e0cd94d76', '1C04', NULL, 's1$FQGezltaUysslUQw7oBWIQ==$sWkWQSAJ6BLrKcT6vJg2XKkORpZLqzGCkh838ztt1e0=', 'siswa', 'ARSEN ELEAZAR GEVARIEL DAMANIK', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('412ddbe1-7b30-424d-8455-c8100583444a', '1C05', NULL, 's1$6Dx8lA5kttafo370kl5KjA==$XtEKn6Pd4G34YYE0pKuGAO8GewpPknAXdenU8/WSG1U=', 'siswa', 'AZRIEL GEVAREL SHILOH SIAGIAN', true, NULL, '2026-10-14 02:15:07.091333+07', '2026-10-14 02:15:07.091333+07', NULL, true);
INSERT INTO public.users VALUES ('756d5a34-c11c-4e91-ad68-b2bf7897ba4e', '1C06', NULL, 's1$vtmQAksaApYm5rAQsQfnRw==$htfJqC+Jv3KB/WBubw6Ne1SNe2PhiH2Zoh5XTnp66iY=', 'siswa', 'CELLINE YOVELLA BR BUKIT', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('47e2fd30-5d4c-4935-853f-0d079a7b6d1b', '1C07', NULL, 's1$l+aMbe8DBLgKB4n0Zwbu1w==$856oNeI8x+q+uNBcE+bw7ofvbOaI/ZRsQNZmNAPh9AY=', 'siswa', 'DELY MANUELA SIMANJUNTAK', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('44c514d5-8c8d-4105-a3ed-dffab864352d', '1C08', NULL, 's1$0tdx7Xc56y+o+zEwBP/dJA==$IbtFbZtN9A4B3ePI6oMM2aat6uYA9eLXpj5px5oMdiU=', 'siswa', 'EDWARD OTHNIEL SITORUS', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('7d16b9f6-36df-427f-878b-eca69736ee08', '1C09', NULL, 's1$mt2PsTtFRAF4OfB0/3zIvA==$AM0la+n8urSVRccuRXBiwblZjVzvg2fSF4QHtsAI4/w=', 'siswa', 'FEODORA EVELINA SUDARWANTO', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('6c5832f0-96b2-42b5-943e-f152ca41518f', '1C10', NULL, 's1$B2ejjjSOGlNUUS0yAGfP5g==$elrLbw+wYxx6EeWZWD4QgDfWPAtLdVuib/PhKvgyShk=', 'siswa', 'FIDELIS CALVIN APRILIO', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('5c9989c8-a269-4abb-ad17-de2443584c4f', '1C11', NULL, 's1$f+3mzJi8p0VPLVCZWqCcjg==$uh0HpnL1YMQqej5qFC1iVj1MFIVtVJC8Vkr4E6a9sig=', 'siswa', 'HENG CASSANDRA LIORA POMALI', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('318795f6-36ab-4041-8f52-b616453a96a6', '1C12', NULL, 's1$sI+5DZvuJz4BaKA+3raQuQ==$L7FwFQZVxCcNIZXtcwbdIsLq7hnHlkoGrvISe0n1fsg=', 'siswa', 'KAYLA YEHEZKIEL RITONGA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('34830f4a-2373-4681-8e65-8a57c6de5ad4', '1C13', NULL, 's1$qxLix2/Rpfj3QJEdPV93uQ==$8b5PY8/UfWknm67TtaJV9jUfFETDhScPqWtmfwf6yUs=', 'siswa', 'KENDRIK IGNASIUS ZEGA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('5f1066dd-7553-469b-81ff-ce27cffedc12', '1C14', NULL, 's1$PVH+eTD1/ZlkU+iOiGOYKQ==$Z2VunIokTjo79gWOUYTttMP+NIeC5xIA2W/7wTr4iEY=', 'siswa', 'KENNETH LEANDRO JULIUS MANGESA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('27f98ad9-46c1-4226-bc43-bfb17691ec9e', '1C15', NULL, 's1$vULTu9cExvtZ26olUsryNQ==$AsihdagsrROegYunQLBaMfnCYf79VXKDnhd1Qrcn3no=', 'siswa', 'KEYTRISAN SABOU SARAGIH', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('4ef6d3f8-2cd1-4b39-a85d-768df2f007b9', '1C16', NULL, 's1$zJ3Vvb5BPpchCsB0mTjCrQ==$gjdJdxaChljAZqLonT8usnjNVeDav8wnZcKhGQBoBxU=', 'siswa', 'KIREI FAYVEL GULTOM', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('a916f050-0da9-436b-b333-72e9230d3273', '1C17', NULL, 's1$fy/IAGms/DiKsBsNCKElog==$8Fy0SxYD4Clfssq7QhgVAZqk7KhVZm206PWawGvO4g4=', 'siswa', 'KYANDRA LOUISA HENGKENGBALA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('907ed518-9f2b-4c8a-a01a-4f0e5805f5da', '1C18', NULL, 's1$sHT+qTX/VAb3JSDK7BOqMg==$jPaJEDfB7GdB2AMObsFHVoyNn9uwNE4QhGPHlLumhDQ=', 'siswa', 'NATHANIA OLIVIA SIREGAR', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('187e052a-4098-4575-a194-09fe9d66938d', '1C19', NULL, 's1$9srb4Bv0sMYZ4/vxnbpltg==$faqs4C8edZmrorTqC573kwWtgNXATe9ElhJCxtY6OuE=', 'siswa', 'RAFAEL ALIANDO LUBIS', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('c6ec443f-9fa5-4b00-a416-8ca9779074d1', '1C20', NULL, 's1$ZVsoBXUP4/WeJtzDDbz3xg==$qJ2zci0iRrVQSmcJ8LBb42phHUIwwfEO3TcQlvW2nSc=', 'siswa', 'REREY THARA NAILAH', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('f0b9b004-64fd-4169-a94f-a2be99940721', '1C21', NULL, 's1$GtTMVeZMLgVZF7E83yz57w==$Bv/wH7Q0qHmgSvQLJGUVymWuoVl+4obV1mPyH0g8ooM=', 'siswa', 'SOPHIA SUN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('8b5f5ff5-6183-41c4-8a7d-3b1ce5223969', '1C22', NULL, 's1$WL4V8JfAwPDbWISoMh4fBA==$vSCdCAX+SHKp0LcDQh38rmIO//sKMsAvNUZDD4o7rgI=', 'siswa', 'VALONIA GRIMONIA SANTOSO', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('6b2181b6-e0d4-4ef4-9978-4373a1e51448', '2A01', NULL, 's1$ETHRtDb3I4lswUihvdZzGA==$W3ezvcOshuu09vrBPpRU6lhiuZGo8Z+KUPVR/ckNhXI=', 'siswa', 'ALFARO BINSAR DONGARI RAJAGUKGUK', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('a13973ee-24b1-4917-926c-5c76c210cbfd', '2A02', NULL, 's1$7dc9RXsga3C/8YQFlh10SQ==$2SuUS7spyOGwjeUEThxZw1wYVEFi1Zj5iky3nYj5X8A=', 'siswa', 'ANNAMARIE HASIHOLAN NABABAN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('9f6e7226-cc70-4ad5-b055-9802f8abb5b5', '2A03', NULL, 's1$8L8qZc84zdwOnyDB7qWtOQ==$AZGLy7/SCnUMRgA61fPy4byHC0u6eI1cpvv4STlthak=', 'siswa', 'CHANIA SHWELIN CRISTABELL', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('5950cc68-873c-4a68-914d-ac83430db986', '2A04', NULL, 's1$LiadnIA//rErP5b0KXaHfQ==$TdoFvRnBPhMPGoEUAwXTwKepSnGNUPA+kSmyBps2msE=', 'siswa', 'CHARLES HOSEA SITORUS', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('457692de-42f8-41e6-ba25-253d314c491a', '2A05', NULL, 's1$7tTHSaGt7fQAQlXJWtnuuw==$8XgqV/qezA4ksJb7ZQAeNjpI87b4tL3sJhNqbfGOMNk=', 'siswa', 'DAVINE SHAAN RAFAEL PANJAITAN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('41322bd1-d51f-4bc3-845a-cc9e112ddd3b', '2A06', NULL, 's1$Qt+piogQsc4uVbZ55mU9Iw==$KXMbNdWXLQlmfHFwKTRDI1gIFrlgaw+u+MY/RFvcF54=', 'siswa', 'DEBORA OKTA ULI HUTAGALUNG', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('ea377795-044c-4abe-b30d-6a34dff5aa4f', '2A07', NULL, 's1$aDVVUWgw8mFa68+7O0YKjA==$LFlHlbiO41wW5nmBCobaz7duiAs+1t1cmRrs4CiY6YI=', 'siswa', 'ELISABETH LOVRIANI SINAGA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('321a9f30-9069-489c-b51c-ba9107828d82', '2A08', NULL, 's1$g3MFdqrjWVadjYw2VAb/Ww==$yFmBszUkrrpfSCOk6fiGsDSjMRIdaYbELHiqBIScwOU=', 'siswa', 'EZRA NATHANAEL L. TOBING', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('a004ba27-077e-48c2-98a8-5395336c1bc6', '2A09', NULL, 's1$kKLCwFSVXFDhA/tjq8bzng==$zOrAR6ejeaz99n/gLnduFGHh26XH6VO5fxINIlmZzmE=', 'siswa', 'GABRIEL ALMENDO MADUWU', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('98a2ab9e-d1a2-4b7a-b5f4-ef3eea4efade', '2A10', NULL, 's1$/UFt56NxQXn0W2EzmeL+Eg==$BAE4iLnvZOV+d/3XLcIfcC6n88JT2ODhA9gOuZ/K6Ss=', 'siswa', 'GABRIEL HEINZE BAKARA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('70e1c397-7d14-4e28-978c-1dbbc5c167a9', '2A11', NULL, 's1$Roj40YjR4kYfM2XnK7q9zA==$UNTaZiVO08jrgdvs3MvOgWRPwGwPg0Yahr2dRw/GSXY=', 'siswa', 'GARRY ALVERDO', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('5f7ede64-2e42-437d-8a19-a8cf5642ceee', '2A26', NULL, 's1$ReHRdDgnLqof48Cb5yDHfQ==$/bm7mx5gTZxxXEec6K+PVn+zlKIg9BOm1gREBUZvLKY=', 'siswa', 'YABES HASIHOLAN TEULAMBANUA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('04413920-0258-4cdc-a22d-02b6e58002ab', '2B01', NULL, 's1$iVbBFKpUVSmqD9zwtyGcyw==$X8ZgUB5OMcfU9UM9zjbd+A1ZBaIHdDhABsabQ0zhv8g=', 'siswa', 'AL KRISTA RISKY MARTUA', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('b579114f-0c56-4da5-b77c-a26b1c6779b9', '2B02', NULL, 's1$A/1oufkxpYljpRi1imy1zw==$GLJh8GD9j51ytbj7bNsijc98Hlwckn7OJp+j0UNyoYE=', 'siswa', 'ALDRICH BARRY BAGO', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('c661583d-9543-4d32-bcb0-e725c1581c2a', '2B03', NULL, 's1$M3VWYcQwHlH2moimuVDKRg==$X08dJvHoa0zUzq4lnaVvvQYHeUzIePCAqfpq0ympfuQ=', 'siswa', 'ALEEZA MICHAELA SIAGIAN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('385d705c-c405-4831-bb07-104e2bc30687', '2B04', NULL, 's1$C707REDLVhv2XlKZOWHIeg==$5SRyK9IdN0jGKOHz1qNBc7NAwIzU5XqHOL8IFbWsl0E=', 'siswa', 'BAGAS RAJA MANALU', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('5fb37f42-469a-430c-ba4b-b9fabc860e56', '2B05', NULL, 's1$d2Pd2ptlUAdaCNopbNKgyQ==$Rj4vhYpHm8xOfL17dI2vex9AVLtLaKMx1q+Sdnjvu2U=', 'siswa', 'CHYNTIA VIONA NAINGGOLAN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('b4ef6236-f88c-4579-bd2c-f2ec266d9bda', '2B06', NULL, 's1$Q6/IIbsRSefy9r6pRXrdCw==$GBB9m5xmdV3LizR/y9YCWST6i+j7a4JMVYGQPkw24SQ=', 'siswa', 'DYMPHNA CAHAYA NINGRUM WIBOWO', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('58e2267a-9bde-4856-bf38-7a6a57393fd7', '2B07', NULL, 's1$GGszY/0KnMHXkn/e7OQRsg==$OLpoK3ucKhNxRZy+5znyZB8jqT9UlySohkWkIHLx8TQ=', 'siswa', 'EFREN YEREMIA NABABAN', true, NULL, '2026-10-14 02:15:07.729092+07', '2026-10-14 02:15:07.729092+07', NULL, true);
INSERT INTO public.users VALUES ('87850fa3-3782-4d5c-893b-3964b1eaaa5c', '2B08', NULL, 's1$m2kChWVy+Bj9Ga33r9KMqw==$KH01e/c6CRFgpqL2rfxwiqUNoXQ2jMrAp7dNTPodkGE=', 'siswa', 'ERLAND JOHANNES NATHANAEL NAPITUPULU', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('3baba964-9b9a-4c1f-951a-d7da7093d274', '2B09', NULL, 's1$bK4X8QsLYdWvHaVg+nejOg==$8qqol+JdQRUxpcWKbsVsiqUrWBYn3/ZIj4Mc8XMHNpo=', 'siswa', 'FAYOLA CICILIA NASUTION', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('b6143a37-d737-44d5-87d4-aa2e934b0fdf', '2B10', NULL, 's1$f8BfbBfRt9TYCdeJgiD5Lw==$aok4DEEzqFup8kRLhe8G3rJME/USFK/UCsoD8s5umWU=', 'siswa', 'GIDEON PEDOLI SINABANG', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('8e49bf3e-5f8b-43f0-bdfc-e2da239d84c0', '2B11', NULL, 's1$+VMHCWHek7n87PZY5WpoaA==$xohPVEkI0lzWuntXNfNGYuv7mS/d9ONXoMtU9/xtccM=', 'siswa', 'GISEL GIVEN LANGI', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('3dfd8255-1638-4910-a103-06a29d9f3253', '2B12', NULL, 's1$jT5iis8OP0EHYXgmhXsJ+A==$IOrJEtuJn3WEOsUhjGU/ZqBb5EN6pekL2ainUQKaq4g=', 'siswa', 'GITHA ALISYA', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('45c1fa8a-fb04-4a82-b411-97d6430c8415', '2B13', NULL, 's1$W+00lWKuud6Q3fqZzSSGtw==$kFTFvNRhdWIHnRzrd4zqnTTApl096d55e1UBY59XkH4=', 'siswa', 'GWEN FELICIA ANTICA SITUMORANG', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('827e1964-20bf-4189-96c8-fe20576bc7bd', '2B14', NULL, 's1$UbaLkt8Wd/RU8QF6ssvZ4A==$aQFoaOklKKO56Vba7znaWdbo9Gto30audKrkpuWXvsg=', 'siswa', 'HANNY ASHWINY PUTRI', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('cf6abea3-cc34-4299-b31c-1a471c00bac0', '2B15', NULL, 's1$KBGE1PzF4gSyTIeEqIlvlQ==$VyZU0vFSrSQkVnqUtDEJ7qDJCGLCs0gqRA352xuhm40=', 'siswa', 'HANSSEN DAWAI ANJU JAVERA', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('0af7695f-59a0-415e-a528-949d6370ad7c', '2B16', NULL, 's1$Z6D1XId6Dpa/Mja4qNq1JQ==$bQ9k4xPVs4fLIcEy6JSRi176/RVtJ6jx4sRSNxcNL+s=', 'siswa', 'HARUN MISAEL SIMANJUNTAK', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('3c9cbdee-bfd0-4873-8019-a4d232505dfc', '2B17', NULL, 's1$HqBxszUAVeLHp/kobn99mQ==$jivj2bwuzB/VkWy6NoThh1PrYfUIvjfx08khpjaPZL4=', 'siswa', 'IMANUEL FANDESTA SILALAHI', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('945068aa-ec32-4aa4-a066-01c475251880', '2B18', NULL, 's1$MD8kay/6mg+pvZjspDLPqQ==$RFXqlaFbarHAEtNdoaJZKGwF2/YclylqUYZgAUzoOZ0=', 'siswa', 'KAIROS TIMOTHY SIMATUPANG', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('1ff8abf9-c85d-48ae-bb45-daccca41c07e', '2B19', NULL, 's1$ClrUGHt431Kttc6rk8KlBQ==$bLLnxAMgyV8FjbMvlcGeIJVFAtNBrBV8VIz2ikZQd78=', 'siswa', 'LEMUEL ELKANA CHARIS MANUHUTU', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('627c6862-cb82-44c4-907c-b8a7d3a40a3f', '2B20', NULL, 's1$SXDB6Z9NW6xkV4CLH9dmGQ==$GrGVvYObzJJ9cv1Oxm2seexJqOSCxJuRg99GF5Wrb88=', 'siswa', 'MANUEL HACYAN LUBIS', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('2ed54fe5-bf0e-4529-bd95-29e961101395', '2B21', NULL, 's1$DcxeLRHYI2OJqFZt5ZY81A==$5s5ng66WkCww207Wr2Gx4Zi/YNDDcolBsDsC+nlmeBI=', 'siswa', 'MILKA SEPTIANA SIHALOHO', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('dcddd7bc-44a7-40bd-8cdc-3610a3cf06d4', '2B22', NULL, 's1$q7oQC7Fnj8Tv7GHfAOIMwQ==$KhtZ0gBKk8Wf7ciDB+3zNRf7iYkjwv+5SOwvNTY/WXI=', 'siswa', 'MIRAI AKWILA SIDAURUK', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('f4a661fa-c3b4-483b-9a27-828ae462fd33', '2B23', NULL, 's1$sb6n4dB4gwDIAdaFqe6CmQ==$+AzMm+Da2dWZkaHNqOzpU8IwcG2Uu/Il725QOni1RwU=', 'siswa', 'PAULINA SHANEVITA PANGGABEAN', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('e3514acb-1ae1-4a3d-9a9d-c06a8a001649', '2B24', NULL, 's1$3btYxxbfg+ezCDIIQbE4nA==$jr7lDr0Dlfvnw1Sg5dTjUiTt8CaKwGRixURVUcGl3+0=', 'siswa', 'PRISCILLA CLARALY MIAN TAMPUBOLON', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('d99c6c07-05b8-4a2e-91bc-2928c5fa5027', '2B25', NULL, 's1$urcN1dXRDVcfzT50Q2gGGQ==$iF3elEO/Xuv72JIThAOeCivbU1duDT1soAWPJfJxma8=', 'siswa', 'RAFAEL ALVARO SIREGAR', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('4d68c6f3-d1cc-4d27-81d4-610283586a1c', '2B26', NULL, 's1$/YXGlk5ryZ/sgbmiwXv4fw==$1IgIBuqfGB7Jwsz6A37w3Cd+Rv+SlRYeb6sAAA4Bih8=', 'siswa', 'RICHARD GABRIEL HOTMAULI TAMBUNAN', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('3050dcc9-9049-41cf-827c-62e387b73a1a', '2C01', NULL, 's1$sQspUvXfEGyUfzcsHEZ8Og==$OXNhdQUORXR6pvTU08o6uE087IB7TmyfdZn+uTmwpTI=', 'siswa', 'AGUSTINUS HERI NAIBAHO', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('317756fe-c6fe-44b5-a72b-1d48f40c8e0c', '2C02', NULL, 's1$IwTusqEdicL3oFy4lk0o7A==$NBurQmqHpMWF/e0ILvjHyH6CjI7zz7Y5VKYkkslr0T4=', 'siswa', 'ANETA CINTA MARITO LUMBANTORUAN', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('186b5c57-d5c4-49b6-afc5-74baeee2255a', '2C03', NULL, 's1$Wgn2YF8fCVzoeoaEDVdDBg==$s4QWdD4AHorhupu8uCvAkRCYugJW/GtXwio2qZgYqfg=', 'siswa', 'ARBINA EAGINTA KARO KARO', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('e232695c-5e92-425d-b192-3a8633b6251d', '2C04', NULL, 's1$K7lW/2I8PJg1GbPZRek2gw==$czfilMNLtnp8WJJPrXDJCQjY8KsNFw+I7dEflwYulQQ=', 'siswa', 'CLEONA PEPAYOSA TURNIP', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('bbaaa6f7-3794-4d89-b71c-9cdee9939647', '2C05', NULL, 's1$CpGCaZ0X5hpNmpup0wwR5g==$/NXfQY2VQMw82dojSB01+oyfPpWzXAwoa3kZH4QtJsc=', 'siswa', 'DARREL DEAN SIMANJUNTAK', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('d957653f-c7c3-40f0-8619-6938e316954c', '2C06', NULL, 's1$VgnOtOGTQDXKFE1X38A9Hw==$0ZyF8nWgrK6FEvdWKyazrEMes5nZ+jm0lFA6ocudvDo=', 'siswa', 'GIDEON GIAN MARSHALL PARDEDE', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('687f958d-0b96-4db4-a8d8-931ceeea10a9', '2C07', NULL, 's1$e/0CWHZXkOm/yZ8xecr/Bg==$fkhpcQed1jnbXIgIAzfziHae61AaUnjHZCWxs9umzfY=', 'siswa', 'GRACE OLIVIA PANGGABEAN', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('0e59e509-f409-4842-8c6b-ed22c6179371', '2C08', NULL, 's1$9fZBAfV8k9y/buxILXhOsA==$JHj/7OgJ0uRKqPIr9w03bkR+At/7QMp7Jv8gRDvbtaM=', 'siswa', 'HOSEA GEVARIEL SIMBOLON', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('2aa0450f-ad31-4859-8441-6ca3886a436f', '2C09', NULL, 's1$vfsNt2ZwaG/GCvwc0crj8g==$A4jV3QLkU9CH/LRNAcZzUe7kg2sFFORvkAEq09OKnAg=', 'siswa', 'JEANETE ALONA BIU', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('9c09c2a2-fdf9-47ae-b015-60bfbe97678a', '2C10', NULL, 's1$Ub0QnnUzr6tx6BqX6erBnw==$Mfpxr5xKH2jqUbjZJnRmSq5Cts4rEyQrS/aoldVf2PE=', 'siswa', 'JOHN ANTONY SIMATUPANG', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('21e4ba55-451e-4cf0-8d60-7172fbff2e4f', '2C11', NULL, 's1$3UhTY5qxdijBrjK/H+KZpA==$OPSj+txT5cPuv/yKna+DQiTaZvhODt3GxRnGvgj7yXA=', 'siswa', 'LUCIA AMEY JHONLY SAMOSIR', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('9a034845-5792-42d2-934a-1966faf26cdd', '2C12', NULL, 's1$Fr8mYhdoQ6W+facZ8eO/RQ==$kdAfJ9CnvEWK19qnkgJBBP6FkGAvub+gVlmXO88ruR0=', 'siswa', 'MARVIN ALVIANO', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('515234b2-9eb9-4b3e-85c7-9f2f4fe0b702', '2C13', NULL, 's1$MS5xkMsW0qVPz40pskg/MQ==$tjSDDaer9PN/R0j/aRiGJ5h57uIof/tbFay987Czxa4=', 'siswa', 'MATTHEW PURNAMA PRADIPTA', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('d89a6aed-463c-4409-b859-dd9035f309a4', '2C14', NULL, 's1$B49wnYtGkfudFSxnHZE+zA==$nd2z1P8QWaSsc2AeIry6raGhA3cjsjiAMIhXzPwBfnY=', 'siswa', 'MIKHAYLA ADELIA NAPITUPULU', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('7954d5d8-9dda-4e2c-b1fc-823a60555059', '2C15', NULL, 's1$T2ioOTvztUErp79fF8NYaQ==$R2VViK1J5gA/r0zZS7QHddF9V2nYPxuCekp91VoZKTU=', 'siswa', 'NANIA EKKLESIA TERESA SIPAYUNG', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('d54b1b1e-962b-4aa3-a6f0-90c56d4d10a8', '2C16', NULL, 's1$21ns37PWSF/6QFNd5NSsBQ==$ven6a+qH6dU9d7pmv39gIa6gHCgu5lP/ntEpNus1haA=', 'siswa', 'NATHAN ABIGAIL PASARIBU', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('0c41fab4-a63d-4f41-946e-8837735b719d', '2C17', NULL, 's1$fwv57SJ0GVprNS9rXG3yLA==$EDE2ZqUjC4JXGNyrIYFya0UFBNCyu1BiWtUiAvbVA4A=', 'siswa', 'ODILIA ANINDY NATALI', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('e3f92076-c93d-450a-9756-386f05bc2dc4', '2C18', NULL, 's1$FZXZCewanLSDkd/N37odaQ==$2e9PalVPFJqPvw5G57h5h+iwRUVJN2fhT+qEsqi9v9I=', 'siswa', 'QIANNA ELDORA BR TARIGAN', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('b26a71a3-b12d-402d-aebd-b1ae34fc16c4', '2C19', NULL, 's1$Bzmd6Mw9wATnHCyK7IQ3AQ==$TBYc3zjkO+IyPlLv0ubTC6Z9rVoH4RipyCdXpGU9/fo=', 'siswa', 'RAPPATAR JANSEN SIHOMBING', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('87b70440-100d-4819-a6b6-09f7460b91d9', '2C20', NULL, 's1$iJ3ebGhZoD/P50cl0EMlHw==$HDvg8hjn20BwtlZkUn10s6VuKge3Ctpjnq52hM/JB8Y=', 'siswa', 'REFAN RICARDO TELAUMBANUA', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('6773d0bd-ddbe-487a-a6a8-896ff127b9c7', '2C21', NULL, 's1$R09t2qjGl64HtiWz1E49ng==$Mf0ZSCvelDYczysiSf/qrHvGswEQ/P9mvUfu22DwOTU=', 'siswa', 'REHUEL AGATHA SIBUEA', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('56cc6fe8-74fd-4905-ba35-2453f649c2ab', '2C22', NULL, 's1$4aGfN+esL0cg4YhnRTzfTA==$xRzxH7p13UNZVqR02ixGwvU3glxkqWwozTTIO7CnQ/0=', 'siswa', 'RUBEN NOEL PINOT SIHOTANG', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('30f6eab9-4d4a-4337-b428-0a76fba93cff', '2C23', NULL, 's1$9f43jYDGQjShLM3D+ls1rg==$OB1WcEj9lI5TqA0VPAtYElNHbQMT4hir+fmX5Tyw6Qk=', 'siswa', 'VALERIE MARION TELUSSA', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('73833801-3586-4bd5-b345-9cd263da4db5', '2C24', NULL, 's1$w9wfjhlBh+ka+K5sZ2zjwg==$h5I85Apz8N9eIB4PfThVf09QvdMbk+n2MxdGAIKY30Q=', 'siswa', 'VANNESA HUTABARAT', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('7d0ba861-a2d0-4139-99cc-5bb7bc3a6da0', '2C25', NULL, 's1$rL6I6pEsncjh1GQxVFNvgQ==$OrBq+HCcF4lta9qXzpzvRVnEWgvl+ETm1bPkmKzrK0U=', 'siswa', 'VELLVINA FLORENSIA', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('e5079f0a-3de5-4d21-a85c-01b2df5897fb', '2C26', NULL, 's1$Ah7TkyUE+KgSI1VMnofY+g==$QZdGIkL+W+TDPkON6z0sRo6a9KMP9QTfTBO7KhFAh3U=', 'siswa', 'ZATRA ZEFANO GEVARIEL HUTAGALUNG', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('33f29806-6ec4-48b8-b298-d92ddbce9383', '3A01', NULL, 's1$DsXUJkKcM/HfxsJX+62Olw==$4cvvp8jF5WJ+DWrFrO0gMR3azM1t4gTFSZLMIIUswTA=', 'siswa', 'ADRIELLA SAPHIRA NASUTION', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('576cb26a-c8a4-4257-a500-667fc9c0fdb3', '3A02', NULL, 's1$QzBBdChd5/vMxnfAmlzS/Q==$6O+Z3PQ6JF5kTPcJwqzeXji/RXjiGDcldRsLpcQbC/U=', 'siswa', 'AMOUREYZA SILAEN', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('66805b69-d61e-49bc-a2b1-fbbf10555ab9', '3A03', NULL, 's1$OriuhTvtkzNEim42jbBpmg==$r1JIqqZUl3T00ayZ6VX7naX4jmL9y5o0cWxjRdmVsHE=', 'siswa', 'ANITA PURBA', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('c979d2d0-2a8c-4c4d-9a6b-94e98ea019c9', '3A04', NULL, 's1$k8X7TZDNAB41afkEUXmBhg==$BdsZekWHwJ/41KN3beZNr/LMo/xNT4Cpii8Uyy1KrYU=', 'siswa', 'ATARIYEVI GRATIA NAPITUPULU', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('b163506c-5799-45e1-8c5d-b83462364d82', '3A05', NULL, 's1$8bIQK0q+9ZAri8YwYSmHdg==$Ax/dlAJO8M9M320cC/0L+U3H8XpTq46edoLacjorfLw=', 'siswa', 'DEVON FEBRIAN RENGKE', true, NULL, '2026-10-14 02:15:08.362958+07', '2026-10-14 02:15:08.362958+07', NULL, true);
INSERT INTO public.users VALUES ('035c3257-e528-44cb-aa02-fcb1b35e1b80', '3A06', NULL, 's1$b2bqgvavUlPxIs8N86LZEQ==$eo70N5Qu7k6DPRTnuBTK2qGAMjrsOCM7h1eCuj6L3c4=', 'siswa', 'EIRENE CHRISTIA HUTAGALUNG', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('58c9fe86-8510-461e-840d-0b2bcbcc6a87', '3A07', NULL, 's1$WGKFTFSLRzc4JWYhZ1p3DQ==$DEf+fYvGYfOozCM3O1TgaxNnKRK88XqFQDB7s/rHcYo=', 'siswa', 'ELGRETTA GRACE THEOFANY MANURUNG', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('e9c533e5-b4ce-4b8e-ba63-82a30032c3f1', '3A08', NULL, 's1$dvowyeSbLbILcGXx5IEBNg==$CSKqTSXliKAxWEe9pIARamtmDSVATGgoGF/RzGma2Sg=', 'siswa', 'ENZO DOMINIC SIHALOHO', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('ac26b553-eaa1-4ba3-b49e-5ca92f45fb2d', '3A09', NULL, 's1$LHkriplZqnZY/3ns6kcILw==$86YjOJ09gpn3Nz22rx20vDGBx55iWyK2rJXVpPVPgbc=', 'siswa', 'EVAN ROGANS NG', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('8a067f9e-476d-4675-947f-e5fc5ce29a27', '3A10', NULL, 's1$SxbbbFYNwVCm4l0c8WiXWg==$bn1MsTUresEw7XTP8nadKOAZ6ufPhAeMzulWj3+Wwyc=', 'siswa', 'FENINA SELOMITHA PARDEDE', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('4ea0de69-7424-44fc-9e59-d03d6f23e31c', '3A11', NULL, 's1$bUtpX/63w8eVuv2o8RtllQ==$wpaJAjVQlckox72X90w1VzGeF06NoCOE3xD8ot2rIIo=', 'siswa', 'GAVRIELA CATALINA PANGKE', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('b3c10347-c1a4-4de0-89b0-ef86bca23bd8', '3A12', NULL, 's1$gSVXxC9Tx4vB/C6aQzbgqQ==$8atTlCHIvdOTHtoUzHn/rtqz3U6Q9aNR3LIOo0ZxGX0=', 'siswa', 'GERALDO THIMOTHI SILALAHI', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('24cb11c9-ff8f-46ad-a1c7-f7761bbed4b1', '3A13', NULL, 's1$UXBGL5wDyRNRxpticPOrLw==$2WjEQDz21/Y7STfH530F2TJaoGWjNXFk9ufOoV5bwxc=', 'siswa', 'GREGORIUS JECONIO ETHAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('fd6451ad-9982-4e86-b84e-0549b0cf4855', '3A14', NULL, 's1$FZnNvse0P7bZm2xc9AINsA==$sXEqTKHdw4gjpDs1jMDANfgsx/C1DKvCWIZFfpL18ac=', 'siswa', 'HANS CORLEONE SINAGA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('d421aff4-47da-4dc6-bd6b-51299392abf9', '3A15', NULL, 's1$3e5/yDHmnljR0aVbq2qsrQ==$iQnUTr4zddIj6mCeA0hjkW1yVOVS1tBdOiVJEqLHrhQ=', 'siswa', 'JOANNA ILELA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('4f070309-9039-477f-903c-961a217dba15', '3A16', NULL, 's1$H2Rre6BlQciS037+u6OXZw==$uR+DLNb6PCfGdWzZmvZyDywdk/kxZIyV1hOEobMs3ZI=', 'siswa', 'KENZIE LEONARD SINURAYA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('70c8c804-17ab-49f6-80fd-2f5b1d7eb3ec', '3A17', NULL, 's1$dRboITtzISPELIPeS7JpSg==$u3qmQQFav05+K8rbk77Q6TFIxoD1ti9/cbqY+OTjBoM=', 'siswa', 'KENZO VALEROS JUARA SIALLAGAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('85d046ea-a156-499f-b38b-3430efd6a7a2', '3A18', NULL, 's1$kl9acgQ6sePwHpPZUQVVxA==$VCWlPf1sJZZpO1l4hBUuaTGQqbRjngwZimnc8j2HUfE=', 'siswa', 'MARCELLO IZUAN BIN MAROP', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('f1c9711d-16a1-4315-9e36-04ec832a8906', '3A19', NULL, 's1$y9JcIKbHjFFB18lSHvbxww==$gaO6UYyLJ2gsS5mpMZIWdV5Vn9t9x7rRzDDpfV5fO4g=', 'siswa', 'MARTHA HELLEN DWI IVANA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('6b8c6db0-f841-4f8f-a75a-926fb6d82d2a', '3A20', NULL, 's1$vy4AcJeqSLz3og1YNac1IA==$vud/51C2/o4FFRG2F9JyiJcPJ0/4NmE5WF8KwmVfhzQ=', 'siswa', 'MATTHEW TIMOTY MALAU', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('e113c9bf-f285-4388-97dd-4c8e1764543d', '3A21', NULL, 's1$6is4xjywQEzHDqGQH4dVew==$bED4V3+bDc0zhu1q1KJGVhRq1wKIdRbssMSiboe/4+4=', 'siswa', 'MELKI PUTRA ZEGA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('4ab8ebb4-0f72-4846-aba0-940a2ffdd145', '3A22', NULL, 's1$tdkBH7vjBhh2qhnKbQsV+Q==$X0l2iZMrw1PlAW/otcsAsjbkLaUe8zstlfdivuZQR3Y=', 'siswa', 'NESYA GRACIA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('e9f0980d-514a-4f6b-b41c-157020a6e9fb', '3A23', NULL, 's1$0iDKquseqmuO6DFnLXEczQ==$Ia7gXFQsTcRQfGRo6Cpa1vFQsctxrAuuE7ez3PS+kQI=', 'siswa', 'OYKU YESENIA SIMBOLON', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('c9b5e922-3e61-45f9-97c9-353925fdbabb', '3A24', NULL, 's1$nY5KhBEOXH0PkVBwZcNiHw==$ucFfCnWJ56crEj1HPn1oZbphELgVVkh8HEBIbzjh/EQ=', 'siswa', 'RACHEL ZILEYNA SINURAYA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('92e753ce-5e28-4c90-9316-025d9520b6aa', '3A25', NULL, 's1$tMuAxpYimlYbtKRoTLxOAg==$Ft0VDGK8gtcfhkYIsruE/YBrePozIOW6Z7Xx3r4jo0o=', 'siswa', 'REMITA LAMRIA MANULLANG', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('4e16fff2-f9db-4c7e-ab2c-43b58a903427', '3A26', NULL, 's1$m0kr4VdWBrSZRe6X+9T8pg==$DqziXyAfvNgPDD+37CBsogmOa+B3vMwvmF1q2sbBxjI=', 'siswa', 'REY NANDO DIKA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('285e60a8-5d64-4359-a9a7-3ed54d7d0b74', '3A27', NULL, 's1$0iArqcdWOJk+uDfMFP10vw==$YouCTJsQ+x9SbgMt0Murodpv1rGRpyztqOuzvECCKHw=', 'siswa', 'SEAN ZIONATHAN SIREGAR', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('d35f703f-3b00-41ca-bcdc-a653d4fb06da', '3A28', NULL, 's1$e1RoAJmKd5MbCqMJ6ff6aA==$FzFAslpsC1kE3dGzg4xLUPeS6CoVcT/7NoNoC3F/HPg=', 'siswa', 'SHALLVYN VALERIE', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('c90325f8-d73e-4e62-b60e-c089f54a5c25', '3A29', NULL, 's1$Gh/V2W7WgC86bus3m9hMnw==$MXnYtSBVjBiAizVLxuMgPe/PRH9lsqlgSiBAtaJgYe4=', 'siswa', 'STEFEN SINAGA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('8deced1f-313e-4e02-a5dc-c5400ef37174', '3A30', NULL, 's1$BMH7A2kkgyxjDJQwqgEFzQ==$zxsV8egFCtSRlxyL01QJN3z2nvLdR5z0QUAp2aGUKyE=', 'siswa', 'STEVANY APRILYA TAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('83e30fc0-0800-454a-8d8c-fc693ff1ae29', '3B01', NULL, 's1$SvlnW/sp4q0rX52nxpq39g==$lKauTZec0sfTMDzsUK9XJMDZldxkqQr6pJoAEQG1ES4=', 'siswa', 'ALDRICK TIMOTY', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('3292bfe6-bcc5-44f7-a27c-ea913058ddd9', '3B02', NULL, 's1$j2a4vgKcd5mMURd9BiInpg==$0fFasX8Yj2Osj3sQYi5p5lnrRuM1G4C7NxxDxAe26mE=', 'siswa', 'AMOREIZA MELINDA MANURUNG', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('c1f0c764-7413-4ac0-917c-af3f286c44f3', '3B03', NULL, 's1$3MMaSbspYJ+92V9tmnc+2w==$kbTAa+j/5makZBbqyEzvKpiFhFpWNoKrDneLvFQzmp0=', 'siswa', 'ANDREAS CHRISTOPHER SIBUEA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('a1b7fdb8-f61a-4df9-8790-fe20cdc7b2ac', '3B04', NULL, 's1$UdyT1HTaA4wGKM3oG1nLkQ==$fOYGFIdBSRBRoVjLA/E/YQc+r2g8vu0sq0/oTAIrP9o=', 'siswa', 'ANDRIEL SEAN IHOT MAJU SIAGIAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('4b086d72-254d-42c5-8681-a0ca45eb8448', '3B05', NULL, 's1$gft1okYeLz8Cazft7njq5g==$Lq8OkHjYjiWgU9+RNCgUw5RjzHHP2jPC/kwpy7xa2I8=', 'siswa', 'ANGEL REBEKA ENG MARTIN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('1325f445-a9c9-49b0-88cf-63cd14e4fe8f', '3B06', NULL, 's1$23RaYd4bZlYfp6Id7DonLw==$5YShtUfJ04BU6IzPldyguFxHtxjgNKdvOmT9yCzMz7U=', 'siswa', 'ATIRA FELICIA SILABAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('25fd920c-fe91-449e-acb2-0563fdac77ee', '3B07', NULL, 's1$4sYFqIuzF+qOYwqqRN1omg==$K7OtWofCO1kx5xXZk2a1tA+sO0eZJI5qAQQHAjDHCIA=', 'siswa', 'BINTANG ANGKASA SEMBIRING', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('6c1e9fef-bf77-4197-8f33-f5378daea4e6', '3B08', NULL, 's1$z7bY/HFsDuYOY7zYl4dDBw==$8+fNx+bcdDR1LzGZk24QozflFJCSzXubKYtZtw/FTe0=', 'siswa', 'BOY BATARA SITORUS', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('4b7a9cfd-bcc4-4220-b031-bb55d8e081b1', '3B09', NULL, 's1$8Ly0K++EuKL+Jm/9KHHJXQ==$CbMmycq0HuU28pCCO1u2Rei1vK+djCooyDCkw+HyTsk=', 'siswa', 'DANNY EFRAN SIAHAAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('43b7d544-5acc-429f-b7b8-fbd586b770bc', '3B10', NULL, 's1$D9NA1IuT+7R6oXbT4WfPHQ==$CiGhLfj14tmYUBBWHZG2aT26ueveGeAEqDHN419Y0hc=', 'siswa', 'ETHAN ABSALOM SILITONGA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('fe00e9e3-dce8-4fe9-ad4a-41104bd0a18d', '3B11', NULL, 's1$3FC0aZrNsHIu6MbYs2K7ug==$YGq/P0PZpiUKi2psAuiYt7G1aGQSrrlEEd+WWAu2qT0=', 'siswa', 'FERONICA AGUSTINA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('3a336c9a-e7f0-4e1c-8d44-e55575294ead', '3B12', NULL, 's1$EuOU7BI1s6o8/ImHJCPiFw==$yuP5bK2/RankC7y8Z5pQxHy8rAPOvnpYABaSvU5KQAY=', 'siswa', 'FREDERICA QUINN SIMANGUNSONG', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('4b416ef1-2f76-4853-8c62-95eed3a7ce1c', '3B13', NULL, 's1$7NdO21yF2ZwsWw5GxEjkug==$vXXxW59OsZUg63cBgUGuKtPb3+VxQz7bjMa6Q7pfjA0=', 'siswa', 'GYTA AMELIYA HUTAURUK', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('7204562f-45a6-4481-a503-e029b230ecc0', '3B14', NULL, 's1$cEV+5LN++NzJqB5EA/sWdw==$ABaEwHtzRZcgAqC00F0Ig1Vv7U4WZ6hr/qaXJ7PWLJU=', 'siswa', 'HARVEY JOACHIM PANGALILA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('3bb91fdf-d215-461a-9796-651a35f3b0da', '3B15', NULL, 's1$qFXD6aK24DGfv7QZQT8F/g==$N8VEKqj5Yy9jpoewf22awhgkr4LGXg6t2X8FqnTbsXE=', 'siswa', 'INGGRID REBECCA WIZZYLIONA. S', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('5e95cc5f-f66b-43c4-990e-9407899adee4', '3B16', NULL, 's1$ORq9refsh9PlQuz3hnLPWw==$u/Hqv+OGgMb/uyIzJUB0sUd4214SgsWcrt0Ts4dARK4=', 'siswa', 'JOAN SAPUTRA WILLIAM WIDI SITORUS', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('a5e3a3f9-f960-48c8-97df-010266a9ab43', '3B17', NULL, 's1$tDGx6iNpCXnc+ai4RI3QJQ==$yxq9vWdhHj46sfHBXST76i6o4zf1NBuK0PayXx4WG8o=', 'siswa', 'JUAN TARA MANURUNG', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('82a62afe-038b-4937-a3b6-cbf9922a45d9', '3B18', NULL, 's1$xeeUx1ali69rzARbGp52FQ==$396mhNNK+UPtA/e3b7P2rYY0RxnJJaX6t5WHVbXpesA=', 'siswa', 'KEYTHIRD RAJA SARAGIH', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('3d8eb397-6204-405a-a550-cf923d990683', '3B19', NULL, 's1$iyZhnRzn2eNSX4dEAXIdDw==$n73Uc3f/YOLjWsH8ktL+ZMo+ggz3/eLKwwmW2etsL2k=', 'siswa', 'LOVIAN FANECIA PANJAITAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('dda1a20d-a90a-48e4-9ce2-fa4599ff2ebe', '3B20', NULL, 's1$iftwQn0H87w4qPPo0/RfvQ==$hOBoX/wS5mYuIYlk4mxHXuKz8F2SOM1aryMmzuNH2yM=', 'siswa', 'MIKKO BENJAMIN NADAPDAP', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('76ed4319-c2ce-40d7-a2c0-519482789726', '3B21', NULL, 's1$xUy5Dz734piQxECtCwdneQ==$Nv3FusM9f/bOaBBpEKNnN7F5tNBvn2TrfRtKpnT3cD4=', 'siswa', 'NOVIA HENNELA HASIBUAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('f3c50200-b799-42d3-856a-44ed4c943e9a', '3B22', NULL, 's1$6oYL4M30a0mTmqrtom6LSw==$AavDZT01dw58qbQ6L/kYPWcceOihsoTnS0DvqtDcO7U=', 'siswa', 'PANDU TIMOTI TUA NAINGGOLAN', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('0e563c4c-c109-4e55-8a57-c8ae8535021e', '3B23', NULL, 's1$UP5nLtORSCHU5H+itN5CDg==$NYjDz55oNKlaT6uEMe1DXtqpUXJ5yBEcD18QOEFz08M=', 'siswa', 'QUEENIRA VIONETA BR SEBAYANG', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('af1c321c-8d60-4912-8d17-deb2cbd7d142', '3B24', NULL, 's1$2oa57tZPCaXq+9dhlnFavQ==$GCvWoKjXD1DNtv/jO8Y3oS7E+Sf5wEpYl5UGv+CPNMM=', 'siswa', 'QUEENZY ANGELIKA LIM', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('ad73c085-4418-4748-b6ff-39f3785b93d2', '3B25', NULL, 's1$hjgpHD4s3z6aSrfkLkKdLg==$G1zSVIBAWS6QNdMJ5nUqTUC6zzE9ac6ty8ynh6uq3dA=', 'siswa', 'RACHEL KRISTEN PRAHASTRA', true, NULL, '2026-10-14 02:15:08.962993+07', '2026-10-14 02:15:08.962993+07', NULL, true);
INSERT INTO public.users VALUES ('9d659ae2-a378-438c-9160-fd040fe3fabf', '3B26', NULL, 's1$BOFuaPmJ4kxjK3poq0V3PA==$2/hg191MYFh6jIXy2m66ftqs2taf8hIBMoZr7VwW9kA=', 'siswa', 'RAMOSTA ANABEL SITORUS', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('bf2560eb-fa88-4cff-b250-60bb43e06540', '3B27', NULL, 's1$rEaqYz5d8gKEMVLoN6xBzA==$NUcPV0HB/lqbHsbIxDMW/32mb+3j1f0JG2VWCw7sNPc=', 'siswa', 'SARA SELOMITHA ULI SIMANJUNTAK', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('0592025f-e447-4532-9d03-08e22efbb52f', '3B28', NULL, 's1$hVxn3ZevgGpyBe72DzD6zA==$UB2G/Fdg/0qwwvE1LBd3w/k5QdG7h4Gmsx696VK5u6Y=', 'siswa', 'YERIKHO TANDIONO', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('4a3b13ab-5458-4ba0-a8e7-fd5f962cd9ad', '3B29', NULL, 's1$THMcBtZMjzFkldu5T3jMdQ==$7ni4yFRtMOcr+mGpBlTXWajJNQGslrLDFw1KrNZsY7Y=', 'siswa', 'YOCELIN KASSIA BEATA LASE', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('1d8c743c-0b99-44cb-a7c7-2798d9911e43', '3B30', NULL, 's1$LWfOVwwGEve6EZtCJkhqsQ==$pRYiuIZSZGLBo7xwPMWuPCIP5CPqFRz1TGCFrUDiR/s=', 'siswa', 'YOHANNA FELICIA SEMBIRING', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('a076e0b2-630e-4764-977e-5e9837f871be', '3C01', NULL, 's1$p15u2NooqOdWHQ5k2qEfMw==$6GDg158ZkocREHFp6QohzlylYC4KHxNDoIIn3xIWtMA=', 'siswa', 'ADELINA HUTAGALUNG', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('f8100f80-4664-4644-bc27-4e96f4477f50', '3C02', NULL, 's1$Mbiu3OheZbkJh6FiubKLMw==$e8Bs0Cn4okxuYzv44ZyryEZybXS+V+GWmQAvJFILaaI=', 'siswa', 'ADRIELL TUA TAMBA', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('78e6190b-02fe-476a-908e-c7c38274f181', '3C03', NULL, 's1$qykeEocdMoA8EqVPH78KQA==$wE9vMvBnzZbsJ0a4IKftAgimNI0q2BqGiPDLPvtQJJY=', 'siswa', 'AUDY RENATA', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('7c95f7cc-b00d-42d3-98e4-d57680d46d3f', '3C04', NULL, 's1$ue6dyN743fwbEOVZ4a+/7g==$vqoSRcjBlJ+xdwQFU6TanKa6FHahMrp42ZpK1oZ36T0=', 'siswa', 'BAGAS MARASI LUBIS', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('70eab42a-874d-470b-bbdc-ecad86974881', '3C05', NULL, 's1$h8JrKXhINg3eu+uFdu+/Yw==$tuil2pQgILf2ImEeu9fz8XBN/3MFjPPS3OjaVHUi3hk=', 'siswa', 'CARISSA CAROLINE SIAHAAN', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('6954a363-9720-4284-b8d1-9b98786bd970', '3C06', NULL, 's1$v5hw+2Upp0FDTL7bhJDf6Q==$Mom4PjLtCr14uiDA4ALsDXGZTkIR7tq9JJBtSw4HTJw=', 'siswa', 'CLEON CRISTIANO BANJARNAHOR', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('eb97afe9-aa63-4aac-8948-9d72037208fa', '3C07', NULL, 's1$uW1zit6L2OY1yHlpQfVHww==$frvIJsWLTaeJ3uwHbxOvyHYu3LIt5WF9001bqYWG6sI=', 'siswa', 'FELICIA BRIELLE KIRANA', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('5660b830-0704-4370-b1e5-daf100ac2615', '3C08', NULL, 's1$YxIn3HGfO9ojUcKIGcaoaQ==$o1K53OgRieu+IH3pLtFJLNi6fxREGIWJYw5L/50gPA0=', 'siswa', 'FIDELIS GRACIO PARULIAN KALANGIE', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('27cb04cc-a3fb-4bd0-aab8-ac05653b657d', '3C09', NULL, 's1$Wb6zqFeWy+M/xxco5+cKLw==$uDcaQ18lOoe9GhgJOmnwhk1JAQQxvTGjkqGsaXOXDi8=', 'siswa', 'GITA OLIVIA SAMOSIR', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('01e6bc0d-0bb1-4ce8-b0fd-0dc0e1c4a977', '3C10', NULL, 's1$mDeN3dc0nnd3GAnUyLcXdA==$s7/mCDCMkjtchTy6gxVnN9CxLNdGjzXl4JvYq7cctwY=', 'siswa', 'GRACE CELLY  MANURUNG', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('3ba4903f-9234-4f5d-9f68-bc46f15525fe', '3C11', NULL, 's1$ub3QRmQfBOAd2wu+QcKRUg==$lSNVC8rWPqE00NkxtnYV8L0NGQkZO3nASpQ1w9l2COA=', 'siswa', 'HELDA RIA HUTAPEA', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('3230e5b2-6da6-4643-8201-3b6b97680893', '3C12', NULL, 's1$OyDHBRRD/NrTPk2brxzy4A==$LWcL9wQh10L9ANL6d0X24n+/yPPb9Ue5E1i8b2SgxMg=', 'siswa', 'IGNASIUS OKA SIGALINGGING', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('7c1c19be-c996-4e28-b321-475ec8fd19e1', '3C13', NULL, 's1$7Y/5pwgTG8mqRqUkH/n5dw==$d5kqXlpCCOBf74ocX+bD8MsYmgGqO0/cnNVDHgULBbI=', 'siswa', 'JEVIER IFANDER PURBA', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('3bc71459-d44b-48a3-908e-f20367ace311', '3C14', NULL, 's1$S4gkId4pVN/t1BexkFgBHw==$7jxgCxUeLW6Y0CyliaSED5TeUXgNM9aOSdjPSx3Q7os=', 'siswa', 'JOSHUA GRACIO HAMONANGAN BUTAR BUTAR', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('261a5de7-5373-4225-9ac1-2e2ebed38c95', '3C15', NULL, 's1$jd0s26gnGTay4cIoEbvRDA==$uQy1K9rR7tKqc4LY3KszVwL6a03vBmLWl9ZdP2l0Plc=', 'siswa', 'JUANOBED HAGA HERMAWAN', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('8f5bd87b-11cd-4a47-a9b6-71f3650e2ae3', '3C16', NULL, 's1$zUgxr9MsaY1Fv+iSuHULiw==$NbgnqfsZ6ssjWtaAtOcTKj7iWn6WTXcepTkt1s/432Y=', 'siswa', 'MIKAEL LUCIO SIREGAR', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('1a7dc510-69c9-449e-bae0-58cd0b4ed3be', '3C17', NULL, 's1$k9QgcCZxTt0UeDpYwuQ+jg==$NOMMTrlz48dIIZ6yH25iABrVYpvkNICKpZ3wFNhP2Dw=', 'siswa', 'NATASHA KIMBERLY GUNAWAN', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('3eae82d3-83ba-4907-a61a-e821d9a69626', '3C18', NULL, 's1$gS4J6ErmFyjl18Gz5CLzxw==$8pH6n4d89Ld3hE26Pwjv1DD7pIlpba5htPo24DmnD6Q=', 'siswa', 'NATHALY MARIBEL TAMBUNAN', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('a0a06297-1601-412c-80fb-c383ed7fb40b', '3C19', NULL, 's1$9NhurptZAa7ww5gjY7xHVg==$KoMYbYZl6dfnOzx9KTCuOL1GibvTAWg+3FIWk3DIwk4=', 'siswa', 'PETRA TIMOTHY SARAGIH', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('84562088-9218-4a2c-b35c-e7eda63ac79d', '3C20', NULL, 's1$D5HgK+wQ+9tHyTpXyTxa3A==$E4ed90vWGg7GpgRIK7s5D1rdZM59dl/0sGGZSlUWWCg=', 'siswa', 'RACHEL KEDZRA NAMORAI TAMPUBOLON', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('9c496bb8-aa87-4098-ba48-b05fd11d631a', '3C21', NULL, 's1$CT75/rO9nqFS1v4mO/8zMQ==$iPrV10HqBO2CJmFGh1lixn5vKeSZV+q30T5gU2783bQ=', 'siswa', 'RAINA APRILICIA PURBA', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('47f234c6-c5b9-4de0-88fc-e4e3ae199e1a', '3C22', NULL, 's1$ikw/sEAMjXtTosC0bgbkRw==$6WPuEg3Ny+bTdd8jsTlqHd4+pnh/ZlEQ+4vSy2XUNBg=', 'siswa', 'REHAND LUTTER TAMPUBOLON', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('508dabcc-0ec6-476d-93c1-74b38162e0b7', '3C23', NULL, 's1$i/pv/uoqCHu5I1gsvbPlVQ==$PkaUVWYUZH5VwJopwQDv347NID/3mM0C7Bc1YrccIGs=', 'siswa', 'ROULINA MANULLANG', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('8eac8e3c-d5bb-4edf-bd64-9450b6c8e4fe', '3C24', NULL, 's1$Qq8sx4asPjZk+eaGEgMbkg==$o/h6epdJak0If4Y0ihgf/0nOjW+YkTZjy+HBTCdWO5A=', 'siswa', 'SANTA DAVINA SIHOMBING', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('017906f9-d70f-477b-a767-8e766e34cf7d', '3C25', NULL, 's1$nePAv4XKZ1tGyf384SZ+5w==$x96EjT9ytUnl8HH7XIISO0rB5eqL0uzGC7+kaYQ+RWE=', 'siswa', 'SILVYA ELISABET SIDAURUK', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('45584083-2540-4943-a42f-4850f4c116e7', '3C26', NULL, 's1$swIY8IbzhRu+ZF1FSdQGxg==$3BbPYHsdWrWZ8YRk4JnbgJW/EYPZP3JSZMPQaej4Ff8=', 'siswa', 'STEFANUS ERLAND SIMANUNGKALIT', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('d59e7df6-f06d-4478-b15f-9f03ce20839f', '3C27', NULL, 's1$EvPrl1A3ASLVVIlEP5/Bbg==$qzAMvU27QesqWVMvde5wBLQMlpYfLFXZv6wF0qFdBvI=', 'siswa', 'SYALOM BRYAN HASIHOLAN NAINGGOLAN', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('8ffab813-964e-44b4-bc4e-93d1087d55b3', '3C28', NULL, 's1$LhH9aXJQbDB3Jx3b779Bww==$J6MslaTJ4DAPvNVaDa0M/RD2eg5yf0Z97ozAyik7A7I=', 'siswa', 'VANNESA CAROLINE SIBARANI', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);
INSERT INTO public.users VALUES ('08e0ccad-944b-4dd6-8ef1-d9783ce06400', '3C29', NULL, 's1$Sy1be98Nwsi+CWZAy4yxKw==$4tCnSNLrOVXQZNDMKzl3CN1em8nXwSFfNHikbc3TJes=', 'siswa', 'ZADKIEL CONSTANTINE', true, NULL, '2026-10-14 02:15:09.44272+07', '2026-10-14 02:15:09.44272+07', NULL, true);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 1, false);


--
-- Name: academic_years academic_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.academic_years
    ADD CONSTRAINT academic_years_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: attendance_daily attendance_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_daily
    ADD CONSTRAINT attendance_daily_pkey PRIMARY KEY (id);


--
-- Name: attendance_subject attendance_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_subject
    ADD CONSTRAINT attendance_subject_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: development_notes development_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_notes
    ADD CONSTRAINT development_notes_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: exam_questions exam_questions_exam_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_questions
    ADD CONSTRAINT exam_questions_exam_id_position_key UNIQUE (exam_id, "position") DEFERRABLE INITIALLY DEFERRED;


--
-- Name: exam_questions exam_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_questions
    ADD CONSTRAINT exam_questions_pkey PRIMARY KEY (exam_id, question_id);


--
-- Name: exam_sessions exam_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_sessions
    ADD CONSTRAINT exam_sessions_pkey PRIMARY KEY (id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: parent_students parent_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_students
    ADD CONSTRAINT parent_students_pkey PRIMARY KEY (id);


--
-- Name: question_banks question_banks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_banks
    ADD CONSTRAINT question_banks_pkey PRIMARY KEY (id);


--
-- Name: question_keys question_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_keys
    ADD CONSTRAINT question_keys_pkey PRIMARY KEY (question_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: report_cards report_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_pkey PRIMARY KEY (id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (name);


--
-- Name: school_settings school_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_settings
    ADD CONSTRAINT school_settings_pkey PRIMARY KEY (id);


--
-- Name: semesters semesters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_pkey PRIMARY KEY (id);


--
-- Name: student_records student_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_records
    ADD CONSTRAINT student_records_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: teaching_assignments teaching_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT teaching_assignments_pkey PRIMARY KEY (id);


--
-- Name: teaching_journals teaching_journals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_journals
    ADD CONSTRAINT teaching_journals_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: academic_years_active_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX academic_years_active_uq ON public.academic_years USING btree ((true)) WHERE (is_active AND (deleted_at IS NULL));


--
-- Name: academic_years_name_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX academic_years_name_uq ON public.academic_years USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: announcements_class_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX announcements_class_idx ON public.announcements USING btree (class_id) WHERE (deleted_at IS NULL);


--
-- Name: announcements_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX announcements_idx ON public.announcements USING btree (pinned DESC, publish_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: announcements_ta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX announcements_ta_idx ON public.announcements USING btree (teaching_assignment_id) WHERE (deleted_at IS NULL);


--
-- Name: assignments_ta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX assignments_ta_idx ON public.assignments USING btree (teaching_assignment_id, due_at) WHERE (deleted_at IS NULL);


--
-- Name: att_daily_class_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX att_daily_class_idx ON public.attendance_daily USING btree (class_id, attendance_date) WHERE (deleted_at IS NULL);


--
-- Name: att_daily_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX att_daily_uq ON public.attendance_daily USING btree (student_id, attendance_date) WHERE (deleted_at IS NULL);


--
-- Name: att_subject_ta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX att_subject_ta_idx ON public.attendance_subject USING btree (teaching_assignment_id, attendance_date) WHERE (deleted_at IS NULL);


--
-- Name: att_subject_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX att_subject_uq ON public.attendance_subject USING btree (student_id, teaching_assignment_id, attendance_date) WHERE (deleted_at IS NULL);


--
-- Name: audit_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_entity_idx ON public.audit_log USING btree (entity, entity_id, created_at DESC);


--
-- Name: calendar_range_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_range_idx ON public.calendar_events USING btree (starts_on, ends_on) WHERE (deleted_at IS NULL);


--
-- Name: classes_homeroom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX classes_homeroom_idx ON public.classes USING btree (homeroom_teacher_id) WHERE (deleted_at IS NULL);


--
-- Name: classes_year_name_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX classes_year_name_uq ON public.classes USING btree (academic_year_id, name) WHERE (deleted_at IS NULL);


--
-- Name: dev_notes_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dev_notes_student_idx ON public.development_notes USING btree (student_id, semester_id, observed_on DESC) WHERE (deleted_at IS NULL);


--
-- Name: enrollments_class_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrollments_class_idx ON public.enrollments USING btree (class_id) WHERE (deleted_at IS NULL);


--
-- Name: enrollments_student_year_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX enrollments_student_year_uq ON public.enrollments USING btree (student_id, academic_year_id) WHERE (deleted_at IS NULL);


--
-- Name: exam_sessions_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exam_sessions_student_idx ON public.exam_sessions USING btree (student_id) WHERE (deleted_at IS NULL);


--
-- Name: exam_sessions_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX exam_sessions_uq ON public.exam_sessions USING btree (exam_id, student_id) WHERE (deleted_at IS NULL);


--
-- Name: exams_ta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exams_ta_idx ON public.exams USING btree (teaching_assignment_id, status) WHERE (deleted_at IS NULL);


--
-- Name: exams_window_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exams_window_idx ON public.exams USING btree (opens_at, closes_at) WHERE ((status = 'published'::public.exam_status) AND (deleted_at IS NULL));


--
-- Name: grades_sem_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grades_sem_idx ON public.grades USING btree (semester_id) WHERE (deleted_at IS NULL);


--
-- Name: grades_ta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX grades_ta_idx ON public.grades USING btree (teaching_assignment_id) WHERE (deleted_at IS NULL);


--
-- Name: grades_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX grades_uq ON public.grades USING btree (enrollment_id, teaching_assignment_id) WHERE (deleted_at IS NULL);


--
-- Name: leave_requests_dates_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_requests_dates_idx ON public.leave_requests USING btree (starts_on, ends_on, status) WHERE (deleted_at IS NULL);


--
-- Name: leave_requests_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leave_requests_student_idx ON public.leave_requests USING btree (student_id, starts_on DESC) WHERE (deleted_at IS NULL);


--
-- Name: materials_ta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX materials_ta_idx ON public.materials USING btree (teaching_assignment_id, published_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: notif_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notif_user_idx ON public.notifications USING btree (user_id, is_read, created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: parent_students_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX parent_students_student_idx ON public.parent_students USING btree (student_id) WHERE (deleted_at IS NULL);


--
-- Name: parent_students_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX parent_students_uq ON public.parent_students USING btree (parent_user_id, student_id) WHERE (deleted_at IS NULL);


--
-- Name: question_banks_owner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_banks_owner_idx ON public.question_banks USING btree (teacher_id, subject_id) WHERE (deleted_at IS NULL);


--
-- Name: questions_bank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_bank_idx ON public.questions USING btree (bank_id) WHERE (deleted_at IS NULL);


--
-- Name: report_cards_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_cards_status_idx ON public.report_cards USING btree (semester_id, status) WHERE (deleted_at IS NULL);


--
-- Name: report_cards_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX report_cards_uq ON public.report_cards USING btree (enrollment_id, semester_id) WHERE (deleted_at IS NULL);


--
-- Name: schedules_class_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schedules_class_idx ON public.schedules USING btree (class_id, semester_id, day_of_week) WHERE (deleted_at IS NULL);


--
-- Name: schedules_ta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schedules_ta_idx ON public.schedules USING btree (teaching_assignment_id, semester_id, day_of_week) WHERE (deleted_at IS NULL);


--
-- Name: semesters_active_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX semesters_active_uq ON public.semesters USING btree ((true)) WHERE ((status = 'active'::public.semester_status) AND (deleted_at IS NULL));


--
-- Name: semesters_year_kind_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX semesters_year_kind_uq ON public.semesters USING btree (academic_year_id, kind) WHERE (deleted_at IS NULL);


--
-- Name: student_records_student_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX student_records_student_idx ON public.student_records USING btree (student_id, semester_id, recorded_on DESC) WHERE (deleted_at IS NULL);


--
-- Name: students_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX students_name_idx ON public.students USING btree (lower(full_name)) WHERE (deleted_at IS NULL);


--
-- Name: students_nis_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX students_nis_uq ON public.students USING btree (nis) WHERE (deleted_at IS NULL);


--
-- Name: students_nisn_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX students_nisn_uq ON public.students USING btree (nisn) WHERE ((nisn IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: students_user_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX students_user_uq ON public.students USING btree (user_id) WHERE ((user_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: subjects_code_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX subjects_code_uq ON public.subjects USING btree (jenjang, code) WHERE (deleted_at IS NULL);


--
-- Name: submissions_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX submissions_uq ON public.assignment_submissions USING btree (assignment_id, student_id) WHERE (deleted_at IS NULL);


--
-- Name: ta_teacher_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ta_teacher_idx ON public.teaching_assignments USING btree (teacher_id, semester_id) WHERE (deleted_at IS NULL);


--
-- Name: ta_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ta_uq ON public.teaching_assignments USING btree (subject_id, class_id, semester_id) WHERE (deleted_at IS NULL);


--
-- Name: teachers_nip_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teachers_nip_idx ON public.teachers USING btree (nip) WHERE (deleted_at IS NULL);


--
-- Name: teachers_user_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX teachers_user_uq ON public.teachers USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: teaching_journals_ta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX teaching_journals_ta_idx ON public.teaching_journals USING btree (teaching_assignment_id, journal_date DESC) WHERE (deleted_at IS NULL);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_idx ON public.users USING btree (role) WHERE (deleted_at IS NULL);


--
-- Name: users_username_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_uq ON public.users USING btree (username) WHERE (deleted_at IS NULL);


--
-- Name: academic_years trg_academic_years_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_academic_years_nodelete BEFORE DELETE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: academic_years trg_academic_years_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_academic_years_touch BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: announcements trg_announcements_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_announcements_nodelete BEFORE DELETE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: announcements trg_announcements_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_announcements_touch BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: assignment_submissions trg_assignment_submissions_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_assignment_submissions_nodelete BEFORE DELETE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: assignment_submissions trg_assignment_submissions_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_assignment_submissions_touch BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: assignments trg_assignments_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_assignments_nodelete BEFORE DELETE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: assignments trg_assignments_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_assignments_touch BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: attendance_daily trg_attendance_daily_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_attendance_daily_nodelete BEFORE DELETE ON public.attendance_daily FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: attendance_daily trg_attendance_daily_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_attendance_daily_touch BEFORE UPDATE ON public.attendance_daily FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: attendance_subject trg_attendance_subject_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_attendance_subject_nodelete BEFORE DELETE ON public.attendance_subject FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: attendance_subject trg_attendance_subject_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_attendance_subject_touch BEFORE UPDATE ON public.attendance_subject FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: calendar_events trg_calendar_events_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calendar_events_nodelete BEFORE DELETE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: calendar_events trg_calendar_events_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calendar_events_touch BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: classes trg_classes_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_classes_nodelete BEFORE DELETE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: classes trg_classes_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_classes_touch BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: development_notes trg_development_notes_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_development_notes_nodelete BEFORE DELETE ON public.development_notes FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: development_notes trg_development_notes_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_development_notes_touch BEFORE UPDATE ON public.development_notes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: enrollments trg_enrollments_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enrollments_nodelete BEFORE DELETE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: enrollments trg_enrollments_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enrollments_touch BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: exam_sessions trg_exam_sessions_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_exam_sessions_nodelete BEFORE DELETE ON public.exam_sessions FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: exam_sessions trg_exam_sessions_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_exam_sessions_touch BEFORE UPDATE ON public.exam_sessions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: exams trg_exams_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_exams_nodelete BEFORE DELETE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: exams trg_exams_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_exams_touch BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: grades trg_grades_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_grades_guard BEFORE INSERT OR UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.guard_grades();


--
-- Name: grades trg_grades_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_grades_nodelete BEFORE DELETE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: grades trg_grades_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_grades_touch BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: leave_requests trg_leave_requests_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_leave_requests_nodelete BEFORE DELETE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: leave_requests trg_leave_requests_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_leave_requests_touch BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: materials trg_materials_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_materials_nodelete BEFORE DELETE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: materials trg_materials_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_materials_touch BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: notifications trg_notifications_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_notifications_nodelete BEFORE DELETE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: parent_students trg_parent_students_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_parent_students_nodelete BEFORE DELETE ON public.parent_students FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: parent_students trg_parent_students_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_parent_students_touch BEFORE UPDATE ON public.parent_students FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: question_banks trg_question_banks_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_question_banks_nodelete BEFORE DELETE ON public.question_banks FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: question_banks trg_question_banks_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_question_banks_touch BEFORE UPDATE ON public.question_banks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: question_keys trg_question_keys_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_question_keys_nodelete BEFORE DELETE ON public.question_keys FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: question_keys trg_question_keys_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_question_keys_touch BEFORE UPDATE ON public.question_keys FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: questions trg_questions_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_questions_nodelete BEFORE DELETE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: questions trg_questions_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_questions_touch BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: report_cards trg_report_cards_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_report_cards_guard BEFORE INSERT OR UPDATE ON public.report_cards FOR EACH ROW EXECUTE FUNCTION public.guard_report_cards();


--
-- Name: report_cards trg_report_cards_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_report_cards_nodelete BEFORE DELETE ON public.report_cards FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: report_cards trg_report_cards_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_report_cards_touch BEFORE UPDATE ON public.report_cards FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: schedules trg_schedules_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_schedules_nodelete BEFORE DELETE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: schedules trg_schedules_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_schedules_touch BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: semesters trg_semesters_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_semesters_nodelete BEFORE DELETE ON public.semesters FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: semesters trg_semesters_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_semesters_touch BEFORE UPDATE ON public.semesters FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: student_records trg_student_records_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_student_records_nodelete BEFORE DELETE ON public.student_records FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: student_records trg_student_records_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_student_records_touch BEFORE UPDATE ON public.student_records FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: students trg_students_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_students_nodelete BEFORE DELETE ON public.students FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: students trg_students_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_students_touch BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: subjects trg_subjects_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_subjects_nodelete BEFORE DELETE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: subjects trg_subjects_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_subjects_touch BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: teachers trg_teachers_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_teachers_nodelete BEFORE DELETE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: teachers trg_teachers_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_teachers_touch BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: teaching_assignments trg_teaching_assignments_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_teaching_assignments_nodelete BEFORE DELETE ON public.teaching_assignments FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: teaching_assignments trg_teaching_assignments_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_teaching_assignments_touch BEFORE UPDATE ON public.teaching_assignments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: teaching_journals trg_teaching_journals_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_teaching_journals_nodelete BEFORE DELETE ON public.teaching_journals FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: teaching_journals trg_teaching_journals_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_teaching_journals_touch BEFORE UPDATE ON public.teaching_journals FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: users trg_users_nodelete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_nodelete BEFORE DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.prevent_hard_delete();


--
-- Name: users trg_users_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_touch BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: announcements announcements_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: announcements announcements_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: announcements announcements_teaching_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_teaching_assignment_id_fkey FOREIGN KEY (teaching_assignment_id) REFERENCES public.teaching_assignments(id);


--
-- Name: assignment_submissions assignment_submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id);


--
-- Name: assignment_submissions assignment_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: assignments assignments_teaching_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_teaching_assignment_id_fkey FOREIGN KEY (teaching_assignment_id) REFERENCES public.teaching_assignments(id);


--
-- Name: attendance_daily attendance_daily_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_daily
    ADD CONSTRAINT attendance_daily_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: attendance_daily attendance_daily_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_daily
    ADD CONSTRAINT attendance_daily_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id);


--
-- Name: attendance_daily attendance_daily_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_daily
    ADD CONSTRAINT attendance_daily_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: attendance_subject attendance_subject_marked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_subject
    ADD CONSTRAINT attendance_subject_marked_by_fkey FOREIGN KEY (marked_by) REFERENCES public.users(id);


--
-- Name: attendance_subject attendance_subject_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_subject
    ADD CONSTRAINT attendance_subject_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: attendance_subject attendance_subject_teaching_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_subject
    ADD CONSTRAINT attendance_subject_teaching_assignment_id_fkey FOREIGN KEY (teaching_assignment_id) REFERENCES public.teaching_assignments(id);


--
-- Name: audit_log audit_log_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: classes classes_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: classes classes_homeroom_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_homeroom_teacher_id_fkey FOREIGN KEY (homeroom_teacher_id) REFERENCES public.teachers(id);


--
-- Name: development_notes development_notes_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_notes
    ADD CONSTRAINT development_notes_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.teachers(id);


--
-- Name: development_notes development_notes_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_notes
    ADD CONSTRAINT development_notes_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id);


--
-- Name: development_notes development_notes_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_notes
    ADD CONSTRAINT development_notes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: enrollments enrollments_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: enrollments enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: exam_questions exam_questions_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_questions
    ADD CONSTRAINT exam_questions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_questions exam_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_questions
    ADD CONSTRAINT exam_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: exam_sessions exam_sessions_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_sessions
    ADD CONSTRAINT exam_sessions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: exam_sessions exam_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_sessions
    ADD CONSTRAINT exam_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: exams exams_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: exams exams_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id);


--
-- Name: exams exams_teaching_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_teaching_assignment_id_fkey FOREIGN KEY (teaching_assignment_id) REFERENCES public.teaching_assignments(id);


--
-- Name: grades grades_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: grades grades_locked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES public.users(id);


--
-- Name: grades grades_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id);


--
-- Name: grades grades_teaching_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_teaching_assignment_id_fkey FOREIGN KEY (teaching_assignment_id) REFERENCES public.teaching_assignments(id);


--
-- Name: leave_requests leave_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: leave_requests leave_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: leave_requests leave_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: materials materials_teaching_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_teaching_assignment_id_fkey FOREIGN KEY (teaching_assignment_id) REFERENCES public.teaching_assignments(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: parent_students parent_students_parent_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_students
    ADD CONSTRAINT parent_students_parent_user_id_fkey FOREIGN KEY (parent_user_id) REFERENCES public.users(id);


--
-- Name: parent_students parent_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_students
    ADD CONSTRAINT parent_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: question_banks question_banks_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_banks
    ADD CONSTRAINT question_banks_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: question_banks question_banks_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_banks
    ADD CONSTRAINT question_banks_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: question_keys question_keys_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_keys
    ADD CONSTRAINT question_keys_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: questions questions_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.question_banks(id);


--
-- Name: report_cards report_cards_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: report_cards report_cards_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: report_cards report_cards_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_cards
    ADD CONSTRAINT report_cards_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id);


--
-- Name: schedules schedules_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: schedules schedules_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: schedules schedules_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id);


--
-- Name: schedules schedules_teaching_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_teaching_assignment_id_fkey FOREIGN KEY (teaching_assignment_id) REFERENCES public.teaching_assignments(id);


--
-- Name: semesters semesters_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id);


--
-- Name: semesters semesters_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.users(id);


--
-- Name: student_records student_records_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_records
    ADD CONSTRAINT student_records_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: student_records student_records_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_records
    ADD CONSTRAINT student_records_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id);


--
-- Name: student_records student_records_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_records
    ADD CONSTRAINT student_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: teaching_assignments teaching_assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT teaching_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: teaching_assignments teaching_assignments_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT teaching_assignments_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id);


--
-- Name: teaching_assignments teaching_assignments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT teaching_assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: teaching_assignments teaching_assignments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_assignments
    ADD CONSTRAINT teaching_assignments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: teaching_journals teaching_journals_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_journals
    ADD CONSTRAINT teaching_journals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: teaching_journals teaching_journals_teaching_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teaching_journals
    ADD CONSTRAINT teaching_journals_teaching_assignment_id_fkey FOREIGN KEY (teaching_assignment_id) REFERENCES public.teaching_assignments(id);


--
-- PostgreSQL database dump complete
--

-- \unrestrict HbdqMf6u3jym19cUHIdH7xDMD08GZ3hPA5imZrJVQ9e4eXgqquLTyVYGGauNCNI



-- Reset search_path to public for immediate use
SET search_path = public;
