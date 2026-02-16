package com.jjrising.bingo.game.prompts.dto;


import java.util.UUID;

public record PromptDto(
        UUID id,
        UUID subjectId,
        String subjectName,
        String text,
        UUID createdBy,
        String createdByName,
        UUID approvedBy,
        String approvedByName
) {
}
