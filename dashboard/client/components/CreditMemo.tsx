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
  { key: "section8_rekomendasi", label: "Notes & Analyst Recommendations",          n: 8 },
];

function renderInline(text: string): React.ReactNode {
  const boldParts = text.split("**");
  return boldParts.map((seg, bi) => {
    if (bi % 2 === 1) {
      return <strong key={bi} className="text-slate-900 font-semibold">{seg}</strong>;
    }
    const italicParts = seg.split("_");
    if (italicParts.length === 1) return <React.Fragment key={bi}>{seg}</React.Fragment>;
    return (
      <React.Fragment key={bi}>
        {italicParts.map((s, ii) =>
          ii % 2 === 1
            ? <em key={ii} className="text-slate-600 italic">{s}</em>
            : <React.Fragment key={ii}>{s}</React.Fragment>
        )}
      </React.Fragment>
    );
  });
}

function renderText(text: string): React.ReactNode {
  if (!text) return <span className="text-slate-300">—</span>;
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const clean = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : trimmed;
        const hasColon = clean.includes(":") && !clean.startsWith("http");
        const colonIdx = hasColon ? clean.indexOf(":") : -1;
        const label = colonIdx > 0 ? clean.slice(0, colonIdx).trim() : "";
        const value = colonIdx > 0 ? clean.slice(colonIdx + 1).trim() : clean;

        if (isBullet && hasColon) {
          return (
            <div key={i} className="flex gap-2 py-0.5">
              <span className="text-slate-400 shrink-0 mt-0.5 text-xs">•</span>
              <div className="flex-1 flex items-baseline gap-2 text-[13px]">
                <span className="text-slate-500 font-medium shrink-0">{renderInline(label)}</span>
                <span className="text-slate-800">:</span>
                <span className="text-slate-900">{renderInline(value)}</span>
              </div>
            </div>
          );
        }
        if (hasColon) {
          return (
            <div key={i} className={`flex gap-2 py-0.5 ${i % 2 === 1 ? "bg-slate-50 -mx-2 px-2 rounded" : ""}`}>
              <div className="flex-1 flex items-baseline gap-2 text-[13px]">
                <span className="text-slate-500 font-medium shrink-0 min-w-[120px]">{renderInline(label)}</span>
                <span className="text-slate-400">:</span>
                <span className="text-slate-900">{renderInline(value)}</span>
              </div>
            </div>
          );
        }
        if (isBullet) {
          return (
            <div key={i} className="flex gap-2 py-0.5">
              <span className="text-slate-400 shrink-0 mt-0.5 text-xs">•</span>
              <span className="text-[13px] leading-relaxed text-slate-700">{renderInline(clean)}</span>
            </div>
          );
        }
        return (
          <div key={i} className={`flex gap-2 py-0.5 text-[13px] leading-relaxed text-slate-700 ${i % 2 === 1 ? "bg-slate-50 -mx-2 px-2 rounded" : ""}`}>
            <span>{renderInline(clean)}</span>
          </div>
        );
      })}
    </div>
  );
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
    <section data-testid={`memo-section-${s.n}`} className="py-5 border-t border-slate-200">
      <div className="flex items-baseline gap-2.5 mb-3">
        <span className="font-mono text-[11px] text-slate-400 min-w-[24px]">
          {String(s.n).padStart(2, "0")}
        </span>
        <h3 className="m-0 text-[16px] font-semibold tracking-tight text-slate-900">
          {s.label}
        </h3>
        <div className="flex-1" />
        <button
          data-testid={`memo-section-copy-${s.n}`}
          className="text-[10px] px-2 py-0.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
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
          className="w-full min-h-[220px] p-3.5 border border-dashed border-amber-300 bg-amber-50/50 rounded-xl font-mono text-xs text-slate-900 resize-vertical outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
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

  const colorMap: Record<string, string> = {
    red: "text-red-600",
    amber: "text-amber-600",
    "": "text-slate-900",
  };

  return (
    <aside className="p-4 bg-slate-50 border border-slate-200 rounded-2xl sticky top-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-3">
        Key Metrics
      </div>
      <dl className="m-0 flex flex-col gap-2.5">
        {items.map(([k, v, color]) => (
          <div key={k} className="flex justify-between items-baseline border-b border-dashed border-slate-200 pb-2">
            <dt className="text-xs text-slate-500">{k}</dt>
            <dd className={`m-0 font-mono text-[13px] font-medium ${colorMap[color] ?? "text-slate-900"}`}>{v}</dd>
          </div>
        ))}
      </dl>
      <div
        className="mt-4 p-2.5 rounded-xl"
        style={{
          background: CRDE_SOFT[r.crdeDecision] ?? "bg-slate-50",
          border: `1px solid ${CRDE_BORDER[r.crdeDecision] ?? "#e2e8f0"}`,
        }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-widest font-semibold mb-1"
          style={{ color: CRDE_COLOR[r.crdeDecision] ?? "#94a3b8" }}
        >
          AI Decision
        </div>
        <div
          className="text-[18px] font-semibold"
          style={{ color: CRDE_COLOR[r.crdeDecision] ?? "#1f2d3d" }}
        >
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
  const crdeBg     = crde ? (CRDE_SOFT[crde.crdeDecision]   ?? "#f8fafc") : "#f8fafc";
  const crdeBorder = crde ? (CRDE_BORDER[crde.crdeDecision] ?? "#e2e8f0") : "#e2e8f0";
  const crdeColor  = crde ? (CRDE_COLOR[crde.crdeDecision]  ?? "#1f2d3d") : "#1f2d3d";

  return (
    <div className="px-6 pb-6">
      <div className="mx-auto max-w-[980px]">
        {/* Memo header */}
        <div data-testid="memo-header" className="pt-7 pb-2">
          <div className="font-mono text-[11px] text-slate-400 uppercase tracking-widest mb-1.5">
            Consumer Credit Analysis Memo
          </div>
          <h1 className="m-0 text-[32px] font-semibold tracking-tight text-slate-900">
            {result ? (renderInline(memo.section1_profil.split("\n")[0]?.trim() || appId)) : appId}
          </h1>
          <div className="flex gap-6 mt-2.5 font-mono text-[11px] text-slate-400">
            <span><b className="text-slate-800">Application</b> {appId}</span>
            <span><b className="text-slate-800">Date</b> {today}</span>
            <span><b className="text-slate-800">Status</b> Draft AI — Awaiting Analyst Decision</span>
          </div>
        </div>

        {/* CRDE banner */}
        {crde && (
          <div
            data-testid="crde-banner"
            className="my-6 p-[18px_22px] rounded-2xl"
            style={{
              background: crdeBg,
              border: `1px solid ${crdeBorder}`,
              borderLeft: `4px solid ${crdeColor}`,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest font-semibold" style={{ color: crdeColor }}>
                CRDE Recommendation
              </span>
              <span className={`tag solid-${crdeCl}`}>{crde.crdeDecision}</span>
              <div className="flex-1" />
              <span className="font-mono text-[11px]" style={{ color: crdeColor }}>
                Risk {crde.riskScore} · Score {crde.numericScore}/1000 · {crde.rulesTriggered.length} rules triggered
              </span>
            </div>
            {crde.rulesTriggered.length > 0 && (
              <p className="m-0 text-[13px] leading-relaxed text-slate-700">
                {crde.rulesTriggered.join("; ")}.
              </p>
            )}
          </div>
        )}

        {/* 2-col: sections | metrics rail */}
        <div className="grid gap-8 pb-6" style={{ gridTemplateColumns: crde ? "1fr 240px" : "1fr" }}>
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
