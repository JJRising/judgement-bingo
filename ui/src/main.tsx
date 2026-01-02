import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import keycloak from "./auth/keycloak.ts";

keycloak
    .init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false
    })
    .then(() => {
        createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
    });
