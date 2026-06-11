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
      <div className="p-3 border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[t("hasil.ready", locale), t("hasil.decided", locale)].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setHasilTab(i)}
              className={`
                flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10">
            {/* <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-gray-400 text-lg">✓</span>
            </div> */}
            <img src="/img/nodata.svg" alt="Empty" className="w-24 h-24 mb-3" />

            <p className="text-sm font-medium text-gray-600">
              {t("hasil.empty_title", locale)}
            </p>

            <p className="text-xs text-gray-400 mt-1">
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
                bg-white
                border
                border-gray-200
                rounded-2xl
                p-4
                shadow-sm
                hover:shadow-md
                hover:border-red-100
                transition-all
                duration-200
                cursor-pointer
              "
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0 flex-1">
                  {loan ? (
                    <>
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {loan.debtor_name}
                      </h4>

                      <p className="text-[11px] text-gray-400 mt-1">
                        APP ID • {appId}
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        Unknown Applicant
                      </h4>

                      <p className="text-[11px] text-gray-400 mt-1">
                        APP ID • {appId}
                      </p>
                    </>
                  )}
                </div>

                <span
                  className={`
                    px-2.5 py-1
                    rounded-full
                    text-[10px]
                    font-semibold
                    whitespace-nowrap
                    ${statusCls}
                  `}
                >
                  {label}
                </span>
              </div>

              {/* LOAN INFO */}
              {loan && (
                <>
                  <div className="grid grid-cols-2 gap-4 mt-4">

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        {t("hasil.product", locale)}
                      </p>

                      <p className="text-xs font-medium text-gray-700 mt-1">
                        {loan.product_type}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        {t("hasil.amount", locale)}
                      </p>

                      <p className="text-xs font-medium text-gray-700 mt-1">
                        {formatRpShort(loan.amount_requested)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <span
                      className={`
                        px-2 py-1
                        rounded-lg
                        text-[10px]
                        font-semibold
                        ${riskCls}
                      `}
                    >
                      {t("hasil.risk", locale)} {loan.risk_score ?? "-"}
                    </span>

                    <span className="text-[11px] text-gray-400">
                      Analyst 01
                    </span>
                  </div>
                </>
              )}

              {/* FOOTER */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">

                <span className="text-[11px] text-gray-400">
                  {decidedAt
                    ? new Date(decidedAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : t("hasil.waiting", locale)}
                </span>

                <span
                  className="
                    text-xs
                    font-semibold
                    text-red-500
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                >
                  {t("hasil.review", locale)} →
                </span>
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