package com.jjrising.bingo.security;

import com.jjrising.bingo.security.db.AppUser;
import com.jjrising.bingo.security.dto.UserDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "has_logged_in", expression = "java(appUser.getExternalSubjectId() != null)")
    UserDto toDto(AppUser appUser);

    List<UserDto> toDto(List<AppUser> appUsers);
}
