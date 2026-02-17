import type { JwtProvider, RoleChecker } from "./types";
import { auth } from "./index";
import { AUTH_PROVIDER } from "./authConfig";

let currentProvider: JwtProvider | null = null;

// Cache for roles fetched from API (used for Google)
let cachedRoles: string[] = [];
let rolesLoading = false;
let rolesLoadPromise: Promise<string[]> | null = null;

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

// Fetch roles from API (used for Google as Google tokens don't contain roles)
async function fetchRolesFromApi(): Promise<string[]> {
    if (rolesLoading && rolesLoadPromise) {
        return rolesLoadPromise;
    }

    rolesLoading = true;
    rolesLoadPromise = (async () => {
        try {
            // Dynamic import to avoid circular dependency
            const { fetchRoles } = await import("../api/games");
            const roles = await fetchRoles();
            cachedRoles = roles;
            return roles;
        } catch (error) {
            console.error("Failed to fetch roles:", error);
            return [];
        } finally {
            rolesLoading = false;
            rolesLoadPromise = null;
        }
    })();

    return rolesLoadPromise;
}

// Clear cached roles (call on logout)
export function clearRolesCache(): void {
    cachedRoles = [];
    rolesLoading = false;
    rolesLoadPromise = null;
}

// Force refresh roles from API
export async function refreshRoles(): Promise<string[]> {
    clearRolesCache();
    return fetchRolesFromApi();
}

// Get roles based on auth provider
function getRoles(): string[] {
    // For Google, use cached roles from API
    if (AUTH_PROVIDER === 'google') {
        return cachedRoles;
    }

    // For Keycloak, parse from JWT token
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
        // For Google, use cached roles from API
        if (AUTH_PROVIDER === 'google') {
            return cachedRoles;
        }

        // For Keycloak, parse from JWT token
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
