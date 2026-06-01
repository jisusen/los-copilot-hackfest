import React, { useState } from 'react';
import type { MemoDraft, AgentResult } from '../lib/types';
import { CRDE_COLOR, RISK_COLOR } from '../lib/format';

const SECTIONS: { key: keyof MemoDraft; label: string }[] = [
  { key: 'section1_profil',      label: '1. DEBTOR PROFILE' },
  { key: 'section2_permohonan',  label: '2. LOAN APPLICATION' },
  { key: 'section3_keuangan',    label: '3. FINANCIAL ANALYSIS & REPAYMENT CAPACITY' },
  { key: 'section4_slik',        label: '4. SLIK OJK RESULT' },
  { key: 'section5_aml',         label: '5. AML SCREENING & FRAUD DETECTION' },
  { key: 'section6_agunan',      label: '6. COLLATERAL' },
  { key: 'section7_crde',        label: '7. CRDE DECISION' },
  { key: 'section8_rekomendasi', label: '8. ANALYST NOTES & RECOMMENDATION' },
];

/** Parse **bold**, _italic_, and bullet lines into React elements. */
function renderMemoText(text: string): React.ReactNode {
  if (!text) return <span className="text-muted">—</span>;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('- ');
    const paddingLeft = isBullet ? 12 : 0;
    const cleanLine = isBullet ? line.trim().slice(1).trimStart() : line;

    // Parse inline formatting: **bold** and _italic_
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|_.*?_)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(cleanLine)) !== null) {
      const before = cleanLine.slice(lastIndex, match.index);
      if (before) parts.push(<span key={`${i}-${lastIndex}`}>{before}</span>);

      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`${i}-${match.index}`} style={{ color: '#f0f0f0' }}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('_') && token.endsWith('_')) {
        parts.push(
          <em key={`${i}-${match.index}`} style={{ color: '#c0c8d8' }}>
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }
    const after = cleanLine.slice(lastIndex);
    if (after) parts.push(<span key={`${i}-end`}>{after}</span>);

    if (isBullet) {
      return (
        <div key={i} className="font-mono text-sm text-text" style={{ lineHeight: 1.6, paddingLeft, display: 'flex', gap: 8 }}>
          <span style={{ color: '#8892a4' }}>•</span>
          <span>{parts.length > 0 ? parts : cleanLine}</span>
        </div>
      );
    }

    return (
      <div key={i} className="font-mono text-sm text-text" style={{ lineHeight: 1.6, paddingLeft }}>
        {parts.length > 0 ? parts : cleanLine || <br />}
      </div>
    );
  });
}

