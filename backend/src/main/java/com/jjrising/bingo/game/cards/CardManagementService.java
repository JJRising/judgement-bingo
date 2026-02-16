package com.jjrising.bingo.game.cards;

import com.jjrising.bingo.exceptions.InvalidOperation;
import com.jjrising.bingo.game.cards.dto.BingoCardUpdateDto;
import com.jjrising.bingo.game.db.*;
import com.jjrising.bingo.security.UserService;
import com.jjrising.bingo.security.db.AppUser;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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

    public BingoCard getMyCard(UUID gameId) {
        Game game = gameRepository.getReferenceById(gameId);
        AppUser user = userService.getAuthenticatedUser();
        Player mePlayer = game.getPlayers().stream()
                .filter(p -> p.getUser().equals(user)).findFirst()
                .orElseThrow();
        return mePlayer.getBingoCard();
    }

    public BingoCard updateMyCard(UUID gameId, BingoCardUpdateDto cardUpdate) throws InvalidOperation {
        Game game = gameRepository.getReferenceById(gameId);
        if (game.getStatus() != Game.Status.PROMPTS) {
            throw new InvalidOperation("Game is not in the prompts stage!");
        }
        // Check for duplicate prompt Ids
        Set<UUID> promptIds = new HashSet<>(cardUpdate.prompts().values());
        if (promptIds.size() != cardUpdate.prompts().size()) {
            throw new InvalidOperation("Can't use the same prompt twice.");
        }

        // Update the users card
        AppUser user = userService.getAuthenticatedUser();
        Player mePlayer = game.getPlayers().stream()
                .filter(p -> p.getUser().equals(user)).findFirst()
                .orElseThrow();
        BingoCard myCard = mePlayer.getBingoCard();
        Map<Integer, BingoSquare> squareMap = myCard.getSquares();
        squareMap.keySet().removeIf(idx -> !cardUpdate.prompts().containsKey(idx));
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
