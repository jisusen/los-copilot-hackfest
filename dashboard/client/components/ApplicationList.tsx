import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { LoanSummary, AgentState } from "../lib/types";
import { formatRpShort, crdeCls } from "../lib/format";

type RowState = "idle" | "selected" | "running" | "ready" | "decided" | "error";

function getRowState(appId: string, selected: Set<string>, sessions: Map<string, AgentState>): RowState {
  const s = sessions.get(appId);
  if (s) return s.status as RowState;
  if (selected.has(appId)) return "selected";
  return "idle";
}

export function ApplicationList({
  loans,
  selected,
  sessions,
  onToggle,
}: {
  loans: LoanSummary[];
  selected: Set<string>;
  sessions: Map<string, AgentState>;
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return loans;
    return loans.filter(l =>
      l.id.toLowerCase().includes(q) ||
      l.debtor_name.toLowerCase().includes(q) ||
      l.product_type.toLowerCase().includes(q),
    );
  }, [loans, query]);

  if (loans.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 8 }}>
        <div style={{ fontSize: 28, color: "var(--ink-5)" }}>◎</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-3)" }}>No pending applications</div>
        <div style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center", lineHeight: 1.5, fontFamily: "var(--font-mono)" }}>
          All applications have been processed.
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Search */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
        <input
          type="text"
          className="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or APP ID…"
        />
      </div>

      {/* List */}
      <div data-testid="loan-queue-list" style={{ flex: 1, overflow: "auto" }}>
        {filtered.map(loan => {
          const rowState = getRowState(loan.id, selected, sessions);
          const isRunning  = rowState === "running";
          const isReady    = rowState === "ready";
          const isDecided  = rowState === "decided";
          const isError    = rowState === "error";
          const isActive   = isRunning || isReady || isDecided || isError;
          const isSel      = rowState === "selected";

          const session = sessions.get(loan.id);
          const agentResult = session?.status === "ready" ? session.result : undefined;
          const decisionStr = session?.status === "decided" ? session.decision : undefined;

          const rightTag = () => {
            if (isRunning) {
              const pct = session?.status === "running" ? session.pct : 0;
              return <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--blue)" }}>{pct}%</span>;
            }
            if (isReady && agentResult) {
              const cls = crdeCls(agentResult.crdeDecision);
              return <span className={`tag ${cls}`} style={{ cursor: "pointer" }}>Review →</span>;
            }
            if (isDecided && decisionStr) {
              const cls = decisionStr === "approve" ? "green" : decisionStr === "reject" ? "red" : "";
              const label = decisionStr === "approve" ? "APPROVED" : decisionStr === "reject" ? "REJECTED" : decisionStr.toUpperCase();
              return <span className={`tag ${cls}`}>{label}</span>;
            }
            if (isError) return <span className="tag red">ERROR</span>;
            return <span className={`tag ${loan.risk_score === "HIGH" ? "red" : loan.risk_score === "LOW" ? "green" : "amber"}`}>{loan.risk_score}</span>;
          };

          return (
            <div
              key={loan.id}
              data-testid={`loan-row-${loan.id}`}
              onClick={() => { if (isReady) { navigate(`/review/${loan.id}`); } else if (!isActive) { onToggle(loan.id); } }}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 68px 1fr auto",
                gap: 10,
                alignItems: "center",
                padding: "10px 14px",
                borderLeft: `2px solid ${isSel ? "var(--accent)" : "transparent"}`,
                background: isSel ? "var(--accent-soft)" : "transparent",
                borderBottom: "1px solid var(--line)",
                cursor: isActive ? "default" : "pointer",
                opacity: isDecided ? 0.5 : 1,
              }}
            >
              {/* Checkbox */}
              <div
                data-testid={`loan-checkbox-${loan.id}`}
                style={{
                  width: 14, height: 14,
                  border: `1.5px solid ${isSel ? "var(--accent)" : "var(--ink-4)"}`,
                  borderRadius: 2,
                  background: isSel ? "var(--accent)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  opacity: isActive ? 0.4 : 1,
                }}
              >
                {isSel && (
                  <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                )}
              </div>

              {/* ID */}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{loan.id}</span>

              {/* Name + product */}
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, color: "var(--ink)" }}>{loan.debtor_name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", marginTop: 1 }}>
                  {loan.product_type} · {formatRpShort(loan.amount_requested)}
                </div>
              </div>

              {/* Right tag */}
              <div data-testid={`loan-status-${loan.id}`} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                {rightTag()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
