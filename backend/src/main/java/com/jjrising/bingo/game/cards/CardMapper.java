package com.jjrising.bingo.game.cards;

import com.jjrising.bingo.game.cards.dto.BingoCardDto;
import com.jjrising.bingo.game.cards.dto.BingoSquareDto;
import com.jjrising.bingo.game.db.*;
import com.jjrising.bingo.game.prompts.dto.PromptDto;
import com.jjrising.bingo.security.db.AppUser;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CardMapper {

    @Mapping(target = "playerName", source = "player.displayName")
    @Mapping(target = "squares", source = "squares")
    BingoCardDto toDto(BingoCard bingoCard, @Context AppUser user);

    @Mapping(target = "subject", expression = "java(resolveSubjectName(bingoSquare))")
    @Mapping(target = "status", source = "prompt.status")
    @Mapping(target = "text", source = "prompt.text")
    @Mapping(target = "promptId", source = "prompt.id")
    BingoSquareDto toDto(BingoSquare bingoSquare, @Context AppUser user);

    @AfterMapping
    default void obfuscateIfNeeded(BingoSquare bingoSquare,
                                   @MappingTarget BingoSquareDto dto,
                                   @Context AppUser user) {
        Player player = bingoSquare.getPrompt().getSubject().getPlayer();
        if (player != null && player.getUser().equals(user)) {
            dto.setText("---");
        }
    }

    List<BingoCardDto> toDto(List<BingoCard> bingoCards, @Context AppUser user);

    default String resolveSubjectName(BingoSquare bingoSquare) {
        if (bingoSquare == null
                || bingoSquare.getPrompt() == null
                || bingoSquare.getPrompt().getSubject() == null
                || bingoSquare.getPrompt().getSubject().getType() == null) {
            return null;
        }

        Subject subject = bingoSquare.getPrompt().getSubject();

        return switch (subject.getType()) {
            case EXTERNAL -> subject.getLabel();
            case PLAYER -> subject.getPlayer().getDisplayName() != null
                    ? subject.getPlayer().getDisplayName()
                    : subject.getPlayer().getUser().getInviteName();
        };
    }
}
