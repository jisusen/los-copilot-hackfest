import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import type { Decision } from '../lib/types';

const BTNS: { decision: Decision; label: string; bg: string; color: string }[] = [
  { decision: 'approve', label: '✓ APPROVE',  bg: '#22c55e', color: '#0f1623' },
  { decision: 'reject',  label: '✗ REJECT',   bg: '#ef4444', color: '#ffffff' },
  { decision: 'cancel',  label: '⊘ CANCEL',   bg: '#6b7280', color: '#ffffff' },
];

const LABEL: Record<Decision, string> = {
  approve: 'APPROVING',
  reject:  'REJECTING',
  cancel:  'CANCELLING',
};

export function DecisionBar({
  appId,
  debtorName,
}: {
  appId: string;
  debtorName: string;
}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState<Decision | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (!pending || loading) return;
    setLoading(true);
    try {
      await apiFetch(`/api/decisions/${appId}`, {
        method: 'POST',
        body: JSON.stringify({ decision: pending, note, analystId: 'analyst01' }),
      });
      navigate('/');
    } catch {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Sticky bar */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#192033',
        borderTop: '1px solid #2a3a52', padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 12, zIndex: 10,
      }}>
        <span className="font-display text-sm font-bold uppercase text-muted tracking-wide">FINAL DECISION:</span>
        {BTNS.map(b => (
          <button
            key={b.decision}
            data-testid={`btn-${b.decision}`}
            onClick={() => setPending(b.decision)}
            className="font-ui font-semibold text-sm uppercase"
            style={{
              padding: '8px 16px', background: b.bg, color: b.color,
              border: 'none', cursor: 'pointer',
            }}
          >
            {b.label}
          </button>
        ))}
        <input
          data-testid="decision-note-input"
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Optional note..."
          className="font-mono text-sm flex-1"
          style={{
            background: '#1e2840', border: '1px solid #2a3a52',
            padding: '8px 12px', color: '#e8edf5', outline: 'none',
          }}
        />
      </div>

      {/* Confirmation modal */}
      {pending && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{ background: '#192033', border: '1px solid #2a3a52', padding: 32, maxWidth: 480, width: '100%' }}>
            <div className="font-display text-lg font-bold uppercase text-text mb-4">CONFIRM DECISION</div>
            <div className="font-mono text-sm text-muted mb-4">
              You are <span className="text-text font-semibold">{LABEL[pending]}</span> application:
            </div>
            <div className="font-mono text-sm text-text mb-6" style={{ padding: '12px 16px', background: '#1e2840', border: '1px solid #2a3a52' }}>
              {appId} — {debtorName}
            </div>
            {note && (
              <div className="font-mono text-xs text-muted mb-4">Note: {note}</div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                data-testid="btn-confirm-decision"
                onClick={confirm}
                disabled={loading}
                className="font-ui font-semibold text-sm uppercase"
                style={{ flex: 1, padding: '10px', background: '#e8ff47', color: '#0f0f0f', border: 'none', cursor: loading ? 'default' : 'pointer' }}
              >
                {loading ? 'PROCESSING...' : 'CONFIRM'}
              </button>
              <button
                onClick={() => setPending(null)}
                className="font-ui font-semibold text-sm uppercase"
                style={{ flex: 1, padding: '10px', background: 'transparent', color: '#e8edf5', border: '1px solid #2a3a52', cursor: 'pointer' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

