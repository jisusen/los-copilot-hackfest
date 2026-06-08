import React from 'react';
import { formatDateTime, formatPercent } from '../../lib/api';

type CrdeResult = {
  processed_at: string; risk_score: string; decision: string; numeric_score: number;
  dti_actual: number; dti_threshold: number; dti_passed: number;
  kol_value: number; kol_passed: number; aml_passed: number; fraud_passed: number;
  rules_triggered: string[]; notes: string; engine_version: string;
};

const RISK_COLORS: Record<string, string> = { LOW: '#1a7f4b', MEDIUM: '#c47d0e', HIGH: '#b91c1c' };
const DECISION_COLORS: Record<string, string> = {
  'APPROVED': '#1a7f4b',
  'COMMITTEE REVIEW': '#c47d0e',
  'REJECTED': '#b91c1c',
};
const DECISION_BG: Record<string, string> = {
  'APPROVED': '#f0fdf4',
  'COMMITTEE REVIEW': '#fffbeb',
  'REJECTED': '#fef2f2',
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex flex-col sm:flex-row sm:items-center border-b py-3 px-4 gap-0.5 sm:gap-0 field-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <span className="w-full sm:w-56 flex-shrink-0 text-xs sm:text-sm font-medium field-label" style={{ color: '#475569' }}>{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm font-semibold" style={{ color: '#0f172a' }}>{children || '—'}</span>
    </div>
  );
}

export function CrdeResultTab({ crde }: { crde: CrdeResult }) {
  const riskColor = RISK_COLORS[crde.risk_score] ?? '#6b7c93';
  const decColor = DECISION_COLORS[crde.decision] ?? '#6b7c93';
  const decBg = DECISION_BG[crde.decision] ?? '#f9fafb';
  const rules: string[] = Array.isArray(crde.rules_triggered) ? crde.rules_triggered : [];

  return (
    <div data-testid="tab-content-hasil-crde">
      {/* CRDE Header Box */}
      <div className="rounded-lg border-2 p-6 mb-6" style={{ background: decBg, borderColor: decColor }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#475569' }}>Credit Risk Decision Engine (CRDE) — Result</div>
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <div className="text-xs mb-1" style={{ color: '#475569' }}>Risk Score</div>
            <div className="font-display text-2xl font-bold" style={{ color: riskColor }}>
              {crde.risk_score === 'LOW' ? '🟢' : crde.risk_score === 'MEDIUM' ? '🟡' : '🔴'} {crde.risk_score}
            </div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div>
            <div className="text-xs mb-1" style={{ color: '#475569' }}>Recommendation</div>
            <div className="font-display text-xl font-bold" style={{ color: decColor }}>{crde.decision}</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div>
            <div className="text-xs mb-1" style={{ color: '#475569' }}>Numeric Score</div>
            <div className="font-display text-xl font-bold text-text">{crde.numeric_score} / 1000</div>
          </div>
        </div>
        <div className="mt-3 text-xs" style={{ color: '#475569' }}>
          Processed: {formatDateTime(crde.processed_at)} · Engine: {crde.engine_version}
        </div>
      </div>

      {/* Check Results Grid */}
      <div className="rounded-lg border bg-white p-5 mb-6" style={{ borderColor: '#e2e8f0' }}>
        <div className="font-semibold text-sm uppercase tracking-wide mb-3" style={{ color: '#0f172a' }}>Check Results</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0 }}>
          {[
            { label: 'DBR', status: crde.dti_passed, val: formatPercent(crde.dti_actual), threshold: formatPercent(crde.dti_threshold) },
            { label: 'Collectability', status: crde.kol_passed, val: `Kol. ${crde.kol_value}`, threshold: '' },
            { label: 'AML', status: crde.aml_passed, val: crde.aml_passed ? 'Clear' : 'Flag', threshold: '' },
            { label: 'Fraud', status: crde.fraud_passed, val: crde.fraud_passed ? 'No signals' : 'Signals detected', threshold: '' },
          ].map((check, i) => (
            <div key={check.label} style={{
              padding: '10px 0',
              borderBottom: i < 2 ? '1px solid #e2e8f0' : 'none',
              borderRight: i % 2 === 0 ? '1px solid #e2e8f0' : 'none',
              paddingRight: i % 2 === 0 ? 16 : 0,
              paddingLeft: i % 2 === 1 ? 16 : 0,
            }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: '#64748b' }}>{check.label}</span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{
                  background: check.status ? '#e3f0e9' : '#fbe5e7',
                  color: check.status ? '#0d6e3f' : '#9b1c2c',
                }}>
                  {check.status ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="text-sm mt-1" style={{ color: '#0f172a' }}>{check.val}</div>
              {check.threshold && <div className="text-xs" style={{ color: '#64748b' }}>Threshold: {check.threshold}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Detail checks */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
        <Field label="DBR Actual" testId="crde-dti-actual">{formatPercent(crde.dti_actual)}</Field>
        <Field label="DBR Threshold" testId="crde-dti-threshold">{formatPercent(crde.dti_threshold)}</Field>
        <Field label="DBR Status" testId="crde-dti-status">
          {crde.dti_passed ? '✅ PASS' : '❌ FAIL'}
        </Field>
        <Field label="Collectability" testId="crde-kol">{crde.kol_value}</Field>
        <Field label="Collectability Status" testId="crde-kol-status">
          {crde.kol_passed ? '✅ PASS' : '❌ FAIL'}
        </Field>
        <Field label="AML Status" testId="crde-aml-status">
          {crde.aml_passed ? '✅ PASS' : '❌ FAIL'}
        </Field>
        <Field label="Fraud Status" testId="crde-fraud-status">
          {crde.fraud_passed ? '✅ PASS' : '❌ FAIL'}
        </Field>
        <Field label="Rules Triggered" testId="crde-rules-triggered">
          {rules.length === 0 ? 'No rules triggered' : `${rules.length} rule(s) triggered`}
        </Field>
      </div>

      {/* Rules list */}
      {rules.length > 0 && (
        <div className="bg-white border rounded-lg p-5 mb-6" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Triggered Rules</h3>
          <ul data-testid="crde-rules-list" className="space-y-2">
            {rules.map((rule, i) => (
              <li key={i} data-testid={`crde-rule-${i}`} className="flex items-start gap-2 text-sm">
                <span className="text-danger mt-0.5">⚠</span>
                <span className="text-text">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        <Field label="CRDE Notes" testId="crde-catatan">{crde.notes}</Field>
      </div>
    </div>
  );
}
