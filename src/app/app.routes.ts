import {Routes} from '@angular/router';
import {authGuard} from "./auth/auth.guard";
import {Login} from "./auth/login/login";

export const routes: Routes = [
    {path: 'login', component: Login},
    {path: '', redirectTo: 'games', pathMatch: 'full'},
    {
        path: 'games',
        loadComponent: () => import('@features/games/games').then(m => m.Games),
        canActivate: [authGuard],
    },
    {
        path: 'games/:id',
        loadComponent: () => import('@features/game/game').then(m => m.Game),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('@features/game/pages/overview/overview').then(m => m.Overview),
            },
            {
                path: 'prompts',
                loadComponent: () => import('@features/game/pages/prompts/prompts').then(m => m.Prompts),
            },
            {
                path: 'card',
                loadComponent: () => import('@features/game/pages/card/card').then(m => m.Card),
            },
            {
                path: 'admin',
                loadComponent: () => import('@features/game/pages/admin/admin').then(m => m.Admin),
            },
        ],
    },
];
