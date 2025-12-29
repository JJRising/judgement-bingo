CREATE TABLE subject
(
    id        UUID PRIMARY KEY,
    game_id   UUID NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    type      TEXT NOT NULL CHECK (type IN ('PLAYER', 'EXTERNAL')),
    player_id UUID REFERENCES player (id),
    label     TEXT NOT NULL,

    CHECK (
        (type = 'PLAYER' AND player_id IS NOT NULL)
            or
        (type = 'EXTERNAL' AND player_id IS NULL)
        ),

    UNIQUE (game_id, label)
);
