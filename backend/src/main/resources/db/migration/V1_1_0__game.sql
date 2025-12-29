CREATE TABLE game
(
    id                  UUID PRIMARY KEY,
    name                TEXT        NOT NULL,
    status              TEXT        NOT NULL CHECK (status IN ('SETUP', 'PROMPTS', 'GAME', 'COMPLETE')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    game_phase_start_at TIMESTAMPTZ,
    game_closed_at      TIMESTAMPTZ
)
