import React, { useState, useMemo } from "react";
import type { LoanSummary, AgentState } from "../../lib/types";
import { formatRpShort,crdeCls } from "../../lib/format";

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
  onSync,
  syncing,
}: {
  loans: LoanSummary[];
  selected: Set<string>;
  sessions: Map<string, AgentState>;
  onToggle: (id: string) => void;
  onSync?: () => void;
  syncing?: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const available = loans.filter(l => {
      const s = sessions.get(l.id);
      if (!s) return true;
      return s.status === "error";
    });
    if (!q) return available;
    return available.filter(l =>
      l.id.toLowerCase().includes(q) ||
      l.debtor_name.toLowerCase().includes(q) ||
      l.product_type.toLowerCase().includes(q),
    );
  }, [loans, query, sessions]);

  if (loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-2">
        <div className="text-3xl text-slate-400">◎</div>
        <div className="text-sm font-medium text-slate-500">No pending applications</div>
        <div className="text-xs text-slate-400 text-center leading-relaxed font-mono">
          All applications have been processed.
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
         <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h2 className="text-base font-bold text-gray-900">Task list</h2>
        <button
          onClick={onSync}
          disabled={syncing}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <svg className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 4v6h6M23 20v-6h-6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
          {syncing ? "Syncing..." : "Sync"}
        </button>
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
                title="Risk Score"
                className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-help ${
                  loan.risk_score === "HIGH"
                    ? "bg-red-100 text-red-600 border border-red-200"
                    : loan.risk_score === "LOW"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-orange-100 text-orange-600 border border-orange-200"
                }`}
              >
               {`CRDE SCORE: ${loan.risk_score}`}
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
                <span className="text-[10px] text-gray-400 font-medium" title="Application ID">{loan.id}</span>
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