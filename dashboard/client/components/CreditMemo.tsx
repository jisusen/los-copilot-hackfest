import React, { useState } from "react";
import type { MemoDraft, AgentResult } from "../lib/types";
import { useToast } from "./Toast";
import { CRDE_COLOR, CRDE_SOFT, CRDE_BORDER, RISK_COLOR, crdeCls } from "../lib/format";

const SECTIONS: { key: keyof MemoDraft; label: string; n: number }[] = [
  { key: "section1_profil",      label: "Debtor Profile",                           n: 1 },
  { key: "section2_permohonan",  label: "Loan Application",                         n: 2 },
  { key: "section3_keuangan",    label: "Financial Analysis & Repayment Capacity",  n: 3 },
  { key: "section4_slik",        label: "SLIK OJK Results",                         n: 4 },
  { key: "section5_aml",         label: "AML & Fraud Screening",                    n: 5 },
  { key: "section6_agunan",      label: "Collateral",                               n: 6 },
  { key: "section7_crde",        label: "CRDE Decision",                            n: 7 },
  { key: "section8_rekomendasi", label: "Notes & Analyst Recommendation",          n: 8 },
];

function renderInline(text: string): React.ReactNode {
  // Split on ** first (bold), then handle _italic_ within plain segments
  const boldParts = text.split("**");
  return boldParts.map((seg, bi) => {
    if (bi % 2 === 1) {
      return <strong key={bi} style={{ color: "var(--ink)", fontWeight: 600 }}>{seg}</strong>;
    }
    const italicParts = seg.split("_");
    if (italicParts.length === 1) return <React.Fragment key={bi}>{seg}</React.Fragment>;
    return (
      <React.Fragment key={bi}>
        {italicParts.map((s, ii) =>
          ii % 2 === 1
            ? <em key={ii} style={{ color: "var(--ink-2)", fontStyle: "italic" }}>{s}</em>
            : <React.Fragment key={ii}>{s}</React.Fragment>
        )}
      </React.Fragment>
    );
  });
}

function renderText(text: string): React.ReactNode {
  if (!text) return <span style={{ color: "var(--ink-4)" }}>—</span>;
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const clean = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : line;
    if (!clean && !isBullet) return <br key={i} />;
    return (
      <div key={i} style={{ lineHeight: 1.7, fontSize: 13, color: "var(--ink-2)", display: "flex", gap: isBullet ? 8 : 0, marginBottom: 2 }}>
        {isBullet && <span style={{ color: "var(--ink-4)", flexShrink: 0, marginTop: 1 }}>•</span>}
        <span>{renderInline(clean)}</span>
      </div>
    );
  });
}

function MemoSection({ s, content, editable, onChange }: {
  s: { key: string; label: string; n: number };
  content: string;
  editable?: boolean;
  onChange?: (v: string) => void;
}) {
  const toast = useToast();
  function copy() {
    navigator.clipboard.writeText(content).then(() => toast?.("Copied to clipboard", "info")).catch(() => {});
  }

  return (
    <section data-testid={`memo-section-${s.n}`} style={{ padding: "22px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", minWidth: 24 }}>
          {String(s.n).padStart(2, "0")}
        </span>
        <h3 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.005em", color: "var(--ink)" }}>
          {s.label}
        </h3>
        <div style={{ flex: 1 }} />
        <button
          data-testid={`memo-section-copy-${s.n}`}
          className="btn-ghost"
          style={{ padding: "3px 8px", fontSize: 10 }}
          onClick={copy}
        >
          Copy
        </button>
      </div>

      {editable ? (
        <textarea
          data-testid="memo-section-8-textarea"
          value={content}
          onChange={e => onChange?.(e.target.value)}
          placeholder="Add your override notes, mitigating factors, or final reasoning…"
          style={{
            width: "100%", minHeight: 140, padding: 14,
            border: "1px solid var(--line)",
            background: "#fff",
            borderRadius: "var(--r)",
            fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)",
            resize: "vertical", outline: "none", lineHeight: 1.6,
          }}
        />
      ) : (
        <div>{renderText(content)}</div>
      )}
    </section>
  );
}

