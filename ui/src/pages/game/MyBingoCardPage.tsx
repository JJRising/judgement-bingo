import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Modal} from "bootstrap";
import {fetchGame, fetchMyBingoCard, fetchPrompts, updateBingoCard, type BingoCardDto, type BingoSquareDto, type GameDto, type PromptDto} from "../../api/games";

export function MyBingoCardPage() {
    const {gameId} = useParams<{ gameId: string }>();
    const [game, setGame] = useState<GameDto | null>(null);
    const [card, setCard] = useState<BingoCardDto | null>(null);
    const [prompts, setPrompts] = useState<PromptDto[]>([]);
    const [selectedSquareIndex, setSelectedSquareIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const isPrompts = game?.status === "PROMPTS";

    useEffect(() => {
        if (!gameId) return;
        Promise.all([
            fetchGame(gameId),
            fetchMyBingoCard(gameId),
            fetchPrompts(gameId),
        ])
            .then(([gameData, cardData, promptsData]) => {
                setGame(gameData);
                setCard(cardData);
                setPrompts(promptsData);
            })
            .catch(() => {
                // If no card exists yet, just show game state
                return fetchGame(gameId).then(setGame);
            })
            .finally(() => setLoading(false));
    }, [gameId]);

    const handleSelectSquare = async (index: number) => {
        if (index === 12) return; // Free square
        if (!isPrompts) return; // Only allow selection during PROMPTS phase
        setSelectedSquareIndex(index);
    };

    const handleUpdateCard = async (newPrompts: Record<number, string>) => {
        if (!gameId) return;
        const updatedCard = await updateBingoCard(gameId, newPrompts);
        setCard(updatedCard);
        setSelectedSquareIndex(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUBMITTED":
                return "bg-warning";
            case "ACCEPTED":
                return "bg-info";
            case "REVEALED":
                return "bg-success";
            default:
                return "";
        }
    };

    return (
        <div>
            <h2 className="mb-4">My Bingo Card</h2>

            {card ? (
                <>
                    <div
                        className="d-grid gap-0"
                        style={{
                            gridTemplateColumns: "repeat(5, 1fr)",
                            maxWidth: "500px",
                        }}
                    >
                        {Array.from({length: 25}, (_, index) => {
                            const square = card.squares?.[index];
                            const isCenter = index === 12;

                            if (isCenter) {
                                return (
                                    <div
                                        key={index}
                                        className="p-2 text-center bg-light"
                                        style={{
                                            aspectRatio: "1",
                                            fontSize: "0.75rem",
                                            border: "1px solid black !important",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        FREE
                                    </div>
                                );
                            }

                            if (!square) {
                                return (
                                    <div
                                        key={index}
                                        className="p-2 text-center bg-secondary-subtle"
                                        style={{
                                            aspectRatio: "1",
                                            border: "1px solid black !important",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: isPrompts ? "pointer" : "default",
                                        }}
                                        onClick={() => handleSelectSquare(index)}
                                    >
                                        -
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={index}
                                    className={`p-1 text-center ${getStatusColor(square.status)}`}
                                    style={{
                                        aspectRatio: "1",
                                        fontSize: "0.65rem",
                                        border: "1px solid black !important",
                                        cursor: isPrompts ? "pointer" : "default",
                                        display: "flex",
                                        flexDirection: "column",
                                        overflow: "hidden",
                                        textAlign: "left",
                                    }}
                                    onClick={() => handleSelectSquare(index)}
                                >
                                    <div className="text-truncate fw-bold">{square.subject}</div>
                                    <div className="text-truncate" style={{fontSize: "0.55rem"}}>{square.text}</div>
                                </div>
                            );
                        })}
                    </div>

                    {selectedSquareIndex !== null && (
                        <SquareSelectModal
                            square={card.squares?.[selectedSquareIndex] ?? null}
                            index={selectedSquareIndex}
                            prompts={prompts}
                            card={card}
                            onClose={() => setSelectedSquareIndex(null)}
                            onUpdate={handleUpdateCard}
                        />
                    )}
                </>
            ) : (
                <p>No card found. Please wait for the game to start.</p>
            )}
        </div>
    );
}

interface SquareSelectModalProps {
    square: BingoSquareDto | null | undefined;
    index: number;
    prompts: PromptDto[];
    card: BingoCardDto;
    onClose: () => void;
    onUpdate: (prompts: Record<number, string>) => Promise<void>;
}

function SquareSelectModal({square, index, prompts, card, onClose, onUpdate}: SquareSelectModalProps) {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (modalRef.current) {
            const m = new Modal(modalRef.current);
            m.show();
            const handleClose = () => onClose();
            modalRef.current.addEventListener('hidden.bs.modal', handleClose, {once: true});
            return () => {
                m.dispose();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get prompts already in the card (excluding current square)
    const usedPromptIds = new Set<string>();
    if (card.squares) {
        for (const [idx, sq] of Object.entries(card.squares)) {
            if (parseInt(idx) !== index && sq) {
                // Find the prompt ID by matching subject and text
                const matchingPrompt = prompts.find(p => p.subjectName === sq.subject && p.text === sq.text);
                if (matchingPrompt) {
                    usedPromptIds.add(matchingPrompt.id);
                }
            }
        }
    }

    const availablePrompts = prompts.filter(p => !usedPromptIds.has(p.id));

    const handleSelectPrompt = async (promptId: string) => {
        setLoading(true);
        try {
            const newPrompts: Record<number, string> = {};
            // Copy existing prompts
            if (card.squares) {
                for (const [idx, sq] of Object.entries(card.squares)) {
                    const prompt = prompts.find(p => p.subjectName === sq.subject && p.text === sq.text);
                    if (prompt) {
                        newPrompts[parseInt(idx)] = prompt.id;
                    }
                }
            }
            // Add new prompt
            newPrompts[index] = promptId;
            await onUpdate(newPrompts);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        setLoading(true);
        try {
            const newPrompts: Record<number, string> = {};
            // Copy existing prompts except the current one
            if (card.squares) {
                for (const [idx, sq] of Object.entries(card.squares)) {
                    if (parseInt(idx) !== index && sq) {
                        const prompt = prompts.find(p => p.subjectName === sq.subject && p.text === sq.text);
                        if (prompt) {
                            newPrompts[parseInt(idx)] = prompt.id;
                        }
                    }
                }
            }
            await onUpdate(newPrompts);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade" ref={modalRef} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {square ? `Square ${index + 1} - ${square.subject}` : `Square ${index + 1} - Select Prompt`}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {square ? (
                            <>
                                <p className="mb-2">
                                    <strong>Status:</strong> {square.status}
                                </p>
                                <p className="mb-3">{square.text}</p>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleRemove}
                                    disabled={loading}
                                >
                                    {loading ? "Removing..." : "Remove"}
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="mb-3">Select a prompt to place in this square:</p>
                                {availablePrompts.length === 0 ? (
                                    <div className="text-center text-muted py-4">No available prompts</div>
                                ) : (
                                    <div className="list-group" style={{maxHeight: "400px", overflowY: "auto"}}>
                                        {availablePrompts.map((prompt) => (
                                            <button
                                                key={prompt.id}
                                                type="button"
                                                className="list-group-item list-group-item-action"
                                                onClick={() => handleSelectPrompt(prompt.id)}
                                                disabled={loading}
                                            >
                                                <div className="fw-bold">{prompt.subjectName}</div>
                                                <small className="text-muted">{prompt.text}</small>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
