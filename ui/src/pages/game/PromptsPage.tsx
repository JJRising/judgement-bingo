import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {
    acknowledgePrompt,
    completePrompt,
    createPrompt,
    deletePrompt,
    incompletePrompt,
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
    const [subjectFilter, setSubjectFilter] = useState<string>("all");

    const isAdmin = hasRole("ADMIN");
    const isPrompts = game?.status === "PROMPTS";
    const isGame = game?.status === "GAME";

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

    const handleComplete = async (promptId: string) => {
        await completePrompt(gameId, promptId);
        setPrompts(
            prompts.map((p) =>
                p.id === promptId
                    ? {...p, status: "COMPLETED", completedBy: "current-user", completedByName: "You"}
                    : p
            )
        );
    };

    const handleIncomplete = async (promptId: string) => {
        await incompletePrompt(gameId, promptId);
        setPrompts(
            prompts.map((p) =>
                p.id === promptId
                    ? {...p, status: "ACCEPTED", completedBy: null, completedByName: null}
                    : p
            )
        );
    };

    const handleAcknowledge = async (promptId: string) => {
        await acknowledgePrompt(gameId, promptId);
        setPrompts(
            prompts.map((p) =>
                p.id === promptId
                    ? {...p, status: "ACKNOWLEDGED", acknowledgedBy: "current-user", acknowledgedByName: "You"}
                    : p
            )
        );
    };

    const availableSubjects = subjects.filter((s) => s.playerId !== myPlayerId);

    // Get unique subject names from prompts
    const uniqueSubjectNames = Array.from(
        new Set(prompts.map((p) => p.subjectName))
    ).sort((a, b) => a.localeCompare(b));

    // Filter and sort prompts
    const filteredPrompts = prompts
        .filter((p) => subjectFilter === "all" || p.subjectName === subjectFilter)
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

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

            {uniqueSubjectNames.length > 0 && (
                <div className="mb-3">
                    <label htmlFor="subjectFilter" className="form-label me-2">
                        Filter by subject:
                    </label>
                    <select
                        id="subjectFilter"
                        className="form-select form-select-sm"
                        style={{width: "auto", display: "inline-block"}}
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                    >
                        <option value="all">All subjects</option>
                        {uniqueSubjectNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {filteredPrompts.length === 0 ? (
                <div className="text-muted">
                    {prompts.length === 0
                        ? "No prompts yet. Be the first to add one!"
                        : "No prompts match the selected filter."}
                </div>
            ) : (
                <div className="accordion" id="promptsAccordion">
                    {filteredPrompts.map((prompt) => {
                        const isAccepted = prompt.status === "ACCEPTED" || prompt.status === "COMPLETED" || prompt.status === "ACKNOWLEDGED";
                        const isCompleted = prompt.status === "COMPLETED";
                        const isAcknowledged = prompt.status === "ACKNOWLEDGED";
                        const isCreator = prompt.createdBy === myPlayerId;
                        const isApprover = prompt.approvedBy === myPlayerId;
                        const isCompleter = prompt.completedBy === myPlayerId || prompt.completedBy === "current-user";
                        const canComplete = isGame && (isCreator || isApprover) && !isCompleted && !isAcknowledged;
                        const canAcknowledge = isGame && isCompleted && !isAcknowledged && !prompt.completedBy && prompt.completedBy !== "current-user";
                        const canIncomplete = isGame && isCompleter && !isAcknowledged;
                        const isExpanded = expandedId === prompt.id;

                        const getStatusBadge = () => {
                            switch (prompt.status) {
                                case "SUBMITTED": return <span className="badge bg-warning">Submitted</span>;
                                case "ACCEPTED": return <span className="badge bg-info">Accepted</span>;
                                case "COMPLETED": return <span className="badge bg-warning text-dark">Completed</span>;
                                case "ACKNOWLEDGED": return <span className="badge bg-success">Acknowledged</span>;
                                default: return null;
                            }
                        };

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
                                        {getStatusBadge()}
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
                                        {prompt.approvedByName && (
                                            <p className="mb-2 text-muted">
                                                <strong>Approved by:</strong> {prompt.approvedByName}
                                            </p>
                                        )}
                                        {prompt.completedByName && (
                                            <p className="mb-2 text-muted">
                                                <strong>Completed by:</strong> {prompt.completedByName}
                                            </p>
                                        )}
                                        {prompt.acknowledgedByName && (
                                            <p className="mb-3 text-muted">
                                                <strong>Acknowledged by:</strong> {prompt.acknowledgedByName}
                                            </p>
                                        )}
                                        <div className="d-flex gap-2 flex-wrap">
                                            {isPrompts && !isAccepted && !isCreator && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleApprove(prompt.id)}
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {canComplete && (
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleComplete(prompt.id)}
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            {canIncomplete && (
                                                <button
                                                    className="btn btn-outline-warning btn-sm"
                                                    onClick={() => handleIncomplete(prompt.id)}
                                                >
                                                    Incomplete
                                                </button>
                                            )}
                                            {canAcknowledge && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleAcknowledge(prompt.id)}
                                                >
                                                    Acknowledge
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
