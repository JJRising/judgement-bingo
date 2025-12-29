CREATE TABLE bingo_square
(
    id        UUID PRIMARY KEY,
    card_id   UUID    NOT NULL REFERENCES bingo_card (player_id) ON DELETE CASCADE,
    idx       INTEGER NOT NULL,
    prompt_id UUID REFERENCES prompt (id),

    UNIQUE (card_id, idx)
);

CREATE INDEX idx_bingo_square_card_id ON bingo_square (card_id);