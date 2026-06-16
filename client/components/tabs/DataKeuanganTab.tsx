import React from 'react';
import { formatRp, formatPercent } from '../../lib/api';

type PastLoan = {
  product: string; amount: number; status: string; year: number; tenure_months: number;
};

type Financials = {
  gross_income: number; net_income: number; existing_obligations: number;
  requested_installment: number; total_obligations: number; dti_ratio: number;
  dti_threshold: number; remaining_income: number; income_verified: number;
  verification_docs: string;
  casa_avg_balance_3m?: number;
  casa_avg_balance_6m?: number;
  casa_avg_balance_12m?: number;
  casa_tenure_months?: number;
  casa_funding_ratio?: number;
  past_loans?: PastLoan[];
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex flex-col sm:flex-row sm:items-center border-b py-3 px-4 gap-0.5 sm:gap-0 field-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <span className="w-full sm:w-56 flex-shrink-0 text-xs sm:text-sm font-medium field-label" style={{ color: '#475569' }}>{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm font-semibold" style={{ color: '#0f172a' }}>{children || '—'}</span>
    </div>
  );
}

export function DataKeuanganTab({ financials }: { financials: Financials }) {
  const dtiPct = financials.dti_ratio * 100;
  const threshPct = financials.dti_threshold * 100;
  const dtiColor = dtiPct < 40 ? '#1a7f4b' : dtiPct <= 50 ? '#c47d0e' : '#b91c1c';
  const barPct = Math.min((dtiPct / threshPct) * 100, 130);
  const dbrPass = dtiPct < threshPct;

  return (
    <div data-testid="tab-content-data-keuangan">
      {/* Income & Obligations */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
        <div className="text-sm font-bold uppercase tracking-wide" style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
          Income & Obligations
        </div>
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

      {/* DBR Analysis */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
        <div className="text-sm font-bold uppercase tracking-wide" style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
          DBR (Debt Burden Ratio) Analysis
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs" style={{ color: '#64748b' }}>DBR Ratio</div>
              <div data-testid="value-dti-ratio" className="text-xl font-bold" style={{ color: dtiColor }}>
                {formatPercent(financials.dti_ratio)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-xs" style={{ color: '#64748b' }}>RAC Limit</div>
              <div data-testid="value-dti-threshold" className="text-lg font-bold" style={{ color: '#0f172a' }}>{Math.round(threshPct)}%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-xs" style={{ color: '#64748b' }}>Status</div>
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{
                background: dbrPass ? '#e3f0e9' : '#fbe5e7',
                color: dbrPass ? '#0d6e3f' : '#9b1c2c',
              }}>
                {dbrPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#64748b' }}>
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
              {dbrPass
                ? `Within limit (${formatPercent(financials.dti_ratio)} < ${Math.round(threshPct)}%)`
                : `Exceeds limit (${formatPercent(financials.dti_ratio)} > ${Math.round(threshPct)}%)`}
            </div>
          </div>
        </div>
      </div>

      {/* CASA Relationship History */}
      {financials.casa_avg_balance_3m != null && (
        <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
          <div className="text-sm font-bold uppercase tracking-wide" style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
            CASA Relationship History
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
            <div style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              <div className="text-xs mb-1" style={{ color: '#64748b' }}>Avg Balance (3mo)</div>
              <div data-testid="value-casa-avg-3m" className="font-mono text-sm" style={{ color: '#0f172a' }}>{formatRp(financials.casa_avg_balance_3m)}</div>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
              <div className="text-xs mb-1" style={{ color: '#64748b' }}>Avg Balance (6mo)</div>
              <div data-testid="value-casa-avg-6m" className="font-mono text-sm" style={{ color: '#0f172a' }}>{formatRp(financials.casa_avg_balance_6m)}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0' }}>
              <div className="text-xs mb-1" style={{ color: '#64748b' }}>Avg Balance (12mo)</div>
              <div data-testid="value-casa-avg-12m" className="font-mono text-sm" style={{ color: '#0f172a' }}>{formatRp(financials.casa_avg_balance_12m)}</div>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div className="text-xs mb-1" style={{ color: '#64748b' }}>Funding Ratio (CASA / Loan)</div>
              <div data-testid="value-casa-funding-ratio" className="font-mono text-sm" style={{ color: '#0f172a' }}>{financials.casa_funding_ratio}x</div>
            </div>
          </div>
          <div className="text-xs" style={{ padding: '8px 16px', borderTop: '1px solid #e2e8f0', color: '#64748b' }}>
            Relationship Tenure: {financials.casa_tenure_months} months
          </div>
        </div>
      )}

      {/* Past Loans */}
      {financials.past_loans && financials.past_loans.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
          <div className="text-sm font-bold uppercase tracking-wide" style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
            Past Loans with CIMB Niaga
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 0 }}>
            {financials.past_loans.map((loan, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                borderRight: i % 3 < 2 ? '1px solid #e2e8f0' : 'none',
                background: '#f8fafc',
              }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold uppercase" style={{ color: '#8B1A1A' }}>{loan.product}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{
                    background: loan.status === 'Paid' ? '#e3f0e9' : '#fff1d8',
                    color: loan.status === 'Paid' ? '#0d6e3f' : '#8a5a08',
                  }}>
                    {loan.status}
                  </span>
                </div>
                <div className="font-mono text-sm font-semibold" style={{ color: '#0f172a' }}>{formatRp(loan.amount)}</div>
                <div className="text-xs mt-1" style={{ color: '#64748b' }}>{loan.year} &middot; {loan.tenure_months}mo</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification */}
      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        <div className="text-sm font-bold uppercase tracking-wide" style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
          Income Verification
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#64748b' }}>{financials.verification_docs}</span>
            <span data-testid="value-status-verifikasi" className="font-mono text-xs font-bold px-2 py-1 rounded" style={{
              background: financials.income_verified ? '#e3f0e9' : '#fbe5e7',
              color: financials.income_verified ? '#0d6e3f' : '#9b1c2c',
            }}>
              {financials.income_verified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
