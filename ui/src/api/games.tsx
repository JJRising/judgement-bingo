import { auth, AUTH_PROVIDER } from "../auth";

export interface GameDto {
    id: string;
    name: string;
    status: string;
}

const API_BASE = "/api/v1/games";

async function authFetch(input: RequestInfo, init: RequestInit = {}, retryCount = 0) {
    const token = auth.getToken?.() ?? (auth as any).token;
    const isAuthenticated = auth.isAuthenticated?.() ?? (auth as any).authenticated;

    if (!isAuthenticated || !token) {
        throw new Error("Not authenticated");
    }

    try {
        const response = await fetch(input, {
            ...init,
            headers: {
                ...(init.headers ?? {}),
                Authorization: `Bearer ${token}`,
            },
        });

        // Handle 401 - token may be expired
        if (response.status === 401 && retryCount === 0 && AUTH_PROVIDER === 'google') {
            // Try to refresh the token
            const googleAuth = auth as unknown as { refreshToken?: () => void; login?: () => void };
            if (googleAuth.refreshToken) {
                googleAuth.refreshToken();
            } else if (googleAuth.login) {
                // Fallback to login if refresh not available
                googleAuth.login();
            }
            throw new Error("Token expired, redirecting to refresh");
        }

        return response;
    } catch (error) {
        // Rethrow if already retried or not a fetch error
        if (retryCount > 0 || !(error instanceof TypeError)) {
            throw error;
        }
        
        // Network error - try once more
        return authFetch(input, init, retryCount + 1);
    }
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

export async function fetchGame(gameId: string): Promise<GameDto> {
    const res = await authFetch(`${API_BASE}/${gameId}`);
    if (!res.ok) throw new Error("Failed to fetch game");
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
    playerId?: string;
}

export async function fetchPlayers(gameId: string): Promise<PlayerDto[]> {
    const res = await authFetch(`${API_BASE}/${gameId}/players`);
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
}

export async function addPlayer(gameId: string, userId: string, displayName: string): Promise<PlayerDto> {
    const res = await authFetch(`${API_BASE}/${gameId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, displayName }),
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

export async function fetchMyPlayer(gameId: string): Promise<PlayerDto> {
    const res = await authFetch(`${API_BASE}/${gameId}/me`);
    if (!res.ok) throw new Error("Failed to fetch my player");
    return res.json();
}

export async function publishGame(gameId: string): Promise<GameDto> {
    const res = await authFetch(`${API_BASE}/${gameId}/publish`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to publish game");
    return res.json();
}

export async function startGame(gameId: string): Promise<GameDto> {
    const res = await authFetch(`${API_BASE}/${gameId}/start`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to start game");
    return res.json();
}

// Prompt API
export interface PromptDto {
    id: string;
    subjectId: string;
    subjectName: string;
    text: string;
    status: "SUBMITTED" | "ACCEPTED" | "COMPLETED" | "ACKNOWLEDGED";
    createdBy: string;
    createdByName: string;
    approvedBy: string | null;
    approvedByName: string | null;
    completedBy: string | null;
    completedByName: string | null;
    acknowledgedBy: string | null;
    acknowledgedByName: string | null;
}

export async function fetchPrompts(gameId: string): Promise<PromptDto[]> {
    const res = await authFetch(`/api/v1/games/${gameId}/prompts`);
    if (!res.ok) throw new Error("Failed to fetch prompts");
    return res.json();
}

export async function createPrompt(gameId: string, subjectId: string, text: string): Promise<PromptDto> {
    const res = await authFetch(`/api/v1/games/${gameId}/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, text }),
    });
    if (!res.ok) throw new Error("Failed to create prompt");
    return res.json();
}

export async function approvePrompt(gameId: string, promptId: string): Promise<void> {
    const res = await authFetch(`/api/v1/games/${gameId}/prompts/${promptId}/approve`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to approve prompt");
}

export async function deletePrompt(gameId: string, promptId: string): Promise<void> {
    const res = await authFetch(`/api/v1/games/${gameId}/prompts/${promptId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete prompt");
}

export async function completePrompt(gameId: string, promptId: string): Promise<void> {
    const res = await authFetch(`/api/v1/games/${gameId}/prompts/${promptId}/complete`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to complete prompt");
}

export async function incompletePrompt(gameId: string, promptId: string): Promise<void> {
    const res = await authFetch(`/api/v1/games/${gameId}/prompts/${promptId}/incomplete`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to incomplete prompt");
}

export async function acknowledgePrompt(gameId: string, promptId: string): Promise<void> {
    const res = await authFetch(`/api/v1/games/${gameId}/prompts/${promptId}/acknowledge`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to acknowledge prompt");
}

// Bingo Cards API
export interface BingoSquareDto {
    subject: string;
    text: string;
    status: "SUBMITTED" | "ACCEPTED" | "COMPLETED" | "ACKNOWLEDGED";
    promptId?: string;
}

export interface BingoCardDto {
    id: string;
    playerId: string;
    playerName: string;
    squares: Record<number, BingoSquareDto> | null;
}

export async function fetchBingoCards(gameId: string): Promise<BingoCardDto[]> {
    const res = await authFetch(`/api/v1/games/${gameId}/cards`);
    if (!res.ok) throw new Error("Failed to fetch bingo cards");
    return res.json();
}

export async function fetchMyBingoCard(gameId: string): Promise<BingoCardDto> {
    const res = await authFetch(`/api/v1/games/${gameId}/cards/me`);
    if (!res.ok) throw new Error("Failed to fetch my bingo card");
    return res.json();
}

export async function fetchRoles(): Promise<string[]> {
    const res = await authFetch(`/api/v1/users/me/roles`);
    if (!res.ok) throw new Error("Failed to fetch roles");
    return res.json();
}

export async function updateBingoCard(gameId: string, prompts: Record<number, string>): Promise<BingoCardDto> {
    const res = await authFetch(`/api/v1/games/${gameId}/cards/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts }),
    });
    if (!res.ok) throw new Error("Failed to update bingo card");
    return res.json();
}

