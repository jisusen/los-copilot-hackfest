import React from 'react';
import type { LoanSummary, AgentState } from '../lib/types';
import { formatRpShort, CRDE_COLOR, RISK_COLOR } from '../lib/format';

const CRDE_SHORT: Record<string, string> = {
  'APPROVED':         'APPROVED',
  'COMMITTEE REVIEW': 'REFER',
  'REJECTED':         'REJECTED',
};

type RowState = 'idle' | 'selected' | 'running' | 'ready' | 'decided' | 'error';

function getRowState(appId: string, selected: Set<string>, sessions: Map<string, AgentState>): RowState {
  const session = sessions.get(appId);
  if (session) return session.status as RowState;
  if (selected.has(appId)) return 'selected';
  return 'idle';
}

export function LoanQueue({
  loans,
  selected,
  sessions,
  onToggle,
}: {
  loans: LoanSummary[];
  selected: Set<string>;
  sessions: Map<string, AgentState>;
  onToggle: (id: string) => void;
}) {
  if (loans.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }}>
        <div style={{ fontSize: 28, color: '#475569' }}>◎</div>
        <div className="font-display text-sm font-semibold uppercase text-muted">No pending applications</div>
        <div className="font-mono text-xs text-muted" style={{ textAlign: 'center', lineHeight: 1.5 }}>
          All applications have been processed or are awaiting LOS submission.
        </div>
      </div>
    );
  }

  return (
    <div data-testid="loan-queue-list" style={{ flex: 1, overflow: 'auto' }}>
      {loans.map(loan => {
        const rowState = getRowState(loan.id, selected, sessions);
        const isRunning = rowState === 'running';
        const isReady = rowState === 'ready';
        const isDecided = rowState === 'decided';
        const isError = rowState === 'error';
        const isActive = isRunning || isReady || isDecided || isError;
        const isSelected = rowState === 'selected';

        const session = sessions.get(loan.id);
        const agentResult = session?.status === 'ready' ? session.result : undefined;

        return (
          <div
            key={loan.id}
            data-testid={`loan-row-${loan.id}`}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #2a3a52',
              borderLeft: isSelected ? '3px solid #e8ff47'
                : isRunning ? '3px solid #60a5fa'
                : isReady ? '3px solid #22c55e'
                : isError ? '3px solid #ef4444'
                : '3px solid transparent',
              background: isSelected ? '#1a2b14'
                : isRunning ? '#0f1e33'
                : 'transparent',
              opacity: isDecided ? 0.45 : 1,
              transition: 'background 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              {/* Checkbox */}
              <div style={{ paddingTop: 2 }}>
                <input
                  type="checkbox"
                  data-testid={`loan-checkbox-${loan.id}`}
                  checked={isSelected}
                  disabled={isActive}
                  onChange={() => !isActive && onToggle(loan.id)}
                  style={{ accentColor: '#e8ff47', cursor: isActive ? 'default' : 'pointer' }}
                />
              </div>

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Row 1: ID + agent status indicator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span className="font-mono text-xs text-muted">{loan.id}</span>
                  <div data-testid={`loan-status-${loan.id}`}>
                    {isRunning && (
                      <span className="pulse-dot font-mono text-xs text-blue">● RUNNING</span>
                    )}
                    {isReady && (
                      <span className="font-mono text-xs text-green">✓ READY</span>
                    )}
                    {isDecided && (
                      <span className="font-mono text-xs text-muted">✓ DECIDED</span>
                    )}
                    {isError && (
                      <span className="font-mono text-xs text-red">⚠ ERROR</span>
                    )}
                  </div>
                </div>

                {/* Row 2: Debtor name */}
                <div className="font-ui text-sm font-semibold text-text truncate" style={{ marginBottom: 4 }}>
                  {loan.debtor_name}
                </div>

                {/* Row 3: Product + amount */}
                <div className="font-mono text-xs text-muted" style={{ marginBottom: 6 }}>
                  {loan.product_type} · {formatRpShort(loan.amount_requested)}
                </div>

                {/* Row 4: Status tag + CRDE (after agent completes) */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span
                    className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      background: '#1e3a52',
                      color: '#60a5fa',
                      border: '1px solid #2a4a6a',
                    }}
                  >
                    Under Review
                  </span>

                  {/* CRDE result badge — shown after agent finishes */}
                  {agentResult && (
                    <span
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                      style={{
                        color: CRDE_COLOR[agentResult.crdeDecision] ?? '#8892a4',
                        border: `1px solid ${CRDE_COLOR[agentResult.crdeDecision] ?? '#2a3a52'}`,
                        background: `${CRDE_COLOR[agentResult.crdeDecision] ?? '#2a3a52'}20`,
                      }}
                    >
                      {CRDE_SHORT[agentResult.crdeDecision] ?? agentResult.crdeDecision}
                    </span>
                  )}
                </div>

                {/* Analysis Results Key Stats */}
                {agentResult && (
                  <div className="mt-2.5 p-2.5 rounded-lg" style={{ background: '#0d1520', border: '1px solid #1e2d3d' }}>
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Risk Level */}
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLOR[agentResult.riskScore] ?? '#8892a4' }} />
                        <span className="font-mono text-[10px] font-bold uppercase" style={{ color: RISK_COLOR[agentResult.riskScore] ?? '#8892a4' }}>
                          {agentResult.riskScore}
                        </span>
                      </div>
                      
                      <span className="text-[10px]" style={{ color: '#2a4a6a' }}>|</span>
                      
                      {/* Score */}
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px]" style={{ color: '#6b7c93' }}>Score</span>
                        <span className="font-mono text-[10px] font-bold" style={{ color: agentResult.numericScore >= 750 ? '#22c55e' : agentResult.numericScore >= 500 ? '#f59e0b' : '#ef4444' }}>
                          {agentResult.numericScore}
                        </span>
                      </div>
                      
                      <span className="text-[10px]" style={{ color: '#2a4a6a' }}>|</span>
                      
                      {/* DSR */}
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px]" style={{ color: '#6b7c93' }}>DBR</span>
                        <span className="font-mono text-[10px] font-bold" style={{ color: agentResult.dtiActual > 0.4 ? '#ef4444' : agentResult.dtiActual > 0.35 ? '#f59e0b' : '#22c55e' }}>
                          {(agentResult.dtiActual * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      <span className="text-[10px]" style={{ color: '#2a4a6a' }}>|</span>
                      
                      {/* SLIK KOL */}
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px]" style={{ color: '#6b7c93' }}>KOL</span>
                        <span className="font-mono text-[10px] font-bold" style={{ color: agentResult.slikKol > 2 ? '#ef4444' : agentResult.slikKol > 1 ? '#f59e0b' : '#22c55e' }}>
                          {agentResult.slikKol}
                        </span>
                      </div>
                      
                      <span className="text-[10px]" style={{ color: '#2a4a6a' }}>|</span>
                      
                      {/* AML */}
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px]" style={{ color: '#6b7c93' }}>AML</span>
                        <span className="font-mono text-[10px] font-bold" style={{ color: agentResult.amlClear ? '#22c55e' : '#ef4444' }}>
                          {agentResult.amlClear ? 'CLEAR' : 'FLAG'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Rules triggered */}
                    {agentResult.rulesTriggered.length > 0 && (
                      <div className="mt-2 pt-2" style={{ borderTop: '1px solid #1e2d3d' }}>
                        <div className="flex flex-wrap gap-1">
                          {agentResult.rulesTriggered.slice(0, 3).map((r, i) => (
                            <span key={i} className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#1a2b3d', color: '#8892a4', border: '1px solid #2a4a6a' }}>
                              {r}
                            </span>
                          ))}
                          {agentResult.rulesTriggered.length > 3 && (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ color: '#6b7c93' }}>
                              +{agentResult.rulesTriggered.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

