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
public class BingoSquare {

    @Id
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private BingoCard bingoCard;

    @Column(nullable = false)
    private int idx;

    @ManyToOne
    @JoinColumn(name = "prompt_id", nullable = false)
    private Prompt prompt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}
