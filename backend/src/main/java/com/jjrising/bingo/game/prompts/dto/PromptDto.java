package com.jjrising.bingo.game.prompts.dto;


import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PromptDto {
    private UUID id;
    private UUID subjectId;
    private String subjectName;
    private String text;
    private String status;
    private UUID createdBy;
    private String createdByName;
    private UUID approvedBy;
    private String approvedByName;
    private UUID completedBy;
    private String completedByName;
    private UUID acknowledgedBy;
    private String acknowledgedByName;
}
