package com.jjrising.bingo.game.prompts;

import com.jjrising.bingo.game.db.Prompt;
import com.jjrising.bingo.game.prompts.dto.PromptDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PromptMapper {

    @Mapping(target = "subject_id", source = "subject.id")
    @Mapping(target = "subject_name", source = "subject.label")
    @Mapping(target = "text", source = "revealedText")
    PromptDto toDto(Prompt prompt);

    List<PromptDto> toDto(Collection<Prompt> prompts);
}
