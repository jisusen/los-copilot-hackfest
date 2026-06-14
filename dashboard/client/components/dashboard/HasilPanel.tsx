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
              {/* Row 1: App ID + Status badge + Reset button */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-gray-400">{appId}</span>
                  {loan && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${riskBg} ${riskColor} uppercase tracking-wider`}>
                      {loan.risk_score}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusCls}`}>
                    {label}
                  </span>
                  <button
                    onClick={handleReset}
                    className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-[9px] text-gray-400 hover:text-red-600 border border-transparent hover:border-gray-200 rounded transition-all"
                    title="Reset so it can be reviewed again"
                  >
                    ↺
                  </button>
                </div>
              </div>

              {/* Row 2: Debtor name */}
              <div className="text-[13px] font-semibold text-gray-800 truncate">
                {loan ? loan.debtor_name : "Unknown Applicant"}
              </div>

              {/* Row 3: Product + Amount + Tenor */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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

              {/* Row 4: CRDE + Score + Review link */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  {loan && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${crdeColor}`}>
                      {loan.crde_decision}
                    </span>
                  )}
                  {loan && (
                    <span className="text-[10px] font-mono text-gray-400">
                      Score {loan.numeric_score}/1000
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-red-500 group-hover:translate-x-0.5 transition-transform">
                  Review →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}