function KeyMetrics({ result }: { result: AgentResult }) {
  const r = result;
  const items: [string, string, string][] = [
    ["DBR",   `${(r.dtiActual * 100).toFixed(1)}%`, r.dtiActual > 0.4 ? "red" : ""],
    ["SLIK",  `Kol.${r.slikKol}`,                   r.slikKol > 1 ? "amber" : ""],
    ["AML",   r.amlClear ? "Clear" : "Flag",        !r.amlClear ? "red" : ""],
    ["Score", `${r.numericScore}`,                  r.numericScore < 500 ? "red" : r.numericScore < 750 ? "amber" : ""],
    ["Rules", `${r.rulesTriggered.length}`,         r.rulesTriggered.length > 0 ? "red" : ""],
  ];
  const cls = crdeCls(r.crdeDecision);

  return (
    <aside style={{ padding: 18, background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", position: "sticky", top: 24 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-3)", fontWeight: 600, marginBottom: 12 }}>
        Key Metrics
      </div>
      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(([k, v, color]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
            <dt style={{ fontSize: 12, color: "var(--ink-3)" }}>{k}</dt>
            <dd style={{
              margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500,
              color: color === "red" ? "var(--red)" : color === "amber" ? "var(--amber)" : "var(--ink)",
            }}>{v}</dd>
          </div>
        ))}
      </dl>
      <div style={{ marginTop: 18, padding: "10px 12px", borderRadius: "var(--r)", background: CRDE_SOFT[r.crdeDecision] ?? "var(--paper-2)", border: `1px solid ${CRDE_BORDER[r.crdeDecision] ?? "var(--line)"}` }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", color: CRDE_COLOR[r.crdeDecision] ?? "var(--ink-3)", fontWeight: 600, marginBottom: 4 }}>CRDE Decision</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600, color: CRDE_COLOR[r.crdeDecision] ?? "var(--ink)" }}>
          {r.crdeDecision}
        </div>
      </div>
    </aside>
  );
}

export function CreditMemo({
  appId,
  memo,
  result,
  onMemoChange,
}: {
  appId: string;
  memo: MemoDraft;
  result?: AgentResult;
  onMemoChange: (updated: MemoDraft) => void;
}) {
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const crde = result;
  const crdeCl = crde ? crdeCls(crde.crdeDecision) : "";
  const crdeBg     = crde ? (CRDE_SOFT[crde.crdeDecision]   ?? "var(--paper-2)") : "var(--paper-2)";
  const crdeBorder = crde ? (CRDE_BORDER[crde.crdeDecision] ?? "var(--line)")     : "var(--line)";
  const crdeColor  = crde ? (CRDE_COLOR[crde.crdeDecision]  ?? "var(--ink)")      : "var(--ink)";

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Memo header */}
        <div data-testid="memo-header" style={{ padding: "28px 0 8px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
            Consumer Credit Analysis Memo
          </div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            {result ? (renderInline(memo.section1_profil.split("\n")[0]?.trim() || appId)) : appId}
          </h1>
          <div style={{ display: "flex", gap: 24, marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
            <span><b style={{ color: "var(--ink)" }}>Application</b> {appId}</span>
            <span><b style={{ color: "var(--ink)" }}>Date</b> {today}</span>
            <span><b style={{ color: "var(--ink)" }}>Status</b> Draft AI — Awaiting Analyst Decision</span>
          </div>
        </div>

        {/* CRDE banner */}
        {crde && (
          <div
            data-testid="crde-banner"
            style={{
              margin: "24px 0",
              padding: "18px 22px",
              background: crdeBg,
              border: `1px solid ${crdeBorder}`,
              borderLeft: `4px solid ${crdeColor}`,
              borderRadius: "var(--r-lg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: crdeColor, fontWeight: 600 }}>
                CRDE Recommendation
              </span>
              <span className={`tag solid-${crdeCl}`}>{crde.crdeDecision}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: crdeColor }}>
                Risk {crde.riskScore} · Score {crde.numericScore}/1000 · {crde.rulesTriggered.length} rules triggered
              </span>
            </div>
            {crde.rulesTriggered.length > 0 && (
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>
                {crde.rulesTriggered.join("; ")}.
              </p>
            )}
          </div>
        )}

        {/* 2-col: sections | metrics rail */}
        <div style={{ display: "grid", gridTemplateColumns: crde ? "1fr 240px" : "1fr", gap: 32, paddingBottom: 24 }}>
          <div>
            {SECTIONS.map(s => (
              <MemoSection
                key={s.key}
                s={s}
                content={memo[s.key]}
                editable={s.key === "section8_rekomendasi"}
                onChange={v => onMemoChange({ ...memo, [s.key]: v })}
              />
            ))}
          </div>
          {crde && <div><KeyMetrics result={crde} /></div>}
        </div>
      </div>
    </div>
  );
}
