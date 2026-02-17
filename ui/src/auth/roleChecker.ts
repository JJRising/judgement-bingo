import type { JwtProvider, RoleChecker } from "./types";
import { auth } from "./index";

let currentProvider: JwtProvider | null = null;

export function setJwtProvider(provider: JwtProvider): void {
    currentProvider = provider;
}

export function getJwtProvider(): JwtProvider | null {
    return currentProvider;
}

function getDefaultProvider(): JwtProvider {
    if (currentProvider) {
        return currentProvider;
    }

    // Handle both keycloak (uses token property) and google (uses getToken method)
    return {
        getToken: () => (auth as any).getToken?.() ?? (auth as any).token,
        getParsedToken: () => (auth as any).getParsedToken?.() ?? (auth as any).tokenParsed,
        isAuthenticated: () => (auth as any).isAuthenticated?.() ?? (auth as any).authenticated ?? false,
    };
}

function getRoles(): string[] {
    const provider = getDefaultProvider();
    if (!provider) {
        return [];
    }

    const parsed = provider.getParsedToken();
    if (!parsed) {
        return [];
    }

    // Keycloak format: realm_access.roles
    if (parsed.realm_access?.roles) {
        return parsed.realm_access.roles as string[];
    }

    // Google format: roles claim (direct array)
    if (Array.isArray(parsed.roles)) {
        return parsed.roles as string[];
    }

    return [];
}

export function hasRole(role: string): boolean {
    const roles = getRoles();
    return roles.includes(role);
}

export function hasAnyRole(roles: string[]): boolean {
    const userRoles = getRoles();
    return roles.some((role) => userRoles.includes(role));
}

export function hasAllRoles(roles: string[]): boolean {
    const userRoles = getRoles();
    return roles.every((role) => userRoles.includes(role));
}

export function createRoleChecker(customProvider?: JwtProvider): RoleChecker {
    const provider = customProvider ?? getDefaultProvider();

    function getProviderRoles(): string[] {
        if (!provider) {
            return [];
        }

        const parsed = provider.getParsedToken();
        if (!parsed) {
            return [];
        }

        // Keycloak format: realm_access.roles
        if (parsed.realm_access?.roles) {
            return parsed.realm_access.roles as string[];
        }

        // Google format: roles claim (direct array)
        if (Array.isArray(parsed.roles)) {
            return parsed.roles as string[];
        }

        return [];
    }

    return {
        hasRole(role: string): boolean {
            return getProviderRoles().includes(role);
        },
        hasAnyRole(roles: string[]): boolean {
            const userRoles = getProviderRoles();
            return roles.some((role) => userRoles.includes(role));
        },
        hasAllRoles(roles: string[]): boolean {
            const userRoles = getProviderRoles();
            return roles.every((role) => userRoles.includes(role));
        },
    };
}

export function isAuthenticated(): boolean {
    const provider = getDefaultProvider();
    return provider?.isAuthenticated() ?? false;
}
