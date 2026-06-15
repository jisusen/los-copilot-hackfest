import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Skeleton } from "../components/Skeleton";
import { Search, RefreshCw, ExternalLink, FileText } from "lucide-react";

type AuditEntry = {
  id: string;
  appId: string;
  action: string;
  actor: string;
  details: string;
  debtorName: string;
  timestamp: string;
};

type AppGroup = {
  appId: string;
  debtorName: string;
  entries: AuditEntry[];
  lastAction: string;
  lastTimestamp: string;
  total: number;
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

export function AuditLogPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sinceTime, setSinceTime] = useState("");

  async function fetchAudit() {
    try {
      const data = await apiFetch<{ audit: AuditEntry[] }>("/api/audit");
      const filteredData = data.audit.filter(e => !HIDDEN_ACTIONS.has(e.action));
      setEntries(filteredData);
      if (!sinceTime) {
        const lastBatch = filteredData.find(e => e.action === "BATCH_STARTED");
        if (lastBatch) {
          setSinceTime(lastBatch.timestamp);
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAudit();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(fetchAudit, 10000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const actions = useMemo(() => {
    const set = new Set(entries.map(e => e.action));
    return Array.from(set).filter(a => !HIDDEN_ACTIONS.has(a)).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let result = entries;
    if (sinceTime) {
      result = result.filter(e => e.timestamp >= sinceTime);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.appId.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.debtorName.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q)
      );
    }
    if (filterAction) {
      result = result.filter(e => e.action === filterAction);
    }
    return result;
  }, [entries, searchQuery, filterAction, sinceTime]);

  const groups = useMemo(() => {
    const map = new Map<string, AuditEntry[]>();
    for (const e of filtered) {
      if (!map.has(e.appId)) map.set(e.appId, []);
      map.get(e.appId)!.push(e);
    }
    const result: AppGroup[] = [];
    for (const [appId, appEntries] of map) {
      appEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      const last = appEntries[appEntries.length - 1];
      result.push({
        appId,
        debtorName: appEntries[0]?.debtorName || "-",
        entries: [last],
        lastAction: last.action,
        lastTimestamp: last.timestamp,
        total: appEntries.length,
      });
    }
    result.sort((a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp));
    return result;
  }, [filtered]);

  return (
    <div className="h-full flex flex-col overflow-hidden ">
      {/* Header */}
      <div className="shrink-0 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Audit Log</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {sinceTime
                ? "Showing entries from latest batch run"
                : "All system activity across applications"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
                className="w-3.5 h-3.5 accent-red-500"
              />
              Auto-refresh
            </label>
            {sinceTime && (
              <button
                onClick={() => setSinceTime("")}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Show all entries
              </button>
            )}
            <button
              onClick={() => { setLoading(true); fetchAudit(); }}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0  px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400"
            />
          </div>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="cursor-pointer px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-red-400 bg-white text-slate-600"
          >
            <option value="">All Actions</option>
            {actions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {groups.length} app{groups.length !== 1 ? "s" : ""}, {filtered.length} entries
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton height={20} width={80} />
                  <Skeleton height={20} width={140} />
                  <div className="flex-1" />
                  <Skeleton height={16} width={60} />
                </div>
                <Skeleton height={32} width="100%" />
                <Skeleton height={32} width="100%" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-400">
            <div className="text-center">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No audit entries found</p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] font-semibold uppercase tracking-wider">
                <th className="text-left py-3 px-4 w-[120px]">Aplikasi</th>
                <th className="text-left py-3 px-3">Action</th>
                <th className="text-left py-3 px-3">Detail</th>
                <th className="text-left py-3 px-3 w-[100px]">Actor</th>
                <th className="text-left py-3 px-3 w-[150px]">Timestamp</th>
                <th className="text-center py-3 px-3 w-[80px]">#</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <React.Fragment key={group.appId}>
                  <tr className="bg-slate-100 border-t-2 border-slate-300">
                    <td className="py-3 px-4" colSpan={5}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-red-600 min-w-[80px]">
                          {group.appId}
                        </span>
                        <span className="text-sm text-slate-700 font-medium truncate max-w-[200px]">
                          {group.debtorName}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${getActionStyle(group.lastAction)}`}>
                          {group.lastAction}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono ml-auto">
                          {group.total} entry{group.total !== 1 ? "ies" : "y"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => navigate(`/audit/${group.appId}`)}
                        className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
