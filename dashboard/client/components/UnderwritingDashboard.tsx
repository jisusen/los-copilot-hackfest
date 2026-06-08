import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Printer,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  X,
  AlertTriangle,
  Shield,
  FileText,
  User,
  Wallet,
  Banknote,
  Scale,
  ShieldCheck,
  Home,
  Pen,
  ThumbsUp,
  Users,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import type { MemoDraft, AgentResult } from "../lib/types";
import { formatRp } from "../lib/format";
import { apiFetch } from "../lib/api";

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**"))
      return <strong key={i} className="font-semibold text-slate-900">{seg.slice(2, -2)}</strong>;
    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
}

function Field({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: "red" | "amber" | "green" }) {
  const colorMap = { red: "text-red-600", amber: "text-amber-600", green: "text-emerald-600" };
  return (
    <div>
      <div className="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">{label}</div>
      <div className={`text-[13px] font-bold text-slate-800 mt-0.5 ${highlight ? colorMap[highlight] : ""}`}>{value}</div>
    </div>
  );
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-slate-900">
        <span className="text-slate-300 font-mono mr-1.5">{num}</span>
        {title}
      </h3>
      <button
        onClick={() => { navigator.clipboard.writeText(document.querySelector(`[data-section="${num}"]`)?.textContent || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

function AccordionSection({ num, title, icon: Icon, children, defaultOpen }: {
  num: string; title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="border-t border-slate-100 py-2">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-mono text-xs font-bold">{num}</span>
          <Icon size={13} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-900">{title}</span>
        </div>
        {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
      </button>
      {open && <div className="mt-2 pl-7">{children}</div>}
    </div>
  );
}

type Decision = "approve" | "refer" | "reject";

const CONFIRM_LABEL: Record<Decision, string> = {
  approve: "APPROVING",
  refer: "REFERRING TO COMMITTEE",
  reject: "REJECTING",
};

export function UnderwritingDashboard({
  appId,
  debtorName,
  memo,
  result,
  onMemoChange,
  onPrint,
  onDownload,
  profil,
  permohonan,
  keuangan,
  slik,
  aml,
}: {
  appId: string;
  debtorName: string;
  memo: MemoDraft;
  result?: AgentResult;
  onMemoChange: (updated: MemoDraft) => void;
  onPrint?: () => void;
  onDownload?: () => void;
  profil: Record<string, string>;
  permohonan: Record<string, string | number>;
  keuangan: Record<string, string | number>;
  slik: Record<string, string | number>;
  aml: Record<string, boolean | string>;
}) {
  const navigate = useNavigate();
  if (!result) return null;

  const r = result;
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  // Computed values
  const dtiPct = (r.dtiActual * 100).toFixed(1);
  const dtiExceeds = r.dtiActual > 0.4;
  const totalOblig = Number(keuangan?.totalKewajiban ?? keuangan?.total_obligations ?? 0);
  const netIncome = Number(keuangan?.penghasilanBersih ?? keuangan?.net_income ?? 0);
  const disposable = netIncome - totalOblig;
  const slikKol = Number(slik?.kolektibilitas ?? slik?.collectibility ?? 1);
  const slikLabel = (slik?.label ?? slik?.kolektibilitas_label ?? "Current") as string;
  const hasCollateral = permohonan?.produk !== "KTA";

  // Decision state
  const [pending, setPending] = useState<Decision | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirmDecision() {
    if (!pending || loading) return;
    setLoading(true);
    try {
      await apiFetch(`/api/decisions/${appId}`, {
        method: "POST",
        body: JSON.stringify({ decision: pending, note, analystId: "analyst01" }),
      });
      navigate("/");
    } catch {
      setLoading(false);
    }
  }

  // Rules breakdown for executive summary
  const keyReasons = r.rulesTriggered.length > 0
    ? r.rulesTriggered
    : ["No rules triggered"];

  return (
    <div data-dashboard-root className="bg-[#F8FAFC] p-5">
      <div className="grid grid-cols-12 gap-5 items-start max-w-[1600px] mx-auto">
        {/* ── Header (full width) ── */}
        <div className="col-span-12 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{debtorName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-slate-400 font-mono">Application {appId}</span>
              <span className="text-[11px] text-slate-400 font-mono">Created {today}</span>
              <span className="bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded text-[11px]">Draft AI — Awaiting Analyst Decision</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onDownload} className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-lg transition-colors" title="Download">
              <Download size={16} />
            </button>
            <button onClick={onPrint} className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-lg transition-colors" title="Print">
              <Printer size={16} />
            </button>
            <button className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-lg transition-colors" title="More">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* ── Center Document Container (Open Book) ── */}
        <div className="col-span-9 bg-white border border-slate-200 rounded-xl shadow-lg">
          <div className="grid grid-cols-2 divide-x divide-slate-200 p-6">
            {/* ═══════════ LEFT PAGE ═══════════ */}
            <div className="pr-6 space-y-6">

              {/* Executive Summary (AI Box) */}
              <div className="bg-[#FFF5F5] border border-red-100 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Executive Summary (AI)</div>
                    <div className="text-lg font-black text-red-600 mt-0.5">REJECT</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">{r.numericScore}/1000</div>
                    <span className="inline-block bg-[#DC2626] text-white font-bold text-[10px] px-2 py-0.5 rounded mt-0.5">HIGH RISK</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5">Key Reasons</div>
                  <div className="space-y-1.5">
                    {keyReasons.map((reason, i) => (
                      <div key={i} className="flex gap-2 text-[12px] leading-relaxed">
                        <span className="shrink-0 mt-0.5 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">!</span>
                        </span>
                        <span className="text-slate-700">{renderInline(reason)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 01 Debtor Profile */}
              <div data-section="01">
                <SectionHeader num="01" title="Debtor Profile" />
                <div className="grid grid-cols-2 gap-y-3 gap-x-5">
                  <Field label="Full Name" value={profil.nama ?? debtorName} />
                  <Field label="NIK" value={profil.nik ?? "—"} />
                  <Field label="Employment Type" value={profil.jenisPekerjaan ?? "—"} />
                  <Field label="Employer" value={profil.namaPerusahaan ?? "—"} />
                  <Field label="Job Title" value={profil.jabatan ?? "—"} />
                  <Field label="City" value={profil.kota ?? profil.city ?? "—"} />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                  <ShieldCheck size={12} />
                  Identity verified via NIK
                </div>
              </div>

              {/* 02 Loan Application */}
              <div data-section="02">
                <SectionHeader num="02" title="Loan Application" />
                <div className="grid grid-cols-2 gap-y-3 gap-x-5">
                  <Field label="Product" value={String(permohonan.produk ?? "—")} />
                  <Field label="Tenor" value={String(permohonan.tenor ?? "—")} />
                  <Field label="Plafon" value={formatRp(Number(permohonan.plafon ?? 0))} />
                  <Field label="Purpose" value={String(permohonan.tujuan ?? permohonan.purpose ?? "—")} />
                  <Field label="Interest Rate" value={permohonan.bunga ? `${permohonan.bunga}%` : "—"} />
                </div>
              </div>
            </div>

            {/* ═══════════ RIGHT PAGE ═══════════ */}
            <div className="pl-6 space-y-2">

              {/* 03 Financial Analysis & Repayment Capacity */}
              <div>
                <SectionHeader num="03" title="Financial Analysis" />
                <p className="text-[12px] text-slate-600 leading-relaxed mb-3">
                  Net monthly income <strong className="text-slate-800">{formatRp(netIncome)}</strong> is insufficient for the requested obligation burden.
                </p>
                <div className="space-y-0">
                  <Row label="Net Monthly Income" value={formatRp(netIncome)} />
                  <Row label="Existing Obligations" value={formatRp(Number(keuangan?.kewajibanExisting ?? keuangan?.existing_obligations ?? 0))} />
                  <Row label="Requested Installment" value={formatRp(Number(keuangan?.cicilanDimohon ?? keuangan?.requested_installment ?? 0))} />
                  <Row label="Total Obligations" value={formatRp(totalOblig)} bold />
                  <Row label="Disposable Income" value={formatRp(disposable)} bold />
                  <Row
                    label="DTI (Debt to Income)"
                    value={dtiExceeds ? (
                      <span className="flex items-center gap-2">
                        <span className="text-red-600 font-bold">{dtiPct}%</span>
                        <span className="bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded">EXCEEDS LIMIT (40%)</span>
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold">{dtiPct}%</span>
                    )}
                    highlight={dtiExceeds ? "red" : undefined}
                  />
                </div>
              </div>

              {/* 04 SLIK OJK Results */}
              <AccordionSection num="04" title="SLIK OJK Results" icon={FileText}>
                <div className="space-y-1.5">
                  <Row label="Collectability" value={
                    slikKol > 1
                      ? <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">{slikKol} — {slikLabel}</span>
                      : <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">{slikKol} — {slikLabel}</span>
                  } />
                  <Row label="Worst 12m" value={String(slik?.worstKol12m ?? slik?.worst_kol_12m ?? "—")} />
                  <Row label="24m History" value={String(slik?.riwayat24m ?? slik?.payment_history_24m ?? "—")} />
                </div>
              </AccordionSection>

              {/* 05 AML & Fraud Screening */}
              <AccordionSection num="05" title="AML & Fraud Screening" icon={Shield}>
                <div className="space-y-1.5">
                  <Row label="DTTOT Match" value={aml?.dttotMatch ? "Yes" : "No"} highlight={aml?.dttotMatch ? "red" : "green"} />
                  <Row label="UN Sanctions" value={aml?.unSanctionsMatch ? "Yes" : "No"} highlight={aml?.unSanctionsMatch ? "red" : "green"} />
                  <Row label="PEP Status" value={aml?.pepStatus ? "Identified" : "None"} highlight={aml?.pepStatus ? "red" : "green"} />
                  <Row label="Fraud Signals" value={String(aml?.fraudSignals ?? aml?.fraud_signals ?? "None")} />
                  <div className="mt-1.5">
                    {r.amlClear
                      ? <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded"><ShieldCheck size={11} /> AML CLEAR</span>
                      : <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded"><AlertTriangle size={11} /> FLAG DETECTED</span>
                    }
                  </div>
                </div>
              </AccordionSection>

              {/* 06 Collateral */}
              <AccordionSection num="06" title="Collateral" icon={Home} defaultOpen={false}>
                <div className="text-[12px] text-slate-600">
                  {hasCollateral ? "Collateral reviewed and within LTV limits." : "Unsecured product — no collateral required."}
                </div>
              </AccordionSection>

              {/* 07 CRDE Decision */}
              <AccordionSection num="07" title="CRDE Decision" icon={Scale}>
                <div className="space-y-1.5">
                  <Row label="Decision" value={
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.crdeDecision === "REJECTED" ? "bg-red-50 text-red-700" : r.crdeDecision === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {r.crdeDecision}
                    </span>
                  } />
                  <Row label="Score" value={`${r.numericScore}/1000`} />
                  <Row label="Risk Level" value={
                    <span className="bg-[#DC2626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{r.riskScore}</span>
                  } />
                  <Row label="Rules Triggered" value={String(r.rulesTriggered.length)} />
                </div>
              </AccordionSection>

              {/* 08 Analyst Notes & Recommendation */}
              <AccordionSection num="08" title="Analyst Notes" icon={Pen} defaultOpen={true}>
                <textarea
                  value={memo.section8_rekomendasi}
                  onChange={e => onMemoChange({ ...memo, section8_rekomendasi: e.target.value })}
                  placeholder="Add your override notes, mitigating factors, or final reasoning…"
                  className="w-full min-h-[100px] p-2.5 border border-dashed border-amber-300 bg-amber-50/30 rounded-lg text-[12px] text-slate-700 resize-vertical outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </AccordionSection>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar (Sticky) ── */}
        <div className="col-span-3 sticky top-5 space-y-3">
          {/* AI Decision Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-red-600 p-3.5 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <X size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white/70 text-[9px] font-bold uppercase tracking-wider">AI Decision</div>
                <div className="text-white text-base font-black">REJECTED</div>
              </div>
            </div>

            <div className="p-3.5 space-y-2">
              <SidebarMetric label="Score" value={`${r.numericScore}/1000`} />
              <SidebarMetric label="Risk Level" value={<span className="bg-[#DC2626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{r.riskScore}</span>} />
              <SidebarMetric label="Rules Triggered" value={String(r.rulesTriggered.length)} violated={r.rulesTriggered.length > 0} />
              <SidebarMetric
                label="DTI"
                value={`${dtiPct}%`}
                sub={dtiExceeds ? "Exceeds Limit" : "Within Limit"}
                violated={dtiExceeds}
              />
              <SidebarMetric
                label="SLIK Collectability"
                value={`${slikKol} — ${slikLabel}`}
                sub={slikKol > 1 ? "Special Mention" : "Current"}
                violated={slikKol > 1}
              />
              <SidebarMetric label="AML Screening" value={r.amlClear ? "Clear" : "Flag"} violated={!r.amlClear} />

              <hr className="border-slate-100 my-1" />

              <SidebarMetric label="Total Obligations" value={formatRp(totalOblig)} />
              <SidebarMetric label="Disposable Income" value={formatRp(disposable)} violated={disposable < 0} />
            </div>
          </div>

          {/* Note input */}
          <div>
            <input
              data-testid="decision-note-input"
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add decision note…"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {([
              { decision: "approve" as Decision, label: "Approve", icon: ThumbsUp, color: "bg-[#10B981] hover:bg-[#059669]" },
              { decision: "refer" as Decision, label: "Refer to Committee", icon: Users, color: "bg-[#2563EB] hover:bg-[#1D4ED8]" },
              { decision: "reject" as Decision, label: "Reject", icon: ThumbsDown, color: "bg-[#EF4444] hover:bg-[#DC2626]" },
            ]).map(b => (
              <button
                key={b.decision}
                data-testid={`btn-${b.decision}`}
                onClick={() => setPending(pending === b.decision ? null : b.decision)}
                className={`w-full text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-sm ${
                  pending === b.decision ? "ring-2 ring-offset-2 ring-slate-400 " + b.color : b.color
                }`}
              >
                <b.icon size={16} />
                {b.label}
              </button>
            ))}
          </div>

          {/* Confirm modal */}
          {pending && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => !loading && setPending(null)}
            >
              <div
                className="bg-white rounded-2xl p-7 max-w-md w-[90%] shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-lg font-bold text-slate-900 mb-1">Confirm Decision</h2>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  You are about to <strong className="text-slate-900">{CONFIRM_LABEL[pending]}</strong> the following application:
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                  <div className="text-[10px] font-mono text-slate-500 mb-0.5">{appId}</div>
                  <div className="text-sm font-bold text-slate-900">{debtorName}</div>
                  {note && <div className="text-[10px] font-mono text-slate-500 mt-2">Note: {note}</div>}
                </div>
                <div className="flex gap-2.5">
                  <button
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    onClick={confirmDecision}
                    disabled={loading}
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? "Processing…" : "Confirm"}
                  </button>
                  <button
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setPending(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──

function Row({ label, value, bold, highlight }: { label: string; value: React.ReactNode; bold?: boolean; highlight?: "red" | "amber" | "green" }) {
  const highlightColors = { red: "text-red-600", amber: "text-amber-600", green: "text-emerald-600" };
  return (
    <div className={`flex justify-between items-center py-1.5 border-b border-slate-100 text-xs ${bold ? "font-bold" : ""}`}>
      <span className="text-slate-500">{label}</span>
      <span className={`text-slate-800 text-right ${highlight ? highlightColors[highlight] : ""} ${bold ? "font-bold" : ""}`}>{value}</span>
    </div>
  );
}

function SidebarMetric({ label, value, sub, violated }: { label: string; value: React.ReactNode; sub?: string; violated?: boolean }) {
  return (
    <div className={`p-2 rounded-lg ${violated ? "bg-red-50" : ""}`}>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center justify-between">
        <span>{value}</span>
        {sub && <span className="text-[9px] font-medium text-red-500">{sub}</span>}
      </div>
    </div>
  );
}
