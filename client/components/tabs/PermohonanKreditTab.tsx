import React from 'react';
import { formatRp, formatDate } from '../../lib/api';

type Application = {
  id: string; product_type: string; amount_requested: number; tenor_months: number;
  interest_rate: number; loan_purpose: string; branch: string;
  marketing_officer: string; created_at: string;
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
      <div className="bg-white border border-border rounded-lg px-5">
        <Field label="Product Type" testId="produk">
          {PRODUCT_LABELS[application.product_type] ?? application.product_type}
        </Field>
        <Field label="Loan Amount Requested" testId="plafon">
          <span className="font-mono font-semibold">{formatRp(application.amount_requested)}</span>
        </Field>
        <Field label="Tenor" testId="tenor">{application.tenor_months} months</Field>
        <Field label="Interest Rate" testId="suku-bunga">{application.interest_rate}% p.a. (effective)</Field>
        <Field label="Monthly Installment" testId="cicilan">
          <span className="font-mono">{formatRp(financials.requested_installment)}</span>
        </Field>
        <Field label="Loan Purpose" testId="tujuan">{application.loan_purpose}</Field>
        <Field label="Payment Source" testId="sumber-bayar">Fixed monthly salary</Field>
        <Field label="Application Date" testId="tanggal-permohonan">{formatDate(application.created_at)}</Field>
        <Field label="Branch" testId="cabang">{application.branch}</Field>
        <Field label="Marketing Officer" testId="marketing-officer">{application.marketing_officer}</Field>
      </div>
    </div>
  );
}
