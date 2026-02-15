package com.jjrising.bingo.game.prompts.dto;


import java.util.UUID;

public record PromptDto(
        UUID id,
        UUID subject_id,
        String subject_name,
        String text
) {
}
