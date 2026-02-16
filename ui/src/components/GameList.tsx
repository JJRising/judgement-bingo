import {Link} from "react-router-dom";
import type {GameDto} from "../api/games";


export function GameList({games}: { games: GameDto[] }) {
    if (!games.length) {
        return <p className="text-muted">No games yet. Create one below.</p>;
    }

    return (
        <div className="list-group">
            {games.map((g) => (
                <Link
                    key={g.id}
                    to={`/games/${g.id}`}
                    className="list-group-item list-group-item-action"
                >
                    <div className="fw-bold">{g.name}</div>
                    <small className="text-muted">
                        {g.published ? "Published" : "Draft"}
                    </small>
                </Link>
            ))}
        </div>
    );
}
