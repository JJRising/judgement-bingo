package com.jjrising.bingo.game.db;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BingoCardRepository extends JpaRepository<BingoCard, UUID> {

    List<BingoCard> findAllByPlayer_Game_Id(UUID playerGameId);
}
