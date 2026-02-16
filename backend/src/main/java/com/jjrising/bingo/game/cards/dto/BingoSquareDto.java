package com.jjrising.bingo.game.cards.dto;

import com.jjrising.bingo.game.db.Prompt;

import java.util.UUID;

public record BingoSquareDto(
        String subject,
        String text,
        String status,
        UUID promptId
) {
}
