import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Skeleton } from "../components/Skeleton";
import { ArrowLeft, Clock, User, ExternalLink } from "lucide-react";

type AuditEntry = {
  id: string;
  appId: string;
  action: string;
  actor: string;
  details: string;
  debtorName: string;
  timestamp: string;
};

const HIDDEN_ACTIONS = new Set(["APPLICATION_SUBMITTED", "AML_SCREENED", "CRDE_EVALUATED"]);

const ACTION_STYLES: Record<string, string> = {
  BATCH_STARTED: "bg-blue-100 text-blue-700",
  AGENT_COMPLETED: "bg-emerald-100 text-emerald-700",
  AGENT_ERROR: "bg-red-100 text-red-700",
  AGENT_RUNNING: "bg-purple-100 text-purple-700",
  MEMO_SUBMITTED: "bg-amber-100 text-amber-700",
  NOTE_ADDED: "bg-indigo-100 text-indigo-700",
  DECISION_APPROV: "bg-green-100 text-green-700",
  DECISION_REJEC: "bg-red-100 text-red-700",
};

function getActionStyle(action: string): string {
  for (const [key, val] of Object.entries(ACTION_STYLES)) {
    if (action.startsWith(key)) return val;
  }
  return "bg-gray-100 text-gray-600";
}

function formatDateTime(ts: string) {
  return new Date(ts).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AuditLogDetailPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const data = await apiFetch<{ audit: AuditEntry[] }>("/api/audit");
        const filtered = data.audit.filter(e => e.appId === appId && !HIDDEN_ACTIONS.has(e.action));
        filtered.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        setEntries(filtered);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [appId]);

  const debtorName = entries.length > 0 ? entries[0].debtorName : "-";

  return (
    <div className="h-full flex flex-col overflow-hidden ">
      {/* Header */}
      <div className="shrink-0  px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/audit")}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              <span className="font-mono text-red-600">{appId}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {debtorName} &middot; {entries.length} entries
            </p>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => navigate(`/review/${appId}`)}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka di Review
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                <Skeleton height={20} width={120} />
                <Skeleton height={20} width="100%" />
                <Skeleton height={20} width={80} />
                <Skeleton height={20} width={160} />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm font-medium">No entries found for {appId}</p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] font-semibold uppercase tracking-wider">
                <th className="text-left py-3 px-4 w-[120px]">Action</th>
                <th className="text-left py-3 px-3">Detail</th>
                <th className="text-left py-3 px-3 w-[100px]">Actor</th>
                <th className="text-left py-3 px-3 w-[170px]">Timestamp</th>
                <th className="text-center py-3 px-3 w-[60px]">#</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className={`text-xs border-t border-slate-100 hover:bg-slate-50/70 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${getActionStyle(entry.action)}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs text-slate-600">{entry.details}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <User className="w-3 h-3" />
                      {entry.actor}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
