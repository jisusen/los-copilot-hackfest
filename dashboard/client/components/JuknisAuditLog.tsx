import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";
import { useToast } from "./Toast";
import { History, ChevronDown, ChevronRight, User, Clock, Edit, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type AuditLogEntry = {
  no: number;
  judul_juknis: string;
  before_juknis: string | null;
  after_juknis: string | null;
  user: string;
  action: string;
  created_at: string;
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE: <Plus className="w-3 h-3 text-green-500" />,
  UPDATE: <Edit className="w-3 h-3 text-amber-500" />,
  DELETE: <Trash2 className="w-3 h-3 text-red-500" />,
  TOGGLE_ACTIVE: <ToggleRight className="w-3 h-3 text-blue-500" />,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-50 text-green-700",
  UPDATE: "bg-amber-50 text-amber-700",
  DELETE: "bg-red-50 text-red-700",
  TOGGLE_ACTIVE: "bg-blue-50 text-blue-700",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DiffView({ before, after }: { before: string | null; after: string | null }) {
  const [expanded, setExpanded] = useState(false);

  if (!before && !after) return null;

  const hasDiff = before && after && before !== after;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700 transition-colors"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {hasDiff ? "View changes" : "View content"}
      </button>
      {expanded && (
        <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
          {before && (
            <div className="px-3 py-2 bg-red-50 border-b border-slate-200">
              <div className="text-[10px] font-mono text-red-600 mb-1">BEFORE:</div>
              <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {before.substring(0, 500)}{before.length > 500 ? "..." : ""}
              </pre>
            </div>
          )}
          {after && (
            <div className="px-3 py-2 bg-green-50">
              <div className="text-[10px] font-mono text-green-600 mb-1">AFTER:</div>
              <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {after.substring(0, 500)}{after.length > 500 ? "..." : ""}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function JuknisAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      const data = await apiFetch<{ logs: AuditLogEntry[] }>("/api/audit-juknis");
      setLogs(data.logs);
    } catch {
      toast("Failed to load audit logs", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (loading) {
    return (
      <div className="px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        Loading audit logs...
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <History className="w-4 h-4 text-slate-500" />
          Skill Change History
          <span className="text-[10px] font-mono text-slate-400">({logs.length} entries)</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No changes recorded yet
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.no}
                  className="bg-white border border-slate-200 rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1 rounded ${ACTION_COLORS[log.action] || "bg-slate-100"}`}>
                        {ACTION_ICONS[log.action] || <Edit className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {log.judul_juknis}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <User className="w-2.5 h-2.5" />
                            {log.user}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        ACTION_COLORS[log.action] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {log.action}
                    </span>
                  </div>

                  <DiffView before={log.before_juknis} after={log.after_juknis} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
