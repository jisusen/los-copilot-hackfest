import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { SkeletonBlock } from "./Skeleton";
import { BarChart3 } from "lucide-react";

type UsageSummary = {
  component: string;
  model: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  total_calls: number;
};

type DailyUsage = {
  date: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  call_count: number;
};

type TotalUsage = {
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  total_calls: number;
};

type UsageData = {
  total: TotalUsage;
  summary: UsageSummary[];
  daily: DailyUsage[];
};

const COMPONENT_LABELS: Record<string, string> = {
  browse: "Browser Agent",
  memo: "Memo Generation",
  chat: "Copilot Chat",
};

const COMPONENT_COLORS: Record<string, string> = {
  browse: "#cf0000",
  memo: "#1a3a5c",
  chat: "#e8a020",
};

export function UsageTab() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadUsage();
  }, []);

  async function loadUsage() {
    setLoading(true);
    try {
      const data = await apiFetch<UsageData>("/api/usage");
      setUsage(data);
    } catch (e) {
      console.error("Failed to load usage:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (!confirm("Clear all usage data? This cannot be undone.")) return;
    setClearing(true);
    try {
      await apiFetch<{ ok: boolean }>("/api/usage", { method: "DELETE" });
      await loadUsage();
    } catch (e) {
      console.error("Failed to clear usage:", e);
    } finally {
      setClearing(false);
    }
  }

  if (loading) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <SkeletonBlock lines={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">LLM Usage</h1>
          <div className="flex-1" />
          <button
            onClick={loadUsage}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleClear}
            disabled={clearing}
            className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {clearing ? "Clearing..." : "Clear Data"}
          </button>
        </div>

        {/* Total Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <UsageCard
            label="Total Cost"
            value={`$${usage?.total.total_cost.toFixed(4) ?? "0.00"}`}
            color="text-emerald-600"
          />
          <UsageCard
            label="Input Tokens"
            value={formatTokens(usage?.total.total_input_tokens ?? 0)}
            color="text-slate-700"
          />
          <UsageCard
            label="Output Tokens"
            value={formatTokens(usage?.total.total_output_tokens ?? 0)}
            color="text-slate-700"
          />
          <UsageCard
            label="Total Calls"
            value={(usage?.total.total_calls ?? 0).toLocaleString()}
            color="text-slate-700"
          />
        </div>

        {/* Per-Component Breakdown */}
        {usage?.summary && usage.summary.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
              By Component
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Component</th>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600">Model</th>
                    <th className="text-right px-4 py-2.5 font-medium text-slate-600">Calls</th>
                    <th className="text-right px-4 py-2.5 font-medium text-slate-600">Input</th>
                    <th className="text-right px-4 py-2.5 font-medium text-slate-600">Output</th>
                    <th className="text-right px-4 py-2.5 font-medium text-slate-600">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.summary.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: COMPONENT_COLORS[row.component] || "#94a3b8" }}
                          />
                          <span className="font-medium text-slate-800">
                            {COMPONENT_LABELS[row.component] || row.component}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 font-mono text-xs">
                        {row.model}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700">
                        {row.total_calls.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700 font-mono text-xs">
                        {formatTokens(row.total_input_tokens)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700 font-mono text-xs">
                        {formatTokens(row.total_output_tokens)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-600 font-medium">
                        ${row.total_cost.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Daily Usage Chart */}
        {usage?.daily && usage.daily.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
              Daily Usage (Last 30 Days)
            </h2>
            <div className="border border-slate-200 rounded-xl bg-white p-4">
              <DailyChart data={usage.daily} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!usage?.summary || usage.summary.length === 0) && (
          <div className="text-center py-12 text-slate-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No usage data yet. Run an agent to start tracking.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UsageCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4 text-center">
      <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function DailyChart({ data }: { data: DailyUsage[] }) {
  const maxCost = Math.max(...data.map((d) => d.total_cost), 0.0001);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => {
        const height = (d.total_cost / maxCost) * 100;
        return (
          <div
            key={i}
            className="flex-1 group relative"
            style={{ height: "100%" }}
          >
            <div className="absolute bottom-0 w-full flex flex-col items-center">
              <div
                className="w-full bg-amber-400 rounded-t hover:bg-amber-500 transition-colors min-h-[2px]"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              <span className="text-[9px] text-slate-400 mt-1 truncate w-full text-center">
                {d.date.slice(5)}
              </span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                <div className="font-medium">{d.date}</div>
                <div>Cost: ${d.total_cost.toFixed(4)}</div>
                <div>Calls: {d.call_count}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
