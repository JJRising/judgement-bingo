package com.jjrising.bingo.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserRequest(
        @NotBlank String inviteName,
        @Email String email
) {
}
