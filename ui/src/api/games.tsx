import keycloak from "../auth/keycloak";

export interface GameDto {
    id: string;
    name: string;
    published: boolean;
}

const API_BASE = "/api/v1/games";

async function authFetch(input: RequestInfo, init: RequestInit = {}) {
    if (!keycloak.authenticated || !keycloak.token) {
        throw new Error("Not authenticated");
    }

    return fetch(input, {
        ...init,
        headers: {
            ...(init.headers ?? {}),
            Authorization: `Bearer ${keycloak.token}`,
        },
    });
}

export async function fetchGames(): Promise<GameDto[]> {
    const res = await authFetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch games");
    return res.json();
}

export async function createGame(name: string): Promise<GameDto> {
    const res = await authFetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error("Failed to create game");
    return res.json();
}

