import {useState, useEffect} from "react";
import {NavLink} from "react-router-dom";
import {hasRole} from "../auth";

const navItem = "nav-link";
const navItemActive = "active";

export function GameSidebar({gameId}: { gameId: string }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isOpen, setIsOpen] = useState(false);
    const isAdmin = hasRole("ADMIN");

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Desktop: inline sidebar
    if (!isMobile) {
        return (
            <aside className="bg-light border-end p-3" style={{width: "16rem", flexShrink: 0}}>
                <h5 className="mb-3">Game</h5>
                <nav className="nav flex-column gap-1">
                    {isAdmin && (
                    <NavLink
                        to={`/games/${gameId}/management`}
                        className={({isActive}) =>
                            `${navItem} ${isActive ? navItemActive : ""}`
                        }
                    >
                        Management
                    </NavLink>)}
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
            </aside>
        );
    }

    // Mobile: slide-out drawer
    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-outline-secondary position-fixed top-0 start-0 m-2 z-3"
                aria-label="Open menu"
                style={{display: isOpen ? "none" : undefined}}
            >
                ☰
            </button>
            <aside
                className="position-fixed top-0 start-0 h-100 bg-light border-end border-secondary z-2"
                style={{
                    width: "16rem",
                    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease",
                }}
            >
                <div className="p-3 d-flex flex-column h-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Game</h5>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="btn btn-sm btn-close"
                            aria-label="Close"
                        />
                    </div>
                    <nav className="nav flex-column gap-1">
                        {isAdmin && (
                        <NavLink
                            to={`/games/${gameId}/management`}
                            onClick={() => setIsOpen(false)}
                            className={({isActive}) =>
                                `${navItem} ${isActive ? navItemActive : ""}`
                            }
                        >
                            Management
                        </NavLink>)}
                        <NavLink
                            to={`/games/${gameId}/prompts`}
                            onClick={() => setIsOpen(false)}
                            className={({isActive}) =>
                                `${navItem} ${isActive ? navItemActive : ""}`
                            }
                        >
                            Prompts
                        </NavLink>
                        <NavLink
                            to={`/games/${gameId}/my-card`}
                            onClick={() => setIsOpen(false)}
                            className={({isActive}) =>
                                `${navItem} ${isActive ? navItemActive : ""}`
                            }
                        >
                            My Bingo Card
                        </NavLink>
                        <NavLink
                            to={`/games/${gameId}/others-cards`}
                            onClick={() => setIsOpen(false)}
                            className={({isActive}) =>
                                `${navItem} ${isActive ? navItemActive : ""}`
                            }
                        >
                            Others' Cards
                        </NavLink>
                    </nav>
                </div>
            </aside>
            {isOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-1"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
