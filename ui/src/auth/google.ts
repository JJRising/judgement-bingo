// Google Identity Services auth implementation
// Uses the token model (gis.js)

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
                oauth2: {
                    initTokenClient: (config: GoogleTokenConfig) => GoogleTokenClient;
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

interface GoogleTokenConfig {
    client_id: string;
    scope: string;
    callback: (response: { access_token: string; scope: string; expires_in: number; error?: string }) => void;
    error_callback?: (error: { type: string; message: string }) => void;
    prompt_none_url?: string;
    state_cookie_domain?: string;
}

interface GoogleTokenClient {
    requestAccessToken: (options?: { prompt?: string }) => void;
    callback: (response: { access_token: string; scope: string; expires_in: number }) => void;
    error_callback: (error: { type: string; message: string }) => void;
}

// JWT decode function
function decodeJwt(token: string): Record<string, unknown> {
    const base64Url = token.split('.')[1];
    if (!base64Url) return {};
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

class GoogleAuth {
    private token: string | undefined;
    private tokenParsed: Record<string, unknown> | undefined;
    private initialized = false;
    private initPromise: Promise<void> | null = null;

    async init(): Promise<void> {
        if (this.initialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = this.initializeGoogle();
        return this.initPromise;
    }

    private async initializeGoogle(): Promise<void> {
        // Load the Google Identity Services script
        await this.loadGisScript();

        if (!window.google) {
            throw new Error('Google Identity Services not loaded');
        }

        // Use token model for modern auth
        const clientConfig: GoogleTokenConfig = {
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: (response) => {
                if (response.access_token) {
                    this.token = response.access_token;
                    this.tokenParsed = decodeJwt(response.access_token);
                }
            },
            error_callback: (error) => {
                console.error('Google auth error:', error);
            },
        };

        const client = window.google.accounts.oauth2.initTokenClient(clientConfig);

        // Request the token
        client.requestAccessToken({ prompt: 'select_account' });

        this.initialized = true;
    }

    private loadGisScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.google) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
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
        return !!this.token;
    }

    async updateToken(): Promise<void> {
        if (!window.google?.accounts?.oauth2) return;

        const clientConfig: GoogleTokenConfig = {
            client_id: GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: (response) => {
                if (response.access_token) {
                    this.token = response.access_token;
                    this.tokenParsed = decodeJwt(response.access_token);
                }
            },
        };

        const client = window.google.accounts.oauth2.initTokenClient(clientConfig);
        client.requestAccessToken({ prompt: 'none' });
    }

    logout(): void {
        this.token = undefined;
        this.tokenParsed = undefined;
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    }
}

const googleAuth = new GoogleAuth();

export default googleAuth;
