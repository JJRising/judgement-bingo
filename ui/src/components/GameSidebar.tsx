import {useState} from "react";
import {NavLink} from "react-router-dom";

const navItem = "nav-link";
const navItemActive = "active";

export function GameSidebar({gameId}: { gameId: string }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="position-relative d-flex flex-shrink-0">
            <aside
                className={`overflow-hidden ${isOpen ? "border-end border-secondary" : ""}`}
                style={{width: isOpen ? "16rem" : "0"}}
            >
                <div className="w-250px bg-light p-3 h-100" style={{opacity: isOpen ? 1 : 0}}>
                <h5 className="mb-3">Game</h5>
                <nav className="nav flex-column gap-1">
                        <NavLink
                            to={`/games/${gameId}/management`}
                            className={({isActive}) =>
                                `${navItem} ${isActive ? navItemActive : ""}`
                            }
                        >
                            Management
                        </NavLink>
                        <NavLink
                            to={`/games/${gameId}/prompts`}
                            className={({isActive}) =>
                                `${navItem} ${isActive ? navItemActive : ""}`
                            }
                        >
                            Prompts
                        </NavLink>
                        <NavLink
                            to={`/games/${gameId}/my-card`}
                            className={({isActive}) =>
                                `${navItem} ${isActive ? navItemActive : ""}`
                            }
                        >
                            My Bingo Card
                        </NavLink>
                        <NavLink
                            to={`/games/${gameId}/others-cards`}
                            className={({isActive}) =>
                                `${navItem} ${isActive ? navItemActive : ""}`
                            }
                        >
                            Others' Cards
                    </NavLink>
                </nav>
                </div>
            </aside>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="align-self-start mt-4 w-40 h-40 bg-light border border-secondary rounded-end d-flex align-items-center justify-content-center"
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isOpen ? "←" : "→"}
            </button>
        </div>
    );
}
