import {Routes} from '@angular/router';
import {authGuard} from "./auth/auth.guard";
import {LoginComponent} from "./auth/login.component";

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
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
                path: 'admin',
                loadComponent: () => import('@features/game/pages/admin/admin').then(m => m.Admin),
            },
        ],
    },
];
