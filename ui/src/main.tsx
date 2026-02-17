import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.tsx'
import { auth } from "./auth";

auth
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
    })
    .catch((error) => {
        console.error('Authentication initialization failed:', error);
    });
