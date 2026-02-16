package com.jjrising.bingo.game.cards.dto;

import java.util.Map;
import java.util.UUID;

public record BingoCardDto(
        UUID playerId,
        String playerName,
        Map<Integer, BingoSquareDto> squares
) {
}
