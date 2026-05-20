import React from 'react';
import { formatRp, formatPercent } from '../../lib/api';

type Financials = {
  gross_income: number; net_income: number; existing_obligations: number;
  requested_installment: number; total_obligations: number; dti_ratio: number;
  dti_threshold: number; remaining_income: number; income_verified: number;
  verification_docs: string;
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex border-b border-border py-2.5">
      <span className="w-52 flex-shrink-0 text-xs text-muted font-medium">{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm text-text">{children || '—'}</span>
    </div>
  );
}

export function DataKeuanganTab({ financials }: { financials: Financials }) {
  const dtiPct = financials.dti_ratio * 100;
  const threshPct = financials.dti_threshold * 100;
  const dtiColor = dtiPct < 40 ? '#1a7f4b' : dtiPct <= 50 ? '#c47d0e' : '#b91c1c';
  const barPct = Math.min((dtiPct / threshPct) * 100, 130);

  return (
    <div data-testid="tab-content-data-keuangan">
      <div className="bg-white border border-border rounded-lg px-5 mb-6">
        <Field label="Gross Income / Month" testId="penghasilan-bruto">
          <span className="font-mono">{formatRp(financials.gross_income)}</span>
        </Field>
        <Field label="Net Income / Month" testId="penghasilan-bersih">
          <span className="font-mono">{formatRp(financials.net_income)}</span>
        </Field>
        <Field label="Existing Obligations / Month" testId="kewajiban-existing">
          <span className="font-mono">{formatRp(financials.existing_obligations)}</span>
        </Field>
        <Field label="Requested Installment / Month" testId="cicilan-dimohon">
          <span className="font-mono">{formatRp(financials.requested_installment)}</span>
        </Field>
        <Field label="Total Obligations / Month" testId="total-kewajiban">
          <span className="font-mono font-semibold">{formatRp(financials.total_obligations)}</span>
        </Field>
        <Field label="Remaining Income" testId="sisa-penghasilan">
          <span className="font-mono">{formatRp(financials.remaining_income)}</span>
        </Field>
      </div>

      {/* DSR Section */}
      <div className="bg-white border border-border rounded-lg p-5 mb-6">
        <h3 className="font-display font-semibold text-sm text-text mb-4">DSR (Debt Service Ratio) Analysis</h3>
        <div className="flex border-b border-border py-2.5">
          <span className="w-52 flex-shrink-0 text-xs text-muted font-medium">DSR Ratio</span>
          <span data-testid="value-dti-ratio" className="text-sm font-bold" style={{ color: dtiColor }}>
            {formatPercent(financials.dti_ratio)}
          </span>
        </div>
        <div className="flex border-b border-border py-2.5">
          <span className="w-52 flex-shrink-0 text-xs text-muted font-medium">DSR Limit (RAC)</span>
          <span data-testid="value-dti-threshold" className="text-sm text-text">{Math.round(threshPct)}%</span>
        </div>

        {/* DSR Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>0%</span>
            <span style={{ color: '#c47d0e' }}>Limit: {Math.round(threshPct)}%</span>
            <span>100%</span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden" style={{ background: '#d1d9e0' }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all"
              style={{ width: `${Math.min(barPct, 100)}%`, background: dtiColor }}
            />
          </div>
          <div className="text-xs mt-1 font-medium" style={{ color: dtiColor }}>
            {dtiPct < threshPct ? `✅ Within limit (${formatPercent(financials.dti_ratio)} < ${Math.round(threshPct)}%)` : `⚠️ Exceeds limit (${formatPercent(financials.dti_ratio)} > ${Math.round(threshPct)}%)`}
          </div>
        </div>
      </div>

      <div className="bg-white border border-border rounded-lg px-5">
        <Field label="Income Verification Docs" testId="verifikasi-penghasilan">{financials.verification_docs}</Field>
        <Field label="Verification Status" testId="status-verifikasi">
          {financials.income_verified ? '✅ Verified' : '⚠️ Not Verified'}
        </Field>
      </div>
    </div>
  );
}
