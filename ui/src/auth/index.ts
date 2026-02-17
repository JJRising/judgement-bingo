export * from "./types";
export * from "./roleChecker";
export { default as keycloak } from "./keycloak";
export { default as google } from "./google";
export { AUTH_PROVIDER } from "./authConfig";

// Unified auth interface that switches based on configuration
import { AUTH_PROVIDER } from "./authConfig";
import keycloak from "./keycloak";
import google from "./google";

// Common interface for auth providers
interface AuthProvider {
    init(options?: object): Promise<void>;
    getToken(): string | undefined;
    getParsedToken(): Record<string, unknown> | undefined;
    isAuthenticated(): boolean;
    token?: string;
    authenticated?: boolean;
    tokenParsed?: Record<string, unknown>;
}

// Use the appropriate auth provider - use 'as any' to handle type differences
const authProvider: AuthProvider = (AUTH_PROVIDER as string) === 'google'
    ? (google as unknown as AuthProvider)
    : (keycloak as unknown as AuthProvider);

export const auth = authProvider;
export default auth;
