CREATE TABLE prompt
(
    id                  UUID PRIMARY KEY,
    game_id             UUID        NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    subject_id          UUID        NOT NULL REFERENCES subject (id),
    ciphertext          BYTEA       NOT NULL,
    revealed_text       TEXT,
    encryption_manifest JSONB       NOT NULL,
    status              TEXT        NOT NULL CHECK (status IN ('SUBMITTED', 'ACCEPTED', 'REVEALED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prompt_game_id ON prompt (game_id);
