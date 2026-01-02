import {useState} from "react";
import {createGame, type GameDto} from "../api/games";

export function CreateGameForm({
                                   onCreated,
                               }: {
    onCreated: (g: GameDto) => void;
}) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const game = await createGame(name.trim());
            onCreated(game);
            setName("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="mt-6 flex gap-2">
            <input
                className="border rounded px-3 py-2 flex-1"
                placeholder="New game name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                Create Game
            </button>
        </form>
    );
}