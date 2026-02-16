package com.jjrising.bingo.game.cards;

import com.jjrising.bingo.game.cards.dto.BingoCardDto;
import com.jjrising.bingo.game.cards.dto.BingoSquareDto;
import com.jjrising.bingo.game.db.BingoCard;
import com.jjrising.bingo.game.db.BingoSquare;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CardMapper {

    BingoCardDto toDto(BingoCard bingoCard);

    BingoSquareDto toDto(BingoSquare bingoSquare);

    List<BingoCardDto> toDto(List<BingoCard> bingoCards);
}
