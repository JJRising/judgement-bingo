// Simple auth state manager using custom events
type AuthChangeCallback = (isAuthenticated: boolean) => void;

const listeners: AuthChangeCallback[] = [];

export function subscribeToAuthChanges(callback: AuthChangeCallback): () => void {
    listeners.push(callback);
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
}

export function notifyAuthChange(isAuthenticated: boolean): void {
    listeners.forEach((callback) => callback(isAuthenticated));
}
