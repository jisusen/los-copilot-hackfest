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
    <div data-testid={`field-${testId}`} className="flex flex-col sm:flex-row sm:items-center border-b py-3 px-4 gap-0.5 sm:gap-0 field-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <span className="w-full sm:w-56 flex-shrink-0 text-xs sm:text-sm font-medium field-label" style={{ color: '#475569' }}>{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm font-semibold" style={{ color: '#0f172a' }}>{children || '—'}</span>
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
      <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
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
          <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Disbursement & Repayment</h3>
          <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
            <Field label="Target Disbursement" testId="tanggal-cair">{application.disbursement_date}</Field>
            <Field label="Disbursement Method" testId="metode-cair">{application.disbursement_method}</Field>
            <Field label="Repayment Account" testId="rekening-pembayaran">
              <span className="font-mono">{application.repayment_account}</span>
            </Field>
            <Field label="Repayment Method" testId="metode-bayar">{application.repayment_method}</Field>
          </div>

          <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Fees & Charges</h3>
          <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
            <Field label="Provision Fee" testId="provisi">{application.provisi_fee}</Field>
            <Field label="Administration Fee" testId="biaya-admin">
              <span className="font-mono">{formatRp(application.admin_fee)}</span>
            </Field>
            <Field label="Insurance Required" testId="asuransi">{application.insurance_required}</Field>
            {application.insurance_required === 'Yes' && (
              <Field label="Insurance Type" testId="jenis-asuransi">{application.insurance_type}</Field>
            )}
          </div>

          <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Document Status</h3>
          <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
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
