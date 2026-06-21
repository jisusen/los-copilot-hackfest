import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../contexts/LayoutContext";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import LoanQueuePanel from "../components/dashboard/LoanQueuePanel";
import RunningCard from "../components/dashboard/RunningCard";
import HasilPanel from "../components/dashboard/HasilPanel";

import { useSessions, useAuth } from "../App";
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
import { t, getLocale, setLocale, type Locale } from "../lib/i18n";

type Tab = "queue" | "agents" | "hasil";

// Bottom tab nav for mobile
const tabs: { key: Tab; label: string }[] = [
  { key: "queue", label: "Task List" },
  { key: "agents", label: "Agents" },
  { key: "hasil", label: "Hasil" },
];

interface JokiFoxProps {
  locale: Locale;
}

function FoxAnimeEye({
  left,
  top,
  side,
}: {
  left: string;
  top: string;
  side: "left" | "right";
}) {
  return (
    <div
      className="fox-anime-eye absolute z-20 pointer-events-none"
      style={{ left, top, transform: "translate(-50%, -50%)" }}
    >
      <div className="fox-anime-eye-inner">
        <div className="fox-anime-sclera">
          <div
            className="fox-anime-look animate-fox-eye-look"
            style={{ animationDelay: side === "right" ? "0.2s" : "0s" }}
          >
            <div className="fox-anime-iris">
              <div className="fox-anime-pupil" />
            </div>
            <span className="fox-anime-sparkle fox-anime-sparkle--main animate-glint-sparkle" />
            <span className="fox-anime-sparkle fox-anime-sparkle--sub" />
          </div>
          <div
            className="fox-anime-lid animate-fox-eye-blink"
            style={{ animationDelay: side === "right" ? "0.05s" : "0s" }}
            aria-hidden="true"
          />
          <div className="fox-anime-lash" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function JokiFox({ locale }: JokiFoxProps) {
  return (
    <div
      className="joki-fox mx-auto select-none flex flex-col items-center"
      data-testid="joki-fox"
    >
      <div className="joki-tag">
        <span className="animate-bounce-subtle">🦊</span>
        <span>{t("dash.joki_greeting", locale)}</span>
      </div>

      <div className="ghost-agent relative w-[196px] h-[196px] mx-auto flex items-center justify-center ghost-agent--awake">
        <div className="joki-orb" aria-hidden="true" />

        <div className="relative w-[176px] h-[158px] z-10 joki-fox-img">
          <img
            src="/img/logo-login.png"
            alt="Joki AI Fox"
            className="w-full h-full object-contain drop-shadow-lg"
          />
          <FoxAnimeEye left="34.7%" top="56.6%" side="left" />
          <FoxAnimeEye left="64.6%" top="56.6%" side="right" />
        </div>

        <div className="joki-pedestal" aria-hidden="true" />
      </div>
    </div>
  );
}

interface AgentsEmptyStateProps {
  locale: Locale;
  tipIndex: number;
  slotsUsed?: number;
}

function AgentsEmptyState({
  locale,
  tipIndex,
  slotsUsed = 0,
}: AgentsEmptyStateProps) {
  const tips = [
    t("dash.tip_1", locale),
    t("dash.tip_2", locale),
    t("dash.tip_3", locale),
  ];

  return (
    <div
      className="agents-empty flex flex-col items-center justify-center flex-1 min-h-[320px] px-6 py-8"
      data-testid="agents-empty-state"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600/80 mb-3">
        {t("dash.agents_idle", locale)}
      </p>
      <JokiFox locale={locale} />
      <h3 className="mt-4 text-sm font-bold text-gray-800 text-center">
        {t("dash.select_prompt", locale)}
      </h3>
      <p className="mt-1 text-xs text-gray-500 text-center max-w-sm">
        {t("dash.joki_subtitle", locale)}
      </p>

      <div className="mt-5 flex items-center gap-2 w-full max-w-md">
        {tips.map((tip, i) => (
          <div key={i} className="flex-1 min-w-0">
            <div
              className={`rounded-xl border px-2.5 py-2 transition-all duration-300 ${
                tipIndex === i
                  ? "border-red-200 bg-red-50 shadow-sm"
                  : "border-gray-100 bg-white/80"
              }`}
            >
              <div
                className={`text-[10px] font-bold mb-0.5 ${
                  tipIndex === i ? "text-red-600" : "text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              <div
                className={`text-[10px] leading-snug ${
                  tipIndex === i ? "text-gray-800 font-medium" : "text-gray-500"
                }`}
              >
                {tip}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < slotsUsed
                  ? "bg-red-500 shadow-[0_0_0_2px_rgba(236,36,40,0.15)]"
                  : "bg-gray-200 border border-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-gray-500 font-medium">
          {5 - slotsUsed}/5 {t("dash.slot_available", locale).toLowerCase()}
        </span>
      </div>

      <p className="mt-3 text-[10px] text-gray-400 flex items-center gap-1.5">
        <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-red-600 text-white text-[8px] font-bold">
          {locale === "en" ? "EN" : "ID"}
        </span>
        {t("dash.joki_memo_lang", locale)}
      </p>
    </div>
  );
}

export function Dashboard() {
  const [mobileTab, setMobileTab] = useState<Tab>("agents");
  const [showHasil, setShowHasil] = useState(true);
  const [locale, setLocaleState] = useState(getLocale());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { sessions, screenshots } = useSessions();
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const { agentMode } = useLayout();
  const { user: currentUser } = useAuth();
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
  async function handleSync() {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 5000));
    await fetchLoans();
    setSyncing(false);
  }

  useEffect(() => {
    fetchLoans();
    const t = setInterval(fetchLoans, 30000);
    return () => clearInterval(t);
  }, [fetchLoans]);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(tipTimer);
  }, []);

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
    setConfirmOpen(true);
  }

  async function confirmRunReview() {
    if (selected.size === 0 || runLoading) return;
    setConfirmOpen(false);
    setRunLoading(true);
    try {
      await apiFetch("/api/batch", {
        method: "POST",
        body: JSON.stringify({
          appIds: Array.from(selected),
          mock: agentMode === "sim",
          locale,
          analystId: currentUser ?? "analyst01",
        }),
      });
      setSelected(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setRunLoading(false);
    }
  }

  function switchLocale() {
    const next: "en" | "id" = locale === "en" ? "id" : "en";
    setLocaleState(next);
    setLocale(next);
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

  const availableLoans = loans.filter((l) => {
    const s = sessions.get(l.id);
    if (!s) return true;
    return s.status === "error";
  });

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  function startTour() {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
    const driverObj = driver({
      animate: true,
      overlayColor: "#000000",
      overlayOpacity: 0.85,
      smoothScroll: true,
      showProgress: true,
      progressText: t("tour.progress", locale),
      nextBtnText: t("tour.next", locale),
      prevBtnText: t("tour.prev", locale),
      doneBtnText: t("tour.done", locale),
      popoverClass: "bms-driver-popover",
      onPopoverRender: (popover) => {
        const close = popover.closeButton;
        close.textContent = t("tour.skip", locale);
        close.classList.add("driver-skip-btn");
        popover.previousButton.classList.add(
          "driver-nav-btn",
          "driver-prev-btn",
        );
        popover.nextButton.classList.add("driver-nav-btn", "driver-next-btn");
      },
      steps: [
        {
          popover: {
            title: t("tour.welcome_title", locale),
            description: t("tour.welcome_desc", locale),
            side: "over",
            align: "center",
            popoverClass: "bms-driver-popover bms-driver-welcome",
          },
        },
        {
          element: ".task-list-section",
          popover: {
            title: t("tour.task_list_title", locale),
            description: t("tour.task_list_desc", locale),
            side: "right",
            align: "start",
          },
        },
        {
          element: "[data-testid='btn-run-review']",
          popover: {
            title: t("tour.run_review_title", locale),
            description: t("tour.run_review_desc", locale),
            side: "top",
            align: "end",
          },
        },
        {
          element: ".agents-section",
          popover: {
            title: t("tour.agents_title", locale),
            description: t("tour.agents_desc", locale),
            side: "left",
            align: "center",
          },
        },
        {
          element: ".hasil-section",
          popover: {
            title: t("tour.hasil_title", locale),
            description: t("tour.hasil_desc", locale),
            side: "left",
            align: "center",
          },
        },
        {
          element: ".status-cards-area",
          popover: {
            title: t("tour.status_title", locale),
            description: t("tour.status_desc", locale),
            side: "bottom",
            align: "center",
          },
        },
        {
          popover: {
            title: t("tour.end_title", locale),
            description: t("tour.end_desc", locale),
            side: "over",
            align: "center",
          },
        },
      ],
    });
    driverRef.current = driverObj;
    driverObj.drive();
  }

  useEffect(() => {
    const seen = localStorage.getItem("bms_tour_seen");
    if (!seen) {
      const t = setTimeout(() => {
        startTour();
        localStorage.setItem("bms_tour_seen", "true");
      }, 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return (
     <div className="h-full flex flex-col overflow-hidden ">
          <div className="hidden lg:flex flex-1 h-full overflow-hidden mt-4 gap-4">
            {/* LEFT SIDE */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {/* STATUS CARDS */}
              <div className="grid grid-cols-5 gap-2 shrink-0 status-cards-area">
                {(() => {
                  const cards = [
                    {
                      label: t("dash.in_queue", locale),
                      value: availableLoans.length,
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      ),
                      color: "text-orange-600",
                      bg: "bg-orange-50",
                    },
                    {
                      label: t("dash.running", locale),
                      value: runningEntries.length,
                      sub: `${runningEntries.length}/5`,
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      ),
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                      pulse: runningEntries.length > 0,
                    },
                    {
                      label: t("dash.need_decision", locale),
                      value: readyEntries.length,
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      ),
                      color: "text-amber-600",
                      bg: "bg-amber-50",
                    },
                    {
                      label: t("dash.decided_today", locale),
                      value: decidedEntries.length,
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      ),
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                    },
                    {
                      label: t("dash.avg_time", locale),
                      value: "3:42",
                      sub: t("dash.vs_manual", locale),
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      ),
                      color: "text-violet-600",
                      bg: "bg-violet-50",
                    },
                  ];
                  return cards.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm"
                    >
                      <div
                        className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center ${s.color} ${s.pulse ? "animate-pulse" : ""}`}
                      >
                        {s.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg font-bold text-gray-900 leading-none">
                          {s.value}
                        </div>
                        <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider truncate">
                          {s.label}
                        </div>
                        {s.sub && (
                          <div className="text-[9px] text-gray-400">{s.sub}</div>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
    
              {/* MAIN CONTENT: Task List + Agents */}
              <div className="flex flex-1 gap-3 overflow-hidden">
                {/* Task List Panel */}
                <div className="w-64 bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm flex flex-col task-list-section">
                  {loading ? (
                    <div className="p-4 flex flex-col gap-2">
                      <Skeleton height={32} />
                      <Skeleton height={32} />
                      <Skeleton height={32} />
                      <Skeleton height={32} />
                    </div>
                  ) : (
                    <LoanQueuePanel
                      loans={loans}
                      selected={selected}
                      sessions={sessions}
                      onToggle={toggle}
                      onSync={handleSync}
                      syncing={syncing}
                    />
                  )}
                  {/* Run Review Footer */}
                  <div className="px-3 py-2.5 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-gray-400">
                        {selected.size > 0
                          ? `${selected.size} selected`
                          : "0 selected"}
                      </span>
                      <button
                        data-testid="btn-run-review"
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                        disabled={selected.size === 0 || runLoading}
                        onClick={runReview}
                      >
                        {runLoading ? (
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="opacity-25"
                              />
                              <path
                                d="M4 12a8 8 0 018-8"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                            Starting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <svg
                              viewBox="0 0 24 24"
                              width="12"
                              height="12"
                              fill="currentColor"
                            >
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            Run Review
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
    
                {/* Middle: Agents */}
                <div className="flex-1 min-w-0 agents-section">
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                      {runningEntries.length > 0 && (
                        <div className="mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">
                              {t("dash.agents_working", locale)}
                            </h3>
                            <p className="text-[10px] text-gray-500">
                              {runningEntries.length} {t("dash.agents_sub", locale)}
                            </p>
                          </div>
                        </div>
                      )}
                      {runningEntries.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
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
                      )}
    
                      {runningEntries.length === 0 && (
                        <AgentsEmptyState
                          locale={locale}
                          tipIndex={tipIndex}
                          slotsUsed={runningEntries.length}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
    
            {/* Panel */}
            <div
              className={`bg-white border border-gray-200 transition-all duration-300 rounded-lg overflow-hidden flex flex-col shrink-0 shadow-sm hasil-section
          ${showHasil ? "w-64" : "w-0"}`}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-4 pt-4 pb-1 shrink-0">
                <div className="text-base font-bold text-gray-900">
                  {t("dash.results", locale)}
                </div>
              </div>
    
              {/* CONTENT */}
              <div
                className={`flex-1 overflow-auto transition-opacity duration-300 ease-in-out
            ${showHasil ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                <HasilPanel
                  readyEntries={readyEntries}
                  decidedEntries={decidedEntries}
                  loanMap={loanMap}
                  locale={locale}
                />
              </div>
            </div>
    
            {/* Toggle Button */}
            <button
              onClick={() => setShowHasil((v) => !v)}
              className={`absolute top-[82px] right-0 p-1.5 rounded-bl-lg hover:bg-red-700 shadow z-50 ${showHasil ? "bg-[#f8f3f3]" : "bg-red-600"}`}
            >
              {showHasil ? (
                <svg
                  className="w-4 h-4 text-red-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              )}
            </button>
          </div>
          <div className="flex lg:hidden flex-1 flex-col overflow-hidden">
            {/* Tab content */}
            <div className="flex-1 overflow-hidden bg-white">
              {mobileTab === "queue" && (
                <div className="flex flex-col h-full">
                  <LoanQueuePanel
                    loans={loans}
                    selected={selected}
                    sessions={sessions}
                    onToggle={toggle}
                    onSync={handleSync}
                    syncing={syncing}
                  />
                  <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {selected.size} {t("dash.selected", locale)}
                    </span>
                    <button
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      disabled={selected.size === 0 || runLoading}
                      onClick={runReview}
                    >
                      {runLoading
                        ? `⟳ ${t("dash.starting", locale)}`
                        : t("dash.run_review", locale)}
                    </button>
                  </div>
                </div>
              )}
              {mobileTab === "agents" &&
                (runningEntries.length > 0 ? (
                  <div className="flex flex-col h-full overflow-hidden">
                    {/* Stats */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                            {t("dash.agents_working", locale)}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {runningEntries.length} {t("dash.agents_sub", locale)}
                          </p>
                        </div>
                        <div />
                      </div>
    
                      {runningEntries.map(([appId, state]) => (
                        <RunningCard
                          key={appId}
                          appId={appId}
                          loan={loanMap.get(appId)}
                          state={state}
                          screenshot={screenshots.get(appId)}
                        />
                      ))}
                      <div className="border border-dashed border-gray-300 rounded-xl p-4 flex items-center gap-3 text-gray-400 hover:border-red-300 hover:text-red-400 cursor-pointer transition-colors">
                        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center shrink-0">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {t("dash.slot_available", locale)} (
                            {5 - runningEntries.length}/5)
                          </div>
                          <div className="text-xs">
                            {t("dash.auto_take", locale)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <AgentsEmptyState
                    locale={locale}
                    tipIndex={tipIndex}
                    slotsUsed={runningEntries.length}
                  />
                ))}
    
              {mobileTab === "hasil" && (
                <HasilPanel
                  decidedEntries={decidedEntries}
                  readyEntries={readyEntries}
                  loanMap={loanMap}
                  locale={locale}
                />
              )}
            </div>
    
            {/* Bottom tab bar */}
            <div className="bg-white border-t border-gray-200 flex shrink-0">
              {tabs.map((tab) => {
                const label =
                  tab.key === "queue"
                    ? t("dash.in_queue", locale)
                    : tab.key === "agents"
                      ? t("dash.agents_working", locale)
                      : t("dash.results", locale);
                return (
                  <button
                    key={tab.key}
                    onClick={() => setMobileTab(tab.key)}
                    className={`flex-1 py-3 text-xs font-semibold transition-colors ${mobileTab === tab.key ? "text-red-600 border-t-2 border-red-500" : "text-gray-500"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
    
          {/* Run-review confirmation modal */}
          {confirmOpen && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => setConfirmOpen(false)}
            >
              <div
                className="bg-white rounded-xl p-7 max-w-md w-[90%] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src="/img/modal.webp"
                  alt="Confirmation Icon"
                  className=" flex items-center justify-center mx-auto mb-4"
                  style={{ width: "60%" }}
                />
                <h2 className="text-lg font-bold text-slate-900 text-center mb-2">
                  {t("confirm.title", locale)}
                </h2>
                <p className="text-sm text-slate-600 text-center leading-relaxed mb-6">
                  {t("confirm.desc", locale)}
                </p>
                <div className="flex gap-2.5">
                  <button
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white hover:bg-red-800 transition-colors"
                    style={{
                      background:
                        "linear-gradient(175deg,rgba(207, 0, 0, 1) 0%, rgba(89, 0, 0, 1) 100%)",
                    }}
                    onClick={confirmRunReview}
                  >
                    {t("confirm.proceed", locale)}
                  </button>
                  <button
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setConfirmOpen(false)}
                  >
                    {t("confirm.cancel", locale)}
                  </button>
                </div>
              </div>
            </div>
          )}
      {/* Tour button */}
      <button
        onClick={startTour}
        className="fixed bottom-4 right-16 z-40 w-9 h-9 bg-blue-600 border border-slate-200 rounded-xl shadow-md flex items-center justify-center text-xs font-bold text-white hover:bg-blue-800 transition-colors"
        title={t("tour.help", locale)}
      >
        ?
      </button>

      {/* Locale toggle */}
      <button
        onClick={switchLocale}
        className="fixed bottom-4 right-4 z-40 w-9 h-9 bg-red-600 border border-slate-200 rounded-xl shadow-md flex items-center justify-center text-xs font-bold text-white hover:bg-red-800 transition-colors"
        title={locale === "en" ? "Switch to Indonesian" : "Switch to English"}
      >
        {locale === "en" ? "ID" : "EN"}
      </button>
    </div>
  );
}
