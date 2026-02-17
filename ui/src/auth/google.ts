// Google Identity Services auth implementation
// Uses the credential model to get JWT id_token

import { clearRolesCache, refreshRoles } from "./roleChecker";
import { notifyAuthChange } from "./authState";

const TOKEN_KEY = 'google_id_token';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: GoogleIdConfig) => void;
                    prompt: () => void;
                    renderButton: (parent: HTMLElement, options?: object) => void;
                    revoke: (hint: string, callback: () => void) => void;
                    disableAutoSelect: () => void;
                };
            };
        };
    }
}

interface GoogleIdConfig {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: string;
    state_cookie_domain?: string;
    ux_mode?: 'popup' | 'redirect';
    redirect_uri?: string;
    native_callback?: (response: { credential: string }) => void;
}

// JWT decode function
function decodeJwt(token: string): Record<string, unknown> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return {};
        
        const base64Url = parts[1];
        if (!base64Url) return {};
        
        // Add padding if needed
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }
        
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return {};
    }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

class GoogleAuth {
    private token: string | undefined;
    private tokenParsed: Record<string, unknown> | undefined;
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    constructor() {
        // Restore token from localStorage on instantiation
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
            this.token = storedToken;
            this.tokenParsed = decodeJwt(storedToken);
        }
    }

    private saveToStorage(): void {
        if (this.token) {
            localStorage.setItem(TOKEN_KEY, this.token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }

    // Initialize the Google script (call on app startup)
    async init(): Promise<void> {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = this.loadGisScript();
        
        // After loading script, check if we returned from a redirect
        await this.initPromise;
        await this.checkForRedirectCredential();
        
        return this.initPromise;
    }

    // Check if we returned from a Google redirect with a credential
    private async checkForRedirectCredential(): Promise<void> {
        const hash = window.location.hash;
        if (!hash) {
            return;
        }

        // Check for id_token (from direct OAuth 2.0) or credential (from GIS library)
        const params = new URLSearchParams(hash.substring(1)); // Remove leading #
        const idToken = params.get('id_token');
        const credential = params.get('credential');
        const token = idToken || credential;
        
        if (token) {
            // Verify state to prevent CSRF
            const returnedState = params.get('state');
            const storedState = sessionStorage.getItem('oauth_state');
            
            if (returnedState !== storedState) {
                console.error('OAuth state mismatch - possible CSRF attack');
                window.history.replaceState(null, '', window.location.pathname);
                sessionStorage.removeItem('oauth_state');
                return;
            }
            
            // Clear the hash from URL and state
            window.history.replaceState(null, '', window.location.pathname);
            sessionStorage.removeItem('oauth_state');
            
            // Process the credential
            this.token = token;
            this.tokenParsed = decodeJwt(token);
            this.saveToStorage();
            
            // Notify components that auth state changed
            notifyAuthChange(true);
            
            // Fetch roles from API after successful login
            await refreshRoles();
        }
    }

    // Trigger the OAuth login flow using direct OAuth 2.0 endpoint
    // This bypasses FedCM issues with the GIS library
    login(): void {
        const redirectUri = window.location.origin;
        const state = Math.random().toString(36).substring(7);
        
        // Store state for verification when we return
        sessionStorage.setItem('oauth_state', state);
        
        // Build the OAuth 2.0 authorization URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'id_token');
        authUrl.searchParams.set('scope', 'openid email profile');
        authUrl.searchParams.set('nonce', state);
        authUrl.searchParams.set('state', state);
        
        // Redirect to Google
        window.location.href = authUrl.toString();
    }

    private loadGisScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.google) {
                this.initialized = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                this.initialized = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
            document.head.appendChild(script);
        });
    }

    getToken(): string | undefined {
        return this.token;
    }

    getParsedToken(): Record<string, unknown> | undefined {
        return this.tokenParsed;
    }

    isAuthenticated(): boolean {
        // Check in-memory token first, fallback to localStorage
        if (this.token) return true;
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
            this.token = storedToken;
            this.tokenParsed = decodeJwt(storedToken);
            return true;
        }
        return false;
    }

    logout(): void {
        this.token = undefined;
        this.tokenParsed = undefined;
        localStorage.removeItem(TOKEN_KEY);
        clearRolesCache();
        notifyAuthChange(false);
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    }
}

const googleAuth = new GoogleAuth();

export default googleAuth;
