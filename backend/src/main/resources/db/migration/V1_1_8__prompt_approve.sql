ALTER TABLE prompt
    ADD COLUMN created_by UUID,
    ADD COLUMN approved_by UUID,
    ADD COLUMN approved_at TIMESTAMPTZ;

ALTER TABLE prompt
    ADD CONSTRAINT fk_prompt_created_by
        FOREIGN KEY (created_by)
            REFERENCES player (id)
            ON DELETE SET NULL;

ALTER TABLE prompt
    ADD CONSTRAINT fk_prompt_approved_by
        FOREIGN KEY (approved_by)
            REFERENCES player (id)
            ON DELETE SET NULL;
