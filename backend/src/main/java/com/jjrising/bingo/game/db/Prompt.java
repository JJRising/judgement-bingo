package com.jjrising.bingo.game.db;

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

    private String text;

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

    @ManyToOne
    @JoinColumn(name = "completed_by")
    private Player completedBy;

    @Column
    private Instant completedAt;

    @ManyToOne
    @JoinColumn(name = "acknowledged_by")
    private Player acknowledgedBy;

    @Column
    private Instant acknowledgedAt;

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
        COMPLETED,
        ACKNOWLEDGED,
    }
}
