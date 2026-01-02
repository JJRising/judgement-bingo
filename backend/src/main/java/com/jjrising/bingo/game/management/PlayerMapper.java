package com.jjrising.bingo.game.management;

import com.jjrising.bingo.game.db.Player;
import com.jjrising.bingo.game.management.dto.PlayerDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collection;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PlayerMapper {

    @Mapping(target = "displayName", source = "player", qualifiedByName = "resolveDisplayName")
    @Mapping(target = "userId", source = "user.id")
    PlayerDto toDto(Player player);

    List<PlayerDto> toDto(Collection<Player> players);

    @Named("resolveDisplayName")
    default String resolveDisplayName(Player player) {
        if (player.getDisplayName() != null && !player.getDisplayName().isBlank()) {
            return player.getDisplayName();
        }
        return player.getUser().getInviteName();
    }
}
