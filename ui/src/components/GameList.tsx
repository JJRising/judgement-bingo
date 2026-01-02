import type {GameDto} from "../api/games";


export function GameList({ games }: { games: GameDto[] }) {
    if (!games.length) {
        return <p className="text-gray-500">No games yet. Create one below.</p>;
    }


    return (
        <ul className="space-y-2">
            {games.map((g) => (
                <li key={g.id}>
                    <a
                        href={`/games/${g.id}`}
                        className="block border rounded px-4 py-3 hover:bg-gray-50"
                    >
                        <div className="font-medium">{g.name}</div>
                        <div className="text-sm text-gray-500">
                            {g.published ? "Published" : "Draft"}
                        </div>
                    </a>
                </li>
            ))}
        </ul>
    );
}
