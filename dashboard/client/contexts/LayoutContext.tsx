import React, { createContext, useContext, useState, ReactNode } from "react";

type LayoutContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  agentMode: string;
  setAgentMode: (v: string) => void;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agentMode, setAgentMode] = useState("sim");

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, agentMode, setAgentMode }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextType {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
