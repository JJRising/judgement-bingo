package com.jjrising.bingo.game.prompts;

import com.jjrising.bingo.exceptions.InvalidOperation;
import com.jjrising.bingo.game.db.Prompt;
import com.jjrising.bingo.game.prompts.dto.PromptDto;
import com.jjrising.bingo.game.prompts.dto.PromptRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/v1/games/{gameId}/prompts")
@AllArgsConstructor
public class PromptManagementRouter {

    private final PromptManagementService promptManagementService;
    private final PromptMapper promptMapper;

    @GetMapping("")
    @PreAuthorize("hasRole('END_USER')")
    public List<PromptDto> getPrompts(@PathVariable UUID gameId) {
        List<Prompt> prompts = promptManagementService.getPromptsForGame(gameId);
        return promptMapper.toDto(prompts);
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public PromptDto createPrompt(
            @PathVariable UUID gameId,
            @RequestBody @Valid PromptRequest promptRequest
    ) throws InvalidOperation {
        Prompt prompt = promptManagementService.createPrompt(gameId, promptRequest);
        return promptMapper.toDto(prompt);
    }

    @DeleteMapping("/{promptId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePrompt(
            @PathVariable UUID gameId,
            @PathVariable UUID promptId
    ) {
        promptManagementService.deletePrompt(promptId);
    }
}
