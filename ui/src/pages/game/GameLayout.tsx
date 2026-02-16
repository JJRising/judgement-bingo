import {Outlet, useParams} from "react-router-dom";
import {GameSidebar} from "../../components/GameSidebar";

export function GameLayout() {
    const {gameId} = useParams<{ gameId: string }>();

    if (!gameId) return null;

    return (
        <div className="d-flex flex-column flex-md-row" style={{height: "100vh"}}>
            <GameSidebar gameId={gameId}/>
            <main className="flex-grow-1 p-3 pb-5"
                  style={{flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch"}}>
                <Outlet/>
            </main>
        </div>
    );
}
