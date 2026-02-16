package com.jjrising.bingo.game.cards;

import com.jjrising.bingo.exceptions.InvalidOperation;
import com.jjrising.bingo.game.cards.dto.BingoCardUpdateDto;
import com.jjrising.bingo.game.db.*;
import com.jjrising.bingo.security.UserService;
import com.jjrising.bingo.security.db.AppUser;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CardManagementService {

    private final BingoCardRepository bingoCardRepository;
    private final GameRepository gameRepository;
    private final PromptRepository promptRepository;
    private final UserService userService;

    public List<BingoCard> getCardsForGame(UUID gameId) {
        return bingoCardRepository.findAllByPlayer_Game_Id(gameId);
    }

    public BingoCard updateMyCard(UUID gameId, BingoCardUpdateDto cardUpdate) throws InvalidOperation {
        Game game = gameRepository.getReferenceById(gameId);
        if (game.getStatus() != Game.Status.PROMPTS) {
            throw new InvalidOperation("Game is not in the prompts stage!");
        }
        AppUser user = userService.getAuthenticatedUser();
        Player mePlayer = game.getPlayers().stream()
                .filter(p -> p.getUser().equals(user)).findFirst()
                .orElseThrow();
        BingoCard myCard = mePlayer.getBingoCard();
        Map<Integer, BingoSquare> squareMap = myCard.getSquares();
        for (Map.Entry<Integer, UUID> update : cardUpdate.prompts().entrySet()) {
            Prompt prompt = promptRepository.getReferenceById(update.getValue());
            BingoSquare square = squareMap.getOrDefault(
                    update.getKey(),
                    BingoSquare.builder().bingoCard(myCard).idx(update.getKey()).build()
            );
            square.setPrompt(prompt);
            squareMap.put(update.getKey(), square);
        }
        myCard.setSquares(squareMap);
        return bingoCardRepository.save(myCard);
    }
}
