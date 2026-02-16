import React, {useEffect, useState} from "react";
import {createUser, fetchUsers, type UserDto} from "../api/games";
import {Modal} from "bootstrap";

interface AddPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (userId: string, displayName: string) => void;
    existingUserIds: string[];
}

export function AddPlayerModal({isOpen, onClose, onSelect, existingUserIds}: AddPlayerModalProps) {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState("");
    const [playerDisplayName, setPlayerDisplayName] = useState("");
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const modalRef = React.useRef<HTMLDivElement>(null);
    const nameModalRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers().then(setUsers);
            setShowCreateForm(false);
            setShowNameModal(false);
            setSelectedUserId(null);
            setSelectedUserName("");
            setPlayerDisplayName("");
            setNewName("");
            setNewEmail("");
        }
    }, [isOpen]);

    useEffect(() => {
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

    useEffect(() => {
        if (showNameModal && nameModalRef.current) {
            const m = new Modal(nameModalRef.current);
            m.show();
            const handleClose = () => {
                setShowNameModal(false);
                setSelectedUserId(null);
                setSelectedUserName("");
                setPlayerDisplayName("");
            };
            nameModalRef.current.addEventListener('hidden.bs.modal', handleClose, {once: true});
            return () => {
                m.dispose();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showNameModal]);

    if (!isOpen) return null;

    const handleUserSelect = (userId: string, userName: string) => {
        setSelectedUserId(userId);
        setSelectedUserName(userName);
        setPlayerDisplayName(userName);
        setShowNameModal(true);
    };

    const handleConfirmPlayer = async () => {
        if (!selectedUserId || !playerDisplayName.trim()) return;
        // Close second modal first, then close first modal after a short delay
        setShowNameModal(false);
        await new Promise(resolve => setTimeout(resolve, 150));
        onSelect(selectedUserId, playerDisplayName.trim());
        onClose();
    };

    const availableUsers = users.filter((u) => !existingUserIds.includes(u.id));

    const handleCreateUser = async () => {
        if (!newName.trim() || !newEmail.trim()) return;
        setLoading(true);
        try {
            const user = await createUser(newName.trim(), newEmail.trim());
            setUsers([...users, user]);
            setShowCreateForm(false);
            setNewName("");
            setNewEmail("");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (userId: string, userName: string) => {
        handleUserSelect(userId, userName);
    };

    return (
        <>
        <div className="modal fade" ref={modalRef} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add Player</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {!showCreateForm ? (
                            <div className="list-group">
                                {availableUsers.length === 0 ? (
                                    <div className="text-center text-muted py-4">No available users</div>
                                ) : (
                                    availableUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                            onClick={() => handleSelect(user.id, user.inviteName)}
                                        >
                                            <div>
                                                <div className="fw-bold">{user.inviteName}</div>
                                                <small className="text-muted">{user.email}</small>
                                            </div>
                                            {user.has_logged_in && (
                                                <span className="badge bg-success">Active</span>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="mb-3">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Display name"
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="form-control"
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="btn btn-outline-secondary flex-fill"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateUser}
                                        disabled={loading || !newName.trim() || !newEmail.trim()}
                                        className="btn btn-primary flex-fill"
                                    >
                                        {loading ? "Creating..." : "Create"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {!showCreateForm && (
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                onClick={() => setShowCreateForm(true)}
                            >
                                + Create New User
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {showNameModal && (
            <div className="modal fade" ref={nameModalRef} tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Player Display Name</h5>
                            <button type="button" className="btn-close" onClick={() => setShowNameModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-3">Enter a display name for <strong>{selectedUserName}</strong>:</p>
                            <div className="mb-3">
                                <label className="form-label">Display Name</label>
                                <input
                                    type="text"
                                    value={playerDisplayName}
                                    onChange={(e) => setPlayerDisplayName(e.target.value)}
                                    placeholder="Enter display name"
                                    className="form-control"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleConfirmPlayer()}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowNameModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleConfirmPlayer}
                                disabled={!playerDisplayName.trim()}
                            >
                                Add Player
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
