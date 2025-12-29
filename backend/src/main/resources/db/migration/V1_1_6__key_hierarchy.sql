CREATE TABLE key_hierarchy
(
    id         UUID PRIMARY KEY,
    game_id    UUID        NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    tree_json  JSONB       NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_key_hierarchy_game_id ON key_hierarchy (game_id);
