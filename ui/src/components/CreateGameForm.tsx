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
        <form onSubmit={submit} className="mt-4 d-flex gap-2">
            <input
                className="form-control"
                placeholder="New game name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
            >
                Create Game
            </button>
        </form>
    );
}