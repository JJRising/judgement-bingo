package com.jjrising.bingo.game.management;

import com.jjrising.bingo.encryption.KeyHierarchyBuilder;
import com.jjrising.bingo.encryption.KeyHierarchyTree;
import com.jjrising.bingo.exceptions.InvalidGameException;
import com.jjrising.bingo.exceptions.InvalidOperation;
import com.jjrising.bingo.game.db.*;
import com.jjrising.bingo.security.UserService;
import com.jjrising.bingo.security.db.AppUser;
import com.jjrising.bingo.security.db.AppUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class GameManagementService {

    private final GameRepository gameRepository;
    private final AppUserRepository appUserRepository;
    private final UserService userService;

    public Game createGame(String name) {
        Game game = Game.builder().name(name).status(Game.Status.SETUP).build();
        return gameRepository.save(game);
    }

    public List<Game> getGames() {
        return gameRepository.findAll(Sort.by("createdAt"));
    }

    public Game getGame(UUID gameId) {
        return gameRepository.getReferenceById(gameId);
    }

    public Player addPlayerToGame(UUID gameId, UUID userId, String displayName) throws InvalidOperation {
        Game game = getGameForSetup(gameId);
        AppUser appUser = appUserRepository.getReferenceById(userId);
        Player player = Player.builder().game(game).user(appUser).displayName(displayName).build();
        game.getPlayers().add(player);

        // All players are also subjects
        Subject subject = Subject.builder().game(game).type(Subject.Type.PLAYER).player(player).build();
        game.getSubjects().add(subject);
        game = gameRepository.save(game);

        // We'll have to go fetch the new persisted model to return with the new id
        player = game.getPlayers().stream().filter(p -> p.getUser().getId().equals(userId)).findFirst().orElseThrow();

        // Create a bingo card for the player
        BingoCard bingoCard = BingoCard.builder().playerId(player.getId()).player(player).build();
        player.setBingoCard(bingoCard);
        gameRepository.save(game);
        return player;
    }

    public void removePlayer(UUID gameId, UUID playerId) throws InvalidOperation {
        Game game = getGameForSetup(gameId);
        Optional<Player> player = game.getPlayers().stream().filter(p -> p.getId().equals(playerId)).findFirst();
        player.ifPresent(value -> game.getPlayers().remove(value));
        gameRepository.save(game);
    }

    public Subject addNonPlayerSubject(UUID gameId, String subjectLabel) throws InvalidOperation {
        Game game = getGameForSetup(gameId);
        Subject subject = Subject.builder().game(game).type(Subject.Type.EXTERNAL).label(subjectLabel).build();
        game.getSubjects().add(subject);
        gameRepository.save(game);
        return subject;
    }

    public void removeNonPlayerSubject(UUID gameId, UUID subjectId) throws InvalidOperation {
        Game game = getGameForSetup(gameId);
        Optional<Subject> subject = game.getSubjects().stream().filter(s -> s.getId().equals(subjectId)).findFirst();
        if (subject.isPresent()) {
            if (subject.get().getType().equals(Subject.Type.PLAYER)) {
                throw new InvalidOperation("All players must remain subjects");
            } else {
                game.getSubjects().remove(subject.get());
            }
        }
        gameRepository.save(game);
    }

    public Game publishGame(UUID gameId) throws InvalidGameException, InvalidOperation {
        Game game = getGameForSetup(gameId);
        if (game.getStatus() != Game.Status.SETUP) {
            throw new InvalidGameException("Invalid game state");
        }
        if (game.getPlayers().size() < 2) {
            throw new InvalidGameException("A valid game must have at least 2 players");
        }

        // Build a hierarchy for the LKH Tree
        List<UUID> playerIds = game.getPlayers().stream().map(Player::getId).sorted().toList();
        KeyHierarchyTree hierarchyTree = KeyHierarchyBuilder.build(playerIds);
        KeyHierarchy keyHierarchy = KeyHierarchy.builder().game(game).tree(hierarchyTree).build();
        game.setKeyHierarchy(keyHierarchy);

        game.setStatus(Game.Status.PROMPTS);
        return gameRepository.save(game);
    }

    public Game startGame(UUID gameId) throws InvalidGameException {
        Game game = gameRepository.getReferenceById(gameId);
        if (game.getStatus() != Game.Status.PROMPTS) {
            throw new InvalidGameException("Invalid game state");
        }
        for (Player player : game.getPlayers()) {
            BingoCard card = player.getBingoCard();
            if (card.getSquares().size() != 24) {
                throw new InvalidGameException("BingoCards not filled");
            }
            for (Prompt prompt : card.getSquares().values().stream().map(BingoSquare::getPrompt).toList()) {
                if (prompt.getStatus() != Prompt.Status.ACCEPTED) {
                    throw new InvalidGameException("BingoCard has unaccepted prompts");
                }
            }
        }
        game.setStatus(Game.Status.GAME);
        return gameRepository.save(game);
    }

    private Game getGameForSetup(UUID gameId) throws InvalidOperation {
        Game game = gameRepository.getReferenceById(gameId);
        if (!game.getStatus().equals(Game.Status.SETUP)) {
            throw new InvalidOperation("Game has already advanced past Setup phase");
        }
        return game;
    }

    public Player getMyPlayer(UUID gameId) {
        Game game = gameRepository.getReferenceById(gameId);
        AppUser user = userService.getAuthenticatedUser();
        return game.getPlayers().stream().filter(p -> p.getUser().equals(user)).findFirst().orElseThrow();
    }
}
