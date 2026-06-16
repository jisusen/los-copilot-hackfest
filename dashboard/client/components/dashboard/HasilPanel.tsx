import { useState } from "react";
import type { LoanSummary, AgentState } from "../../lib/types";
import type { Locale } from "../../lib/i18n";
import { useNavigate } from "react-router-dom";
import { formatRpShort } from "../../lib/format";
import { t } from "../../lib/i18n";
import { apiFetch } from "../../lib/api";

type Props = {
  readyEntries: [string, AgentState & { status: "ready" }][];
  decidedEntries: [string, AgentState & { status: "decided" }][];
  loanMap: Map<string, LoanSummary>;
  locale: Locale;
};

const PRODUCT_ICON: Record<string, string> = {
  KTA: "💳",
  KPR: "🏠",
  KKB: "🚗",
  Multiguna: "📋",
};

const CRDE_COLOR: Record<string, string> = {
  APPROVED: "text-emerald-600 bg-emerald-50",
  "COMMITTEE REVIEW": "text-amber-600 bg-amber-50",
  REJECTED: "text-red-600 bg-red-50",
};

export default function HasilPanel({
  readyEntries,
  decidedEntries,
  loanMap,
  locale,
}: Props) {
  const [hasilTab, setHasilTab] = useState(0);
  const navigate = useNavigate();

  const data = hasilTab === 0 ? readyEntries : decidedEntries;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* TAB */}
      <div className="px-4 pb-3 pt-1 border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[t("hasil.ready", locale), t("hasil.decided", locale)].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setHasilTab(i)}
              className={`
                flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200
                ${
                  hasilTab === i
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {tab}
              <span className="ml-1 opacity-70">
                ({i === 0 ? readyEntries.length : decidedEntries.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto">

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <img src="/img/nodata.svg" alt="Empty" className="w-16 h-16 mb-2" />

            <p className="text-xs font-medium text-gray-600 text-center">
              {t("hasil.empty_title", locale)}
            </p>

            <p className="text-[10px] text-gray-400 mt-1 text-center">
              {t("hasil.empty_desc", locale)}
            </p>
          </div>
        )}

        {data.map(([appId, state]) => {
          const loan = loanMap.get(appId);
          const isDecided = state.status === "decided";
          const dec = isDecided ? state.decision : "ready";
          const result = state.status === "ready" ? state.result : state.status === "decided" ? state.result : undefined;

          const statusCls =
            dec === "approve"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : dec === "reject"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200";

          const label =
            dec === "approve"
              ? "APPROVED"
              : dec === "reject"
              ? "REJECTED"
              : "READY";

          const riskColor =
            loan?.risk_score === "HIGH"
              ? "text-red-600"
              : loan?.risk_score === "LOW"
              ? "text-emerald-600"
              : "text-amber-600";

          const riskBg =
            loan?.risk_score === "HIGH"
              ? "bg-red-50 border-red-100"
              : loan?.risk_score === "LOW"
              ? "bg-emerald-50 border-emerald-100"
              : "bg-amber-50 border-amber-100";

          const crdeColor = CRDE_COLOR[loan?.crde_decision ?? ""] || "text-slate-600 bg-slate-50";

          const handleReset = async (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!confirm(`Reset ${appId} so it can be reviewed again?`)) return;
            try {
              await apiFetch(`/api/sessions/${appId}`, { method: 'DELETE' });
              // The WS 'agent:reset' will remove it from the list automatically
            } catch (err) {
              alert('Failed to reset. Try again.');
            }
          };

          return (
            <div
              key={appId}
              onClick={() => navigate(`/review/${appId}`)}
              className="group px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-all duration-200"
            >
              {/* Row 1: App ID + Review */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-gray-400">{appId}</span>
                <span className="text-[10px] font-semibold text-red-500 group-hover:translate-x-0.5 transition-transform">
                  Review →
                </span>
              </div>

              {/* Row 2: Debtor name */}
              <div className="text-[13px] font-semibold text-gray-800 truncate mb-1">
                {loan ? loan.debtor_name : "Unknown Applicant"}
              </div>

              {/* Row 3: Product + Amount + Tenor */}
              <div className="flex items-center gap-1.5 mb-2">
                {loan && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                    <span>{PRODUCT_ICON[loan.product_type] || "📄"}</span>
                    {loan.product_type}
                  </span>
                )}
                {loan && (
                  <span className="text-[10px] font-mono text-gray-500">
                    {formatRpShort(loan.amount_requested)}
                  </span>
                )}
                {loan && (
                  <span className="text-[10px] text-gray-400">
                    · {loan.tenor_months}mo
                  </span>
                )}
              </div>

              {/* Row 4: Risk + AI Decision */}
              <div className="flex items-center gap-3 mb-1.5">
                {loan && (
                  <span className="text-[10px]">
                    <span className="text-gray-400">Risk:</span>{" "}
                    <span className={`font-bold uppercase ${riskColor}`}>
                      {loan.risk_score}
                    </span>
                  </span>
                )}
                {loan && (
                  <span className="text-[10px]">
                    <span className="text-gray-400">AI Rec:</span>{" "}
                    <span className={`font-bold uppercase ${crdeColor.split(" ")[0]}`}>
                      {loan.crde_decision}
                    </span>
                  </span>
                )}
              </div>

              {/* Row 5: Metrics */}
              {result && (
                <div className="flex items-center gap-1.5 text-[9px]">
                  <span className="font-mono text-gray-400">Score</span>
                  <span className={`font-bold font-mono ${
                    result.numericScore >= 750 ? "text-emerald-600" : 
                    result.numericScore >= 500 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {result.numericScore}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="font-mono text-gray-400">DBR</span>
                  <span className={`font-bold font-mono ${
                    result.dtiActual > 0.4 ? "text-red-600" : 
                    result.dtiActual > 0.35 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {(result.dtiActual * 100).toFixed(0)}%
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="font-mono text-gray-400">KOL</span>
                  <span className={`font-bold font-mono ${
                    result.slikKol > 2 ? "text-red-600" : 
                    result.slikKol > 1 ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {result.slikKol}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="font-mono text-gray-400">AML</span>
                  <span className={`font-bold font-mono ${
                    result.amlClear ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {result.amlClear ? "✓" : "⚠"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}