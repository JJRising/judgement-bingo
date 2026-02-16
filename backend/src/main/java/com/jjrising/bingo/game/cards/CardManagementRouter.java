package com.jjrising.bingo.game.cards;

import com.jjrising.bingo.game.cards.dto.BingoCardDto;
import com.jjrising.bingo.game.cards.dto.BingoCardUpdateDto;
import com.jjrising.bingo.game.db.BingoCard;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/games/{gameId}/cards")
@AllArgsConstructor
public class CardManagementRouter {

    private final CardManagementService cardManagementService;
    private final CardMapper cardMapper;

    @GetMapping("")
    @PreAuthorize("hasRole('END_USER')")
    public List<BingoCardDto> getCards(@PathVariable UUID gameId) {
        List<BingoCard> cards = cardManagementService.getCardsForGame(gameId);
        // TODO filter prompts about you
        return cardMapper.toDto(cards);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('END_USER')")
    public BingoCardDto updateCard(
            @PathVariable UUID gameId,
            @RequestBody BingoCardUpdateDto cardUpdate
    ) {
        BingoCard bingoCard = cardManagementService.updateMyCard(gameId, cardUpdate);
        return cardMapper.toDto(bingoCard);
    }
}
