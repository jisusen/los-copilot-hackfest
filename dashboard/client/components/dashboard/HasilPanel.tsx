import { useState } from "react";
import type { LoanSummary, AgentState } from "../../lib/types";
import type { Locale } from "../../lib/i18n";
import { useNavigate } from "react-router-dom";
import { formatRpShort } from "../../lib/format";
import { t } from "../../lib/i18n";

type Props = {
  readyEntries: [string, AgentState & { status: "ready" }][];
  decidedEntries: [string, AgentState & { status: "decided" }][];
  loanMap: Map<string, LoanSummary>;
  locale: Locale;
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

      {/* HEADER */}
    

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
          const decidedAt = isDecided ? state.decidedAt : undefined;

          const statusCls =
            dec === "approve"
              ? "bg-green-100 text-green-700 border border-green-200"
              : dec === "reject"
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-blue-100 text-blue-700 border border-blue-200";

          const label =
            dec === "approve"
              ? t("hasil.approved", locale)
              : dec === "reject"
              ? t("hasil.rejected", locale)
              : t("hasil.ready_label", locale);

          const riskCls =
            loan?.risk_score === "HIGH"
              ? "bg-red-50 text-red-600 border border-red-100"
              : loan?.risk_score === "LOW"
              ? "bg-green-50 text-green-600 border border-green-100"
              : "bg-orange-50 text-orange-600 border border-orange-100";

          return (
            <div
              key={appId}
              onClick={() => navigate(`/review/${appId}`)}
              className="
                group
                flex
                items-center
                gap-2
                px-4
                py-2.5
                hover:bg-gray-50
                cursor-pointer
                border-b
                border-gray-100
                transition-all
                duration-200
              "
            >
              <div className="flex-1 min-w-0">
                {/* ID AND STATUS */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">APP ID • {appId}</span>
                  <span
                    className={`
                      px-2 py-0.5
                      rounded
                      text-[10px]
                      font-semibold
                      whitespace-nowrap
                      ${statusCls}
                    `}
                  >
                    {label}
                  </span>
                </div>

                {/* DEBTOR NAME */}
                <div className="text-xs font-semibold text-gray-800 truncate mt-0.5">
                  {loan ? loan.debtor_name : "Unknown Applicant"}
                </div>

                {/* PRODUCT TYPE, AMOUNT AND RISK */}
                <div className="flex items-center justify-between mt-0.5 text-[10px] text-gray-400">
                  <span className="truncate">
                    {loan ? `${loan.product_type} · ${formatRpShort(loan.amount_requested)}` : ""}
                    {loan?.risk_score && ` · Risk ${loan.risk_score}`}
                  </span>
                  <span
                    className="
                      text-[10px]
                      font-semibold
                      text-red-500
                      transition-transform
                      duration-200
                      group-hover:translate-x-0.5
                      shrink-0
                      ml-2
                    "
                  >
                    {t("hasil.review", locale)} →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-gray-100 bg-white mt-auto">
        {/* <button
          className="
            w-full
            py-2.5
            rounded-xl
            border
            border-red-100
            bg-red-50
            text-sm
            font-semibold
            text-red-600
            hover:bg-red-100
            transition-colors
          "
        >
          {t("hasil.see_all", locale)}
        </button> */}
      </div>
    </div>
  );
}