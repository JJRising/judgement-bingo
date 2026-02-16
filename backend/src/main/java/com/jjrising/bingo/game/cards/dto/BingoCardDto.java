package com.jjrising.bingo.game.cards.dto;

import java.util.Map;
import java.util.UUID;

public record BingoCardDto(
        UUID id,
        UUID player_id,
        String player_name,
        Map<Integer, BingoSquareDto> squares
) {
}
