-- Allow private schools / foundation teachers to have shared appointment dates or non-unique NIP
DROP INDEX IF EXISTS teachers_nip_uq;
CREATE INDEX IF NOT EXISTS teachers_nip_idx ON teachers (nip) WHERE nip IS NOT NULL AND deleted_at IS NULL;
