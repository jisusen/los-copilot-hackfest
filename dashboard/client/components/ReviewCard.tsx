import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { AgentState, LoanSummary } from "../lib/types";
import { formatElapsed, formatRpShort } from "../lib/format";

const LOG_HEIGHT = 12;

function LogPanel({ logs }: { logs: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView(); }, [logs.length]);

  return (
    <div style={{ marginTop: 8, background: "#0d1117", borderRadius: 6, padding: "6px 8px", maxHeight: LOG_HEIGHT * 10, overflowY: "auto", fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: `${LOG_HEIGHT}px` }}>
      {logs.length === 0 && <span style={{ color: "#666" }}>Waiting…</span>}
      {logs.map((log, i) => {
        const isLast = i === logs.length - 1;
        return (
          <div key={i} style={{ color: isLast ? "#e8edf5" : "#8892a4", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {isLast ? <><span>▶ {log}</span><span className="blink">▌</span></> : <span>✓ {log}</span>}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

export function ReviewCard({ appId, loan, state, screenshot }: {
  appId: string; loan?: LoanSummary; state: AgentState; screenshot?: string;
}) {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [showLive, setShowLive] = useState(false);

  useEffect(() => {
    if (state.status !== "running") return;
    const t = setInterval(() => setElapsed(Date.now() - state.startedAt), 1000);
    return () => clearInterval(t);
  }, [state.status, state.status === "running" ? state.startedAt : null]);

  const page = state.status === "running"
    ? (state.pct < 30 ? "data-keuangan" : state.pct < 60 ? "slik-ojk" : "hasil-crde")
    : "profil-debitur";

  return (
    <div
      data-testid={`agent-card-${appId}`}
      className="card"
      style={{ padding: 14, opacity: state.status === "decided" ? 0.5 : 1 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{appId}</span>
        <span style={{ fontWeight: 500, fontSize: 13, color: "var(--ink)" }}>{loan?.debtor_name ?? appId}</span>
        {loan && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
            · {loan.product_type} · {formatRpShort(loan.amount_requested)}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {state.status === "running" && (
          <span className="tag run blue"><span className="dot" /> RUNNING · {state.pct}%</span>
        )}
        {state.status === "error" && (
          <span className="tag red">ERROR</span>
        )}
      </div>

      {/* RUNNING: live screen */}
      {state.status === "running" && (
        <>
          <div className="live-screen" style={{ height: 160 }}>
            <div className="badge"><i /> LIVE · {appId}</div>
            <div className="browser">
              <div className="url">
                <i style={{ background: "#e87b6e" }} /><i style={{ background: "#e8c46e" }} /><i style={{ background: "#7bbb6e" }} />
                <span className="addr">los.bms.local/loans/{appId}?tab={page}</span>
              </div>
              <div className="body">
                <div className="skel h12 w40 bg-accent" /><div style={{ height: 6 }} />
                <div className="skel h6 w20" /><div className="skel w80" />
                <div className="skel h6 w20" /><div className="skel w60" />
                <div className="skel h6 w20" /><div className="skel w80" />
              </div>
            </div>
          </div>
          {screenshot && (
            <button
              onClick={e => { e.stopPropagation(); setShowLive(v => !v); }}
              className="btn-ghost"
              style={{ marginTop: 8, fontSize: 10, padding: "4px 8px" }}
            >
              {showLive ? "✕ Hide live" : "👁 Show live"}
            </button>
          )}
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="bar" style={{ flex: 1 }}><div className="fill" style={{ width: `${state.pct}%` }} /></div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", minWidth: 50, textAlign: "right" }}>
              {formatElapsed(elapsed)}
            </span>
          </div>
          <LogPanel logs={state.logs} />
        </>
      )}

      {/* ERROR state */}
      {state.status === "error" && (
        <div style={{ padding: "8px 0" }}>
          <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, fontFamily: "var(--font-mono)" }}>{state.error}</div>
          {state.retryable && (
            <div style={{ fontSize: 11, color: "var(--blue)", marginTop: 6 }}>Re-run the batch to retry</div>
          )}
        </div>
      )}

      {/* Live screenshot */}
      {showLive && screenshot && (
        <div style={{ marginTop: 8 }}>
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Live browser view"
            style={{ width: "100%", border: "1px solid var(--line)", display: "block", borderRadius: "var(--r)" }}
          />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", marginTop: 4 }}>Auto-refreshes every 2s</div>
        </div>
      )}
    </div>
  );
}
