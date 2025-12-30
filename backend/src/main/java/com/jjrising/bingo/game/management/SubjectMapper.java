package com.jjrising.bingo.game.management;

import com.jjrising.bingo.game.db.Subject;
import com.jjrising.bingo.game.management.dto.SubjectDto;
import org.mapstruct.Mapper;

import java.util.Collection;
import java.util.List;

@Mapper
public interface SubjectMapper {

    SubjectDto toDto(Subject subject);

    List<SubjectDto> toDto(Collection<Subject> subjects);
}
