package com.jjrising.bingo.game.prompts;

import com.jjrising.bingo.exceptions.InvalidOperation;
import com.jjrising.bingo.game.db.*;
import com.jjrising.bingo.game.management.GameManagementService;
import com.jjrising.bingo.game.prompts.dto.PromptRequest;
import com.jjrising.bingo.security.UserService;
import com.jjrising.bingo.security.db.AppUser;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

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
        AppUser user = userService.getAuthenticatedUser();
        return game.getPrompts().stream()
                .filter(prompt -> prompt.getSubject().getPlayer() == null
                        || !prompt.getSubject().getPlayer().getUser().equals(user))
                .toList();
    }

    public Prompt createPrompt(UUID gameId, PromptRequest promptRequest) throws InvalidOperation {
        Game game = gameManagementService.getGame(gameId);
        if (game.getStatus() != Game.Status.PROMPTS) {
            throw new InvalidOperation("Game is not in the prompts stage!");
        }
        AppUser user = userService.getAuthenticatedUser();
        Subject subject = subjectRepository.getReferenceById(promptRequest.subject_id());
        if (subject.getPlayer() != null && subject.getPlayer().getUser().equals(user)) {
            throw new IllegalArgumentException("Can't create a prompt about yourself.");
        }
        Prompt prompt = Prompt.builder()
                .game(game)
                .status(Prompt.Status.SUBMITTED)
                .subject(subject)
                .build();
        return promptRepository.save(prompt);
    }

    public void deletePrompt(UUID promptId) {
        promptRepository.deleteById(promptId);
    }
}
