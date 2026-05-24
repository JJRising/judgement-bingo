import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {doc, Firestore, getDoc} from 'firebase/firestore';
import {AuthService} from './auth.service';
import {FIRESTORE} from '../app.config';

export const authGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const firestore = inject(FIRESTORE) as Firestore;

    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) {
        return router.createUrlTree(['/login']);
    }

    try {
        const snap = await getDoc(doc(firestore, 'members', user.uid));
        const status = snap.exists() ? (snap.data()['status'] as string | undefined) : undefined;
        if (!snap.exists() || status === 'disabled') {
            await auth.signOut();
            return router.createUrlTree(['/login']);
        }
    } catch {
        await auth.signOut();
        return router.createUrlTree(['/login']);
    }

    return true;
};
