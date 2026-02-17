import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.tsx'
import { auth, AUTH_PROVIDER } from "./auth";

async function initAuth() {
    if (AUTH_PROVIDER === 'google') {
        // Google auth - just initialize the script, login is triggered by user click
        await auth.init();
    } else {
        // Keycloak auth
        await auth.init({
            onLoad: "login-required",
            pkceMethod: "S256",
            checkLoginIframe: false
        });
    }
}

initAuth()
    .then(() => {
        createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
    })
    .catch((error) => {
        console.error('Authentication initialization failed:', error);
    });
