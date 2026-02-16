package com.jjrising.bingo.game.prompts;

import com.jjrising.bingo.game.db.Prompt;
import com.jjrising.bingo.game.prompts.dto.PromptDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PromptMapper {

    @Mapping(target = "subjectId", source = "subject.id")
    @Mapping(target = "subjectName", source = "subject.label")
    @Mapping(target = "text", source = "revealedText")
    @Mapping(target = "createdBy", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.displayName")
    @Mapping(target = "approvedBy", source = "approvedBy.id")
    @Mapping(target = "approvedByName", source = "approvedBy.displayName")
    PromptDto toDto(Prompt prompt);

    List<PromptDto> toDto(Collection<Prompt> prompts);
}
