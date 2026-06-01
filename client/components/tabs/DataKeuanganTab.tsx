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

export function DataKeuanganTab({ financials }: { financials: Financials }) {
  const dtiPct = financials.dti_ratio * 100;
  const threshPct = financials.dti_threshold * 100;
  const dtiColor = dtiPct < 40 ? '#1a7f4b' : dtiPct <= 50 ? '#c47d0e' : '#b91c1c';
  const barPct = Math.min((dtiPct / threshPct) * 100, 130);
  const dbrPass = dtiPct < threshPct;

  return (
    <div data-testid="tab-content-data-keuangan">
      {/* Income & Obligations summary grid */}
      <div className="bg-white border border-border rounded-lg mb-5" style={{ padding: 0 }}>
        <div className="font-display text-sm font-bold uppercase tracking-wide text-text" style={{ padding: '12px 16px', borderBottom: '1px solid #e5e3dc' }}>
          Income & Obligations
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
          {[
            { label: 'Gross Income', val: formatRp(financials.gross_income), testId: 'penghasilan-bruto' },
            { label: 'Net Income', val: formatRp(financials.net_income), testId: 'penghasilan-bersih' },
            { label: 'Existing Obligations', val: formatRp(financials.existing_obligations), testId: 'kewajiban-existing' },
            { label: 'Requested Installment', val: formatRp(financials.requested_installment), testId: 'cicilan-dimohon' },
            { label: 'Total Obligations', val: formatRp(financials.total_obligations), testId: 'total-kewajiban', bold: true },
            { label: 'Remaining Income', val: formatRp(financials.remaining_income), testId: 'sisa-penghasilan' },
          ].map((item, i) => (
            <div key={item.testId} data-testid={`field-${item.testId}`} style={{
              padding: '10px 14px',
              borderRight: i % 3 < 2 ? '1px solid #e5e3dc' : 'none',
              borderBottom: i < 3 ? '1px solid #e5e3dc' : 'none',
            }}>
              <div className="text-xs text-muted font-medium mb-1">{item.label}</div>
              <div data-testid={`value-${item.testId}`} className="font-mono text-sm" style={{ fontWeight: item.bold ? 600 : 400, color: '#0f1216' }}>
                {item.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DBR Analysis */}
      <div className="bg-white border border-border rounded-lg mb-5" style={{ padding: 0 }}>
        <div className="font-display text-sm font-bold uppercase tracking-wide text-text" style={{ padding: '12px 16px', borderBottom: '1px solid #e5e3dc' }}>
          DBR (Debt Burden Ratio) Analysis
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted">DBR Ratio</div>
              <div data-testid="value-dti-ratio" className="font-display text-xl font-bold" style={{ color: dtiColor }}>
                {formatPercent(financials.dti_ratio)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-xs text-muted">RAC Limit</div>
              <div data-testid="value-dti-threshold" className="font-display text-lg font-bold text-text">{Math.round(threshPct)}%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-xs text-muted">Status</div>
              <span className="font-mono text-xs font-bold px-2 py-1 rounded" style={{
                background: dbrPass ? '#e3f0e9' : '#fbe5e7',
                color: dbrPass ? '#0d6e3f' : '#9b1c2c',
              }}>
                {dbrPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
          </div>

          <div className="mt-3">
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
              {dbrPass
                ? `Within limit (${formatPercent(financials.dti_ratio)} < ${Math.round(threshPct)}%)`
                : `Exceeds limit (${formatPercent(financials.dti_ratio)} > ${Math.round(threshPct)}%)`}
            </div>
          </div>
        </div>
      </div>

      {/* CASA Relationship History */}
      {financials.casa_avg_balance_3m != null && (
        <div className="bg-white border border-border rounded-lg mb-5" style={{ padding: 0 }}>
          <div className="font-display text-sm font-bold uppercase tracking-wide text-text" style={{ padding: '12px 16px', borderBottom: '1px solid #e5e3dc' }}>
            CASA Relationship History
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <div style={{ padding: '12px 16px', borderRight: '1px solid #e5e3dc', borderBottom: '1px solid #e5e3dc' }}>
              <div className="text-xs text-muted mb-1">Avg Balance (3mo)</div>
              <div data-testid="value-casa-avg-3m" className="font-mono text-sm text-text">{formatRp(financials.casa_avg_balance_3m)}</div>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e3dc' }}>
              <div className="text-xs text-muted mb-1">Avg Balance (6mo)</div>
              <div data-testid="value-casa-avg-6m" className="font-mono text-sm text-text">{formatRp(financials.casa_avg_balance_6m)}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRight: '1px solid #e5e3dc' }}>
              <div className="text-xs text-muted mb-1">Avg Balance (12mo)</div>
              <div data-testid="value-casa-avg-12m" className="font-mono text-sm text-text">{formatRp(financials.casa_avg_balance_12m)}</div>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div className="text-xs text-muted mb-1">Funding Ratio (CASA / Loan)</div>
              <div data-testid="value-casa-funding-ratio" className="font-mono text-sm text-text">{financials.casa_funding_ratio}x</div>
            </div>
          </div>
          <div className="text-xs text-muted" style={{ padding: '8px 16px', borderTop: '1px solid #e5e3dc' }}>
            Relationship Tenure: {financials.casa_tenure_months} months
          </div>
        </div>
      )}

      {/* Past Loans */}
      {financials.past_loans && financials.past_loans.length > 0 && (
        <div className="bg-white border border-border rounded-lg mb-5" style={{ padding: 0 }}>
          <div className="font-display text-sm font-bold uppercase tracking-wide text-text" style={{ padding: '12px 16px', borderBottom: '1px solid #e5e3dc' }}>
            Past Loans with BMS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
            {financials.past_loans.map((loan, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                borderRight: i % 3 < 2 ? '1px solid #e5e3dc' : 'none',
                background: '#fafaf7',
              }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold uppercase" style={{ color: '#1a3a5c' }}>{loan.product}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{
                    background: loan.status === 'Paid' ? '#e3f0e9' : '#fff1d8',
                    color: loan.status === 'Paid' ? '#0d6e3f' : '#8a5a08',
                  }}>
                    {loan.status}
                  </span>
                </div>
                <div className="font-mono text-sm text-text font-semibold">{formatRp(loan.amount)}</div>
                <div className="text-xs text-muted mt-1">{loan.year} &middot; {loan.tenure_months}mo</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification */}
      <div className="bg-white border border-border rounded-lg" style={{ padding: 0 }}>
        <div className="font-display text-sm font-bold uppercase tracking-wide text-text" style={{ padding: '12px 16px', borderBottom: '1px solid #e5e3dc' }}>
          Income Verification
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{financials.verification_docs}</span>
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
