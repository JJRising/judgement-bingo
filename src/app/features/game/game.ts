import {Component, inject} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterOutlet} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

@Component({
  selector: 'app-game',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game {
    private readonly route = inject(ActivatedRoute);

    readonly gameId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));
}
