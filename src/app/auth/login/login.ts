import {Component, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

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
    error = '';

    async signIn() {
        if (!this.email || !this.password) return;
        try {
            await this.authService.signInWithEmail(this.email, this.password);
            void this.router.navigate(['/games']);
        } catch (e: any) {
            this.error = e.message;
        }
    }

    async signInWithGoogle() {
        try {
            await this.authService.signInWithGoogle();
            void this.router.navigate(['/games']);
        } catch (e: any) {
            this.error = e.message;
        }
    }
}
