package com.jjrising.bingo.game.management;

import com.jjrising.bingo.game.db.Subject;
import com.jjrising.bingo.game.management.dto.SubjectDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.List;

@Mapper
public interface SubjectMapper {

    @Mapping(target = "type", source = "type")
    @Mapping(target = "displayName", expression = "java(resolveDisplayName(subject))")
    SubjectDto toDto(Subject subject);

    List<SubjectDto> toDto(Collection<Subject> subjects);

    default String resolveDisplayName(Subject subject) {
        if (subject == null || subject.getType() == null) {
            return null;
        }

        return switch (subject.getType()) {
            case EXTERNAL -> subject.getLabel();
            case PLAYER -> subject.getPlayer() != null
                    ? subject.getPlayer().getDisplayName()
                    : null;
        };
    }
}
