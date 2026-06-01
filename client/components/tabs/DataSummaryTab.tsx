import React from 'react';
import { formatRp, formatPercent, formatDate, formatDateTime } from '../../lib/api';

type Props = {
  application: any;
  debtor: any;
  financials: any;
  slik: any;
  aml: any;
  crde: any;
  collateral: any;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3
        data-testid={`summary-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="font-semibold text-base mb-3"
        style={{ color: '#0f172a', letterSpacing: '-0.01em' }}
      >
        {title}
      </h3>
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, testId, value }: { label: string; testId: string; value: React.ReactNode }) {
  return (
    <div
      data-testid={`summary-row-${testId}`}
      className="flex items-center py-3 px-4"
      style={{ borderBottom: '1px solid #f1f5f9' }}
    >
      <span className="w-56 flex-shrink-0 text-sm font-medium" style={{ color: '#475569' }}>
        {label}
      </span>
      <span
        data-testid={`summary-value-${testId}`}
        className="text-sm font-semibold"
        style={{ color: '#0f172a' }}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

export function DataSummaryTab({ application, debtor, financials, slik, aml, crde, collateral }: Props) {
  const rules: string[] = Array.isArray(crde?.rules_triggered) ? crde.rules_triggered : [];

  return (
    <div data-testid="tab-content-data-summary" className="pb-8">
      {/* Header */}
      <div className="mb-6 p-4 border rounded-lg" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
        <div data-testid="summary-header-id" className="font-mono text-sm font-bold" style={{ color: '#1e40af' }}>
          {application.id}
        </div>
        <div data-testid="summary-header-name" className="text-lg font-bold mt-1" style={{ color: '#0f172a' }}>
          {debtor?.full_name ?? '—'}
        </div>
        <div data-testid="summary-header-meta" className="text-sm mt-1" style={{ color: '#475569' }}>
          {application.product_type} · {formatRp(application.amount_requested)} · {application.tenor_months} months · {application.interest_rate}%
        </div>
      </div>

      {/* Loan Application */}
      <Section title="Loan Application">
        <Row label="Product Type" testId="app-product" value={application.product_type} />
        <Row label="Amount Requested" testId="app-amount" value={<span className="font-mono">{formatRp(application.amount_requested)}</span>} />
        <Row label="Tenor" testId="app-tenor" value={`${application.tenor_months} months`} />
        <Row label="Interest Rate" testId="app-rate" value={`${application.interest_rate}%`} />
        <Row label="Purpose" testId="app-purpose" value={application.loan_purpose} />
        <Row label="Branch" testId="app-branch" value={application.branch} />
        <Row label="Marketing Officer" testId="app-mo" value={application.marketing_officer} />
        <Row label="Status" testId="app-status" value={application.status} />
      </Section>

      {/* Debtor Profile */}
      {debtor && (
        <Section title="Debtor Profile">
          <Row label="Full Name" testId="debtor-name" value={debtor.full_name} />
          <Row label="NIK" testId="debtor-nik" value={<span className="font-mono">{debtor.nik}</span>} />
          <Row label="NPWP" testId="debtor-npwp" value={<span className="font-mono">{debtor.npwp}</span>} />
          <Row label="Date of Birth" testId="debtor-dob" value={formatDate(debtor.date_of_birth)} />
          <Row label="Marital Status" testId="debtor-marital" value={debtor.marital_status} />
          <Row label="Dependents" testId="debtor-dependents" value={debtor.dependents} />
          <Row label="Employment Type" testId="debtor-employment" value={debtor.employment_type} />
          <Row label="Employer" testId="debtor-employer" value={debtor.employer_name} />
          <Row label="Job Title" testId="debtor-job" value={debtor.job_title} />
          <Row label="Years Employed" testId="debtor-years" value={debtor.years_employed} />
          <Row label="City" testId="debtor-city" value={debtor.domicile_city} />
          <Row label="Phone" testId="debtor-phone" value={debtor.phone} />
          <Row label="Email" testId="debtor-email" value={debtor.email} />
        </Section>
      )}

      {/* Financials */}
      {financials && (
        <Section title="Financials">
          <Row label="Gross Income / Month" testId="fin-gross" value={<span className="font-mono">{formatRp(financials.gross_income)}</span>} />
          <Row label="Net Income / Month" testId="fin-net" value={<span className="font-mono">{formatRp(financials.net_income)}</span>} />
          <Row label="Existing Obligations" testId="fin-existing" value={<span className="font-mono">{formatRp(financials.existing_obligations)}</span>} />
          <Row label="Requested Installment" testId="fin-installment" value={<span className="font-mono">{formatRp(financials.requested_installment)}</span>} />
          <Row label="Total Obligations" testId="fin-total" value={<span className="font-mono">{formatRp(financials.total_obligations)}</span>} />
          <Row label="Remaining Income" testId="fin-remaining" value={<span className="font-mono">{formatRp(financials.remaining_income)}</span>} />
          <Row label="DBR Ratio" testId="fin-dti" value={<span className="font-mono">{formatPercent(financials.dti_ratio)}</span>} />
          <Row label="DBR Threshold (RAC)" testId="fin-dti-threshold" value={`${Math.round(financials.dti_threshold * 100)}%`} />
          <Row label="Income Verified" testId="fin-verified" value={financials.income_verified ? 'Yes' : 'No'} />
        </Section>
      )}

      {/* SLIK OJK */}
      {slik && (
        <Section title="SLIK OJK">
          <Row label="Check Date" testId="slik-date" value={formatDate(slik.check_date)} />
          <Row label="Current Collectability" testId="slik-kol" value={`${slik.kolektibilitas} — ${slik.kolektibilitas_label}`} />
          <Row label="Worst Collectability (12m)" testId="slik-worst" value={slik.worst_kol_12m} />
          <Row label="Payment History (24m)" testId="slik-history" value={slik.payment_history_24m} />
          <Row label="Existing Bank" testId="slik-bank" value={slik.existing_bank} />
          <Row label="Existing Facility" testId="slik-facility" value={slik.existing_facility} />
          <Row label="Existing Amount" testId="slik-existing-amount" value={<span className="font-mono">{formatRp(slik.existing_amount)}</span>} />
          <Row label="Blacklist Status" testId="slik-blacklist" value={slik.blacklist_status ? 'Listed' : 'Not Listed'} />
        </Section>
      )}

      {/* AML & Fraud */}
      {aml && (
        <Section title="AML & Fraud Screening">
          <Row label="Screening Date" testId="aml-date" value={formatDate(aml.screening_date)} />
          <Row label="DTTOT Match" testId="aml-dttot" value={aml.dttot_match ? 'Listed' : 'Not Listed'} />
          <Row label="UN Sanctions Match" testId="aml-un" value={aml.un_sanctions_match ? 'Listed' : 'Not Listed'} />
          <Row label="PEP Status" testId="aml-pep" value={aml.pep_status ? 'Identified as PEP' : 'Not a PEP'} />
          <Row label="PEP EDD Required" testId="aml-pep-edd" value={aml.pep_edd_required ? 'Enhanced Due Diligence Required' : 'Not Required'} />
          <Row label="Income Consistency" testId="aml-income" value={aml.income_consistent ? 'Consistent' : 'Inconsistent'} />
          <Row label="Address Flag" testId="aml-address" value={aml.address_flag ? 'Flagged' : 'No Flag'} />
          <Row label="Fraud Signals" testId="aml-fraud" value={aml.fraud_signals || 'None'} />
        </Section>
      )}

      {/* CRDE Result */}
      {crde && (
        <Section title="CRDE Result">
          <Row label="Decision" testId="crde-decision" value={crde.decision} />
          <Row label="Risk Score" testId="crde-risk" value={crde.risk_score} />
          <Row label="Numeric Score" testId="crde-score" value={`${crde.numeric_score} / 1000`} />
          <Row label="DBR Actual" testId="crde-dti" value={formatPercent(crde.dti_actual)} />
          <Row label="DBR Threshold" testId="crde-dti-limit" value={formatPercent(crde.dti_threshold)} />
          <Row label="DBR Passed" testId="crde-dti-passed" value={crde.dti_passed ? 'PASS' : 'FAIL'} />
          <Row label="Collectability" testId="crde-kol" value={crde.kol_value} />
          <Row label="KOL Passed" testId="crde-kol-passed" value={crde.kol_passed ? 'PASS' : 'FAIL'} />
          <Row label="AML Passed" testId="crde-aml" value={crde.aml_passed ? 'PASS' : 'FAIL'} />
          <Row label="Fraud Passed" testId="crde-fraud" value={crde.fraud_passed ? 'PASS' : 'FAIL'} />
          <Row label="Rules Triggered" testId="crde-rules-count" value={rules.length === 0 ? 'None' : `${rules.length} rule(s)`} />
          {rules.length > 0 && (
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="text-sm font-medium mb-2" style={{ color: '#475569' }}>Triggered Rules:</div>
              <ul data-testid="summary-crde-rules-list">
                {rules.map((rule, i) => (
                  <li key={i} data-testid={`summary-crde-rule-${i}`} className="text-sm py-1" style={{ color: '#0f172a' }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Row label="Notes" testId="crde-notes" value={crde.notes} />
          <Row label="Engine" testId="crde-engine" value={crde.engine_version} />
        </Section>
      )}

      {/* Collateral */}
      {collateral && collateral.required ? (
        <Section title="Collateral">
          <Row label="Asset Type" testId="col-type" value={collateral.collateral_type} />
          <Row label="Description" testId="col-desc" value={collateral.asset_description} />
          <Row label="Market Value" testId="col-market" value={<span className="font-mono">{formatRp(collateral.market_value)}</span>} />
          <Row label="Liquidation Value" testId="col-liquid" value={<span className="font-mono">{formatRp(collateral.liquidation_value)}</span>} />
          <Row label="LTV Ratio" testId="col-ltv" value={<span className="font-mono">{formatPercent(collateral.ltv_ratio)}</span>} />
          <Row label="Legal Status" testId="col-legal" value={collateral.legal_status} />
        </Section>
      ) : (
        <Section title="Collateral">
          <Row label="Collateral" testId="col-status" value="Not required (unsecured product)" />
        </Section>
      )}
    </div>
  );
}
