import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Modal} from "bootstrap";
import {
    addPlayer,
    addSubject,
    deletePlayer,
    deleteSubject,
    fetchGame,
    fetchPlayers,
    fetchSubjects,
    publishGame,
    startGame,
    type GameDto,
    type PlayerDto,
    type SubjectDto,
} from "../../api/games";
import {AddPlayerModal} from "../../components/AddPlayerModal";

export function ManagementPage() {
    const {gameId} = useParams<{ gameId: string }>();
    const [game, setGame] = useState<GameDto | null>(null);
    const [players, setPlayers] = useState<PlayerDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [newSubjectLabel, setNewSubjectLabel] = useState("");
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [showStartModal, setShowStartModal] = useState(false);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        if (!gameId) return;
        fetchGame(gameId).then(setGame);
        fetchPlayers(gameId).then(setPlayers);
        fetchSubjects(gameId).then(setSubjects);
    }, [gameId]);

    if (!gameId) return null;

    const isSetup = game?.status === "SETUP";
    const isPrompts = game?.status === "PROMPTS";

    const handleAddPlayer = async (userId: string, displayName: string) => {
        const player = await addPlayer(gameId, userId, displayName);
        setPlayers([...players, player]);
        fetchSubjects(gameId).then(setSubjects);
    };

    const handleDeletePlayer = async (playerId: string) => {
        await deletePlayer(gameId, playerId);
        setPlayers(players.filter((p) => p.id !== playerId));
        fetchSubjects(gameId).then(setSubjects);
    };

    const handleAddSubject = async () => {
        if (!newSubjectLabel.trim()) return;
        const subject = await addSubject(gameId, newSubjectLabel.trim());
        setSubjects([...subjects, subject]);
        setNewSubjectLabel("");
    };

    const handleDeleteSubject = async (subjectId: string) => {
        await deleteSubject(gameId, subjectId);
        setSubjects(subjects.filter((s) => s.id !== subjectId));
    };

    const handlePublish = async () => {
        if (!gameId) return;
        setPublishing(true);
        try {
            const updatedGame = await publishGame(gameId);
            setGame(updatedGame);
            setShowPublishModal(false);
        } finally {
            setPublishing(false);
        }
    };

    const handleStart = async () => {
        if (!gameId) return;
        setStarting(true);
        try {
            const updatedGame = await startGame(gameId);
            setGame(updatedGame);
            setShowStartModal(false);
        } finally {
            setStarting(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "SETUP":
                return "bg-secondary";
            case "PROMPTS":
                return "bg-primary";
            case "GAME":
                return "bg-warning";
            case "COMPLETE":
                return "bg-success";
            default:
                return "bg-secondary";
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Management</h2>
                {game && (
                    <span className={`badge fs-6 ${getStatusBadgeClass(game.status)}`}>
                        {game.status}
                    </span>
                )}
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6 border rounded p-3">
                    <h5 className="mb-3">Players</h5>
                    <div className="list-group mb-3">
                        {players.map((player) => (
                            <div
                                key={player.id}
                                className="list-group-item d-flex justify-content-between align-items-center bg-light"
                            >
                                <span>{player.displayName}</span>
                                {isSetup && (
                                    <button
                                        onClick={() => handleDeletePlayer(player.id)}
                                        className="btn btn-sm btn-link text-danger"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {isSetup && (
                        <button
                            onClick={() => setShowPlayerModal(true)}
                            className="btn btn-primary w-100"
                        >
                            Add Player
                        </button>
                    )}
                </div>

                <div className="col-md-6 border rounded p-3">
                    <h5 className="mb-3">Subjects</h5>
                    <div className="list-group mb-3">
                        {subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="list-group-item d-flex justify-content-between align-items-center bg-light"
                            >
                                <div>
                                    <span>{subject.displayName}</span>
                                    <span className="ms-2 badge bg-secondary">
                                        {subject.type}
                                    </span>
                                </div>
                                {isSetup && subject.type?.toUpperCase() !== "PLAYER" && (
                                    <button
                                        onClick={() => handleDeleteSubject(subject.id)}
                                        className="btn btn-sm btn-link text-danger"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {isSetup && (
                        <div className="d-flex gap-2">
                            <input
                                type="text"
                                value={newSubjectLabel}
                                onChange={(e) => setNewSubjectLabel(e.target.value)}
                                placeholder="Subject label"
                                className="form-control"
                                onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                            />
                            <button
                                onClick={handleAddSubject}
                                className="btn btn-primary"
                            >
                                Add
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AddPlayerModal
                isOpen={showPlayerModal}
                onClose={() => setShowPlayerModal(false)}
                onSelect={handleAddPlayer}
                existingUserIds={players.map((p) => p.userId)}
            />

            <div className="mt-4 pt-3 border-top">
                {isSetup && (
                    <button
                        onClick={() => setShowPublishModal(true)}
                        className="btn btn-success w-100"
                    >
                        Publish Game
                    </button>
                )}
                {isPrompts && (
                    <button
                        onClick={() => setShowStartModal(true)}
                        className="btn btn-primary w-100"
                    >
                        Start Game
                    </button>
                )}
            </div>

            <PublishGameModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                onPublish={handlePublish}
                publishing={publishing}
            />

            <StartGameModal
                isOpen={showStartModal}
                onClose={() => setShowStartModal(false)}
                onStart={handleStart}
                starting={starting}
            />
        </div>
    );
}

interface PublishGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: () => void;
    publishing: boolean;
}

function PublishGameModal({isOpen, onClose, onPublish, publishing}: PublishGameModalProps) {
    const modalRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen && modalRef.current) {
            const m = new Modal(modalRef.current);
            m.show();
            const handleClose = () => onClose();
            modalRef.current.addEventListener('hidden.bs.modal', handleClose, {once: true});
            return () => {
                m.dispose();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal fade" ref={modalRef} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Publish Game</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to publish this game? Once published, players will be able to join and play.</p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={publishing}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={onPublish}
                            disabled={publishing}
                        >
                            {publishing ? "Publishing..." : "Publish"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StartGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: () => void;
    starting: boolean;
}

function StartGameModal({isOpen, onClose, onStart, starting}: StartGameModalProps) {
    const modalRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen && modalRef.current) {
            const m = new Modal(modalRef.current);
            m.show();
            const handleClose = () => onClose();
            modalRef.current.addEventListener('hidden.bs.modal', handleClose, {once: true});
            return () => {
                m.dispose();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal fade" ref={modalRef} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Start Game</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to start the game? This will transition the game to the prompts phase.</p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={starting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onStart}
                            disabled={starting}
                        >
                            {starting ? "Starting..." : "Start"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
