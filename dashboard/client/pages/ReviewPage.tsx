import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditMemo } from "../components/CreditMemo";
import { CopilotChat } from "../components/CopilotChat";
import { DecisionFooter } from "../components/DecisionFooter";
import { UserMenu } from "../components/UserMenu";
import { Skeleton, SkeletonBlock } from "../components/Skeleton";
import { useSessions } from "../App";
import { apiFetch } from "../lib/api";
import { formatRpShort, CRDE_COLOR, crdeCls } from "../lib/format";
import type { MemoDraft, AgentResult } from "../lib/types";

type SessionData = {
  appId: string;
  losData: {
    profilDebitur: Record<string, string>;
    permohonanKredit: Record<string, string | number>;
    dataKeuangan: Record<string, string | number>;
    slikOjk: Record<string, string | number>;
    amlFraud: Record<string, boolean | string>;
    hasilCrde: {
      riskScore: string;
      decision: string;
      numericScore: number;
      rulesTriggered: string[];
    };
  };
  memoDraft: MemoDraft;
};

// ─── NavRail (same as Dashboard) ───────────────────────────────────────────
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
function Topbar({ crumbs = [] }: { crumbs?: string[] }) {
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
      <UserMenu username="analyst01" />
    </div>
  );
}

export function ReviewPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { sessions } = useSessions();
  const [session, setSession] = useState<SessionData | null>(null);
  const [memo, setMemo] = useState<MemoDraft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appId) return;
    apiFetch<{ session: SessionData }>(`/api/sessions/${appId}`)
      .then((data) => {
        setSession(data.session);
        setMemo(data.session.memoDraft);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [appId]);

  if (!appId) return null;

  if (loading) {
    return (
      <div className="app">
        <div className="app-rail"><NavRail active="dash" /></div>
        <div className="app-top"><Topbar crumbs={["Pipeline", appId, "Review"]} /></div>
        <div className="app-main" style={{ padding: "24px 32px", overflow: "auto" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 24 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <Skeleton width="60%" height={22} />
              <Skeleton width="40%" height={16} />
              <SkeletonBlock lines={4} />
              <SkeletonBlock lines={3} />
            </div>
            <div style={{ width: 380, display: "flex", flexDirection: "column", gap: 12 }}>
              <SkeletonBlock lines={5} />
              <SkeletonBlock lines={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !memo) {
    return (
      <div className="app">
        <div className="app-rail">
          <NavRail active="dash" />
        </div>
        <div className="app-top">
          <Topbar crumbs={["Pipeline", appId ?? "", "Review"]} />
        </div>
        <div
          className="app-main"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            Session not found
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            No session for {appId}. Run the agent first.
          </div>
          <button className="btn-ghost" onClick={() => navigate("/")}>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to pipeline
          </button>
        </div>
      </div>
    );
  }

  const crde = session.losData.hasilCrde;
  const profil = session.losData.profilDebitur;
  const permohonan = session.losData.permohonanKredit;
  const keuangan = session.losData.dataKeuangan;
  const slik = session.losData.slikOjk;
  const aml = session.losData.amlFraud;
  const debtorName = (profil.nama ?? profil["Nama Lengkap"] ?? appId) as string;

  let dtiActual = 0;
  const dtiRaw = keuangan?.dtiRatio ?? keuangan?.dti_ratio ?? 0;
  if (typeof dtiRaw === "string") {
    const parsed = parseFloat(dtiRaw.replace("%", ""));
    if (!isNaN(parsed)) dtiActual = parsed / 100;
  } else if (typeof dtiRaw === "number") {
    dtiActual = dtiRaw > 1 ? dtiRaw / 100 : dtiRaw;
  }

  const slikKol = Number(slik?.kolektibilitas ?? slik?.collectibility ?? 1);
  const amlClear = !(
    aml?.pepStatus ||
    aml?.pep_status ||
    aml?.dttotMatch ||
    aml?.dttot_match
  );

  const agentResult: AgentResult | undefined = crde
    ? {
        riskScore: crde.riskScore,
        crdeDecision: crde.decision,
        dtiActual,
        slikKol,
        amlClear,
        numericScore: crde.numericScore,
        rulesTriggered: crde.rulesTriggered ?? [],
        memoDraft: memo,
      }
    : undefined;

  const riskCls =
    crde?.riskScore === "HIGH"
      ? "red"
      : crde?.riskScore === "LOW"
        ? "green"
        : "amber";

  return (
    <div className="app">
      <div className="app-rail">
        <NavRail active="dash" />
      </div>
      <div className="app-top">
        <Topbar crumbs={["Pipeline", appId, "Review"]} />
      </div>

      <div
        className="app-main"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 56px)",
          overflow: "hidden",
        }}
      >
        {/* Sub-header */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid var(--line)",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexShrink: 0,
          }}
        >
          <button
            className="btn-ghost"
            onClick={() => navigate("/")}
            style={{ textTransform: "none", fontSize: 12 }}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to pipeline
          </button>
          <div style={{ height: 18, width: 1, background: "var(--line)" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
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
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--ink)",
              }}
            >
              {debtorName}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-3)",
              }}
            >
              {permohonan.produk as string}
              {permohonan.plafon
                ? ` · ${formatRpShort(Number(permohonan.plafon))}`
                : ""}
            </span>
            {crde?.riskScore && (
              <span className={`tag ${riskCls}`}>{crde.riskScore}</span>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <button
            className="btn-ghost"
            onClick={() => window.print()}
            style={{ textTransform: "none", fontSize: 12 }}
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>
        </div>

        {/* 2-column: memo | chat */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Memo + sticky decision bar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
              <CreditMemo
                appId={appId}
                memo={memo}
                result={agentResult}
                onMemoChange={setMemo}
              />
            </div>
            <DecisionFooter appId={appId} debtorName={debtorName} />
          </div>

          {/* Chat — must be a constrained flex column so messages scroll */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <CopilotChat appId={appId} debtorName={debtorName} />
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .app-rail, .app-top { display: none !important; }
          .app-main { height: auto !important; overflow: visible !important; }
        }
      `}</style>
    </div>
  );
}
