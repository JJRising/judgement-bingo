package com.jjrising.bingo.game.management.dto;

import jakarta.validation.constraints.NotBlank;

public record GameRequest(
        @NotBlank String name
) {
}
