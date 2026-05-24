import {Component, inject, input, signal, effect} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {GamesService} from '@features/games/games.service';
import {GameModel} from '@shared/models';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-game-details',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSuffix,
    MatDatepickerModule,
    MatButtonModule,
  ],
  templateUrl: './game-details.html',
  styleUrl: './game-details.css',
})
export class GameDetails {
  private readonly fb = inject(FormBuilder);
  private readonly gamesService = inject(GamesService);

  readonly gameId = input.required<string>();
  readonly game = signal<GameModel | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    sessionDates: this.fb.group({
      sessionStartDate: [null as Date | null, Validators.required],
      sessionEndDate: [null as Date | null, Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      const id = this.gameId();
      if (id) {
        this.gamesService.getGame(id).subscribe(g => {
          this.game.set(g);
          this.form.patchValue({
            name: g.name,
            sessionDates: {
              sessionStartDate: g.sessionStartDate,
              sessionEndDate: g.sessionEndDate,
            },
          });
        });
      }
    });
  }

  async onSave() {
    if (this.form.valid && this.gameId()) {
      const {name, sessionDates} = this.form.value;
      await this.gamesService.updateGame(this.gameId(), {
        name: name!,
        sessionStartDate: sessionDates!.sessionStartDate!,
        sessionEndDate: sessionDates!.sessionEndDate!,
      });
    }
  }
}
