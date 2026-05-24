import {Component, inject, signal, viewChild} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {MatSidenavContainer, MatSidenavModule} from '@angular/material/sidenav';
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
    private readonly container = viewChild.required(MatSidenavContainer);

    readonly gameId = toSignal(this.route.paramMap.pipe(map(params => params.get())));
    readonly collapsed = signal(false);

    toggleCollapsed(): void {
        this.collapsed.update(v => !v);
        // Timeout so recalculation of main content width happens after the sidenav animation
        setTimeout(() => this.container().updateContentMargins(), 210);
    }
}
