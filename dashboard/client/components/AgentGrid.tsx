import React from "react";
import { ReviewCard } from "./ReviewCard";
import { useSessions } from "../App";
import type { LoanSummary } from "../lib/types";

export function AgentGrid({
  sessions,
  loans,
}: {
  sessions: ReturnType<typeof useSessions>["sessions"];
  loans: LoanSummary[];
}) {
  const { screenshots, tabIds } = useSessions();
  const loanMap = new Map(loans.map(l => [l.id, l]));

  // Only render non-idle sessions (running/error — ready/decided shown in DashboardPage)
  const entries = Array.from(sessions.entries()).filter(([, s]) => s.status === "running" || s.status === "error");

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--ink-3)", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>◌</div>
        No agents running.<br />
        Select loans from the queue and click <strong>Run review</strong> to start.
      </div>
    );
  }

  return (
    <div
      data-testid="agent-grid"
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 14 }}
    >
      {entries.map(([appId, state]) => (
        <ReviewCard
          key={appId}
          appId={appId}
          loan={loanMap.get(appId)}
          state={state}
          screenshot={screenshots.get(appId)}
          tabId={tabIds.get(appId)}
        />
      ))}
    </div>
  );
}
