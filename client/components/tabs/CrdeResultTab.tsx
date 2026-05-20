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
    <div data-testid={`field-${testId}`} className="flex border-b border-border py-2.5">
      <span className="w-52 flex-shrink-0 text-xs text-muted font-medium">{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm text-text">{children || '—'}</span>
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
        <div className="text-xs text-muted font-semibold uppercase tracking-wide mb-3">Credit Risk Decision Engine (CRDE) — Result</div>
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <div className="text-xs text-muted mb-1">Risk Score</div>
            <div className="font-display text-2xl font-bold" style={{ color: riskColor }}>
              {crde.risk_score === 'LOW' ? '🟢' : crde.risk_score === 'MEDIUM' ? '🟡' : '🔴'} {crde.risk_score}
            </div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div>
            <div className="text-xs text-muted mb-1">Recommendation</div>
            <div className="font-display text-xl font-bold" style={{ color: decColor }}>{crde.decision}</div>
          </div>
          <div className="w-px h-12 bg-border" />
          <div>
            <div className="text-xs text-muted mb-1">Numeric Score</div>
            <div className="font-display text-xl font-bold text-text">{crde.numeric_score} / 1000</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted">
          Processed: {formatDateTime(crde.processed_at)} · Engine: {crde.engine_version}
        </div>
      </div>

      {/* Detail checks */}
      <div className="bg-white border border-border rounded-lg px-5 mb-6">
        <Field label="Risk Score" testId="crde-risk-score">
          <span className="font-bold" style={{ color: riskColor }}>{crde.risk_score}</span>
        </Field>
        <Field label="CRDE Recommendation" testId="crde-decision">
          <span className="font-bold" style={{ color: decColor }}>{crde.decision}</span>
        </Field>
        <Field label="Numeric Score" testId="crde-numeric-score">{crde.numeric_score} / 1000</Field>
        <Field label="DSR Actual" testId="crde-dti-actual">{formatPercent(crde.dti_actual)}</Field>
        <Field label="DSR Threshold" testId="crde-dti-threshold">{formatPercent(crde.dti_threshold)}</Field>
        <Field label="DSR Status" testId="crde-dti-status">
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
        <div className="bg-white border border-border rounded-lg p-5 mb-6">
          <h3 className="font-display text-sm font-semibold text-text mb-3">Triggered Rules</h3>
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

      <div className="bg-white border border-border rounded-lg px-5">
        <Field label="CRDE Notes" testId="crde-catatan">{crde.notes}</Field>
      </div>
    </div>
  );
}
