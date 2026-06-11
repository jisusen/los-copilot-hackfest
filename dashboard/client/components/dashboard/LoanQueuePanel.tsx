import React, { useState, useMemo } from "react";
import type { LoanSummary, AgentState } from "../../lib/types";
import { formatRpShort,crdeCls } from "../../lib/format";
import BadgeRisk from "./BadgeRisk";
type RowState = "idle" | "selected" | "running" | "ready" | "decided" | "error";

function getRowState(appId: string, selected: Set<string>, sessions: Map<string, AgentState>): RowState {
  const s = sessions.get(appId);
  if (s) return s.status as RowState;
  if (selected.has(appId)) return "selected";
  return "idle";
}
export default function LoanQueuePanel({
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
    <>
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-base font-bold text-gray-900">Task list</h2>
      </div>
      <div className="px-3 pb-2 flex gap-2">
        <div className="relative flex-1">
          <svg className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
          <input placeholder="Search by name or APP ID..." 
          className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400"
          value={query}
          onChange={e => setQuery(e.target.value)} />
        </div>
        <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
         
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

              return (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                  {pct}%
                </span>
              );
            }

            if (isReady && agentResult) {
              const cls = crdeCls(agentResult.crdeDecision);

              return (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cls}`}>
                 Review →
                </span>
              );
            }

            if (isDecided && decisionStr) {
              const cls =
                decisionStr === "approve"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : decisionStr === "reject"
                  ? "bg-red-100 text-red-600 border border-red-200"
                  : "";

              const label =
                decisionStr === "approve"
                  ? "APPROVED"
                  : decisionStr === "reject"
                  ? "REJECTED"
                  : decisionStr.toUpperCase();

              return (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cls}`}>
                  {label}
                </span>
              );
            }

            if (isError) {
              return (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">
                  ERROR
                </span>
              );
            }

            return (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  loan.risk_score === "HIGH"
                    ? "bg-red-100 text-red-600 border border-red-200"
                    : loan.risk_score === "LOW"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-orange-100 text-orange-600 border border-orange-200"
                }`}
              >
                {loan.risk_score}
              </span>
            );
          };

          return (
          <div   key={loan.id}
              data-testid={`loan-row-${loan.id}`}
              onClick={() => !isActive && onToggle(loan.id)}
               className="flex items-center gap-2 px-2 py-2.5 hover:bg-gray-50 cursor-pointer border-b">
           <input
                type="checkbox"
                checked={selected.has(loan.id)}
                onChange={() => !isActive && onToggle(loan.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 accent-red-500 shrink-0"
              />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">{loan.id}</span>
                {rightTag()} 
                
              </div>
              <div className="text-xs font-semibold text-gray-800 truncate">{loan.debtor_name}</div>
              <div className="text-[10px] text-gray-400">{loan.product_type} · {formatRpShort(loan.amount_requested)}</div>
            </div>
          </div>
          )
})}

      </div>
   </>
)};