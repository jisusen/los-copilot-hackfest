import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type AuditLog = {
  id: number;
  loan_id: string;
  actor: string;
  action: string;
  detail: string;
  created_at: string;
};

const ACTION_ICONS: Record<string, string> = {
  APPLICATION_SUBMITTED: '📄',
  CRDE_EVALUATED: '🤖',
  AML_SCREENED: '🔍',
  DECISION_APPROVED: '✅',
  DECISION_REJECTED: '❌',
  DECISION_CANCELLED: '🚫',
  ASSIGNED: '👤',
};

const ACTION_COLORS: Record<string, string> = {
  APPLICATION_SUBMITTED: '#1a3a5c',
  CRDE_EVALUATED: '#2d5a8e',
  AML_SCREENED: '#c47d0e',
  DECISION_APPROVED: '#1a7f4b',
  DECISION_REJECTED: '#b91c1c',
  DECISION_CANCELLED: '#6b7c93',
  ASSIGNED: '#1a3a5c',
};

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function AuditLogTab({ loanId }: { loanId: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ logs: AuditLog[] }>(`/api/loans/${loanId}/audit`)
      .then(data => { setLogs(data.logs); setLoading(false); })
      .catch(() => setLoading(false));
  }, [loanId]);

  if (loading) {
    return <div data-testid="tab-content-audit-log" className="p-8 text-center text-muted text-sm">Loading audit trail...</div>;
  }

  return (
    <div data-testid="tab-content-audit-log">
      <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Application Audit Trail</h3>
      <div className="bg-white border border-border rounded-lg p-5">
        {logs.length === 0 ? (
          <div className="text-center text-muted text-sm py-8">No audit events recorded.</div>
        ) : (
          <div className="space-y-0">
            {logs.map((log, i) => {
              const color = ACTION_COLORS[log.action] ?? '#6b7c93';
              const isLast = i === logs.length - 1;
              return (
                <div key={log.id} className="flex gap-4 relative" style={{ paddingBottom: isLast ? 0 : 16 }}>
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-4 top-8 bottom-0 w-px" style={{ background: '#d1d9e0' }} />
                  )}
                  {/* Icon dot */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ background: `${color}15`, border: `2px solid ${color}` }}
                  >
                    {ACTION_ICONS[log.action] ?? '•'}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-text">{formatAction(log.action)}</span>
                      <span className="text-xs text-muted">{formatTime(log.created_at)}</span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      Actor: <span className="font-mono text-text">{log.actor}</span>
                    </div>
                    {log.detail && (
                      <div className="text-sm text-text mt-1">{log.detail}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
