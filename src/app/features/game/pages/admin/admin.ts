import {Component, inject, signal, effect} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PlayerList} from './player-list/player-list';

@Component({
  selector: 'app-admin',
  imports: [PlayerList],
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
