package com.jjrising.bingo.game.db;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BingoCard {

    @Id
    @Column(name = "player_id", nullable = false, updatable = false)
    private UUID playerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "playerId", nullable = false)
    private Player player;
}
