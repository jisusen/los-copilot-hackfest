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
  const { screenshots } = useSessions();
  const loanMap = new Map(loans.map(l => [l.id, l]));

  // Only render non-idle sessions (running/error — ready/decided shown in DashboardPage)
  const entries = Array.from(sessions.entries()).filter(([, s]) => s.status === "running" || s.status === "error");

  if (entries.length === 0) return null;

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
        />
      ))}
    </div>
  );
}
