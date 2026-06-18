import React, { useState, useEffect } from "react";
import type { LoanSummary, AgentState } from "../../lib/types";
import { formatRpShort, formatElapsed } from "../../lib/format";

function phaseLabel(pct: number): { label: string; color: string; bg: string; border: string } {
  if (pct < 30)
    return { label: "LOGIN", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" };
  if (pct < 72)
    return { label: "BROWSE", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };
  if (pct < 91)
    return { label: "EXTRACT", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "MEMO", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
}

export default function RunningCard({
  appId,
  loan,
  state,
  screenshot,
}: {
  appId: string;
  loan?: LoanSummary;
  state: AgentState & { status: "running" };
  screenshot?: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(Date.now() - state.startedAt), 1000);
    return () => clearInterval(t);
  }, [state.startedAt]);

  const phase = phaseLabel(state.pct);
  const currentStep = state.currentStep ?? state.logs[state.logs.length - 1] ?? "Starting...";
  const stepIndex = state.stepIndex ?? 0;
  const totalSteps = state.totalSteps ?? 18;
  const recentLogs = state.logs.slice(-5);

  return (
    <div
      data-testid={`agent-card-${appId}`}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] text-slate-400 shrink-0">{appId}</span>
          <span className="font-semibold text-sm text-slate-800 truncate">
            {loan?.debtor_name ?? appId}
          </span>
        </div>
        <div className="flex-1" />
        <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${phase.color} ${phase.bg} ${phase.border}`}>
          {phase.label}
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {state.pct}%
        </span>
      </div>

      {/* Info row */}
      {loan && (
        <div className="px-4 py-2 flex items-center gap-2 text-[10px] text-slate-400 border-b border-slate-50">
          <span className="font-medium text-slate-500">{loan.product_type}</span>
          <span className="text-slate-300">·</span>
          <span>{formatRpShort(loan.amount_requested)}</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono">{loan.tenor_months}mo</span>
          <span className="flex-1" />
          <span className="font-mono text-slate-400">Step {stepIndex}/{totalSteps}</span>
        </div>
      )}

      {/* Screenshot */}
      <div className="px-3 pt-3">
        {screenshot ? (
          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
            <img
              src={`data:image/png;base64,${screenshot}`}
              alt="Live browser"
              className="w-full block"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100" style={{ height: "140px" }}>
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-200/60 bg-white/60 backdrop-blur">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="ml-2 text-[8px] font-mono text-slate-400 truncate">
                  {appId} — {phase.label}
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-slate-400 font-medium">Initializing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress section */}
      <div className="px-4 pb-3 pt-3">
        {/* Step dots */}
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < stepIndex
                  ? "bg-red-500"
                  : i === stepIndex
                  ? "bg-red-400 animate-pulse"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Main progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
              style={{ width: `${state.pct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-slate-500 min-w-[40px] text-right">
            {formatElapsed(elapsed)}
          </span>
        </div>

        {/* Current step */}
        <div className="rounded-md bg-red-50 border border-red-100 px-2 py-1.5 mb-1.5">
          <div className="text-[9px] font-mono text-red-800 truncate">
            <span className="text-red-500">▶</span> {currentStep}
          </div>
        </div>

        {/* Completed steps */}
        {recentLogs.length > 1 && (
          <div className="max-h-20 overflow-y-auto space-y-0.5 pr-0.5">
            {recentLogs.slice(0, -1).reverse().map((log, i) => (
              <div
                key={`${log}-${i}`}
                className="text-[8px] font-mono text-slate-400 truncate"
              >
                ✓ {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
