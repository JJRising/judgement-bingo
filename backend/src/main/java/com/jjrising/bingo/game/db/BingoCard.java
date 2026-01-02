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
public class BingoCard {

    @Id
    @Column(name = "player_id", nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID playerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "playerId", nullable = false)
    private Player player;
}
