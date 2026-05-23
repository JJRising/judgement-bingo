import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-game',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './game.html',
  styleUrl: './game.css',
})
export class Game {
    private readonly route = inject(ActivatedRoute);

    readonly gameId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));
    readonly collapsed = signal(false);
}
