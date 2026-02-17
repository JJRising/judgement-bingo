package com.jjrising.bingo.security.db;

import com.jjrising.bingo.security.auth.IdentityProviderType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppUser {

    @Id
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "identity_provider")
    @Enumerated(EnumType.STRING)
    private IdentityProviderType identityProviderType;

    @Column
    private String externalSubjectId;

    @Column(nullable = false)
    private String inviteName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private Instant created_at;

    private Instant disabled_at;

    private Boolean isAdmin;

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
