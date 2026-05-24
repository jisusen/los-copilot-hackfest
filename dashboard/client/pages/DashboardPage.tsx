import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ApplicationList } from "../components/ApplicationList";
import { UserMenu } from "../components/UserMenu";
import { useSessions } from "../App";
import { apiFetch } from "../lib/api";
import { Skeleton } from "../components/Skeleton";
import {
  formatElapsed,
  formatRpShort,
  CRDE_COLOR,
  CRDE_SOFT,
  CRDE_BORDER,
  RISK_COLOR,
  crdeCls,
} from "../lib/format";
import type { LoanSummary, AgentState } from "../lib/types";

// ─── NavRail ───────────────────────────────────────────────────────────────
function NavRail({ active = "dash" }: { active?: string }) {
  const navigate = useNavigate();
  const ic = (d: string) => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
  const items = [
    {
      k: "dash",
      label: "Dashboard",
      d: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
      path: "/",
    },
    { k: "queue", label: "Queue", d: "M3 6h18M3 12h18M3 18h18", path: null },
    {
      k: "agents",
      label: "Agents",
      d: "M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z",
      path: null,
    },
    {
      k: "audit",
      label: "Audit",
      d: "M9 11l3 3 8-8M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0z",
      path: null,
    },
    {
      k: "set",
      label: "Settings",
      d: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 12l2 1-1 3-2-1m-12 0l-2 1 1 3 2-1m12-9l1-2-3-1-1 2m-8 0l-1-2-3 1 1 2",
      path: "/settings",
    },
  ];
  return (
    <div className="rail">
      <div className="mark">B</div>
      {items.map((it) => (
        <div
          key={it.k}
          className={`ic${active === it.k ? " on" : ""}`}
          title={it.label}
          onClick={() => it.path && navigate(it.path)}
          style={{ cursor: it.path ? "pointer" : "default" }}
        >
          {ic(it.d)}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--ink-4)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          letterSpacing: ".1em",
        }}
      >
        BMB · v1
      </div>
    </div>
  );
}

// ─── Topbar ────────────────────────────────────────────────────────────────
function Topbar({
  crumbs = [],
  agentMode,
  onAgentMode,
  liveOn,
  onLive,
}: {
  crumbs?: string[];
  agentMode: string;
  onAgentMode: (v: string) => void;
  liveOn: boolean;
  onLive: (v: boolean) => void;
}) {
  return (
    <div className="top">
      <div className="brand">
        Bank Maju Bersama
        <span className="sub">Credit Analyst Copilot</span>
      </div>
      <div className="crumb">
        {crumbs.map((c, i) => (
          <span key={i}>
            {" / "}
            {i === crumbs.length - 1 ? <b>{c}</b> : c}
          </span>
        ))}
      </div>
      <div className="spacer" />
      <div className="seg">
        <span className="lbl">Agent</span>
        <button
          className={agentMode === "real" ? "on real" : ""}
          onClick={() => onAgentMode("real")}
        >
          Real
        </button>
        <button
          className={agentMode === "sim" ? "on sim" : ""}
          onClick={() => onAgentMode("sim")}
        >
          Sim
        </button>
      </div>
      <button
        className={`btn-ghost live${liveOn ? "" : " off"}`}
        onClick={() => onLive(!liveOn)}
      >
        <span className="dot" />
        Live view {liveOn ? "ON" : "OFF"}
      </button>
      <UserMenu username="analyst01" />
    </div>
  );
}

