ALTER TABLE prompt
    ADD COLUMN text TEXT NOT NULL default 'OLD';

ALTER TABLE prompt
    DROP COLUMN ciphertext,
    DROP COLUMN revealed_text,
    DROP COLUMN encryption_manifest;