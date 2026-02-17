import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Modal} from "bootstrap";
import {fetchBingoCards, type BingoCardDto, type BingoSquareDto} from "../../api/games";

export function OthersCardsPage() {
    const {gameId} = useParams<{ gameId: string }>();
    const [cards, setCards] = useState<BingoCardDto[]>([]);
    const [selectedSquare, setSelectedSquare] = useState<BingoSquareDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!gameId) return;
        fetchBingoCards(gameId)
            .then(setCards)
            .finally(() => setLoading(false));
    }, [gameId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SUBMITTED":
                return "bg-warning";
            case "ACCEPTED":
                return "bg-info";
            case "COMPLETED":
                return "bg-warning text-dark";
            case "ACKNOWLEDGED":
                return "bg-success";
            default:
                return "";
        }
    };

    return (
        <div>
            <h2 className="mb-4">Others' Bingo Cards</h2>

            {cards.map((card) => (
                <div key={card.id} className="mb-5">
                    <h5 className="mb-3">{card.playerName}</h5>

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
                                        }}
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
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        overflow: "hidden",
                                        textAlign: "left",
                                    }}
                                    onClick={() => setSelectedSquare(square)}
                                >
                                    <div className="text-truncate fw-bold">{square.subject}</div>
                                    <div className="text-truncate" style={{fontSize: "0.55rem"}}>{square.text}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-bottom my-4"></div>
                </div>
            ))}

            {selectedSquare && (
                <SquareModal
                    square={selectedSquare}
                    onClose={() => setSelectedSquare(null)}
                />
            )}
        </div>
    );
}

interface SquareModalProps {
    square: BingoSquareDto;
    onClose: () => void;
}

function SquareModal({square, onClose}: SquareModalProps) {
    const modalRef = React.useRef<HTMLDivElement>(null);

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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "SUBMITTED":
                return "Submitted";
            case "ACCEPTED":
                return "Accepted";
            case "REVEALED":
                return "Revealed";
            default:
                return status;
        }
    };

    return (
        <div className="modal fade" ref={modalRef} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{square.subject}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p className="mb-2">
                            <strong>Status:</strong> {getStatusLabel(square.status)}
                        </p>
                        <p className="mb-0">{square.text}</p>
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
