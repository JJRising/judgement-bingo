import {useEffect, useState} from "react";
import {fetchGames, type GameDto} from "../api/games";
import {CreateGameForm} from "../components/CreateGameForm";
import {GameList} from "../components/GameList";

export function HomePage() {
    const [games, setGames] = useState<GameDto[]>([]);
    const [loading, setLoading] = useState(true);

    const userName = "Admin";

    useEffect(() => {
        fetchGames()
            .then(setGames)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container-md mx-auto p-4">
            <h1 className="display-5 mb-1">Welcome {userName}!</h1>
            <p className="text-muted mb-4">Select a game to begin</p>

            {loading ? <p>Loading games…</p> : <GameList games={games}/>}

            <CreateGameForm
                onCreated={(g) => setGames((prev) => [...prev, g])}
            />
        </div>
    );
}
