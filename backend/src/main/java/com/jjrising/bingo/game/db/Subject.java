package com.jjrising.bingo.game.db;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Subject {

    @Id
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Type type;

    @OneToOne
    @JoinColumn(name = "player_id")
    private Player player;

    private String label;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    public enum Type {
        PLAYER,
        EXTERNAL,
    }
}
