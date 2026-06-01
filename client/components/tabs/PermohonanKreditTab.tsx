import React from 'react';
import { formatRp, formatDate } from '../../lib/api';

type Application = {
  id: string; product_type: string; amount_requested: number; tenor_months: number;
  interest_rate: number; loan_purpose: string; branch: string;
  marketing_officer: string; created_at: string;
  disbursement_date?: string; disbursement_method?: string;
  repayment_account?: string; repayment_method?: string;
  insurance_required?: string; insurance_type?: string;
  provisi_fee?: string; admin_fee?: number;
  legal_docs_complete?: string; credit_committee_date?: string | null;
  special_rate?: string | null; referral_source?: string;
};

type Financials = { requested_installment: number };

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex border-b border-border py-2.5">
      <span className="w-52 flex-shrink-0 text-xs text-muted font-medium">{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm text-text">{children || '—'}</span>
    </div>
  );
}

const PRODUCT_LABELS: Record<string, string> = {
  KTA: 'KTA (Unsecured Personal Loan)',
  KPR: 'KPR (Home Mortgage)',
  KKB: 'KKB (Vehicle Loan)',
  Multiguna: 'Multiguna (Multi-Purpose Loan)',
};

export function PermohonanKreditTab({ application, financials }: { application: Application; financials: Financials }) {
  return (
    <div data-testid="tab-content-permohonan-kredit">
      <div className="bg-white border border-border rounded-lg px-5 mb-6">
        <Field label="Product Type" testId="produk">
          {PRODUCT_LABELS[application.product_type] ?? application.product_type}
        </Field>
        <Field label="Loan Amount Requested" testId="plafon">
          <span className="font-mono font-semibold">{formatRp(application.amount_requested)}</span>
        </Field>
        <Field label="Tenor" testId="tenor">{application.tenor_months} months</Field>
        <Field label="Interest Rate" testId="suku-bunga">{application.interest_rate}% p.a. (effective)</Field>
        {application.special_rate && (
          <Field label="Special Rate" testId="suku-bunga-khusus">
            <span style={{ color: '#c47d0e', fontWeight: 600 }}>{application.special_rate}</span>
          </Field>
        )}
        <Field label="Monthly Installment" testId="cicilan">
          <span className="font-mono">{formatRp(financials.requested_installment)}</span>
        </Field>
        <Field label="Loan Purpose" testId="tujuan">{application.loan_purpose}</Field>
        <Field label="Referral Source" testId="referral">{application.referral_source}</Field>
        <Field label="Payment Source" testId="sumber-bayar">Fixed monthly salary</Field>
      </div>

      {application.disbursement_date && (
        <>
          <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Disbursement & Repayment</h3>
          <div className="bg-white border border-border rounded-lg px-5 mb-6">
            <Field label="Target Disbursement" testId="tanggal-cair">{application.disbursement_date}</Field>
            <Field label="Disbursement Method" testId="metode-cair">{application.disbursement_method}</Field>
            <Field label="Repayment Account" testId="rekening-pembayaran">
              <span className="font-mono">{application.repayment_account}</span>
            </Field>
            <Field label="Repayment Method" testId="metode-bayar">{application.repayment_method}</Field>
          </div>

          <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Fees & Charges</h3>
          <div className="bg-white border border-border rounded-lg px-5 mb-6">
            <Field label="Provision Fee" testId="provisi">{application.provisi_fee}</Field>
            <Field label="Administration Fee" testId="biaya-admin">
              <span className="font-mono">{formatRp(application.admin_fee)}</span>
            </Field>
            <Field label="Insurance Required" testId="asuransi">{application.insurance_required}</Field>
            {application.insurance_required === 'Yes' && (
              <Field label="Insurance Type" testId="jenis-asuransi">{application.insurance_type}</Field>
            )}
          </div>

          <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Document Status</h3>
          <div className="bg-white border border-border rounded-lg px-5 mb-6">
            <Field label="Legal Documents" testId="dokumen-hukum">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{
                background: application.legal_docs_complete === 'Complete' ? '#e3f0e9' : '#fff1d8',
                color: application.legal_docs_complete === 'Complete' ? '#0d6e3f' : '#8a5a08',
              }}>
                {application.legal_docs_complete}
              </span>
            </Field>
            <Field label="Application Date" testId="tanggal-permohonan">{formatDate(application.created_at)}</Field>
            <Field label="Branch" testId="cabang">{application.branch}</Field>
            <Field label="Marketing Officer" testId="marketing-officer">{application.marketing_officer}</Field>
          </div>
        </>
      )}
    </div>
  );
}
