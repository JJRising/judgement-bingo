package com.jjrising.bingo.game.db;

import com.jjrising.bingo.encryption.EncryptionManifest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Prompt {

    @Id
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Lob
    @Column(nullable = false)
    private byte[] ciphertext;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "encryption_manifest")
    private EncryptionManifest encryptionManifest;

    private String revealedText;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private Player createdBy;

    @Column(nullable = false)
    private Instant createdAt;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Player approvedBy;

    @Column
    private Instant approvedAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public enum Status {
        SUBMITTED,
        ACCEPTED,
        REVEALED,
    }
}