function SectionBlock({
  idx, label, content, editable, onChange,
}: {
  idx: number; label: string; content: string; editable?: boolean; onChange?: (v: string) => void;
}) {
  function copy() {
    navigator.clipboard.writeText(content).catch(() => {});
  }

  return (
    <div data-testid={`memo-section-${idx + 1}`} style={{ marginBottom: 24 }}>
      <div style={{ borderTop: '1px solid #2a3a52', marginBottom: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="font-display text-sm font-bold uppercase text-text tracking-wide">{label}</span>
        <button
          data-testid={`memo-section-copy-${idx + 1}`}
          onClick={copy}
          className="font-ui text-xs text-muted hover:text-text transition-colors"
          style={{ padding: '2px 8px', border: '1px solid #2a3a52' }}
        >
          COPY
        </button>
      </div>
      {editable ? (
        <textarea
          data-testid="memo-section-8-textarea"
          value={content}
          onChange={e => onChange?.(e.target.value)}
          placeholder={`Structure your recommendation:
1. Summary of key findings
2. Risk assessment
3. Recommended decision and rationale
4. Conditions (if any)`}
          className="font-mono text-sm text-text w-full"
          style={{
            background: '#1e2840', border: '1px solid #2a3a52',
            padding: 12, minHeight: 120, resize: 'vertical', outline: 'none',
            color: '#e8edf5',
          }}
        />
      ) : (
        <div>
          {renderMemoText(content)}
        </div>
      )}
    </div>
  );
}

function KeyMetric({ label, value, pass }: { label: string; value: React.ReactNode; pass?: 'pass' | 'fail' | 'warn' | 'neutral' }) {
  const colors = {
    pass: { dot: '#22c55e', text: '#e8edf5' },
    fail: { dot: '#ef4444', text: '#ef4444' },
    warn: { dot: '#f59e0b', text: '#f59e0b' },
    neutral: { dot: '#6b7280', text: '#8892a4' },
  };
  const c = colors[pass ?? 'neutral'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      <span className="font-mono text-xs" style={{ color: '#8892a4', width: 60 }}>{label}</span>
      <span className="font-mono text-xs font-semibold" style={{ color: c.text }}>{value}</span>
    </div>
  );
}

/** Extract the AI recommendation sentence from section 8 text. */
function extractAiRecommendation(text: string): { decision: string; body: string } | null {
  if (!text) return null;
  // Look for **Recommended: X** or **Recommend: X** or **X**
  const recMatch = text.match(/\*\*Recommended?:?\s*([^*]+)\*\*/i);
  if (recMatch) {
    const decision = recMatch[1].trim();
    const body = text.replace(recMatch[0], '').replace(/^[—–\-:\s]+/, '').trim();
    return { decision, body };
  }
  // Fallback: first bolded phrase
  const firstBold = text.match(/\*\*([^*]+)\*\*/);
  if (firstBold) {
    return { decision: firstBold[1].trim(), body: text.replace(firstBold[0], '').replace(/^[—–\-:\s]+/, '').trim() };
  }
  return null;
}

export function MemoViewer({
  appId,
  memo,
  result,
  onMemoChange,
}: {
  appId: string;
  memo: MemoDraft;
  result?: AgentResult;
  onMemoChange: (updated: MemoDraft) => void;
}) {
  const decColor = result ? (CRDE_COLOR[result.crdeDecision] ?? '#e8edf5') : '#e8edf5';
  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const redFlags: string[] = [];
  if (result) {
    if (result.dtiActual > 0.4) redFlags.push(`DBR ${(result.dtiActual * 100).toFixed(1)}% exceeds RAC limit (40%)`);
    if (result.slikKol > 1) redFlags.push(`SLIK collectability ${result.slikKol} — substandard`);
    if (!result.amlClear) redFlags.push(`AML flag detected`);
    if (result.rulesTriggered.length > 0) redFlags.push(...result.rulesTriggered);
  }

  const hasRedFlags = redFlags.length > 0;
  const aiRec = extractAiRecommendation(memo.section8_rekomendasi);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
      {/* Header */}
      <div data-testid="memo-header" style={{ marginBottom: 20 }}>
        <div className="font-display text-xl font-bold uppercase text-text tracking-wide">
          CONSUMER CREDIT ANALYSIS MEMO
        </div>
        <div className="font-mono text-xs text-muted mt-2 space-y-0.5">
          <div>APPLICATION NO: {appId}</div>
          <div>DATE: {today.toUpperCase()}</div>
          <div>STATUS: AI DRAFT — PENDING ANALYST DECISION</div>
        </div>
      </div>

      {/* CRDE banner */}
      {result && (
        <div
          data-testid="crde-banner"
          style={{
            border: `1px solid ${decColor}`,
            padding: 12,
            marginBottom: 24,
            background: `${decColor}11`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-xs text-muted mb-1">CRDE RECOMMENDATION</div>
              <div className="font-display text-base font-bold uppercase" style={{ color: decColor }}>
                {result.crdeDecision}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs" style={{ color: RISK_COLOR[result.riskScore] }}>
                Risk: {result.riskScore}
              </div>
              <div className="font-mono text-xs text-muted">Score: {result.numericScore}/1000</div>
              <div className="font-mono text-xs text-muted">
                Rules: {result.rulesTriggered.length === 0 ? 'None' : result.rulesTriggered.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two column: Memo + Sidebar */}
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Main memo */}
        <div style={{ flex: 1 }}>
          {/* AI Recommendation — prominent card */}
          {aiRec && (
            <div
              data-testid="ai-recommendation"
              style={{
                border: `1px solid ${decColor}`,
                background: `${decColor}0d`,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <div className="font-display text-xs font-bold uppercase text-muted mb-2">AI Recommendation</div>
              <div className="font-display text-base font-bold uppercase" style={{ color: decColor, marginBottom: 8 }}>
                {aiRec.decision}
              </div>
              {aiRec.body && (
                <div className="font-mono text-sm text-text" style={{ lineHeight: 1.6 }}>
                  {renderMemoText(aiRec.body)}
                </div>
              )}
            </div>
          )}

          {/* Executive Summary */}
          {memo.executive_summary && (
            <div style={{ background: '#1e2840', border: '1px solid #2a3a52', padding: 16, marginBottom: 24 }}>
              <div className="font-display text-xs font-bold uppercase text-muted mb-2">Executive Summary</div>
              <div className="font-mono text-sm text-text" style={{ lineHeight: 1.6 }}>
                {renderMemoText(memo.executive_summary)}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {hasRedFlags && (
            <div
              style={{
                border: '1px solid #ef4444',
                background: '#2a1515',
                padding: 14,
                marginBottom: 24,
              }}
            >
              <div className="font-display text-xs font-bold uppercase text-red mb-2">⚠️ Red Flags Identified</div>
              <div className="space-y-1">
                {redFlags.map((flag, i) => (
                  <div key={i} className="font-mono text-xs text-text" style={{ paddingLeft: 12 }}>
                    • {flag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {SECTIONS.map((s, i) => (
            <SectionBlock
              key={s.key}
              idx={i}
              label={s.label}
              content={memo[s.key]}
              editable={s.key === 'section8_rekomendasi'}
              onChange={v => onMemoChange({ ...memo, [s.key]: v })}
            />
          ))}
        </div>

        {/* Sidebar — Key Metrics */}
        {result && (
          <div
            style={{
              width: 180,
              flexShrink: 0,
              position: 'sticky',
              top: 24,
              alignSelf: 'flex-start',
            }}
          >
            <div style={{ background: '#192033', border: '1px solid #2a3a52', padding: 16 }}>
              <div className="font-display text-xs font-bold uppercase text-muted mb-3">Key Metrics</div>
              <KeyMetric
                label="DBR"
                value={`${(result.dtiActual * 100).toFixed(1)}%`}
                pass={result.dtiActual <= 0.35 ? 'pass' : result.dtiActual <= 0.4 ? 'warn' : 'fail'}
              />
              <KeyMetric
                label="SLIK"
                value={`Kol.${result.slikKol}`}
                pass={result.slikKol === 1 ? 'pass' : result.slikKol === 2 ? 'warn' : 'fail'}
              />
              <KeyMetric
                label="AML"
                value={result.amlClear ? 'Clear' : 'Flag'}
                pass={result.amlClear ? 'pass' : 'fail'}
              />
              <KeyMetric
                label="Score"
                value={`${result.numericScore}`}
                pass={result.numericScore >= 750 ? 'pass' : result.numericScore >= 500 ? 'warn' : 'fail'}
              />
              <KeyMetric
                label="Rules"
                value={result.rulesTriggered.length}
                pass={result.rulesTriggered.length === 0 ? 'pass' : 'warn'}
              />

              <div style={{ borderTop: '1px solid #2a3a52', marginTop: 10, paddingTop: 10 }}>
                <div className="font-display text-xs font-bold uppercase text-muted mb-2">Decision</div>
                <div
                  className="font-display text-sm font-bold uppercase"
                  style={{ color: decColor }}
                >
                  {result.crdeDecision}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

