import {Routes} from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'games', pathMatch: 'full'},
    {path: 'games', loadComponent: () => import('@features/games/games').then(m => m.Games)},
    {
        path: 'games/:id',
        loadComponent: () => import('@features/game/game').then(m => m.Game),
        children: [
            {
                path: 'admin',
                loadComponent: () => import('@features/game/pages/admin/admin').then(m => m.Admin),
            },
        ],
    },
];
