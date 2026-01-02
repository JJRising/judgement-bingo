package com.jjrising.bingo.security.db;

import com.jjrising.bingo.security.IdentityProviderType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppUser {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "identity_provider", nullable = false)
    @Enumerated(EnumType.STRING)
    private IdentityProviderType identityProviderType;

    @Column(nullable = false)
    private String externalSubjectId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(nullable = false)
    private Instant created_at;

    private Instant disabled_at;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (created_at == null) {
            created_at = Instant.now();
        }
    }
}
