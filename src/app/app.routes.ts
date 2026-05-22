import {Routes} from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'games', pathMatch: 'full'},
    {path: 'games', loadComponent: () => import('@features/games/games').then(m => m.Games)},
];
