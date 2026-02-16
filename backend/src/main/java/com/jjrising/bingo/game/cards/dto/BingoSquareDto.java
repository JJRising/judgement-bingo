package com.jjrising.bingo.game.cards.dto;

import com.jjrising.bingo.game.db.Prompt;

public record BingoSquareDto(
        String subject,
        String text,
        Prompt.Status status
) {
}
