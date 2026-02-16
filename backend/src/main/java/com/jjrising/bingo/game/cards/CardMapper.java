package com.jjrising.bingo.game.cards;

import com.jjrising.bingo.game.cards.dto.BingoCardDto;
import com.jjrising.bingo.game.cards.dto.BingoSquareDto;
import com.jjrising.bingo.game.db.BingoCard;
import com.jjrising.bingo.game.db.BingoSquare;
import com.jjrising.bingo.game.db.Prompt;
import com.jjrising.bingo.game.db.Subject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CardMapper {

    @Mapping(target = "playerName", source = "player.displayName")
    @Mapping(target = "squares", source = "squares")
    BingoCardDto toDto(BingoCard bingoCard);

    @Mapping(target = "subject", expression = "java(resolveSubjectName(bingoSquare))")
    @Mapping(target = "status", source = "prompt.status")
    @Mapping(target = "text", source = "prompt.text")
    BingoSquareDto toDto(BingoSquare bingoSquare);

    List<BingoCardDto> toDto(List<BingoCard> bingoCards);

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
