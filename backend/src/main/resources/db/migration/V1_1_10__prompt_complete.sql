ALTER TABLE prompt
    ADD COLUMN completed_by UUID,
    ADD COLUMN completed_at TIMESTAMPTZ,
    ADD COLUMN acknowledged_by UUID,
    ADD COLUMN acknowledged_at TIMESTAMPTZ;


ALTER TABLE prompt
    ADD CONSTRAINT fk_prompt_completed_by
        FOREIGN KEY (completed_by)
            REFERENCES player (id)
            ON DELETE SET NULL;

ALTER TABLE prompt
    ADD CONSTRAINT fk_prompt_acknowledged_by
        FOREIGN KEY (acknowledged_by)
            REFERENCES player (id)
            ON DELETE SET NULL;
