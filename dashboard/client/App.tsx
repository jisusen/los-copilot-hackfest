import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useAgentSessions } from "./hooks/useAgentSessions";
import { useWebSocket } from "./hooks/useWebSocket";
import type { AgentState } from "./lib/types";
import { ToastProvider } from "./components/Toast";

type SessionsCtx = {
  sessions: Map<string, AgentState>;
  screenshots: Map<string, string>;
  tabIds: Map<string, string>;
  dispatch: (action: any) => void;
};

export const SessionsContext = createContext<SessionsCtx>({
  sessions: new Map(),
  screenshots: new Map(),
  tabIds: new Map(),
  dispatch: () => {},
});
export function useSessions() {
  return useContext(SessionsContext);
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function App() {
  const [screenshots, setScreenshots] = useState(new Map<string, string>());
  const [tabIds, setTabIds] = useState(new Map<string, string>());
  const { sessions, handleWsMessage, dispatch } = useAgentSessions();

  const handleAllWs = useCallback(
    (msg: any) => {
      if (msg.type === "agent:screenshot") {
        setScreenshots((prev) => {
          const next = new Map(prev);
          next.set(msg.appId, msg.screenshot);
          return next;
        });
        if (msg.tabId) {
          setTabIds((prev) => {
            const next = new Map(prev);
            next.set(msg.appId, msg.tabId);
            return next;
          });
        }
      } else {
        handleWsMessage(msg);
      }
    },
    [handleWsMessage],
  );

  useWebSocket(handleAllWs);

  return (
    <ToastProvider>
    <SessionsContext.Provider value={{ sessions, screenshots, tabIds, dispatch }}>
      <BrowserRouter>
        <Routes>
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
    </ToastProvider>
  );
}
