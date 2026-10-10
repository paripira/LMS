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
