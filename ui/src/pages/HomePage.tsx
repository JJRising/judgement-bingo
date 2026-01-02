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
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-1">Welcome {userName}!</h1>
            <p className="text-gray-600 mb-6">Select a game to begin</p>

            {loading ? <p>Loading games…</p> : <GameList games={games}/>}

            <CreateGameForm
                onCreated={(g) => setGames((prev) => [...prev, g])}
            />
        </div>
    );
}
