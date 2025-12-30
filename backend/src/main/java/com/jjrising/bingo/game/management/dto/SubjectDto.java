package com.jjrising.bingo.game.management.dto;

import java.util.UUID;

public record SubjectDto(
        UUID id,
        String type,
        String displayName
) {
}
