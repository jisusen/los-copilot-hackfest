import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { useAgentSessions } from "./hooks/useAgentSessions";
import { useWebSocket } from "./hooks/useWebSocket";
import type { AgentState } from "./lib/types";

type SessionsCtx = {
  sessions: Map<string, AgentState>;
  screenshots: Map<string, string>;
  dispatch: (action: any) => void;
};

export const SessionsContext = createContext<SessionsCtx>({
  sessions: new Map(),
  screenshots: new Map(),
  dispatch: () => {},
});
export function useSessions() {
  return useContext(SessionsContext);
}

function useAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.username ?? null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--ink-3)",
        }}
      >
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  const [screenshots, setScreenshots] = useState(new Map<string, string>());
  const { sessions, handleWsMessage, dispatch } = useAgentSessions();

  const handleAllWs = useCallback(
    (msg: any) => {
      if (msg.type === "agent:screenshot") {
        setScreenshots((prev) => {
          const next = new Map(prev);
          next.set(msg.appId, msg.screenshot);
          return next;
        });
      } else {
        handleWsMessage(msg);
      }
    },
    [handleWsMessage],
  );

  useWebSocket(handleAllWs);

  return (
    <SessionsContext.Provider value={{ sessions, screenshots, dispatch }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review/:appId"
            element={
              <ProtectedRoute>
                <ReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionsContext.Provider>
  );
}
