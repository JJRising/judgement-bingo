import {useEffect, useState} from "react";
import {createUser, fetchUsers, type UserDto} from "../api/games";

interface AddPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (userId: string) => void;
    existingUserIds: string[];
}

export function AddPlayerModal({isOpen, onClose, onSelect, existingUserIds}: AddPlayerModalProps) {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers().then(setUsers);
            setShowCreateForm(false);
            setNewName("");
            setNewEmail("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

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

    const handleSelect = (userId: string) => {
        onSelect(userId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add Player</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
                </div>

                {!showCreateForm ? (
                    <>
                        <ul className="space-y-2 mb-4">
                            {availableUsers.length === 0 ? (
                                <li className="text-gray-500 text-center py-4">No available users</li>
                            ) : (
                                availableUsers.map((user) => (
                                    <li
                                        key={user.id}
                                        className="flex items-center justify-between bg-gray-50 p-3 rounded hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleSelect(user.id)}
                                    >
                                        <div>
                                            <div className="font-medium">{user.inviteName}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                        {user.has_logged_in && (
                                            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Active</span>
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full border border-dashed border-gray-300 text-gray-600 py-2 rounded hover:bg-gray-50"
                        >
                            + Create New User
                        </button>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Display name"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={loading || !newName.trim() || !newEmail.trim()}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
