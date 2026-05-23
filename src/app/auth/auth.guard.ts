import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return from(auth.authStateReady()).pipe(
        map(() => auth.currentUser ? true : router.createUrlTree(['/login']))
    );
};
