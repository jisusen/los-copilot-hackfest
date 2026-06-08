import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Skeleton } from "../components/Skeleton";

type AuditEntry = {
  id: string;
  appId: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
};

const MOCK_AUDIT: AuditEntry[] = [
  { id: "1", appId: "APP-001", action: "Agent Complete", actor: "Agent-LLM", timestamp: new Date().toISOString(), details: "CRDE decision: APPROVED (Score 720)" },
  { id: "2", appId: "APP-003", action: "Agent Started", actor: "analyst01", timestamp: new Date(Date.now() - 300000).toISOString(), details: "Batch review triggered" },
  { id: "3", appId: "APP-005", action: "Human Decision", actor: "analyst01", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "Decision: Approve with note" },
  { id: "4", appId: "APP-002", action: "Agent Error", actor: "Agent-LLM", timestamp: new Date(Date.now() - 7200000).toISOString(), details: "Session timeout on LOS login page, retry scheduled" },
  { id: "5", appId: "APP-007", action: "Agent Complete", actor: "Agent-LLM", timestamp: new Date(Date.now() - 14400000).toISOString(), details: "CRDE decision: REJECTED (Score 320, HIGH risk)" },
  { id: "6", appId: "APP-010", action: "AML Flag", actor: "System", timestamp: new Date(Date.now() - 28800000).toISOString(), details: "DTTOT match detected — manual review required" },
  { id: "7", appId: "APP-004", action: "Human Decision", actor: "supervisor", timestamp: new Date(Date.now() - 86400000).toISOString(), details: "Decision: Reject — DTI exceeds RAC threshold" },
  { id: "8", appId: "APP-009", action: "Settings Updated", actor: "analyst01", timestamp: new Date(Date.now() - 172800000).toISOString(), details: "LLM provider changed to Gemini" },
];

function ActionBadge({ action }: { action: string }) {
  const cls = action.includes("Error") ? "bg-red-50 text-red-700 ring-1 ring-red-200"
    : action === "Human Decision" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
    : action === "AML Flag" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
    : action.includes("Started") ? "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
    : action === "Settings Updated" ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${cls}`}>{action}</span>;
}

export function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ audit: AuditEntry[] }>("/api/audit")
      .then((data) => setEntries(data.audit))
      .catch(() => setEntries(MOCK_AUDIT))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 px-6 py-4">
        <h1 className="text-lg font-bold text-slate-900">Audit Log</h1>
        <p className="text-xs text-slate-500 mt-0.5">All agent and analyst activity across the system</p>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? ( 
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                <Skeleton height={20} width={80} />
                <Skeleton height={20} width={120} />
                <Skeleton height={20} width={200} />
                <div className="flex-1" />
                <Skeleton height={16} width={100} />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium">No audit entries found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
              >
                <div className="min-w-0 flex-1 flex items-center gap-4">
                  <span className="w-16 text-[11px] font-mono text-slate-400 shrink-0">{entry.appId}</span>
                  <ActionBadge action={entry.action} />
                  <span className="text-xs text-slate-600 truncate">{entry.details}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">{entry.actor}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(entry.timestamp).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
