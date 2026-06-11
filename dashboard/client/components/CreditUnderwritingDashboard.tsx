import React, { useState } from "react";
import type { MemoDraft, AgentResult } from "../lib/types";
import { useToast } from "./Toast";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  User,
  FileText,
  BarChart3,
  ShieldAlert,
  Ban,
  Building2,
  FileCheck,
  Scale,
    Sparkles,
} from "lucide-react";

function renderInline(text: string): React.ReactNode {
  const boldParts = text.split("**");
  return boldParts.map((seg, bi) => {
    if (bi % 2 === 1) {
      return <strong key={bi} className="text-gray-800 font-semibold">{seg}</strong>;
    }
    const italicParts = seg.split("_");
    if (italicParts.length === 1) return <React.Fragment key={bi}>{seg}</React.Fragment>;
    return (
      <React.Fragment key={bi}>
        {italicParts.map((s, ii) =>
          ii % 2 === 1
            ? <em key={ii} className="text-gray-500 italic">{s}</em>
            : <React.Fragment key={ii}>{s}</React.Fragment>
        )}
      </React.Fragment>
    );
  });
}

function SectionHeader({
  number,
  title,
  onCopy,
  copyLabel,
}: {
  number: string;
  title: string;
  onCopy?: () => void;
  copyLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="flex items-center gap-2.5 text-base font-bold text-gray-900">
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 text-[11px] font-bold text-gray-400">{number}</span>
        {title}
      </span>
      <div className="flex-1" />
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all flex items-center gap-1.5"
        >
          <Copy className="w-3 h-3" />
          {copyLabel || "Copy"}
        </button>
      )}
    </div>
  );
}

