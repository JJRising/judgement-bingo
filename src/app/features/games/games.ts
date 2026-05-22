import {Component, computed, inject, signal} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {GameCard} from "@features/games/components/game-card/game-card";
import {GameModel} from "@shared/models";
import {FormsModule} from "@angular/forms";
import {MatFabButton} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {NewGameDialog} from "@features/games/components/new-game-dialog/new-game-dialog";
import {GamesService} from "@features/games/games.service";

@Component({
  selector: 'app-games',
    imports: [
        MatFormField,
        MatLabel,
        MatIcon,
        GameCard,
        FormsModule,
        MatInput,
        MatFabButton
    ],
  templateUrl: './games.html',
  styleUrl: './games.css',
})
export class Games {
    private readonly dialog = inject(MatDialog);
    private readonly gamesService = inject(GamesService);

    games = signal<GameModel[]>([]);

    searchQuery = signal('');

    filteredGames = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        if (!query) return this.games();

        return this.games().filter(game =>
            game.name.toLowerCase().includes(query)
        );
    });

    constructor() {
        this.gamesService.getGames().subscribe(games => this.games.set(games));
    }

    onSearchChange(value: string) {
        this.searchQuery.set(value);
    }

    openNewGameDialog() {
        const ref = this.dialog.open(NewGameDialog);
        ref.afterClosed().subscribe(result => {
            if (result) {
                this.gamesService.createGame(result);
            }
        });
    }
}
