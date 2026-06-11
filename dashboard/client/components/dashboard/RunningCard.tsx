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
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 mb-2"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[11px] text-slate-400">
          {appId}
        </span>

        <span className="font-semibold text-sm text-slate-800">
          {loan?.debtor_name ?? appId}
        </span>

        {loan && (
          <span className="font-mono text-[10px] text-slate-400">
            · {loan.product_type} ·{" "}
            {formatRpShort(loan.amount_requested)}
          </span>
        )}

        <div className="flex-1" />

        {screenshot && (
          <button
            onClick={() => setShowLive((v) => !v)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all
            ${
              showLive
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            {showLive ? "● LIVE" : "○ LIVE"}
          </button>
        )}

        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          RUNNING · {state.pct}%
        </span>
      </div>

      {/* Live Screenshot */}
      {screenshot && showLive ? (
        <div className="relative mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Live browser"
            className="w-full block"
          />

          <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-1 rounded-md shadow-lg">
            ● LIVE · {appId}
          </div>
        </div>
      ) : (
        <div className="relative h-40 mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="absolute top-1 left-1 z-10 bg-red-600 text-white text-[8px] font-semibold px-1.5 py-[2px] rounded">
  ● LIVE · {appId}
</div>

          {/* Browser Mockup */}
          <div className="h-full flex flex-col ">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 bg-white">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />

              <span className="ml-6 text-[10px] font-mono text-slate-500 truncate">
                los.bms.local/loans/{appId}?tab={page}
              </span>
            </div>

            <div className="flex-1 p-4 space-y-3">
              <div className="h-3 w-40 rounded bg-blue-200 animate-pulse" />

              <div className="h-2 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-2 w-4/5 rounded bg-slate-200 animate-pulse" />

              <div className="h-2 w-16 rounded bg-slate-200 animate-pulse" />
              <div className="h-2 w-3/5 rounded bg-slate-200 animate-pulse" />

              <div className="h-2 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-2 w-4/5 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${state.pct}%` }}
          />
        </div>

        <span className="font-mono text-[11px] text-slate-500 min-w-[60px] text-right">
          {formatElapsed(elapsed)}
        </span>
      </div>

      {/* Logs */}
      <div className="mt-3 flex items-center text-[11px] font-mono text-slate-500">
        <span className="truncate">
          ▶ {state.logs[state.logs.length - 1] ?? "Starting..."}
        </span>

        <span className="ml-1 text-blue-500 animate-pulse">
          ▌
        </span>
      </div>
    </div>
  );
}