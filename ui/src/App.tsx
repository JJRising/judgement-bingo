import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { GameLayout } from "./pages/game/GameLayout";
import { ManagementPage } from "./pages/game/ManagementPage";
import { ComingSoon } from "./pages/game/ComingSoon";
import { hasRole } from "./auth";

function RequireAdmin({ children }: { children: React.ReactNode }) {
    if (!hasRole("ADMIN")) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route path="/games/:gameId" element={<Navigate to="my-card" replace />} />

                <Route path="/games/:gameId" element={<GameLayout />}>
                    <Route
                        path="management"
                        element={
                            <RequireAdmin>
                                <ManagementPage />
                            </RequireAdmin>
                        }
                    />
                    <Route path="prompts" element={<ComingSoon title="Prompts" />} />
                    <Route path="my-card" element={<ComingSoon title="My Bingo Card" />} />
                    <Route path="others-cards" element={<ComingSoon title="Others' Cards" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
