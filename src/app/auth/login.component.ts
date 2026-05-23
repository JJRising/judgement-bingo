import { Component, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/input';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        FormsModule,
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatCardTitle,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatSuffix,
        MatIcon,
        MatButton,
    ],
    styles: [`
        .login-card {
            max-width: 400px;
            margin: 80px auto 0;
        }
        .login-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .login-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
        }
    `],
    template: `
        <mat-card class="login-card">
            <mat-card-header>
                <mat-card-title>Sign In</mat-card-title>
            </mat-card-header>
            <mat-card-content>
                <form class="login-form" (ngSubmit)="signIn()" #loginForm="ngForm">
                    <mat-form-field appearance="outline">
                        <mat-label>Email</mat-label>
                        <input matInput type="email" [(ngModel)]="email" name="email" required />
                        <mat-icon matSuffix>email</mat-icon>
                        @if (loginForm.submitted && !email) {
                            <mat-error>Email is required</mat-error>
                        }
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                        <mat-label>Password</mat-label>
                        <input matInput type="password" [(ngModel)]="password" name="password" required />
                        <mat-icon matSuffix>lock</mat-icon>
                        @if (loginForm.submitted && !password) {
                            <mat-error>Password is required</mat-error>
                        }
                    </mat-form-field>
                    @if (error) {
                        <mat-error>{{ error }}</mat-error>
                    }
                    <div class="login-actions">
                        <button mat-raised-button color="primary" type="submit">Sign In</button>
                    </div>
                </form>
            </mat-card-content>
        </mat-card>
    `
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    email = '';
    password = '';
    error = '';

    async signIn() {
        if (!this.email || !this.password) return;
        try {
            await this.authService.signInWithEmail(this.email, this.password);
            this.router.navigate(['/games']);
        } catch (e: any) {
            this.error = e.message;
        }
    }
}