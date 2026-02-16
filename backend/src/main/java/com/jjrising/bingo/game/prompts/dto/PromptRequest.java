package com.jjrising.bingo.game.prompts.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record PromptRequest(
        UUID subjectId,
        @NotBlank String text
) {
}
