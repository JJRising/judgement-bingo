package com.jjrising.bingo.game.cards;

import com.jjrising.bingo.exceptions.InvalidOperation;
import com.jjrising.bingo.game.cards.dto.BingoCardDto;
import com.jjrising.bingo.game.cards.dto.BingoCardUpdateDto;
import com.jjrising.bingo.game.db.BingoCard;
import com.jjrising.bingo.security.UserService;
import com.jjrising.bingo.security.db.AppUser;
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
    private final UserService userService;
    private final CardMapper cardMapper;

    @GetMapping("")
    @PreAuthorize("hasRole('END_USER')")
    public List<BingoCardDto> getCards(@PathVariable UUID gameId) {
        List<BingoCard> cards = cardManagementService.getCardsForGame(gameId);
        AppUser user = userService.getAuthenticatedUser();
        return cardMapper.toDto(cards, user);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('END_USER')")
    public BingoCardDto getMyCard(@PathVariable UUID gameId) {
        BingoCard card = cardManagementService.getMyCard(gameId);
        AppUser user = userService.getAuthenticatedUser();
        return cardMapper.toDto(card, user);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('END_USER')")
    public BingoCardDto updateMyCard(
            @PathVariable UUID gameId,
            @RequestBody BingoCardUpdateDto cardUpdate
    ) throws InvalidOperation {
        BingoCard card = cardManagementService.updateMyCard(gameId, cardUpdate);
        AppUser user = userService.getAuthenticatedUser();
        return cardMapper.toDto(card, user);
    }
}
