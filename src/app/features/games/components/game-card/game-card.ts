import {Component, Input} from '@angular/core';
import {DatePipe} from "@angular/common";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {RouterLink} from "@angular/router";
import {GameModel} from "@shared/models";

@Component({
    selector: 'app-game-card',
    imports: [
        MatCard,
        RouterLink,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        DatePipe,
    ],
    templateUrl: './game-card.html',
    styleUrl: './game-card.css',
})
export class GameCard {
    @Input({required: true}) game!: GameModel;
}
