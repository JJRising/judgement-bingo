package com.jjrising.bingo.game.cards;

import com.jjrising.bingo.exceptions.InvalidOperation;
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

    @GetMapping("/me")
    @PreAuthorize("hasRole('END_USER')")
    public BingoCardDto getMyCard(@PathVariable UUID gameId) {
        BingoCard card = cardManagementService.getMyCard(gameId);
        return cardMapper.toDto(card);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('END_USER')")
    public BingoCardDto updateMyCard(
            @PathVariable UUID gameId,
            @RequestBody BingoCardUpdateDto cardUpdate
    ) throws InvalidOperation {
        BingoCard bingoCard = cardManagementService.updateMyCard(gameId, cardUpdate);
        return cardMapper.toDto(bingoCard);
    }
}