function AccordionBlock({
  icon: Icon,
  number,
  title,
  children,
  defaultOpen = false,
  copyContent,
}: {
  icon?: React.ElementType;
  number: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  copyContent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toast = useToast();
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center py-2.5 gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-2.5 text-left group"
        >
          {Icon && (
            <div className="w-7 h-7 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors border border-gray-100">
              <Icon className="w-3.5 h-3.5 text-gray-500" />
            </div>
          )}
          <span className="text-[11px] font-semibold text-gray-300 shrink-0">{number}</span>
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          <div className="flex-1" />
          <div className={`transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </button>
        {copyContent && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(copyContent).then(() => toast?.("Copied", "info")).catch(() => {});
            }}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1.5 rounded-lg transition-all shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

function KeyValueGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
      {items.map((item) => (
        <div key={item.label}>
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">{item.label}</div>
          <div className="text-sm font-semibold text-gray-800 mt-1">{item.value || <span className="text-gray-200">—</span>}</div>
        </div>
      ))}
    </div>
  );
}

function renderText(text: string): React.ReactNode {
  if (!text) return <span className="text-gray-200">—</span>;
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const clean = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : trimmed;
        const hasColon = clean.includes(":") && !clean.startsWith("http");
        const colonIdx = hasColon ? clean.indexOf(":") : -1;
        const label = colonIdx > 0 ? clean.slice(0, colonIdx).trim() : "";
        const value = colonIdx > 0 ? clean.slice(colonIdx + 1).trim() : clean;

        if (isBullet && hasColon) {
          return (
            <div key={i} className="flex gap-2.5 py-0.5">
              <span className="text-gray-300 shrink-0 mt-0.5">•</span>
              <div className="flex-1 flex items-baseline gap-2 text-xs">
                <span className="text-gray-500 font-medium shrink-0">{renderInline(label)}</span>
                <span className="text-gray-800">{renderInline(value)}</span>
              </div>
            </div>
          );
        }
        if (hasColon) {
          return (
            <div key={i} className="flex gap-2.5 py-0.5">
              <div className="flex-1 flex items-baseline gap-2 text-xs">
                <span className="text-gray-500 font-medium shrink-0 min-w-[100px]">{renderInline(label)}</span>
                <span className="text-gray-800">{renderInline(value)}</span>
              </div>
            </div>
          );
        }
        if (isBullet) {
          return (
            <div key={i} className="flex gap-2.5 py-0.5">
              <span className="text-gray-300 shrink-0 mt-0.5">•</span>
              <span className="text-xs leading-relaxed text-gray-600">{renderInline(clean)}</span>
            </div>
          );
        }
        return (
          <div key={i} className="text-xs leading-relaxed text-gray-600 py-0.5">
            {renderInline(clean)}
          </div>
        );
      })}
    </div>
  );
}

interface CreditUnderwritingDashboardProps {
  appId: string;
  memo: MemoDraft;
  result?: AgentResult;
  onMemoChange: (updated: MemoDraft) => void;
  profilDebitur?: Record<string, string>;
  permohonanKredit?: Record<string, string | number>;
  dataKeuangan?: Record<string, string | number>;
  slikOjk?: Record<string, string | number>;
  amlFraud?: Record<string, boolean | string>;
}

const PROFILE_FIELDS: { key: string; label: string; aliases: string[]; mask?: (v: string) => string }[] = [
  { key: "nama", label: "Full Name", aliases: ["full_name", "Nama Lengkap", "fullName", "nama_lengkap"] },
  { key: "nik", label: "NIK", aliases: [], mask: (v) => v.length >= 4 ? `**** **** **** ${v.slice(-4)}` : v },
  { key: "jenisPekerjaan", label: "Jenis Pekerjaan", aliases: ["jenis_pekerjaan", "employment_type", "employmentType", "occupation"] },
  { key: "namaPerusahaan", label: "Nama Perusahaan", aliases: ["nama_perusahaan", "employer_name", "employerName", "company"] },
  { key: "jabatan", label: "Jabatan", aliases: ["job_title", "jobTitle", "position"] },
];

const LOAN_FIELDS: { key: string; label: string; aliases: string[] }[] = [
  { key: "product_type", label: "Product", aliases: ["produk", "Product", "productType", "loan_product"] },
  { key: "amount_requested", label: "Plafon", aliases: ["plafon", "Plafon", "amount", "amountRequested"] },
  { key: "tenor_months", label: "Tenor", aliases: ["tenor", "Tenor", "jangka_waktu"] },
];

function safeVal(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function CreditUnderwritingDashboard({
  appId,
  memo,
  result,
  onMemoChange,
  profilDebitur = {},
  permohonanKredit = {},
  dataKeuangan = {},
  slikOjk = {},
  amlFraud = {},
}: CreditUnderwritingDashboardProps) {
  const toast = useToast();
  const decisionNorm = (d: string | undefined) => {
    if (!d) return "unknown";
    const u = d.toUpperCase();
    if (u === "APPROVED" || u === "APPROVE" || u === "DISETUJUI") return "approved";
    if (u === "REJECTED" || u === "REJECT" || u === "DITOLAK" || u === "CANCEL" || u === "CANCELLED") return "rejected";
    if (u.includes("REVIEW") || u.includes("REFER") || u === "COMMITTEE REVIEW") return "committee";
    return "unknown";
  };
  const decisionType = decisionNorm(result?.crdeDecision);
  const execBg = decisionType === "approved" ? "bg-emerald-50/60 border-b border-emerald-100"
    : decisionType === "rejected" ? "bg-red-50/60 border-b border-red-100"
    : decisionType === "committee" ? "bg-amber-50/60 border-b border-amber-100"
    : "bg-gray-50/60 border-b border-gray-100";
  const execDecisionText = decisionType === "approved" ? "APPROVED"
    : decisionType === "rejected" ? "REJECT"
    : decisionType === "committee" ? "COMMITTEE REVIEW"
    : result?.crdeDecision ?? "N/A";
  const execDecisionColor = decisionType === "approved" ? "text-emerald-600"
    : decisionType === "rejected" ? "text-red-600"
    : decisionType === "committee" ? "text-amber-600"
    : "text-gray-900";
  const riskBadgeColor = result?.riskScore === "HIGH" ? "bg-red-500"
    : result?.riskScore === "MEDIUM" ? "bg-amber-500"
    : "bg-emerald-500";

  const profileItems = PROFILE_FIELDS.map((f) => {
    const allKeys = [f.key, ...f.aliases, f.key.replace(/_/g, "")];
    let val = "";
    for (const k of allKeys) {
      const raw = profilDebitur[k];
      if (raw !== null && raw !== undefined && raw !== "") { val = safeVal(raw); break; }
    }
    if (f.mask && val) val = f.mask(val);
    return { label: f.label, value: val || "—" };
  });

  const purposeFromMemo = (() => {
    const m = memo.section2_permohonan.match(/Purpose:\s*\*\*([^*]+)\*\*/);
    return m ? m[1].trim() : "";
  })();

  const loanItems = LOAN_FIELDS.map((f) => {
    const allKeys = [f.key, ...f.aliases, f.key.replace(/_/g, "")];
    let v = "";
    for (const k of allKeys) {
      const raw = permohonanKredit[k];
      if (raw !== null && raw !== undefined && raw !== "") { v = safeVal(raw); break; }
    }
    if (f.key === "amount_requested" && v) {
      const n = typeof permohonanKredit[f.key] === "number" ? Number(permohonanKredit[f.key]) : parseFloat(v.replace(/[^0-9]/g, ""));
      if (!isNaN(n)) v = `Rp ${n.toLocaleString("id-ID")}`;
    }
    if (f.key === "tenor_months" && v) {
      const n = parseInt(v);
      if (!isNaN(n)) v = `${n} months`;
    }
    return { label: f.label, value: v || "—" };
  });
  if (purposeFromMemo) {
    loanItems.push({ label: "Purpose", value: purposeFromMemo });
  }
  const installmentFromMemo = (() => {
    const m = memo.section2_permohonan.match(/installment:\s*\*\*([^*]+)\*\*/);
    return m ? m[1].trim() : "";
  })();
  if (installmentFromMemo) {
    loanItems.push({ label: "Installment", value: installmentFromMemo });
  }

  const financialRows: { label: string; value: string; flagged: boolean; flagReason?: string }[] = [];
  const finMap: { key: string; label: string; fmt?: "curr" | "pct" | "num" }[] = [
    { key: "gross_income", label: "Gross Monthly Income", fmt: "curr" },
    { key: "net_income", label: "Net Monthly Income", fmt: "curr" },
    { key: "existing_obligations", label: "Existing Obligations", fmt: "curr" },
    { key: "requested_installment", label: "Requested Installment", fmt: "curr" },
    { key: "total_obligations", label: "Total Obligations", fmt: "curr" },
    { key: "dti_ratio", label: "DTI Ratio", fmt: "pct" },
    { key: "dti_threshold", label: "DTI Threshold", fmt: "pct" },
    { key: "remaining_income", label: "Remaining Income", fmt: "curr" },
  ];
  const finAliases: Record<string, string[]> = {
    gross_income: ["grossIncome", "gross_income", "pendapatan_kotor", "penghasilan_kotor"],
    net_income: ["netIncome", "net_income", "pendapatan_bersih", "penghasilan_bersih"],
    existing_obligations: ["existingObligations", "existing_obligations", "kewajiban_eksisting"],
    requested_installment: ["requestedInstallment", "requested_installment", "angsuran_diminta"],
    total_obligations: ["totalObligations", "total_obligations", "total_kewajiban"],
    dti_ratio: ["dtiRatio", "dti_ratio", "dsr", "DSR", "dti"],
    dti_threshold: ["dtiThreshold", "dti_threshold", "dti_maksimal"],
    remaining_income: ["remainingIncome", "remaining_income", "sisa_penghasilan"],
  };
  for (const f of finMap) {
    const aliases = finAliases[f.key] ?? [];
    let raw: unknown = dataKeuangan[f.key] ?? dataKeuangan[f.key.replace(/_/g, "")];
    if (raw === null || raw === undefined || raw === "") {
      for (const a of aliases) {
        const av = dataKeuangan[a];
        if (av !== null && av !== undefined && av !== "") { raw = av; break; }
      }
    }
    if (raw === null || raw === undefined || raw === "") continue;
    let v = "";
    let numVal = 0;
    if (typeof raw === "number") {
      numVal = raw;
      if (f.fmt === "curr") v = `Rp ${raw.toLocaleString("id-ID")}`;
      else if (f.fmt === "pct") v = `${(raw > 1 ? raw : raw * 100).toFixed(1)}%`;
      else v = String(raw);
    } else if (typeof raw === "string") {
      const cleaned = raw.replace(/[^0-9,.-]/g, "").replace(",", ".");
      numVal = parseFloat(cleaned) || 0;
      if (f.fmt === "pct") {
        v = raw.includes("%") ? raw : `${raw}%`;
      } else if (f.fmt === "curr") {
        const n = parseFloat(cleaned.replace(/[^0-9.-]/g, ""));
        v = isNaN(n) ? raw : `Rp ${n.toLocaleString("id-ID")}`;
      } else {
        v = raw;
      }
    }
    let flagged = false;
    let flagReason: string | undefined;
    if (f.key === "dti_ratio") {
      const threshold = result?.dtiActual ?? (typeof raw === "number" ? raw : numVal);
      if (threshold > 0.4) { flagged = true; flagReason = "Exceeds RAC 40%"; }
    }
    financialRows.push({ label: f.label, value: v, flagged, flagReason });
  }

  const slikKol = (() => {
    const v = slikOjk?.kolektibilitas ?? slikOjk?.collectibility ?? slikOjk?.kol ?? 0;
    return Number(v);
  })();
  const slikLabel = slikKol <= 1 ? "CLEAR" : slikKol <= 2 ? "Special Mention" : slikKol <= 3 ? "Substandard" : "Doubtful/Loss";
  const slikBadgeClass = slikKol <= 1 ? "bg-emerald-50 text-emerald-600" : slikKol <= 2 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600";

  const amlFlagged = !!(amlFraud?.pepStatus || amlFraud?.pep_status || amlFraud?.dttotMatch || amlFraud?.dttot_match || amlFraud?.fraudSignals || amlFraud?.fraud_signals);
  const amlBadgeClass = amlFlagged ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600";

  function copyText(text: string) {
    navigator.clipboard.writeText(text).then(() => toast?.("Copied", "info")).catch(() => {});
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)' }}>
      {/* Executive Summary */}
      <div className={`px-6 py-5 ${execBg}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-white/80 px-2.5 py-1 rounded-lg">EXECUTIVE SUMMARY (AI) <Sparkles className="w-3 h-3 text-amber-500" /></div>
            <div className={`text-2xl font-black mt-2 ${execDecisionColor}`}>
              {execDecisionText}
            </div>
            <div className="mt-3 text-xs text-gray-600 leading-relaxed">
              {memo.executive_summary ? renderInline(memo.executive_summary) : null}
            </div>
          </div>
          <div className="text-right">
            {result && (
              <div className={`inline-flex items-center gap-1.5 ${riskBadgeColor} text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm`}>
                <AlertTriangle className="w-3 h-3" />
                {result.riskScore === "HIGH" ? "HIGH RISK" : result.riskScore === "LOW" ? "LOW RISK" : "MEDIUM RISK"}
              </div>
            )}
            {result && (
              <div className="mt-2.5 font-mono text-xs text-gray-400">
                Score: <span className="font-bold text-gray-700">{result.numericScore}</span>/1000
              </div>
            )}
            {result && result.rulesTriggered.length > 0 && (
              <div className="mt-4 text-left bg-white/60 rounded-xl p-3">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Reasons</div>
                <ul className="space-y-1.5">
                  {result.rulesTriggered.map((r, i) => (
                    <li key={i} className="flex gap-2 text-[11px] text-gray-600 leading-tight">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${decisionType === "approved" ? "bg-emerald-400" : decisionType === "committee" ? "bg-amber-400" : "bg-red-400"}`} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2 Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* ===== LEFT ===== */}
        <div className="p-5 lg:p-7">
          {/* 01 Debtor Profile */}
          <div className="pb-6 mb-6" style={{ borderBottom: '1px solid #f1f3f5' }}>
            <SectionHeader
              number="01"
              title="Debtor Profile"
              onCopy={() => copyText(memo.section1_profil)}
            />
            <KeyValueGrid items={profileItems} />
            {memo.section1_profil && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid #f1f3f5' }}>
                <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-2">Analyst Note</div>
                <div className="text-xs text-gray-600 leading-relaxed">{renderInline(memo.section1_profil)}</div>
              </div>
            )}
          </div>

          {/* 02 Loan Application */}
          <div className="pb-6 mb-6" style={{ borderBottom: '1px solid #f1f3f5' }}>
            <SectionHeader
              number="02"
              title="Loan Application"
              onCopy={() => copyText(memo.section2_permohonan)}
            />
            <KeyValueGrid items={loanItems} />
          </div>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="p-5 lg:p-7">
          {/* 03 Financial Analysis */}
          <SectionHeader number="03" title="Financial Analysis & Repayment Capacity" />
          <div className="space-y-0 mb-5">
            {financialRows.length > 0 ? financialRows.map((row) => (
              <div
                key={row.label}
                className={`flex justify-between items-center py-2.5 text-sm ${row.flagged ? "bg-red-50/70 -mx-3 px-3 rounded-lg" : ""}`}
                style={{ borderBottom: '1px solid #f1f3f5' }}
              >
                <span className="text-gray-500 text-xs">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-xs ${row.flagged ? "text-red-600" : "text-gray-800"}`}>{row.value}</span>
                  {row.flagged && (
                    <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md text-[10px] font-bold">{row.flagReason}</span>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-xs text-gray-400 py-3">Financial data not available</div>
            )}
          </div>
          <div className="text-xs text-gray-600 leading-relaxed mb-6">{renderInline(memo.section3_keuangan)}</div>

          {/* 04 SLIK OJK */}
          <AccordionBlock icon={ShieldAlert} number="04" title="SLIK OJK Results" copyContent={memo.section4_slik}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${slikBadgeClass}`}>{slikLabel}</span>
              {slikKol > 0 && <span className="text-xs text-gray-400">Kol. {slikKol}</span>}
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">{renderText(memo.section4_slik)}</div>
          </AccordionBlock>

          {/* 05 AML & Fraud */}
          <AccordionBlock icon={Ban} number="05" title="AML & Fraud Screening" copyContent={memo.section5_aml}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${amlBadgeClass}`}>
                {amlFlagged ? "FLAGGED" : "CLEAR"}
              </span>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">{renderText(memo.section5_aml)}</div>
          </AccordionBlock>

          {/* 06 Collateral */}
          <AccordionBlock icon={Building2} number="06" title="Collateral" copyContent={memo.section6_agunan}>
            <div className="text-xs text-gray-600 leading-relaxed">{renderText(memo.section6_agunan)}</div>
          </AccordionBlock>

          {/* 07 CRDE Decision */}
          <AccordionBlock icon={FileCheck} number="07" title="CRDE Decision" copyContent={memo.section7_crde}>
            {result && (
              <div className="mb-3 p-3 rounded-xl" style={{
                background: result ? `color-mix(in srgb, ${result.crdeDecision === "REJECT" || result.crdeDecision === "REJECTED" ? "#DC2626" : result.crdeDecision === "APPROVED" || result.crdeDecision === "APPROVE" ? "#10B981" : "#F59E0B"} 8%, white)` : "#f8fafc",
                border: `1px solid ${result ? (result.crdeDecision === "REJECT" || result.crdeDecision === "REJECTED" ? "#FCA5A5" : result.crdeDecision === "APPROVED" || result.crdeDecision === "APPROVE" ? "#6EE7B7" : "#FDE68A") : "#e2e8f0"}`,
              }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{
                    color: result.crdeDecision === "REJECT" || result.crdeDecision === "REJECTED" ? "#DC2626" : result.crdeDecision === "APPROVED" || result.crdeDecision === "APPROVE" ? "#059669" : "#D97706"
                  }}>{result.crdeDecision}</span>
                  <span className="text-[10px] text-gray-400 font-mono">Score {result.numericScore}/1000</span>
                </div>
                <div className="text-[10px] text-gray-400">Risk: {result.riskScore} &middot; {result.rulesTriggered.length} rules triggered</div>
              </div>
            )}
            <div className="text-xs text-gray-600 leading-relaxed">{renderText(memo.section7_crde)}</div>
          </AccordionBlock>

          {/* 08 Notes & Analyst Recommendations */}
          <AccordionBlock icon={Scale} number="08" title="Notes & Analyst Recommendations" defaultOpen={true} copyContent={memo.section8_rekomendasi}>
            <textarea
              data-testid="memo-section-8-textarea"
              value={memo.section8_rekomendasi}
              onChange={e => onMemoChange({ ...memo, section8_rekomendasi: e.target.value })}
              placeholder="Add your override notes, mitigating factors, or final reasoning..."
              className="w-full min-h-[160px] p-3.5 border border-dashed border-amber-200 bg-amber-50/40 rounded-xl font-mono text-xs text-gray-800 resize-vertical outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </AccordionBlock>
        </div>
      </div>
    </div>
  );
}
