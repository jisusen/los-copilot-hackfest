import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../contexts/LayoutContext";

import LoanQueuePanel from "../components/dashboard/LoanQueuePanel";
import RunningCard from "../components/dashboard/RunningCard";
import HasilPanel from "../components/dashboard/HasilPanel";

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
import { t, getLocale, setLocale } from "../lib/i18n";

type Tab = "queue" | "agents" | "hasil";

// Bottom tab nav for mobile
const tabs: { key: Tab; label: string }[] = [
  { key: "queue", label: "Task List" },
  { key: "agents", label: "Agents" },
  { key: "hasil", label: "Hasil" },
];

interface JokiFoxProps {
  isWatching: boolean;
  locale: string;
}

function JokiFox({ isWatching, locale }: JokiFoxProps) {
  return (
    <div className="ghost-agent relative w-[200px] h-[200px] flex items-center justify-center select-none">
      {/* Comic Speech Bubble */}
      <div className="comic-bubble">
        {isWatching ? (
          locale === "id" ? "👀 Aku mengawasimu!" : "👀 I'm watching you!"
        ) : (
          locale === "id" ? "💤 ZZZ... Aku tidur..." : "💤 ZZZ... I'm sleeping..."
        )}
      </div>

      {/* Floating ZZZs */}
      {!isWatching && (
        <div className="zzz-container">
          <span className="zzz-letter zzz-1">Z</span>
          <span className="zzz-letter zzz-2">z</span>
          <span className="zzz-letter zzz-3">z</span>
        </div>
      )}

      {/* Fox Head Logo Background */}
      <img
        src="/img/logo-login.png"
        alt="Joki AI Fox"
        className="w-[180px] h-[180px] object-contain"
      />

      {/* Left Eye Assembly */}
      <div 
        className={`absolute w-[18px] h-[18px] bg-white rounded-full overflow-hidden border border-zinc-950/5 shadow-inner ${
          isWatching ? "animate-anime-blink" : ""
        }`}
        style={{
          left: "calc(50% - 36.5px)",
          top: "calc(50% + 3.5px)",
        }}
      >
        {/* Animated Cute Large Dot Pupil */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${
            isWatching ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div 
            className="w-[13px] h-[13px] bg-zinc-950 rounded-full relative animate-watch-pupil"
          >
            {/* Cute Sparkle Glint */}
            <div 
              className="absolute w-[4px] h-[4px] bg-white rounded-full"
              style={{
                top: "1.5px",
                left: "2px",
              }}
            />
          </div>
        </div>

        {/* Sleeping Eyelid Cover */}
        <div 
          className={`absolute inset-0 bg-[#EC2428] flex items-center justify-center transition-opacity duration-500 ease-in-out ${
            !isWatching ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div 
            className="w-[12px] h-[8px] border-t-[2.5px] border-zinc-950 rounded-t-full mt-[5px] animate-sleep-pulse"
          />
        </div>
      </div>

      {/* Right Eye Assembly */}
      <div 
        className={`absolute w-[18px] h-[18px] bg-white rounded-full overflow-hidden border border-zinc-950/5 shadow-inner ${
          isWatching ? "animate-anime-blink" : ""
        }`}
        style={{
          left: "calc(50% + 18.5px)",
          top: "calc(50% + 3.5px)",
        }}
      >
        {/* Animated Cute Large Dot Pupil */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${
            isWatching ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div 
            className="w-[13px] h-[13px] bg-zinc-950 rounded-full relative animate-watch-pupil"
          >
            {/* Cute Sparkle Glint */}
            <div 
              className="absolute w-[4px] h-[4px] bg-white rounded-full"
              style={{
                top: "1.5px",
                left: "2px",
              }}
            />
          </div>
        </div>

        {/* Sleeping Eyelid Cover */}
        <div 
          className={`absolute inset-0 bg-[#EC2428] flex items-center justify-center transition-opacity duration-500 ease-in-out ${
            !isWatching ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div 
            className="w-[12px] h-[8px] border-t-[2.5px] border-zinc-950 rounded-t-full mt-[5px] animate-sleep-pulse"
          />
        </div>
      </div>
    </div>
  );
}

export  function Dashboard() {

  const [mobileTab, setMobileTab] = useState<Tab>("agents");
  const [showHasil, setShowHasil] = useState(true);
  const [locale, setLocaleState] = useState(getLocale());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { sessions, screenshots } = useSessions();
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    let active = true;
    const runCycle = async () => {
      while (active) {
        setIsWatching(false);
        await new Promise((r) => setTimeout(r, 7000));
        if (!active) break;
        setIsWatching(true);
        await new Promise((r) => setTimeout(r, 4000));
      }
    };
    runCycle();
    return () => {
      active = false;
    };
  }, []);

  const { agentMode } = useLayout();
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

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">

<div className="hidden lg:flex flex-1 h-full overflow-hidden  mt-4 gap-4">

  {/* LEFT SIDE */}
  <div className="flex-1 flex flex-col gap-4 min-w-0">

    {/* HEADER AREA */}
    <div className="shrink-0">

      <div className="flex items-center justify-start" style={{ gap: "3rem" }}>

        <div className="shrink-0">
          <h1 className="text-md font-bold text-gray-900">
            {t("dash.pipeline", locale)}
          </h1>

          <div className="flex items-center gap-1 mt-1">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>

            <span className="text-xs text-gray-500">
              {today}
            </span>
          </div>
        </div>

        {/* STATUS CARDS */}
        <div className="flex-1 flex gap-2 flex-nowrap min-w-0">
           {(() => {
             const iconMap: Record<string, React.ReactNode> = {
               clipboard: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>,
               play: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
               hourglass: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3v4a6 6 0 01-6 6 6 6 0 016 6v4" /><path d="M6 3v4a6 6 0 006 6 6 6 0 00-6 6v4" /><line x1="3" y1="3" x2="21" y2="3" /><line x1="3" y1="21" x2="21" y2="21" /></svg>,
               check: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
               clock: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
             };
             const cards = [
               { label: t("dash.in_queue", locale), value: loans.length.toString(), icon: "clipboard", iconColor: "text-orange-500", bg: "bg-orange-50" },
               { label: t("dash.running", locale), value: runningEntries.length.toString(), sub: `${runningEntries.length} ${t("dash.of_max", locale)}`, icon: "play", iconColor: "text-green-500", bg: "bg-green-50" },
               { label: t("dash.need_decision", locale), value: readyEntries.length.toString(), icon: "hourglass", iconColor: "text-red-400", bg: "bg-red-50" },
               { label: t("dash.decided_today", locale), value: decidedEntries.length.toString(), icon: "check", iconColor: "text-pink-400", bg: "bg-pink-50" },
               { label: t("dash.avg_time", locale), value: "3:42", sub: t("dash.vs_manual", locale), icon: "clock", iconColor: "text-orange-400", bg: "bg-orange-50" },
             ];
             return cards.map((s) => (
               <div
                 key={s.label}
                 className="flex-1 min-w-0 flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-1.5 bg-white shadow-md"
               >
                 <div className={`w-7 h-7 ${s.bg} rounded-full flex items-center justify-center ${s.iconColor}`}>
                   {iconMap[s.icon]}
                 </div>
                 <div className="min-w-0">
                   <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide truncate">
                     {s.label}
                   </div>
                   <div className="text-base font-bold text-gray-900">
                     {s.value}
                   </div>
                   {s.sub && (
                     <div className="text-[9px] text-gray-400 truncate">
                       {s.sub}
                     </div>
                   )}
                 </div>
               </div>
             ));
           })()}
        </div>

      </div>
    </div>
    <div className="flex flex-1 gap-4 overflow-hidden">

      <div className="w-64 bg-white border border-gray-200 rounded-md overflow-hidden shrink-0 shadow-md mb-4">
          
    <div className="flex flex-col h-full">
          {loading ? (
            <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
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
            />
          )}
            <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{selected.size} {t("dash.selected", locale)}</span>
              <button
              data-testid="btn-run-review"
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              disabled={selected.size === 0 || runLoading}
                onClick={runReview}>
              {runLoading ? `⟳ ${t("dash.starting", locale)}` : `▶ ${t("dash.run_review", locale)}`}
              </button>
            </div>
            </div>
        </div>

            {/* Middle: Agents */}
         <div className="flex-1 mr-4 min-w-0">
          
            <div className="flex flex-col h-full overflow-hidden">

              <div className="flex-1 overflow-y-auto mb-4">

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      {t("dash.agents_working", locale)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {runningEntries.length} {t("dash.agents_sub", locale)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button className="hidden sm:flex items-center shadow-md gap-1 border bg-white border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                      {t("dash.cinemas", locale)}
                    </button>
                    {/* <button onClick={switchLocale} className="flex items-center gap-1 border bg-white border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                      {locale === "en" ? "ID" : "EN"}
                    </button> */}
                  </div>
                </div>
                {runningEntries.length > 0 && runningEntries.map(([appId, state]) => (
                  <RunningCard
                    key={appId}
                    appId={appId}
                    loan={loanMap.get(appId)}
                    state={state}
                    screenshot={screenshots.get(appId)}
                  />
                ))}

                {runningEntries.length === 0 && entries.length === 0  && (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 gap-3">
                    <JokiFox isWatching={isWatching} locale={locale} />
                    <div className="text-sm font-medium text-gray-500">
                      {t("dash.select_prompt", locale)}
                    </div>
                    <div className="text-xs font-mono text-gray-400">
                      {t("dash.select_hint", locale)}
                    </div>
                  </div>
                )}
                {runningEntries.length === 0 && entries.length > 0 && (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 gap-3">
                    <JokiFox isWatching={isWatching} locale={locale} />
                    <div className="text-sm font-medium text-gray-500">
                      {t("dash.select_prompt", locale)}
                    </div>
                    <div className="text-xs font-mono text-gray-400">
                      {t("dash.select_hint", locale)}
                    </div>
                  </div>
                )}
                <div className="border border-dashed border-red-300 rounded-xl p-4 flex items-center gap-3 ">
                  <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-red-400">
                    +
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-400">
                      {t("dash.slot_available", locale)} ({5 - runningEntries.length}/5)
                    </div>
                    <div className="text-xs text-gray-400">
                      {t("dash.auto_take", locale)}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          

         
        </div>
    </div>
  </div>

    {/* Panel */}
  <div
    className={`bg-white border border-gray-200 transition-all duration-300 rounded-md overflow-hidden flex flex-col  shrink-0 shadow-md mb-4
      ${showHasil ? "w-64" : "w-0"}`}
  >
    {/* HEADER */}
    <div className="flex items-center justify-between px-4 pt-4 pb-1 shrink-0">
      <div className="text-base font-bold text-gray-900">{t("dash.results", locale)}</div>
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

  {/* Toggle Button - selalu terlihat */}
  <button
    onClick={() => setShowHasil((v) => !v)}
    className={`absolute top-(72px) right-0 p-1.5  rounded-bl-[10px] hover:bg-red-700  shadow z-50 ${showHasil ? "bg-[#f8f3f3]" : "bg-red-600"}`}
  >
    {showHasil ? (
      <svg
        className="w-4 h-4 text-white-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-white-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
                    />
                      <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{selected.size} {t("dash.selected", locale)}</span>
              <button className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              disabled={selected.size === 0 || runLoading}
                onClick={runReview}>
              {runLoading ? `⟳ ${t("dash.starting", locale)}` : t("dash.run_review", locale)}
              </button>
              </div>
              </div>
            )}
           {mobileTab === "agents" && (
  runningEntries.length > 0 ? (
             <div className="flex flex-col h-full overflow-hidden">
                {/* Stats */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">{t("dash.agents_working", locale)}</h3>
                      <p className="text-xs text-gray-500">{runningEntries.length} {t("dash.agents_sub", locale)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" /></svg>
                        {t("dash.cinemas", locale)}
                      </button>
                      <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                      </button>
                    </div>
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
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t("dash.slot_available", locale)} ({5 - runningEntries.length}/5)</div>
                      <div className="text-xs">{t("dash.auto_take", locale)}</div>
                    </div>
                  </div>
                </div>
                </div>
            ) : (
                // Ketika runningEntries === 0 (baik entries kosong ataupun tidak, tetap memuat animasi)
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 gap-3">
                  <JokiFox isWatching={isWatching} locale={locale} />
                  <div className="text-sm font-medium text-gray-500">
                    {entries.length === 0 ? t("dash.select_prompt", locale) : t("dash.select_prompt", locale)}
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    {entries.length === 0 ? t("dash.select_hint", locale) : t("dash.select_hint", locale)}
                  </div>
                </div>
              )
            )}
             
            {mobileTab === "hasil" &&   
            <HasilPanel
            decidedEntries={decidedEntries}
            readyEntries={readyEntries}
            loanMap={loanMap}
            locale={locale}
            />}
          </div>

          {/* Bottom tab bar */}
          <div className="bg-white border-t border-gray-200 flex shrink-0">
            {tabs.map((tab) => {
              const label = tab.key === "queue" ? t("dash.in_queue", locale)
                : tab.key === "agents" ? t("dash.agents_working", locale)
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setConfirmOpen(false)}>
          <div className="bg-white rounded-2xl p-7 max-w-md w-[90%] shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src="/img/modal.webp" alt="Confirmation Icon" className=" flex items-center justify-center mx-auto mb-4" style={{width:"60%"}} />
            <h2 className="text-lg font-bold text-slate-900 text-center mb-2">{t("confirm.title", locale)}</h2>
            <p className="text-sm text-slate-600 text-center leading-relaxed mb-6">{t("confirm.desc", locale)}</p>
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white hover:bg-red-800 transition-colors"
                style={{background:"linear-gradient(175deg,rgba(207, 0, 0, 1) 0%, rgba(89, 0, 0, 1) 100%)"}}  onClick={confirmRunReview}
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
