import React, { useState, useEffect } from "react";
import type { LoanSummary, AgentState } from "../../lib/types";
import { formatRpShort, formatElapsed } from "../../lib/format";

function phaseLabel(pct: number): { label: string; cls: string } {
  if (pct < 30)
    return { label: "Login", cls: "bg-slate-100 text-slate-600 border-slate-200" };
  if (pct < 72)
    return { label: "Browse", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  if (pct < 91)
    return { label: "Extract", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return {
    label: "Memo",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
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
  const [showLive, setShowLive] = useState(true);

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
      className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[10px] text-slate-400">{appId}</span>
        <span className="font-semibold text-xs text-slate-800 truncate">
          {loan?.debtor_name ?? appId}
        </span>
        <div className="flex-1" />
        <span
          className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wide ${phase.cls}`}
        >
          {phase.label}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          {state.pct}%
        </span>
      </div>

      {/* Info row */}
      {loan && (
        <div className="flex items-center gap-2 mb-2 text-[10px] text-slate-400">
          <span>{loan.product_type}</span>
          <span>·</span>
          <span>{formatRpShort(loan.amount_requested)}</span>
          <span>·</span>
          <span className="font-mono">
            Step {stepIndex}/{totalSteps}
          </span>
        </div>
      )}

      {/* Screenshot */}
      {screenshot && showLive ? (
        <div className="relative mb-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Live browser"
            className="w-full block"
          />
          <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            ● LIVE
          </div>
        </div>
      ) : (
        <div
          className="relative mb-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
          style={{ height: "140px" }}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-1.5 px-2 py-1 border-b border-slate-200 bg-white">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="ml-3 text-[8px] font-mono text-slate-400 truncate">
                {appId} — {phase.label}
              </span>
            </div>
            <div className="flex-1 p-2 space-y-1.5">
              <div className="h-1.5 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="h-1 w-16 rounded bg-slate-200 animate-pulse" />
              <div className="h-1 w-32 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Step progress dots */}
      <div className="flex items-center gap-1 mb-2 px-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < stepIndex
                ? "bg-blue-500"
                : i === stepIndex
                ? "bg-blue-400 animate-pulse"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Main progress bar + elapsed */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${state.pct}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-slate-500 min-w-[40px] text-right">
          {formatElapsed(elapsed)}
        </span>
      </div>

      {/* Current step — highlighted */}
      <div className="rounded-md bg-blue-50 border border-blue-100 px-2 py-1.5 mb-1.5">
        <div className="text-[9px] font-mono text-blue-800 truncate">
          <span className="text-blue-500">▶</span> {currentStep}
        </div>
      </div>

      {/* Completed steps log */}
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
  );
}
