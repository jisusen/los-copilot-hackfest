import React, { useState, useEffect } from "react";
import type { LoanSummary, AgentState } from "../../lib/types";
import { formatRpShort, formatElapsed } from "../../lib/format";

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
    const t = setInterval(
      () => setElapsed(Date.now() - state.startedAt),
      1000
    );
    return () => clearInterval(t);
  }, [state.startedAt]);

  const page =
    state.pct < 30
      ? "data-keuangan"
      : state.pct < 60
      ? "slik-ojk"
      : "hasil-crde";

  return (
    <div
      data-testid={`agent-card-${appId}`}
      className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[10px] text-slate-400">
          {appId}
        </span>

        <span className="font-semibold text-xs text-slate-800 truncate">
          {loan?.debtor_name ?? appId}
        </span>

        <div className="flex-1" />

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
        </div>
      )}

      {/* Live Screenshot — NO fixed height. Let the image render at full natural size so the entire browser page composition (header + form + content + bottom) is visible without being cut off. The parent grid area will scroll if needed. */}
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
        <div className="relative mb-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50" style={{ height: '140px' }}>
          {/* Browser Mockup */}
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-1.5 px-2 py-1 border-b border-slate-200 bg-white">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="ml-3 text-[8px] font-mono text-slate-400 truncate">
                {appId}?tab={page}
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

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${state.pct}%` }}
          />
        </div>
        <span className="font-mono text-[9px] text-slate-400 min-w-[40px] text-right">
          {formatElapsed(elapsed)}
        </span>
      </div>

      {/* Logs */}
      <div className="mt-1.5 flex items-center text-[9px] font-mono text-slate-400">
        <span className="truncate">
          ▶ {state.logs[state.logs.length - 1] ?? "Starting..."}
        </span>
      </div>
    </div>
  );
}