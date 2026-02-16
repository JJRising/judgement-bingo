export interface JwtPayload {
    realm_access?: {
        roles?: string[];
    };
    resource_access?: {
        [clientId: string]: {
            roles?: string[];
        };
    };
}

export interface JwtProvider {
    getToken(): string | undefined;
    getParsedToken(): JwtPayload | undefined;
    isAuthenticated(): boolean;
}

export type RoleCheckFn = (roles: string[]) => boolean;

export interface RoleChecker {
    hasRole(role: string): boolean;
    hasAnyRole(roles: string[]): boolean;
    hasAllRoles(roles: string[]): boolean;
}
