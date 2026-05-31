import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GameDetails} from './game-details/game-details';
import {PlayerList} from './player-list/player-list';
import {SubjectList} from './subject-list/subject-list';

@Component({
  selector: 'app-admin',
  imports: [GameDetails, PlayerList, SubjectList],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private readonly route = inject(ActivatedRoute);

  readonly gameId = signal<string>('');

  constructor() {
    // :id is defined on the parent route (games/:id), not on this child (admin)
    this.route.parent!.paramMap.subscribe({
      next: params => {
        const id = params.get('id')!;
        this.gameId.set(id);
      },
    });
  }
}
