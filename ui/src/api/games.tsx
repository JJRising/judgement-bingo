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

export interface PlayerDto {
    id: string;
    userId: string;
    displayName: string;
}

export interface SubjectDto {
    id: string;
    type: string;
    displayName: string;
}

export async function fetchPlayers(gameId: string): Promise<PlayerDto[]> {
    const res = await authFetch(`${API_BASE}/${gameId}/players`);
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
}

export async function addPlayer(gameId: string, userId: string): Promise<PlayerDto> {
    const res = await authFetch(`${API_BASE}/${gameId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to add player");
    return res.json();
}

export interface UserDto {
    id: string;
    inviteName: string;
    email: string;
    created_at: string;
    has_logged_in: boolean;
}

export async function fetchUsers(): Promise<UserDto[]> {
    const res = await authFetch("/api/v1/users");
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function createUser(inviteName: string, email: string): Promise<UserDto> {
    const res = await authFetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteName, email }),
    });
    if (!res.ok) throw new Error("Failed to create user");
    return res.json();
}

export async function deletePlayer(gameId: string, playerId: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/${gameId}/players/${playerId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete player");
}

export async function fetchSubjects(gameId: string): Promise<SubjectDto[]> {
    const res = await authFetch(`${API_BASE}/${gameId}/subjects`);
    if (!res.ok) throw new Error("Failed to fetch subjects");
    return res.json();
}

export async function addSubject(gameId: string, label: string): Promise<SubjectDto> {
    const res = await authFetch(`${API_BASE}/${gameId}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
    });
    if (!res.ok) throw new Error("Failed to add subject");
    return res.json();
}

export async function deleteSubject(gameId: string, subjectId: string): Promise<void> {
    const res = await authFetch(`${API_BASE}/${gameId}/subjects/${subjectId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete subject");
}

