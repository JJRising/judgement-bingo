import {Outlet, useParams} from "react-router-dom";
import {GameSidebar} from "../../components/GameSidebar";

export function GameLayout() {
    const {gameId} = useParams<{ gameId: string }>();

    if (!gameId) return null;

    return (
        <div className="d-flex vh-100">
            <GameSidebar gameId={gameId}/>
            <main className="flex-grow-1 p-4 overflow-auto">
                <Outlet/>
            </main>
        </div>
    );
}
