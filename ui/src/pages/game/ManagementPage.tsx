import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {
    addPlayer,
    addSubject,
    deletePlayer,
    deleteSubject,
    fetchPlayers,
    fetchSubjects,
    type PlayerDto,
    type SubjectDto,
} from "../../api/games";
import {AddPlayerModal} from "../../components/AddPlayerModal";

export function ManagementPage() {
    const {gameId} = useParams<{ gameId: string }>();
    const [players, setPlayers] = useState<PlayerDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [newSubjectLabel, setNewSubjectLabel] = useState("");
    const [showPlayerModal, setShowPlayerModal] = useState(false);

    useEffect(() => {
        if (!gameId) return;
        fetchPlayers(gameId).then(setPlayers);
        fetchSubjects(gameId).then(setSubjects);
    }, [gameId]);

    if (!gameId) return null;

    const handleAddPlayer = async (userId: string) => {
        const player = await addPlayer(gameId, userId);
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

    return (
        <div>
            <h2 className="mb-4">Management</h2>

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
                                <button
                                    onClick={() => handleDeletePlayer(player.id)}
                                    className="btn btn-sm btn-link text-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowPlayerModal(true)}
                        className="btn btn-primary w-100"
                    >
                        Add Player
                    </button>
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
                                <button
                                    onClick={() => handleDeleteSubject(subject.id)}
                                    className="btn btn-sm btn-link text-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
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
                </div>
            </div>

            <AddPlayerModal
                isOpen={showPlayerModal}
                onClose={() => setShowPlayerModal(false)}
                onSelect={handleAddPlayer}
                existingUserIds={players.map((p) => p.userId)}
            />
        </div>
    );
}
