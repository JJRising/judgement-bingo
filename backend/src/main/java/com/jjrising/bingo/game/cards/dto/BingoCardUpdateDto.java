package com.jjrising.bingo.game.cards.dto;

import java.util.Map;
import java.util.UUID;

public record BingoCardUpdateDto(
        Map<Integer, UUID> prompts
) {
}
