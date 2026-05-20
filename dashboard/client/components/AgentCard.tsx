import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AgentState, LoanSummary } from '../lib/types';
import { formatElapsed, formatRpShort, CRDE_COLOR, RISK_COLOR } from '../lib/format';

const DECISION_LABEL: Record<string, string> = {
  approve: 'APPROVED',
  reject:  'REJECTED',
  cancel:  'CANCELLED',
};
const DECISION_COLOR: Record<string, string> = {
  approve: '#22c55e',
  reject:  '#ef4444',
  cancel:  '#9ca3af',
};

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1 w-full" style={{ background: '#2a3a52' }}>
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${pct}%`, background: '#60a5fa' }}
      />
    </div>
  );
}

export function AgentCard({ appId, loan, state, screenshot }: {
  appId: string; loan?: LoanSummary; state: AgentState; screenshot?: string;
}) {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [showLive, setShowLive] = useState(false);

  useEffect(() => {
    if (state.status !== 'running') return;
    const t = setInterval(() => setElapsed(Date.now() - state.startedAt), 1000);
    return () => clearInterval(t);
  }, [state.status, state.status === 'running' ? state.startedAt : null]);

  const cardStyle: React.CSSProperties = {
    background: '#192033',
    border: '1px solid #2a3a52',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    opacity: state.status === 'decided' ? 0.5 : 1,
    cursor: state.status === 'ready' || state.status === 'decided' ? 'pointer' : 'default',
    transition: 'opacity 0.3s',
  };

  function handleClick() {
    if (state.status === 'ready' || state.status === 'decided') {
      navigate(`/review/${appId}`);
    }
  }

  return (
    <div
      data-testid={`agent-card-${appId}`}
      style={cardStyle}
      onClick={handleClick}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted">{appId}</span>
          {state.status === 'running' && (
            <span className="font-mono text-xs text-muted">{formatElapsed(elapsed)}</span>
          )}
          {state.status === 'ready' && (
            <span className="font-mono text-xs text-muted">{formatElapsed(state.elapsedMs)}</span>
          )}
        </div>
        <div className="font-display text-base font-semibold text-text mt-0.5">{loan?.debtor_name ?? appId}</div>
        {loan && (
          <div className="font-mono text-xs text-muted">
            {loan.product_type} · {formatRpShort(loan.amount_requested)}
          </div>
        )}
      </div>

      {/* RUNNING state */}
      {state.status === 'running' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="pulse-dot text-blue text-xs">●</span>
              <span className="font-display text-sm font-semibold uppercase text-blue tracking-wide">AGENT RUNNING</span>
            </div>
            {screenshot && (
              <button
                onClick={e => { e.stopPropagation(); setShowLive(v => !v); }}
                className="font-mono text-xs px-2 py-1 transition-colors"
                style={{
                  border: `1px solid ${showLive ? '#e8ff47' : '#2a3a52'}`,
                  color: showLive ? '#e8ff47' : '#8892a4',
                  background: 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#e8ff47'; e.currentTarget.style.color = '#e8ff47'; }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = showLive ? '#e8ff47' : '#2a3a52';
                  e.currentTarget.style.color = showLive ? '#e8ff47' : '#8892a4';
                }}
              >
                {showLive ? '✕ LIVE' : '👁 LIVE'}
              </button>
            )}
          </div>
          <div className="space-y-0.5 min-h-20 overflow-hidden">
            {state.logs.slice(-6).map((log, i) => {
              const isLast = i === Math.min(state.logs.length, 6) - 1;
              return (
                <div key={i} className="font-mono text-xs" style={{ color: isLast ? '#e8edf5' : '#8892a4' }}>
                  {isLast ? (
                    <><span>› {log}</span><span className="blink ml-0.5">▌</span></>
                  ) : (
                    <span>✓ {log}</span>
                  )}
                </div>
              );
            })}
          </div>
          <ProgressBar pct={state.pct} />
          <div className="font-mono text-xs text-muted">{state.pct}%</div>
        </>
      )}

      {/* READY state */}
      {state.status === 'ready' && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-green text-xs">✓</span>
            <span className="font-display text-sm font-semibold uppercase text-green tracking-wide">Complete</span>
          </div>
          <div>
            <div className="font-mono text-xs text-muted mb-1">CRDE RECOMMENDATION</div>
            <div
              className="font-display text-lg font-bold uppercase"
              style={{ color: CRDE_COLOR[state.result.crdeDecision] ?? '#f0f0f0' }}
            >
              {state.result.crdeDecision}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs" style={{ color: RISK_COLOR[state.result.riskScore] }}>
              Risk: {state.result.riskScore} · Score: {state.result.numericScore}/1000
            </div>
            <div className="font-mono text-xs text-muted">
              DSR: {(state.result.dtiActual * 100).toFixed(1)}% ·{' '}
              SLIK: Kol.{state.result.slikKol} ·{' '}
              AML: {state.result.amlClear ? 'Clear ✓' : 'Flag ⚠'}
            </div>
          </div>
          <button
            className="w-full py-2 font-ui font-semibold text-sm uppercase text-bg"
            style={{ background: '#e8ff47', border: 'none' }}
          >
            REVIEW & CHAT →
          </button>
        </>
      )}

      {/* DECIDED state */}
      {state.status === 'decided' && (
        <>
          <div
            className="font-display text-lg font-bold uppercase"
            style={{ color: DECISION_COLOR[state.decision] ?? '#f0f0f0' }}
          >
            ✓ {DECISION_LABEL[state.decision] ?? state.decision}
          </div>
          <div className="font-mono text-xs text-muted">
            {state.analystId} · {formatElapsed(Date.now() - new Date(state.decidedAt).getTime())} ago
          </div>
        </>
      )}

      {/* ERROR state */}
      {state.status === 'error' && (
        <>
          <div className="font-display text-sm font-bold uppercase text-red">⚠ ERROR</div>
          <div className="font-mono text-xs text-muted">{state.error}</div>
          {state.retryable && (
            <div className="font-mono text-xs" style={{ color: '#60a5fa' }}>Re-run the batch to retry</div>
          )}
        </>
      )}

      {/* Live browser view — inline */}
      {showLive && screenshot && (
        <div>
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Live browser view"
            style={{ width: '100%', border: '1px solid #2a3a52', display: 'block' }}
          />
          <div className="font-mono text-xs text-muted mt-1">Auto-refreshes every 2s</div>
        </div>
      )}
    </div>
  );
}

