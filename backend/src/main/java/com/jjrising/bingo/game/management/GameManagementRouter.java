package com.jjrising.bingo.game.management;

import com.jjrising.bingo.exceptions.InvalidGameException;
import com.jjrising.bingo.exceptions.InvalidOperation;
import com.jjrising.bingo.game.db.Game;
import com.jjrising.bingo.game.db.Player;
import com.jjrising.bingo.game.db.Subject;
import com.jjrising.bingo.game.management.dto.*;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/games")
@AllArgsConstructor
public class GameManagementRouter {

    private final GameManagementService gameManagementService;
    private final GameMapper gameMapper;
    private final PlayerMapper playerMapper;
    private final SubjectMapper subjectMapper;

    @GetMapping("")
    public List<GameDto> getGames() {
        List<Game> games = gameManagementService.getGames();
        return gameMapper.toDto(games);
    }

    @PostMapping("")
    public GameDto createGame(GameRequest gameRequest) {
        Game game = gameManagementService.createGame(gameRequest.name());
        return gameMapper.toDto(game);
    }

    @GetMapping("/{gameId}")
    public GameDto getGame(@PathVariable UUID gameId) {
        Game game = gameManagementService.getGame(gameId);
        return gameMapper.toDto(game);
    }

    @PostMapping("/{gameId}/publish")
    public GameDto publishGame(@PathVariable UUID gameId) throws InvalidGameException, InvalidOperation {
        Game game = gameManagementService.publishGame(gameId);
        return gameMapper.toDto(game);
    }

    @GetMapping("/{gameId}/players")
    public List<PlayerDto> getPlayers(@PathVariable UUID gameId) {
        Game game = gameManagementService.getGame(gameId);
        return playerMapper.toDto(game.getPlayers());
    }

    @PostMapping("/{gameId}/players")
    public PlayerDto addPlayer(@PathVariable UUID gameId, PlayerRequest playerRequest) throws InvalidOperation {
        Player player = gameManagementService.addPlayerToGame(gameId, playerRequest.displayName());
        return playerMapper.toDto(player);
    }

    @DeleteMapping("/{gameId}/players/{playerId}")
    public void deletePlayer(@PathVariable UUID gameId, @PathVariable UUID playerId) throws InvalidOperation {
        gameManagementService.removePlayer(gameId, playerId);
    }

    @GetMapping("/{gameId}/subjects")
    public List<SubjectDto> getSubjects(@PathVariable UUID gameId) {
        Game game = gameManagementService.getGame(gameId);
        return subjectMapper.toDto(game.getSubjects());
    }

    @PostMapping("/{gameId}/subjects")
    public SubjectDto addSubject(@PathVariable UUID gameId, SubjectRequest subjectRequest) throws InvalidOperation {
        Subject subject = gameManagementService.addNonPlayerSubject(gameId, subjectRequest.label());
        return subjectMapper.toDto(subject);
    }

    @DeleteMapping("/{gameId}/subjects/{subjectId}")
    public void deleteSubject(@PathVariable UUID gameId, @PathVariable UUID subjectId) throws InvalidOperation {
        gameManagementService.removeNonPlayerSubject(gameId, subjectId);
    }
}
