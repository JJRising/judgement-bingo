package com.jjrising.bingo.game.cards.dto;

import com.jjrising.bingo.game.db.Prompt;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BingoSquareDto {
    private String subject;
    private String text;
    private String status;
    private UUID promptId;
}
