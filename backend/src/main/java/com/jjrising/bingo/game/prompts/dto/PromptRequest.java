package com.jjrising.bingo.game.prompts.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record PromptRequest(
        UUID subject_id,
        @NotBlank String text
) {
}
