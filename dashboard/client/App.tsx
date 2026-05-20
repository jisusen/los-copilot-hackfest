import React, { createContext, useContext, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";
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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/review/:appId" element={<ReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionsContext.Provider>
  );
}
