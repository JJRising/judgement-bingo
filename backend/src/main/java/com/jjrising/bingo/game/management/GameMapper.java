package com.jjrising.bingo.game.management;

import com.jjrising.bingo.game.db.Game;
import com.jjrising.bingo.game.db.Player;
import com.jjrising.bingo.game.management.dto.GameDto;
import com.jjrising.bingo.game.management.dto.PlayerDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.List;

@Mapper(componentModel = "spring")
public interface GameMapper {

    @Mapping(target = "status", source = "status")
    @Mapping(target = "playerCount", expression = "java(game.getPlayers().size())")
    GameDto toDto(Game game);

    List<GameDto> toDto(Collection<Game> games);
}
