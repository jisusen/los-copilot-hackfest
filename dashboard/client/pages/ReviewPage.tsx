import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditUnderwritingDashboard } from "../components/CreditUnderwritingDashboard";
import { CopilotChat } from "../components/CopilotChat";
import { DecisionFooter } from "../components/DecisionFooter";


import { apiFetch } from "../lib/api";
import type { MemoDraft, AgentResult, Decision } from "../lib/types";
import {
  Download,
  Printer,
  MoreHorizontal,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  MessageCircle,
  X,
  Sparkles,
} from "lucide-react";

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

const EMPTY_MEMO: MemoDraft = {
  executive_summary: "",
  section1_profil: "",
  section2_permohonan: "",
  section3_keuangan: "",
  section4_slik: "",
  section5_aml: "",
  section6_agunan: "",
  section7_crde: "",
  section8_rekomendasi: "",
};

const CONFIRM_LABEL: Record<Decision, string> = {
  approve: "APPROVING",
  reject: "REFERRING TO COMMITTEE",
  cancel: "REJECTING",
};

export function ReviewPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [memo, setMemo] = useState<MemoDraft>(EMPTY_MEMO);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Decision | null>(null);
  const [note, setNote] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (printing) {
      const t = setTimeout(() => { window.print(); }, 80);
      return () => clearTimeout(t);
    }
  }, [printing]);

  useEffect(() => {
    const done = () => setPrinting(false);
    window.addEventListener('afterprint', done);
    return () => window.removeEventListener('afterprint', done);
  }, []);

  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    apiFetch<{ session: SessionData }>(`/api/sessions/${appId}`)
      .then((data) => {
        setSession(data.session);
        setMemo(data.session.memoDraft ?? EMPTY_MEMO);
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [appId]);

  async function confirm() {
    if (!pending || decisionLoading) return;
    setDecisionLoading(true);
    try {
      await apiFetch(`/api/decisions/${appId}`, {
        method: "POST",
        body: JSON.stringify({ decision: pending, note, analystId: "analyst01" }),
      });
      navigate("/");
    } catch {
      setDecisionLoading(false);
    }
  }

  if (!appId) return null;

  const crde = session?.losData.hasilCrde;
  const profil = session?.losData.profilDebitur ?? {};
  const permohonan = session?.losData.permohonanKredit ?? {};
  const keuangan = session?.losData.dataKeuangan ?? {};
  const slik = session?.losData.slikOjk ?? {};
  const aml = session?.losData.amlFraud ?? {};
  const debtorName = (profil.nama ?? profil["Nama Lengkap"] ?? profil["full_name"] ?? appId) as string;

  let dtiActual = 0;
  const dtiRaw = keuangan?.dtiRatio ?? keuangan?.dti_ratio ?? 0;
  if (typeof dtiRaw === "string") {
    const parsed = parseFloat(dtiRaw.replace("%", ""));
    if (!isNaN(parsed)) dtiActual = parsed / 100;
  } else if (typeof dtiRaw === "number") {
    dtiActual = dtiRaw > 1 ? dtiRaw / 100 : dtiRaw;
  }

  const slikKol = Number(slik?.kolektibilitas ?? slik?.collectibility ?? 1);
  const amlClear = !(aml?.pepStatus || aml?.pep_status || aml?.dttotMatch || aml?.dttot_match);

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

  const isApproved = crde?.decision === "APPROVED" || crde?.decision === "APPROVE" || crde?.decision === "DISETUJUI";
  const isRejected = crde?.decision === "REJECT" || crde?.decision === "REJECTED" || crde?.decision === "DITOLAK";
  const isCommittee = !isApproved && !isRejected && (crde?.decision?.includes("REVIEW") || crde?.decision?.includes("REFER") || crde?.decision === "COMMITTEE REVIEW");

  const amlFlagged = !!(aml?.pepStatus || aml?.pep_status || aml?.dttotMatch || aml?.dttot_match || aml?.fraudSignals || aml?.fraud_signals);

  return (
    <div className="h-full flex flex-col " style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {loading ? (
        <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-9">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-4">
                  <div className="h-6 w-60 rounded-full bg-slate-200 animate-pulse mb-4" />
                  <div className="h-4 w-40 rounded-full bg-slate-200 animate-pulse mb-3" />
                  <div className="space-y-3">
                    <div className="h-4 w-full rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-4 w-5/6 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-4 w-4/6 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !session ? (
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="flex min-h-[calc(100vh-180px)] items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Session not found</h2>
              <p className="text-sm text-slate-500 mb-6">
                No session was found for <span className="font-mono text-slate-700 font-medium">{appId}</span>. Run the agent first to generate review data.
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 border border-slate-200 bg-white text-sm font-semibold text-slate-700 px-4 py-2 rounded-xl transition-colors hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to pipeline
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 12-col grid wrapper */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-12 gap-6 items-start">
                {/* ===== HEADER: col-span-12 ===== */}
                <header className="col-span-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-1.5 border border-slate-200 bg-white text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-50"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back
                      </button>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate max-w-[200px] sm:max-w-none">{debtorName}</h1>
                          <div className="bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded text-xs">
                            {permohonan.produk ?? permohonan.product_type ?? "Loan"}
                          </div>
                          {crde?.riskScore && (
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                isRejected
                                  ? "bg-red-50 text-red-700"
                                  : crde?.riskScore === "LOW"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {crde.riskScore}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="font-mono text-slate-400">{appId}</span>
                          <span>{session ? new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
                          <span className="bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded text-[10px]">Under Review</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                     
                      <button
                        type="button"
                        onClick={() => setPrinting(true)}
                        className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    
                    </div>
                  </div>
                </header>

                {/* ===== CENTER DOCUMENT: col-span-12 lg:col-span-9 ===== */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                  <CreditUnderwritingDashboard
                    appId={appId}
                    memo={memo}
                    result={agentResult}
                    onMemoChange={setMemo}
                    profilDebitur={profil}
                    permohonanKredit={permohonan}
                    dataKeuangan={keuangan}
                    slikOjk={slik}
                    amlFraud={aml}
                  />

            <DecisionFooter appId={appId} debtorName={debtorName} memo={memo} />

                  {/* Sticky Chat Toggle Button */}
                  <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
                    {chatOpen && (
                      <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col" >
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
                          <span className="text-sm font-bold text-slate-900">Copilot Chat</span>
                          <button
                            type="button"
                            onClick={() => setChatOpen(false)}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1 min-h-0" >
                          <CopilotChat appId={appId} debtorName={debtorName} />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setChatOpen(!chatOpen)}
                      className={`flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-2xl shadow-lg transition-all duration-200 ${
                        chatOpen
                          ? "bg-slate-800 text-white hover:bg-slate-700 shadow-slate-900/20"
                          : "bg-gradient-to-r from-red-600 to-amber-500 text-white hover:from-red-700 hover:to-amber-600 shadow-red-500/30 hover:shadow-red-500/40"
                      }`}
                    >
                      {chatOpen ? (
                        <><X className="w-4 h-4" /> Close</>
                      ) : (
                        <><MessageCircle className="w-5 h-5" /> Ask Copilot</>
                      )}
                    </button>
                  </div>
                </div>

                {/* ===== RIGHT SIDEBAR: col-span-12 lg:col-span-3 ===== */}
                <aside className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-6">
                  {/* AI Decision Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div
                      className={`p-5 ${
                        isCommittee
                          ? "bg-[#FFFBEB]"
                          : isRejected
                          ? "bg-[#FEF2F2]"
                          : isApproved
                          ? "bg-[#F0FDF4]"
                          : "bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isCommittee ? "bg-amber-100" : isRejected ? "bg-red-100" : "bg-emerald-100"
                        }`}>
                          {isCommittee ? (
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                          ) : isRejected ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wider ${
                            isCommittee ? "text-amber-700" : isRejected ? "text-red-700" : "text-emerald-700"
                          }`}>
                            {isCommittee ? "COMMITTEE REVIEW" : isRejected ? "REJECTED AI DECISION" : "APPROVED AI DECISION"}
                          </div>
                          <div className={`text-lg font-black ${
                            isCommittee ? "text-amber-600" : isRejected ? "text-red-600" : "text-emerald-600"
                          }`}>
                            {crde?.decision ?? "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Metrics */}
                    <div className="p-5 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Summary Metrics
                      </div>
                      <div className="space-y-0">
                        {[
                          { label: "Credit Score", value: crde?.numericScore ? `${crde.numericScore}/1000` : "—", flagged: (crde?.numericScore ?? 999) < 500 },
                          { label: "Risk Level", value: crde?.riskScore ?? "—", flagged: crde?.riskScore === "HIGH" },
                          { label: "Rules Triggered", value: `${crde?.rulesTriggered?.length ?? 0}`, flagged: (crde?.rulesTriggered?.length ?? 0) > 0 },
                          { label: "DTI Ratio", value: `${(dtiActual * 100).toFixed(1)}%`, flagged: dtiActual > 0.4 },
                          { label: "SLIK Collectability", value: `Kol. ${slikKol}`, flagged: slikKol > 1 },
                          { label: "AML Screening", value: amlClear ? "CLEAR" : "FLAGGED", flagged: !amlClear },
                        ].map((m) => (
                          <div
                            key={m.label}
                            className={`flex items-center justify-between py-2 text-xs border-b border-slate-50 last:border-b-0 ${
                              m.flagged ? "bg-red-50/50 -mx-5 px-5" : ""
                            }`}
                          >
                            <span className="text-slate-500">{m.label}</span>
                            <span className={`font-bold ${m.flagged ? "text-red-600" : "text-slate-800"}`}>
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {/* <div className="p-5 border-t border-slate-100 space-y-2.5">
                      <button
                        data-testid="btn-approve"
                        className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-all ${
                          pending === "approve"
                            ? "bg-[#10B981] hover:bg-[#059669] text-white ring-2 ring-emerald-300"
                            : "bg-[#10B981] border-2 border-[#059669] text-[#059669] hover:border-[#ffffff] hover:text-[#000000]"
                        }`}
                        onClick={() => setPending(prev => prev === "approve" ? null : "approve")}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        data-testid="btn-refer"
                        className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-all ${
                          pending === "reject"
                            ? "bg-[#F59E0B] hover:bg-[#D97706] text-white ring-2 ring-amber-300"
                            : "bg-[#F59E0B] border-2 border-[#D97706] text-[#D97706] hover:border-[#ffffff] hover:text-[#000000]"
                        }`}
                        onClick={() => setPending(prev => prev === "reject" ? null : "reject")}
                      >
                        <HelpCircle className="w-4 h-4" />
                        Refer to Committee
                      </button>
                      <button
                        data-testid="btn-reject"
                        className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-all ${
                          pending === "cancel"
                            ? "bg-[#EF4444] hover:bg-[#DC2626] text-white ring-2 ring-red-300"
                            : "bg-[#EF4444] border-2 border-[#DC2626] text-[#DC2626] hover:border-[#ffffff] hover:text-[#000000]"
                        }`}
                        onClick={() => setPending(prev => prev === "cancel" ? null : "cancel")}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div> */}

                    {/* Note Input + Submit — always visible */}
                    {/* <div className="p-5 border-t border-slate-100 space-y-2.5">
                      <input
                        data-testid="decision-note-input"
                        type="text"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Add note for decision..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        data-testid="btn-confirm-decision"
                        disabled={!pending || decisionLoading}
                        onClick={confirm}
                        className="w-full py-2.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
                      >
                        {decisionLoading ? "Processing..." : pending ? `Confirm ${CONFIRM_LABEL[pending]}` : "Select a decision above"}
                      </button>
                    </div> */}
                  </div>

                  {/* Key Metrics Card */}
                  
                </aside>
              </div>
            </div>
          </div>

          {/* Decision Confirmation Modal */}
          {pending && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => !decisionLoading && setPending(null)}
            >
              <div
                className="bg-white rounded-2xl p-7 max-w-md w-[90%] shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-slate-900 mb-1">Confirm Decision</h2>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  You are about to <strong className="text-slate-900">{CONFIRM_LABEL[pending]}</strong> the following application:
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5">
                  <div className="text-[11px] font-mono text-slate-500 mb-0.5">{appId}</div>
                  <div className="text-base font-bold text-slate-900">{debtorName}</div>
                  {note && <div className="text-[11px] font-mono text-slate-500 mt-2">Note: {note}</div>}
                </div>
                <div className="flex gap-2.5">
                  <button
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40"
                    onClick={confirm}
                    disabled={decisionLoading}
                  >
                    {decisionLoading ? "Processing..." : "Confirm"}
                  </button>
                  <button
                    className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                    onClick={() => setPending(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== PRINT LAYOUT ===== */}
          {printing && (
            <div className="fixed inset-0 bg-white z-[9999] overflow-auto p-8">
              <div className="mx-auto max-w-4xl space-y-8">
                {/* Executive Summary */}
                <div>
                  <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1 flex items-center gap-1.5">EXECUTIVE SUMMARY (AI) <Sparkles className="w-3 h-3 text-amber-500" /></div>
                  <div className={`text-2xl font-black mt-1 ${
                    isRejected ? "text-red-600" : isCommittee ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {isApproved ? "APPROVED" : isRejected ? "REJECT" : isCommittee ? "COMMITTEE REVIEW" : crde?.decision ?? "N/A"}
                  </div>
                  <div className="mt-3 text-sm text-slate-700 leading-relaxed">
                    {memo.executive_summary ? (
                      memo.executive_summary.split("**").map((seg, i) =>
                        i % 2 === 1 ? <strong key={i} className="text-slate-900">{seg}</strong> : seg
                      )
                    ) : "—"}
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* AI Decision Card */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden">
                  <div className={`p-6 ${
                    isCommittee ? "bg-[#FFFBEB]" : isRejected ? "bg-[#FEF2F2]" : "bg-[#F0FDF4]"
                  }`}>
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isCommittee ? "bg-amber-100" : isRejected ? "bg-red-100" : "bg-emerald-100"
                      }`}>
                        {isCommittee ? <AlertTriangle className="w-6 h-6 text-amber-600" /> :
                         isRejected ? <XCircle className="w-6 h-6 text-red-600" /> :
                         <CheckCircle className="w-6 h-6 text-emerald-600" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">CRDE Recommendation</div>
                        <div className={`text-2xl font-black ${
                          isCommittee ? "text-amber-600" : isRejected ? "text-red-600" : "text-emerald-600"
                        }`}>{crde?.decision ?? "N/A"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Summary Metrics</div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                      {[
                        { label: "Credit Score", value: crde?.numericScore ? `${crde.numericScore}/1000` : "—" },
                        { label: "Risk Level", value: crde?.riskScore ?? "—" },
                        { label: "Rules Triggered", value: `${crde?.rulesTriggered?.length ?? 0}` },
                        { label: "DTI Ratio", value: `${(dtiActual * 100).toFixed(1)}%` },
                        { label: "SLIK Collectability", value: `Kol. ${slikKol}` },
                        { label: "AML Screening", value: amlClear ? "CLEAR" : "FLAGGED" },
                      ].map((m) => (
                        <div key={m.label} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-xs text-slate-500">{m.label}</span>
                          <span className="text-sm font-bold text-slate-800">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
