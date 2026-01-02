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
            <h1 className="text-2xl font-bold mb-4">Management</h1>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1 border border-gray-300 rounded p-4">
                    <h2 className="text-lg font-semibold mb-3">Players</h2>
                    <ul className="space-y-2 mb-4">
                        {players.map((player) => (
                            <li
                                key={player.id}
                                className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                                <span>{player.displayName}</span>
                                <button
                                    onClick={() => handleDeletePlayer(player.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => setShowPlayerModal(true)}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                    >
                        Add Player
                    </button>
                </div>

                <div className="flex-1 border border-gray-300 rounded p-4">
                    <h2 className="text-lg font-semibold mb-3">Subjects</h2>
                    <ul className="space-y-2 mb-4">
                        {subjects.map((subject) => (
                            <li
                                key={subject.id}
                                className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                                <div>
                                    <span>{subject.displayName}</span>
                                    <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                        {subject.type}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDeleteSubject(subject.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSubjectLabel}
                            onChange={(e) => setNewSubjectLabel(e.target.value)}
                            placeholder="Subject label"
                            className="flex-1 border border-gray-300 rounded px-2 py-1"
                            onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                        />
                        <button
                            onClick={handleAddSubject}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
