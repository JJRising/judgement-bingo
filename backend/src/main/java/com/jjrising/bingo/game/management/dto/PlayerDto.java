package com.jjrising.bingo.game.management.dto;

import java.util.UUID;

public record PlayerDto(
        UUID id,
        UUID userId,
        String displayName
) {
}
