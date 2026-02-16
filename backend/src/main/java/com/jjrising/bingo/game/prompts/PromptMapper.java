package com.jjrising.bingo.game.prompts;

import com.jjrising.bingo.game.db.Prompt;
import com.jjrising.bingo.game.db.Subject;
import com.jjrising.bingo.game.prompts.dto.PromptDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PromptMapper {

    @Mapping(target = "subjectId", source = "subject.id")
    @Mapping(target = "subjectName", expression = "java(resolveSubjectName(prompt))")
    @Mapping(target = "text", source = "text")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createdBy", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.displayName")
    @Mapping(target = "approvedBy", source = "approvedBy.id")
    @Mapping(target = "approvedByName", source = "approvedBy.displayName")
    PromptDto toDto(Prompt prompt);

    List<PromptDto> toDto(Collection<Prompt> prompts);

    default String resolveSubjectName(Prompt prompt) {
        if (prompt == null || prompt.getSubject() == null || prompt.getSubject().getType() == null) {
            return null;
        }

        Subject subject = prompt.getSubject();

        return switch (subject.getType()) {
            case EXTERNAL -> subject.getLabel();
            case PLAYER -> subject.getPlayer().getDisplayName() != null
                    ? subject.getPlayer().getDisplayName()
                    : subject.getPlayer().getUser().getInviteName();
        };
    }
}
