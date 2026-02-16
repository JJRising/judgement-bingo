import {useState} from "react";
import type {SubjectDto} from "../api/games";

interface AddPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (subjectId: string, text: string) => void;
    subjects: SubjectDto[];
    excludedSubjectId: string | null;
}

export function AddPromptModal({
    isOpen,
    onClose,
    onSubmit,
    subjects,
    excludedSubjectId,
}: AddPromptModalProps) {
    const [subjectId, setSubjectId] = useState("");
    const [text, setText] = useState("");

    const availableSubjects = subjects.filter((s) => s.id !== excludedSubjectId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectId || !text.trim()) return;
        onSubmit(subjectId, text.trim());
        setSubjectId("");
        setText("");
    };

    const handleClose = () => {
        setSubjectId("");
        setText("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add New Prompt</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Subject</label>
                                <select
                                    className="form-select"
                                    value={subjectId}
                                    onChange={(e) => setSubjectId(e.target.value)}
                                    required
                                >
                                    <option value="">Select a subject...</option>
                                    {availableSubjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.displayName}
                                            {subject.type && ` (${subject.type})`}
                                        </option>
                                    ))}
                                </select>
                                {availableSubjects.length === 0 && (
                                    <div className="form-text text-warning">
                                        No subjects available. Subjects must be added by an admin first.
                                    </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Prompt Text</label>
                                <textarea
                                    className="form-control"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={5}
                                    required
                                    placeholder="Enter your prompt..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!subjectId || !text.trim()}
                            >
                                Add Prompt
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
