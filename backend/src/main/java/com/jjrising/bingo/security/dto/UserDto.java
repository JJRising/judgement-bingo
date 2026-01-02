package com.jjrising.bingo.security.dto;

import java.time.Instant;
import java.util.UUID;

public record UserDto(
        UUID id,
        String inviteName,
        String email,
        Instant created_at,
        boolean has_logged_in
) {
}
