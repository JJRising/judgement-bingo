import { Injectable, inject } from '@angular/core';
import { AUTH } from '../app.config';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(AUTH);

    readonly user$: Observable<User | null> = new Observable(subscriber => {
        return onAuthStateChanged(this.auth, subscriber);
    });

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
