create table bingo_card
(
    player_id UUID PRIMARY KEY REFERENCES player (id) ON DELETE CASCADE
);
