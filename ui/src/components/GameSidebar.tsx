import {useState} from "react";
import {NavLink} from "react-router-dom";

const navItem = "block px-4 py-2 rounded hover:bg-gray-200";
const navItemActive = "bg-gray-300 font-medium";

export function GameSidebar({gameId}: { gameId: string }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="relative flex-shrink-0 flex">
            <aside
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "border-r border-gray-300" : ""}`}
                style={{width: isOpen ? "16rem" : "0"}}
            >
                <div className="w-64 bg-gray-100 p-4 h-full transition-opacity duration-300 ease-in-out" style={{opacity: isOpen ? 1 : 0}}>
                <h2 className="text-lg font-semibold mb-4">Game</h2>
                <nav className="space-y-1">
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
                className="self-start mt-4 w-8 h-8 bg-gray-100 border border-gray-300 rounded-r flex items-center justify-center hover:bg-gray-200"
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isOpen ? "←" : "→"}
            </button>
        </div>
    );
}
