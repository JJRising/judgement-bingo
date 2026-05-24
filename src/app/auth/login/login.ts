import {Component, inject, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

function friendlyAuthError(e: unknown): string {
    if (!(e instanceof Error)) return 'Sign-in failed. Please try again.';

    const embedded = e.message.match(/"message"\s*:\s*"([^"]+)"/);
    if (embedded) return embedded[1];

    const code = (e as {code?: string}).code;
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-email':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            return '';
        case 'auth/network-request-failed':
            return 'Network error. Check your connection and try again.';
        default:
            return 'Sign-in failed. Please try again.';
    }
}

@Component({
  selector: 'app-login',
    imports: [
        FormsModule,
        MatButton,
        MatCard,
        MatCardContent,
        MatCardHeader,
        MatCardTitle,
        MatError,
        MatFormField,
        MatIcon,
        MatInput,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule
    ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
    private authService = inject(AuthService);
    private router = inject(Router);
    private iconRegistry = inject(MatIconRegistry);
    private sanitizer = inject(DomSanitizer);

    constructor() {
        this.iconRegistry.addSvgIcon(
            'google',
            this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/google.svg')
        );
    }

    email = '';
    password = '';
    readonly error = signal('');

    async signIn() {
        if (!this.email || !this.password) return;
        this.error.set('');
        try {
            await this.authService.signInWithEmail(this.email, this.password);
            void this.router.navigate(['/games']);
        } catch (e: unknown) {
            this.error.set(friendlyAuthError(e));
        }
    }

    async signInWithGoogle() {
        this.error.set('');
        try {
            await this.authService.signInWithGoogle();
            void this.router.navigate(['/games']);
        } catch (e: unknown) {
            this.error.set(friendlyAuthError(e));
        }
    }
}
