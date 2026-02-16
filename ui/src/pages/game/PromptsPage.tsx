import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {
    createPrompt,
    deletePrompt,
    approvePrompt,
    fetchGame,
    fetchPrompts,
    fetchSubjects,
    fetchMyPlayer,
    type GameDto,
    type PromptDto,
    type SubjectDto,
} from "../../api/games";
import {hasRole} from "../../auth";
import {AddPromptModal} from "../../components/AddPromptModal";

export function PromptsPage() {
    const {gameId} = useParams<{ gameId: string }>();
    const [game, setGame] = useState<GameDto | null>(null);
    const [prompts, setPrompts] = useState<PromptDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const isAdmin = hasRole("ADMIN");
    const isPrompts = game?.status === "PROMPTS";

    useEffect(() => {
        if (!gameId) return;

        Promise.all([
            fetchGame(gameId),
            fetchPrompts(gameId),
            fetchMyPlayer(gameId).catch(() => null),
            fetchSubjects(gameId).catch(() => []),
        ])
            .then(([gameData, promptsData, myPlayer, subjectsData]) => {
                setGame(gameData);
                setPrompts(promptsData);
                setMyPlayerId(myPlayer?.id ?? null);
                setSubjects(subjectsData);
            })
            .finally(() => setLoading(false));
    }, [gameId]);

    if (!gameId) return null;

    const handleCreatePrompt = async (subjectId: string, text: string) => {
        const prompt = await createPrompt(gameId, subjectId, text);
        setPrompts([...prompts, prompt]);
        setShowAddModal(false);
    };

    const handleApprove = async (promptId: string) => {
        await approvePrompt(gameId, promptId);
        setPrompts(
            prompts.map((p) =>
                p.id === promptId
                    ? {...p, status: "ACCEPTED", approvedBy: "current-user", approvedByName: "You"}
                    : p
            )
        );
    };

    const handleDelete = async (promptId: string) => {
        if (!confirm("Are you sure you want to delete this prompt?")) return;
        await deletePrompt(gameId, promptId);
        setPrompts(prompts.filter((p) => p.id !== promptId));
    };

    const availableSubjects = subjects.filter((s) => s.playerId !== myPlayerId);

    if (loading) {
        return <div>Loading prompts...</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Prompts</h2>
                {isPrompts && (
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        Add Prompt
                    </button>
                )}
            </div>

            {prompts.length === 0 ? (
                <div className="text-muted">No prompts yet. Be the first to add one!</div>
            ) : (
                <div className="accordion" id="promptsAccordion">
                    {prompts.map((prompt) => {
                        const isAccepted = prompt.status === "ACCEPTED" || prompt.status === "REVEALED";
                        const isRevealed = prompt.status === "REVEALED";
                        const isCreator = prompt.createdBy === myPlayerId;
                        const isExpanded = expandedId === prompt.id;

                        return (
                            <div className="accordion-item" key={prompt.id}>
                                <h2 className="accordion-header">
                                    <button
                                        className={`accordion-button ${isExpanded ? "" : "collapsed"}`}
                                        type="button"
                                        onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                        }}
                                    >
                                        <span
                                            className={`badge ${isRevealed ? "bg-success" : isAccepted ? "bg-info" : "bg-warning"}`}
                                            style={{flexShrink: 0}}
                                        >
                                            {isRevealed ? "Revealed" : isAccepted ? "Accepted" : "Submitted"}
                                        </span>
                                        <span
                                            className="badge bg-info text-dark"
                                            style={{flexShrink: 0}}
                                        >
                                            {prompt.subjectName}
                                        </span>
                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                maxWidth: "300px",
                                            }}
                                        >
                                            {prompt.text.substring(0, 50)}
                                            {prompt.text.length > 50 ? "..." : ""}
                                        </span>
                                    </button>
                                </h2>
                                <div
                                    className={`accordion-collapse collapse ${isExpanded ? "show" : ""}`}
                                >
                                    <div className="accordion-body">
                                        <p className="mb-2">
                                            <strong>Created by:</strong> {prompt.createdByName}
                                        </p>
                                        <p className="mb-3" style={{whiteSpace: "pre-wrap"}}>
                                            {prompt.text}
                                        </p>
                                        {isAccepted && (
                                            <p className="mb-3 text-muted">
                                                <strong>Approved by:</strong> {prompt.approvedByName}
                                            </p>
                                        )}
                                        <div className="d-flex gap-2">
                                            {isPrompts && !isAccepted && !isCreator && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleApprove(prompt.id)}
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {isAdmin && isPrompts && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(prompt.id)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AddPromptModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleCreatePrompt}
                subjects={availableSubjects}
                excludedSubjectId={myPlayerId}
            />
        </div>
    );
}
