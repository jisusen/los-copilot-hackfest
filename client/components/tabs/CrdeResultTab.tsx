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

export function CrdeResultTab({ crde }: { crde: CrdeResult }) {
  const riskColor = RISK_COLORS[crde.risk_score] ?? '#6b7c93';
  const decColor = DECISION_COLORS[crde.decision] ?? '#6b7c93';
  const decBg = DECISION_BG[crde.decision] ?? '#f9fafb';
  const rules: string[] = Array.isArray(crde.rules_triggered) ? crde.rules_triggered : [];
  const failedChecks = [!crde.dti_passed, !crde.kol_passed, !crde.aml_passed, !crde.fraud_passed].filter(Boolean).length;

  return (
    <div data-testid="tab-content-hasil-crde">
      {/* Header: decision summary */}
      <div className="rounded-lg border-2 p-5 mb-5" style={{ background: decBg, borderColor: decColor }}>
        <div className="flex items-center gap-6 flex-wrap">
          <div style={{ flex: 1, minWidth: 120 }}>
            <div className="text-xs text-muted font-semibold uppercase tracking-wide mb-1">Risk Score</div>
            <div className="font-display text-2xl font-bold" style={{ color: riskColor }}>
              {crde.risk_score}
            </div>
          </div>
          <div className="w-px h-10" style={{ background: decColor }} />
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="text-xs text-muted font-semibold uppercase tracking-wide mb-1">Recommendation</div>
            <div className="font-display text-xl font-bold" style={{ color: decColor }}>{crde.decision}</div>
          </div>
          <div className="w-px h-10" style={{ background: decColor }} />
          <div style={{ flex: 1, minWidth: 100 }}>
            <div className="text-xs text-muted font-semibold uppercase tracking-wide mb-1">Score</div>
            <div className="font-display text-xl font-bold text-text">{crde.numeric_score}/1000</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted" style={{ borderTop: `1px solid ${decColor}`, paddingTop: 8 }}>
          Processed: {formatDateTime(crde.processed_at)} &middot; Engine: {crde.engine_version}
        </div>
      </div>

      {/* Rules section — prominent card */}
      <div className="rounded-lg border mb-5" style={{
        borderLeft: `4px solid ${rules.length > 0 ? '#c47d0e' : '#1a7f4b'}`,
        background: rules.length > 0 ? '#fffbeb' : '#f0fdf4',
        borderColor: rules.length > 0 ? '#fde68a' : '#bbf7d0',
      }}>
        <div style={{ padding: '14px 16px' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="font-display text-sm font-bold uppercase tracking-wide" style={{ color: rules.length > 0 ? '#92400e' : '#166534' }}>
              Underwriting Rules Check
            </div>
            {rules.length > 0 && (
              <div className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: '#fde68a', color: '#92400e' }}>
                {rules.length} rule{rules.length > 1 ? 's' : ''} triggered
              </div>
            )}
          </div>
          {rules.length > 0 ? (
            <ul data-testid="crde-rules-list" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {rules.map((rule, i) => (
                <li key={i} data-testid={`crde-rule-${i}`} className="text-sm" style={{
                  padding: '6px 0',
                  borderBottom: i < rules.length - 1 ? '1px solid #fde68a' : 'none',
                  color: '#78350f',
                  display: 'flex',
                  gap: 8,
                }}>
                  <span className="font-mono text-xs font-bold" style={{ color: '#92400e', minWidth: 20 }}>{i + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm font-medium" style={{ color: '#166534' }}>
              All RAC criteria satisfied — no rules triggered.
            </div>
          )}
        </div>
      </div>

      {/* Check results grid */}
      <div className="rounded-lg border border-border bg-white p-5 mb-5">
        <div className="font-display text-sm font-bold uppercase tracking-wide text-text mb-3">Check Results</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[
            { label: 'DBR', status: crde.dti_passed, val: formatPercent(crde.dti_actual), threshold: formatPercent(crde.dti_threshold) },
            { label: 'Collectability', status: crde.kol_passed, val: `Kol. ${crde.kol_value}`, threshold: '' },
            { label: 'AML', status: crde.aml_passed, val: crde.aml_passed ? 'Clear' : 'Flag', threshold: '' },
            { label: 'Fraud', status: crde.fraud_passed, val: crde.fraud_passed ? 'No signals' : 'Signals detected', threshold: '' },
          ].map((check, i) => (
            <div key={check.label} style={{
              padding: '10px 0',
              borderBottom: i < 2 ? '1px solid #e5e3dc' : 'none',
              borderRight: i % 2 === 0 ? '1px solid #e5e3dc' : 'none',
              paddingRight: i % 2 === 0 ? 16 : 0,
              paddingLeft: i % 2 === 1 ? 16 : 0,
            }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">{check.label}</span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{
                  background: check.status ? '#e3f0e9' : '#fbe5e7',
                  color: check.status ? '#0d6e3f' : '#9b1c2c',
                }}>
                  {check.status ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="text-sm text-text mt-1">{check.val}</div>
              {check.threshold && <div className="text-xs text-muted">Threshold: {check.threshold}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Notes section */}
      {crde.notes ? (
        <div className="rounded-lg border bg-white p-5" style={{ borderLeft: '3px solid #1a3a5c' }}>
          <div className="font-display text-sm font-bold uppercase tracking-wide text-text mb-2">CRDE Notes</div>
          <div className="text-sm text-text leading-relaxed">{crde.notes}</div>
        </div>
      ) : null}
    </div>
  );
}
