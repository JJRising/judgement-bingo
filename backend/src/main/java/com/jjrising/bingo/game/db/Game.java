package com.jjrising.bingo.game.db;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Game {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(nullable = false)
    private Instant created_at;

    private Instant game_phase_start_at;

    private Instant game_closed_at;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (created_at == null) {
            created_at = Instant.now();
        }
    }

    public enum Status {
        SETUP,
        PROMPTS,
        GAME,
        COMPLETE,
    }
}
