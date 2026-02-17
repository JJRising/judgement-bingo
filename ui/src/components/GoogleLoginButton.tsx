import { google, AUTH_PROVIDER } from "../auth";

export function GoogleLoginButton({ onLogin }: { onLogin?: () => void }) {
    if (AUTH_PROVIDER !== 'google') {
        return null;
    }

    const handleLogin = async () => {
        try {
            await google.login();
            onLogin?.();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <button
            className="btn btn-primary"
            onClick={handleLogin}
        >
            Sign in with Google
        </button>
    );
}
