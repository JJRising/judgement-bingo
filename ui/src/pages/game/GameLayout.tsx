import {Outlet, useParams} from "react-router-dom";
import {GameSidebar} from "../../components/GameSidebar";

export function GameLayout() {
    const {gameId} = useParams<{ gameId: string }>();

    if (!gameId) return null;

    return (
        <div className="flex h-screen">
            <GameSidebar gameId={gameId}/>
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet/>
            </main>
        </div>
    );
}
