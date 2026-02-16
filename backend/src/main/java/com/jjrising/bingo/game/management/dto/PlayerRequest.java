package com.jjrising.bingo.game.management.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PlayerRequest(
        @NotNull UUID userId,
        @NotNull String displayName
) {
}
