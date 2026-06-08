import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/DashboardPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { LoginPage } from "./pages/LoginPage";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import { LayoutProvider, useLayout } from "./contexts/LayoutContext";
import { useAgentSessions } from "./hooks/useAgentSessions";
import { useWebSocket } from "./hooks/useWebSocket";
import type { AgentState } from "./lib/types";
import { ToastProvider } from "./components/Toast";
import { apiFetch } from "./lib/api";

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

type AuthCtx = {
  user: string | null;
  loading: boolean;
  login: (username: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthCtx>({ user: null, loading: true, login: () => {}, logout: () => {} });
export function useAuth() {
  return useContext(AuthContext);
}

export function App() {
  const [screenshots, setScreenshots] = useState(new Map<string, string>());
  const { sessions, handleWsMessage, dispatch } = useAgentSessions();
  const [user, setUser] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ username: string }>("/api/auth/me")
      .then((d) => { setUser(d.username); })
      .catch(() => { setUser(null); })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback((username: string) => {
    setUser(username);
  }, []);

  const logout = useCallback(() => {
    apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

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
    <ToastProvider>
      <AuthContext.Provider value={{ user, loading: authLoading, login, logout }}>
        <SessionsContext.Provider value={{ sessions, screenshots, dispatch }}>
          <LayoutProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </LayoutProvider>
        </SessionsContext.Provider>
      </AuthContext.Provider>
    </ToastProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-mono">Checking session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f3f3] overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar agentmode="" />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AuthHeader />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/review/:appId" element={<ReviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AuthHeader() {
  const { agentMode, setAgentMode, liveOn, setLiveOn, setSidebarOpen } = useLayout();
  return (
    <Header
      agentMode={agentMode}
      onAgentMode={setAgentMode}
      liveOn={liveOn}
      onLive={setLiveOn}
      onMenuClick={() => setSidebarOpen(true)}
    />
  );
}
