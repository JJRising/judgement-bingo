package com.jjrising.bingo.game.management;

import com.jjrising.bingo.game.db.Player;
import com.jjrising.bingo.game.management.dto.PlayerDto;
import org.mapstruct.Mapper;

import java.util.Collection;
import java.util.List;

@Mapper
public interface PlayerMapper {

    PlayerDto toDto(Player player);

    List<PlayerDto> toDto(Collection<Player> players);
}
