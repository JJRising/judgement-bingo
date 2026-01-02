CREATE TABLE player
(
    id           UUID PRIMARY KEY,
    game_id      UUID NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    display_name TEXT
);

CREATE INDEX idx_player_game_id ON player (game_id);