// ─── Attention card (ready sessions) ──────────────────────────────────────
function AttentionCard({
  appId,
  loan,
  state,
}: {
  appId: string;
  loan?: LoanSummary;
  state: AgentState & { status: "ready" };
}) {
  const navigate = useNavigate();
  const r = state.result;
  const isReject =
    r.crdeDecision === "DITOLAK" || r.crdeDecision === "REJECTED";
  const cls = crdeCls(r.crdeDecision);
  const recBg = isReject ? "var(--red-soft)" : "var(--amber-soft)";
  const recBorder = isReject ? "var(--red-line)" : "var(--amber-line)";
  const recColor = isReject ? "var(--red)" : "var(--amber)";

  const flags: string[] = [];
  if (r.dtiActual > 0.4)
    flags.push(
      `DTI ${(r.dtiActual * 100).toFixed(1)}% exceeds RAC limit (40%)`,
    );
  if (r.slikKol > 1)
    flags.push(`SLIK Kol.${r.slikKol} — substandard payment history`);
  if (!r.amlClear) flags.push("AML flag detected");
  if (r.rulesTriggered.length > 0) flags.push(...r.rulesTriggered.slice(0, 2));

  return (
    <div
      data-testid={`agent-card-${appId}`}
      className={`card hot${isReject ? " red" : ""}`}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/review/${appId}`)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
          }}
        >
          {appId}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--ink-4)",
          }}
        >
          ·
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--ink-4)",
          }}
        >
          agent done · {formatElapsed(state.elapsedMs)}
        </span>
        <div style={{ flex: 1 }} />
        <span
          className={`tag ${RISK_COLOR[r.riskScore] === "var(--red)" ? "red" : r.riskScore === "LOW" ? "green" : "amber"}`}
        >
          {r.riskScore}
        </span>
      </div>
      <h3
        style={{
          margin: "0 0 2px",
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.015em",
          color: "var(--ink)",
        }}
      >
        {loan?.debtor_name ?? appId}
      </h3>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          marginBottom: 14,
          letterSpacing: ".02em",
        }}
      >
        {loan?.product_type ?? ""}
        {loan ? ` · ${formatRpShort(loan.amount_requested)}` : ""}
      </div>

      {/* AI rec block */}
      <div
        style={{
          padding: "12px 14px",
          background: recBg,
          border: `1px solid ${recBorder}`,
          borderRadius: "var(--r)",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: flags.length > 0 ? 8 : 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: ".1em",
              color: recColor,
            }}
          >
            AI recommendation
          </span>
          <span className={`tag solid-${cls}`}>{r.crdeDecision}</span>
          <div style={{ flex: 1 }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: recColor,
            }}
          >
            Score {r.numericScore}/1000
          </span>
        </div>
        {flags.length > 0 && (
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--ink-2)",
            }}
          >
            {flags.slice(0, 3).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Metrics strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          marginBottom: 14,
          border: "1px solid var(--line)",
          borderRadius: "var(--r)",
        }}
      >
        {[
          [
            "DTI",
            `${(r.dtiActual * 100).toFixed(1)}%`,
            r.dtiActual > 0.4 ? "red" : "",
          ],
          ["SLIK", `Kol.${r.slikKol}`, r.slikKol > 1 ? "amber" : ""],
          ["AML", r.amlClear ? "Clear" : "Flag", !r.amlClear ? "red" : ""],
          [
            "Rules",
            String(r.rulesTriggered.length),
            r.rulesTriggered.length > 0 ? "amber" : "",
          ],
        ].map(([k, v, color], i) => (
          <div
            key={k}
            style={{
              padding: "8px 12px",
              borderRight: i < 3 ? "1px solid var(--line)" : 0,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--ink-4)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
            >
              {k}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 500,
                color:
                  color === "red"
                    ? "var(--red)"
                    : color === "amber"
                      ? "var(--amber)"
                      : "var(--ink)",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn primary"
        style={{ width: "100%" }}
        onClick={() => navigate(`/review/${appId}`)}
      >
        Open &amp; decide →
      </button>
    </div>
  );
}

// ─── Running agent compact card ────────────────────────────────────────────
function RunningCard({
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

  const page =
    state.pct < 30
      ? "data-keuangan"
      : state.pct < 60
        ? "slik-ojk"
        : "hasil-crde";

  return (
    <div
      data-testid={`agent-card-${appId}`}
      className="card"
      style={{ padding: 14 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
          }}
        >
          {appId}
        </span>
        <span style={{ fontWeight: 500, fontSize: 13, color: "var(--ink)" }}>
          {loan?.debtor_name ?? appId}
        </span>
        {loan && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--ink-4)",
            }}
          >
            · {loan.product_type} · {formatRpShort(loan.amount_requested)}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {screenshot && (
          <button
            onClick={() => setShowLive((v) => !v)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "3px 8px",
              border: `1px solid ${showLive ? "var(--accent)" : "var(--line)"}`,
              color: showLive ? "var(--accent)" : "var(--ink-3)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {showLive ? "✕ LIVE" : "👁 LIVE"}
          </button>
        )}
        <span className="tag run blue">
          <span className="dot" /> RUNNING · {state.pct}%
        </span>
      </div>

      {/* Live browser — real screenshot or skeleton fallback */}
      {screenshot && showLive ? (
        <div style={{ position: "relative", marginBottom: 8 }}>
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Live browser"
            style={{
              width: "100%",
              display: "block",
              border: "1px solid var(--line)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              background: "#e8002d",
              color: "#fff",
              padding: "2px 6px",
              letterSpacing: ".06em",
            }}
          >
            ● LIVE · {appId}
          </div>
        </div>
      ) : (
        <div className="live-screen" style={{ height: 160, marginBottom: 8 }}>
          <div className="badge">
            <i /> LIVE · {appId}
          </div>
          <div className="browser">
            <div className="url">
              <i style={{ background: "#e87b6e" }} />
              <i style={{ background: "#e8c46e" }} />
              <i style={{ background: "#7bbb6e" }} />
              <span className="addr">
                los.bms.local/loans/{appId}?tab={page}
              </span>
            </div>
            <div className="body">
              <div className="skel h12 w40 bg-accent" />
              <div style={{ height: 6 }} />
              <div className="skel h6 w20" />
              <div className="skel w80" />
              <div className="skel h6 w20" />
              <div className="skel w60" />
              <div className="skel h6 w20" />
              <div className="skel w80" />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div className="bar" style={{ flex: 1 }}>
          <div className="fill" style={{ width: `${state.pct}%` }} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--ink-3)",
            minWidth: 60,
            textAlign: "right",
          }}
        >
          {formatElapsed(elapsed)}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--ink-3)",
          marginTop: 6,
        }}
      >
        ▶ {state.logs[state.logs.length - 1] ?? "Starting..."}
        <span className="blink" style={{ marginLeft: 4 }}>
          ▌
        </span>
      </div>
    </div>
  );
}

// ─── Decided row ───────────────────────────────────────────────────────────
function DecidedRow({
  appId,
  loan,
  state,
}: {
  appId: string;
  loan?: LoanSummary;
  state: AgentState & { status: "decided" };
}) {
  const navigate = useNavigate();
  const dec = state.decision;
  const cls = dec === "approve" ? "green" : dec === "reject" ? "red" : "";
  const label =
    dec === "approve"
      ? "APPROVED"
      : dec === "reject"
        ? "REJECTED"
        : dec.toUpperCase();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto auto",
        gap: 14,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--line)",
        fontSize: 12,
        opacity: 0.6,
        cursor: "pointer",
      }}
      onClick={() => navigate(`/review/${appId}`)}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
          minWidth: 60,
        }}
      >
        {appId}
      </span>
      <span style={{ color: "var(--ink-2)" }}>
        {loan?.debtor_name ?? appId}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--ink-3)",
        }}
      >
        {loan?.product_type ?? ""}
        {loan ? ` · ${formatRpShort(loan.amount_requested)}` : ""}
      </span>
      <span className={`tag ${cls}`}>{label}</span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--ink-4)",
        }}
      >
        analyst01 ·{" "}
        {new Date(state.decidedAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}

// ─── DashboardPage ─────────────────────────────────────────────────────────
export function DashboardPage() {
  const { sessions, screenshots } = useSessions();
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [agentMode, setAgentMode] = useState("sim");
  const [liveOn, setLiveOn] = useState(true);

  const fetchLoans = useCallback(async () => {
    try {
      const data = await apiFetch<{ loans: LoanSummary[] }>(
        "/api/loans?status=Under+Review",
      );
      setLoans(data.loans);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
    const t = setInterval(fetchLoans, 30000);
    return () => clearInterval(t);
  }, [fetchLoans]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 5) return prev;
        next.add(id);
      }
      return next;
    });
  }

  async function runReview() {
    if (selected.size === 0 || runLoading) return;
    setRunLoading(true);
    try {
      await apiFetch("/api/batch", {
        method: "POST",
        body: JSON.stringify({
          appIds: Array.from(selected),
          mock: agentMode === "sim",
        }),
      });
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setRunLoading(false);
    }
  }

  const loanMap = new Map(loans.map((l) => [l.id, l]));
  const entries = Array.from(sessions.entries());
  const readyEntries = entries.filter(([, s]) => s.status === "ready") as [
    string,
    AgentState & { status: "ready" },
  ][];
  const runningEntries = entries.filter(([, s]) => s.status === "running") as [
    string,
    AgentState & { status: "running" },
  ][];
  const decidedEntries = entries.filter(([, s]) => s.status === "decided") as [
    string,
    AgentState & { status: "decided" },
  ][];

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="app">
      {/* Left rail */}
      <div className="app-rail">
        <NavRail active="dash" />
      </div>

      {/* Topbar */}
      <div className="app-top">
        <Topbar
          crumbs={["Pipeline", "Triage"]}
          agentMode={agentMode}
          onAgentMode={setAgentMode}
          liveOn={liveOn}
          onLive={setLiveOn}
        />
      </div>

      {/* Main content */}
      <div className="app-main">
        {/* Sim mode banner */}
        {agentMode === "sim" && (
          <div className="sim-banner">
            <span>⚙</span>
            <span>
              <b>SIMULATION MODE</b> — agents replay seeded fixtures from
              /data/los.db (no live LOS calls).
            </span>
          </div>
        )}

        {/* Page header + stats */}
        <div className="page-head">
          <div>
            <h1>Pipeline · Triage</h1>
            <div className="sub">
              {today} · {loans.length} active applications
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div className="stats" style={{ minWidth: 680 }}>
            <div className="stat">
              <span className="lbl">In queue</span>
              <span className="val">{loading ? <Skeleton width={24} height={14} /> : loans.length}</span>
            </div>
            <div className="stat">
              <span className="lbl">Running</span>
              <span className="val accent">{runningEntries.length}</span>
              <span className="delta">
                {runningEntries.length} of 5 max parallel
              </span>
            </div>
            <div className="stat">
              <span className="lbl">Ready · need decision</span>
              <span className={`val${readyEntries.length > 0 ? " red" : ""}`}>
                {readyEntries.length}
              </span>
              {readyEntries.some(([, s]) => s.result.riskScore === "HIGH") && (
                <span className="delta down">1 high-risk</span>
              )}
            </div>
            <div className="stat">
              <span className="lbl">Decided today</span>
              <span className="val">{decidedEntries.length}</span>
              {decidedEntries.length > 0 && (
                <span className="delta up">↑ this session</span>
              )}
            </div>
            <div className="stat">
              <span className="lbl">Avg agent time</span>
              <span className="val">3:42</span>
              <span className="delta">vs 47 min manual</span>
            </div>
          </div>
        </div>

        {/* Needs attention — ready sessions */}
        {readyEntries.length > 0 && (
          <div style={{ padding: "0 24px" }}>
            <div className="section-head">
              <div>
                <h2>Needs your attention</h2>
                <div className="sub">
                  {readyEntries.length} application
                  {readyEntries.length !== 1 ? "s" : ""} ready · sorted by risk
                </div>
              </div>
              <div className="spacer" />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 14,
                padding: "14px 0 0",
              }}
            >
              {[...readyEntries]
                .sort((a, b) => {
                  const order: Record<string, number> = {
                    HIGH: 0,
                    MEDIUM: 1,
                    LOW: 2,
                  };
                  return (
                    (order[a[1].result.riskScore] ?? 3) -
                    (order[b[1].result.riskScore] ?? 3)
                  );
                })
                .map(([appId, state]) => (
                  <AttentionCard
                    key={appId}
                    appId={appId}
                    loan={loanMap.get(appId)}
                    state={state}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Bottom: Queue (left) + Agents working (right) */}
        <div
          style={{
            padding: "24px",
            display: "grid",
            gridTemplateColumns: "380px 1fr",
            gap: 14,
          }}
        >
          {/* Queue panel */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignSelf: "flex-start",
            }}
          >
            <div className="section-head" style={{ padding: "18px 20px 12px" }}>
              <div>
                <h2>Loan queue</h2>
                <div className="sub">
                  {loading ? "…" : `${loans.length} pending`}
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton height={32} />
                <Skeleton height={32} />
                <Skeleton height={32} />
                <Skeleton height={32} />
              </div>
            ) : (
              <ApplicationList
                loans={loans}
                selected={selected}
                sessions={sessions}
                onToggle={toggle}
              />
            )}

            <div
              style={{
                padding: 14,
                borderTop: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {selected.size >= 5 && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--amber)",
                    textTransform: "uppercase",
                  }}
                >
                  Max 5
                </span>
              )}
              <span
                data-testid="selected-count-label"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                }}
              >
                {selected.size} selected
              </span>
              <div style={{ flex: 1 }} />
              <button
                data-testid="btn-run-review"
                className="btn primary"
                disabled={selected.size === 0 || runLoading}
                onClick={runReview}
                style={{ padding: "8px 14px" }}
              >
                {runLoading ? "⟳ Starting…" : "▶ Run review"}
              </button>
            </div>
          </div>

          {/* Agents working + Decided */}
          <div>
            {runningEntries.length > 0 ? (
              <>
                <div
                  className="section-head"
                  style={{ padding: "18px 0 12px" }}
                >
                  <div>
                    <h2>Agents working</h2>
                    <div className="sub">
                      {runningEntries.length} of 5 max parallel
                    </div>
                  </div>
                  <div className="spacer" />
                  <button
                    className="btn outline"
                    style={{ padding: "5px 10px", fontSize: 12 }}
                  >
                    Cinema mode
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    paddingTop: 14,
                  }}
                >
                  {runningEntries.map(([appId, state]) => (
                    <RunningCard
                      key={appId}
                      appId={appId}
                      loan={loanMap.get(appId)}
                      state={state}
                      screenshot={screenshots.get(appId)}
                    />
                  ))}
                </div>
              </>
            ) : entries.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  color: "var(--ink-4)",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 40 }}>◫</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--ink-3)",
                  }}
                >
                  Select applications to begin
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-4)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Check loans in the queue, then click Run review
                </div>
              </div>
            ) : null}

            {/* Decided today */}
            {decidedEntries.length > 0 && (
              <div style={{ marginTop: runningEntries.length > 0 ? 24 : 0 }}>
                <div
                  className="section-head"
                  style={{ padding: "18px 0 12px" }}
                >
                  <div>
                    <h2>Decided today</h2>
                    <div className="sub">
                      {decidedEntries.length} applications
                    </div>
                  </div>
                </div>
                <div style={{ paddingTop: 8 }}>
                  {decidedEntries.map(([appId, state]) => (
                    <DecidedRow
                      key={appId}
                      appId={appId}
                      loan={loanMap.get(appId)}
                      state={state}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
