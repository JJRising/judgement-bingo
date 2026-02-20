import {useEffect, useState, useCallback} from "react";
import {fetchGames, type GameDto} from "../api/games";
import {CreateGameForm} from "../components/CreateGameForm";
import {GameList} from "../components/GameList";
import {GoogleLoginButton} from "../components/GoogleLoginButton";
import {AUTH_PROVIDER, auth} from "../auth";
import { subscribeToAuthChanges } from "../auth/authState";
import { hasRole } from "../auth/roleChecker";

export function HomePage() {
    const [games, setGames] = useState<GameDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const isAdmin = hasRole("ADMIN");

    const loadGames = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchGames();
            setGames(data);
        } catch (error) {
            console.error("Failed to load games:", error);
            setGames([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Check initial auth state
        const initialAuth = auth.isAuthenticated?.() ?? (auth as any).authenticated ?? false;
        setIsAuthenticated(initialAuth);

        // Subscribe to auth changes
        const unsubscribe = subscribeToAuthChanges((authenticated) => {
            setIsAuthenticated(authenticated);
            // Re-fetch games after login
            if (authenticated) {
                loadGames();
            }
        });

        return unsubscribe;
    }, [loadGames]);

    // Fetch games when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadGames();
        }
    }, [isAuthenticated, loadGames]);

    // Show login prompt if using Google auth and not authenticated
    if (AUTH_PROVIDER === 'google' && !isAuthenticated) {
        return (
            <div className="container-md mx-auto p-4 text-center">
                <h1 className="display-5 mb-1">Welcome!</h1>
                <p className="text-muted mb-4">Please sign in to continue</p>
                <GoogleLoginButton />
            </div>
        );
    }

    return (
        <div className="container-md mx-auto p-4">
            <h1 className="display-5 mb-1">Welcome!</h1>
            <p className="text-muted mb-4">Select a game to begin</p>

            {loading ? <p>Loading games…</p> : <GameList games={games}/>}

            {isAdmin && (
                <CreateGameForm
                    onCreated={(g) => setGames((prev) => [...prev, g])}
                />
            )}
        </div>
    );
}
