import React from 'react';
import { formatRp, formatDate, formatPercent } from '../lib/api';

type LoanDetail = {
  application: {
    id: string; status: string; product_type: string; amount_requested: number;
    tenor_months: number; interest_rate: number; loan_purpose: string;
    branch: string; marketing_officer: string; created_at: string;
    analyst_id?: string; assigned_at?: string;
  };
  debtor: any;
  financials: any;
  slik: any;
  amlFraud: any;
  crde: any;
  collateral: any;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>
      <span style={{ width: 200, fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#1f2937' }}>{value ?? '—'}</span>
    </div>
  );
}

export function PrintMemoView({ loan, onClose }: { loan: LoanDetail; onClose: () => void }) {
  const { application, debtor, financials, slik, amlFraud, crde, collateral } = loan;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, overflow: 'auto' }}>
      <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
          <span className="font-display text-sm font-bold text-text">Print Preview — Credit Analysis Memo</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => window.print()}
              className="btn-print-memo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#8B1A1A',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                height: 32,
                padding: '0 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Open Sans, system-ui, sans-serif',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
            <button
              onClick={onClose}
              className="btn-close-memo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                color: '#475569',
                border: '1.5px solid #CBD5E1',
                borderRadius: 6,
                height: 32,
                padding: '0 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Open Sans, system-ui, sans-serif',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Close
            </button>
          </div>
        </div>

        {/* Print content */}
        <div id="print-memo-content" style={{ padding: 40 }}>
          {/* Bank Header */}
          <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #8B1A1A', paddingBottom: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#8B1A1A' }}>Bank Maju Bersama</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Consumer Credit Information System</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8B1A1A', marginTop: 12 }}>CREDIT ANALYSIS MEMO</div>
          </div>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, fontSize: 12 }}>
            <div><strong>Application No:</strong> {application.id}</div>
            <div><strong>Date:</strong> {formatDate(new Date().toISOString())}</div>
            <div><strong>Debtor:</strong> {debtor?.full_name}</div>
            <div><strong>Product:</strong> {application.product_type}</div>
            <div><strong>Amount:</strong> {formatRp(application.amount_requested)}</div>
            <div><strong>Tenor:</strong> {application.tenor_months} months</div>
            <div><strong>Analyst:</strong> {application.analyst_id ?? '—'}</div>
            <div><strong>Status:</strong> {application.status}</div>
          </div>

          {/* CRDE Banner */}
          {crde && (
            <div style={{
              border: `2px solid ${crde.decision === 'APPROVED' ? '#1a7f4b' : crde.decision === 'REJECTED' ? '#b91c1c' : '#c47d0e'}`,
              background: crde.decision === 'APPROVED' ? '#f0fdf4' : crde.decision === 'REJECTED' ? '#fef2f2' : '#fffbeb',
              padding: 16,
              marginBottom: 24,
              borderRadius: 4,
            }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: crde.decision === 'APPROVED' ? '#1a7f4b' : crde.decision === 'REJECTED' ? '#b91c1c' : '#c47d0e' }}>
                CRDE Recommendation: {crde.decision}
              </div>
              <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>
                Risk Score: {crde.risk_score} · Numeric Score: {crde.numeric_score}/1000
              </div>
            </div>
          )}

          {/* Sections */}
          <Section title="1. Debtor Profile">
            <Field label="Full Name" value={debtor?.full_name} />
            <Field label="NIK" value={(() => { const n = debtor?.nik ?? ""; return n.length >= 4 ? "**** **** **** " + n.slice(-4) : n || "—"; })()} />
            <Field label="NPWP" value={debtor?.npwp} />
            <Field label="Date of Birth" value={debtor?.date_of_birth ? formatDate(debtor.date_of_birth) : '—'} />
            <Field label="Marital Status" value={debtor?.marital_status} />
            <Field label="Dependents" value={debtor?.dependents} />
            <Field label="Employment Type" value={debtor?.employment_type} />
            <Field label="Employer" value={debtor?.employer_name} />
            <Field label="Job Title" value={debtor?.job_title} />
            <Field label="Years Employed" value={debtor?.years_employed} />
            <Field label="City" value={debtor?.domicile_city} />
            <Field label="Address" value={debtor?.domicile_address} />
            <Field label="Phone" value={debtor?.phone} />
            <Field label="Email" value={debtor?.email} />
          </Section>

          <Section title="2. Loan Application">
            <Field label="Product Type" value={application.product_type} />
            <Field label="Amount Requested" value={formatRp(application.amount_requested)} />
            <Field label="Tenor" value={`${application.tenor_months} months`} />
            <Field label="Interest Rate" value={`${application.interest_rate}% p.a.`} />
            <Field label="Monthly Installment" value={financials?.requested_installment ? formatRp(financials.requested_installment) : '—'} />
            <Field label="Purpose" value={application.loan_purpose} />
            <Field label="Branch" value={application.branch} />
            <Field label="Marketing Officer" value={application.marketing_officer} />
          </Section>

          <Section title="3. Financial Analysis">
            <Field label="Gross Income / Month" value={financials?.gross_income ? formatRp(financials.gross_income) : '—'} />
            <Field label="Net Income / Month" value={financials?.net_income ? formatRp(financials.net_income) : '—'} />
            <Field label="Existing Obligations" value={financials?.existing_obligations ? formatRp(financials.existing_obligations) : '—'} />
            <Field label="Requested Installment" value={financials?.requested_installment ? formatRp(financials.requested_installment) : '—'} />
            <Field label="Total Obligations" value={financials?.total_obligations ? formatRp(financials.total_obligations) : '—'} />
            <Field label="DBR Ratio" value={financials?.dti_ratio ? formatPercent(financials.dti_ratio) : '—'} />
            <Field label="DBR Threshold" value={financials?.dti_threshold ? `${Math.round(financials.dti_threshold * 100)}%` : '—'} />
            <Field label="Remaining Income" value={financials?.remaining_income ? formatRp(financials.remaining_income) : '—'} />
          </Section>

          <Section title="4. SLIK OJK Result">
            <Field label="Check Date" value={slik?.check_date ? formatDate(slik.check_date) : '—'} />
            <Field label="Collectability" value={`${slik?.kolektibilitas} — ${slik?.kolektibilitas_label}`} />
            <Field label="Worst Kol (12m)" value={slik?.worst_kol_12m} />
            <Field label="Payment History (24m)" value={slik?.payment_history_24m} />
            <Field label="Existing Bank" value={slik?.existing_bank} />
            <Field label="Existing Facility" value={slik?.existing_facility} />
            <Field label="Blacklist Status" value={slik?.blacklist_status ? '⚠️ LISTED' : '✅ Not Listed'} />
            <Field label="Notes" value={slik?.notes} />
          </Section>

          <Section title="5. AML & Fraud Screening">
            <Field label="DTTOT Status" value={amlFraud?.dttot_match ? '⚠️ LISTED' : '✅ Not Listed'} />
            <Field label="UN Sanctions" value={amlFraud?.un_sanctions_match ? '⚠️ LISTED' : '✅ Not Listed'} />
            <Field label="PEP Status" value={amlFraud?.pep_status ? '⚠️ IDENTIFIED AS PEP' : '✅ Not a PEP'} />
            <Field label="PEP EDD Required" value={amlFraud?.pep_edd_required ? '⚠️ Enhanced Due Diligence Required' : '✅ Not Required'} />
            <Field label="Income Consistency" value={amlFraud?.income_consistent ? '✅ Consistent' : '⚠️ Inconsistent'} />
            <Field label="Address Flag" value={amlFraud?.address_flag ? '⚠️ Flagged' : '✅ No Flag'} />
            <Field label="Fraud Signals" value={amlFraud?.fraud_signals || '✅ None'} />
            <Field label="Notes" value={amlFraud?.notes} />
          </Section>

          {collateral?.required ? (
            <Section title="6. Collateral">
              <Field label="Asset Type" value={collateral?.collateral_type} />
              <Field label="Description" value={collateral?.asset_description} />
              <Field label="Market Value" value={collateral?.market_value ? formatRp(collateral.market_value) : '—'} />
              <Field label="Liquidation Value" value={collateral?.liquidation_value ? formatRp(collateral.liquidation_value) : '—'} />
              <Field label="LTV Ratio" value={collateral?.ltv_ratio ? formatPercent(collateral.ltv_ratio) : '—'} />
              <Field label="Certificate No." value={collateral?.certificate_number} />
              <Field label="Legal Status" value={collateral?.legal_status} />
            </Section>
          ) : (
            <Section title="6. Collateral">
              <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>Unsecured product — no collateral required.</div>
            </Section>
          )}

          <Section title="7. CRDE Decision">
            <Field label="Risk Score" value={crde?.risk_score} />
            <Field label="Decision" value={crde?.decision} />
            <Field label="Numeric Score" value={`${crde?.numeric_score}/1000`} />
            <Field label="DBR Actual" value={crde?.dti_actual ? formatPercent(crde.dti_actual) : '—'} />
            <Field label="DBR Passed" value={crde?.dti_passed ? '✅ Yes' : '❌ No'} />
            <Field label="Kol Passed" value={crde?.kol_passed ? '✅ Yes' : '❌ No'} />
            <Field label="AML Passed" value={crde?.aml_passed ? '✅ Yes' : '❌ No'} />
            <Field label="Fraud Passed" value={crde?.fraud_passed ? '✅ Yes' : '❌ No'} />
            <Field label="Rules Triggered" value={crde?.rules_triggered?.length ? crde.rules_triggered.join(', ') : 'None'} />
            <Field label="Notes" value={crde?.notes} />
          </Section>

          {/* Footer */}
          <div style={{ marginTop: 40, borderTop: '1px solid #d1d9e0', paddingTop: 16, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
            Bank Maju Bersama — Consumer Credit Information System v2.5.1<br />
            This document is generated electronically and is valid without signature.
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        .btn-print-memo:hover {
          background: #6B1212 !important;
          box-shadow: 0 2px 8px rgba(139,26,26,0.3) !important;
        }
        .btn-close-memo:hover {
          background: #F8FAFC !important;
          border-color: #94A3B8 !important;
        }
        @media print {
          body * { visibility: hidden; }
          #print-memo-content, #print-memo-content * { visibility: visible; }
          #print-memo-content { position: absolute; left: 0; top: 0; width: 100%; padding: 20px !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 'bold', color: '#8B1A1A', borderBottom: '2px solid #8B1A1A', paddingBottom: 4, marginBottom: 8, textTransform: 'uppercase' }}>
        {title}
      </div>
      {children}
    </div>
  );
}
