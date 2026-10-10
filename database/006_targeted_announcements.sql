-- =====================================================================
-- 006_targeted_announcements.sql
-- Scope announcements to a specific Class (class_id) or Subject-Class (teaching_assignment_id)
-- =====================================================================

BEGIN;

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES classes(id),
  ADD COLUMN IF NOT EXISTS teaching_assignment_id uuid REFERENCES teaching_assignments(id);

CREATE INDEX IF NOT EXISTS announcements_class_idx ON announcements (class_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS announcements_ta_idx ON announcements (teaching_assignment_id) WHERE deleted_at IS NULL;

COMMIT;
