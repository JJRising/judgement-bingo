package com.jjrising.bingo.game.prompts;

import com.jjrising.bingo.exceptions.InvalidOperation;
import com.jjrising.bingo.game.db.*;
import com.jjrising.bingo.game.management.GameManagementService;
import com.jjrising.bingo.game.prompts.dto.PromptRequest;
import com.jjrising.bingo.security.UserService;
import com.jjrising.bingo.security.db.AppUser;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class PromptManagementService {

    private final GameManagementService gameManagementService;
    private final UserService userService;
    private final PromptRepository promptRepository;
    private final SubjectRepository subjectRepository;

    public List<Prompt> getPromptsForGame(UUID gameId) {
        Game game = gameManagementService.getGame(gameId);
        return game.getPrompts().stream().toList();
    }

    public Prompt createPrompt(UUID gameId, PromptRequest promptRequest) throws InvalidOperation {
        Game game = gameManagementService.getGame(gameId);
        if (game.getStatus() != Game.Status.PROMPTS) {
            throw new InvalidOperation("Game is not in the prompts stage!");
        }
        AppUser user = userService.getAuthenticatedUser();
        Player player = game.getPlayers().stream().filter(p -> p.getUser().equals(user)).findFirst().orElseThrow();
        Subject subject = subjectRepository.getReferenceById(promptRequest.subjectId());
        if (subject.getPlayer() != null && subject.getPlayer().equals(player)) {
            throw new IllegalArgumentException("Can't create a prompt about yourself.");
        }
        Prompt prompt = Prompt.builder()
                .game(game)
                .status(Prompt.Status.SUBMITTED)
                .subject(subject)
                .text(promptRequest.text())
                .createdBy(player)
                .createdAt(Instant.now())
                .build();
        return promptRepository.save(prompt);
    }

    public void approvePrompt(UUID gameId, UUID promptId) throws InvalidOperation {
        Game game = gameManagementService.getGame(gameId);
        if (game.getStatus() != Game.Status.PROMPTS) {
            throw new InvalidOperation("Game is not in the prompts stage!");
        }
        AppUser user = userService.getAuthenticatedUser();
        Player player = game.getPlayers().stream().filter(p -> p.getUser().equals(user)).findFirst().orElseThrow();
        Prompt prompt = promptRepository.getReferenceById(promptId);
        if (prompt.getCreatedBy().equals(player)) {
            throw new InvalidOperation("Can't approve your own prompt");
        }
        if (prompt.getStatus() == Prompt.Status.SUBMITTED) {
            prompt.setStatus(Prompt.Status.ACCEPTED);
            prompt.setApprovedBy(player);
            prompt.setApprovedAt(Instant.now());
            promptRepository.save(prompt);
        }
    }

    public void completePrompt(UUID gameId, UUID promptId) throws InvalidOperation {
        Game game = gameManagementService.getGame(gameId);
        if (game.getStatus() != Game.Status.GAME) {
            throw new InvalidOperation("Game is not in the Game stage!");
        }
        AppUser user = userService.getAuthenticatedUser();
        Player player = game.getPlayers().stream().filter(p -> p.getUser().equals(user)).findFirst().orElseThrow();
        Prompt prompt = promptRepository.getReferenceById(promptId);
        if (prompt.getStatus() == Prompt.Status.ACCEPTED) {
            prompt.setStatus(Prompt.Status.COMPLETED);
            prompt.setCompletedBy(player);
            prompt.setCompletedAt(Instant.now());
            promptRepository.save(prompt);
        }
    }

    public void incompletePrompt(UUID gameId, UUID promptId) throws InvalidOperation {
        Game game = gameManagementService.getGame(gameId);
        if (game.getStatus() != Game.Status.GAME) {
            throw new InvalidOperation("Game is not in the Game stage!");
        }
        AppUser user = userService.getAuthenticatedUser();
        Player player = game.getPlayers().stream().filter(p -> p.getUser().equals(user)).findFirst().orElseThrow();
        Prompt prompt = promptRepository.getReferenceById(promptId);
        if (!prompt.getCompletedBy().equals(player)) {
            throw new InvalidOperation("Can't incomplete a prompt you didn't completed");
        }
        if (prompt.getStatus() == Prompt.Status.COMPLETED) {
            prompt.setStatus(Prompt.Status.ACCEPTED);
            prompt.setCompletedBy(null);
            prompt.setCompletedAt(null);
            promptRepository.save(prompt);
        }
    }

    public void acknowledgePrompt(UUID gameId, UUID promptId) throws InvalidOperation {
        Game game = gameManagementService.getGame(gameId);
        if (game.getStatus() != Game.Status.GAME) {
            throw new InvalidOperation("Game is not in the Game stage!");
        }
        AppUser user = userService.getAuthenticatedUser();
        Player player = game.getPlayers().stream().filter(p -> p.getUser().equals(user)).findFirst().orElseThrow();
        Prompt prompt = promptRepository.getReferenceById(promptId);
        if (prompt.getCompletedBy().equals(player)) {
            throw new InvalidOperation("Can't acknowledge a prompt you completed");
        }
        if (prompt.getStatus() == Prompt.Status.COMPLETED) {
            prompt.setStatus(Prompt.Status.ACKNOWLEDGED);
            prompt.setAcknowledgedBy(player);
            prompt.setAcknowledgedAt(Instant.now());
            promptRepository.save(prompt);
        }
    }

    public void deletePrompt(UUID promptId) {
        promptRepository.deleteById(promptId);
    }
}
