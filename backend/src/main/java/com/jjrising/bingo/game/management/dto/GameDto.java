package com.jjrising.bingo.game.management.dto;

import java.time.Instant;
import java.util.UUID;

public record GameDto(
        UUID id,
        String name,
        String status,
        Instant createdAt,
        Instant gamePhaseStartAt,
        Instant gameClosedAt,
        int playerCount
) {
}
