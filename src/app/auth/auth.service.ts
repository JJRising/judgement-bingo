import { Injectable, inject } from '@angular/core';
import { AUTH } from '../app.config';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(AUTH);

    readonly user$: Observable<User | null> = new Observable(subscriber => {
        return onAuthStateChanged(this.auth, subscriber);
    });

    readonly isAdmin$: Observable<boolean> = this.user$.pipe(
        switchMap(user => user ? user.getIdTokenResult().then(token => token.claims['role'] === 'admin') : of(false))
    );

    get currentUser(): User | null {
        return this.auth.currentUser;
    }

    authStateReady(): Promise<void> {
        return this.auth.authStateReady();
    }

    signInWithEmail(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    signInWithGoogle() {
        return signInWithPopup(this.auth, new GoogleAuthProvider());
    }

    signOut() {
        return signOut(this.auth);
    }
}
