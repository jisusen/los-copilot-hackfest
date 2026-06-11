import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../../lib/api';

type AuditLog = {
  id: number;
  app_id: string;
  actor: string;
  action: string;
  detail: string;
  created_at: string;
};

const STEP_CONFIG = [
  { step: 1, label: 'Submission', actions: ['APPLICATION_SUBMITTED'] },
  { step: 2, label: 'Document & SLIK', actions: ['DOCUMENTS_VERIFIED', 'SLIK_CHECKED'] },
  { step: 3, label: 'AML & CRDE', actions: ['AML_SCREENED', 'CRDE_EVALUATED'] },
  { step: 4, label: 'Manual Review', actions: ['ASSIGNED', 'MANUAL_REVIEW'] },
  { step: 5, label: 'Final Decision', actions: ['DECISION_APPROVED', 'DECISION_REJECTED'] },
];

function getCompletedStep(logs: AuditLog[], status: string): number {
  if (status === 'Approved' || status === 'Rejected') return 5;
  if (status === 'Under Review') return 4;
  if (status === 'Submitted') return 2;
  if (status === 'Draft') return 0;
  
  let completed = 0;
  for (const s of STEP_CONFIG) {
    const anyFound = s.actions.some(a => logs.some(log => log.action === a));
    if (anyFound) completed = s.step;
    else break;
  }
  return completed;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function AuditLogTab({ loanId, status }: { loanId: string; status: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchLogs = useCallback(async () => {
    try {
      const data = await apiFetch<{ logs: AuditLog[] }>(`/api/loans/${loanId}/audit`);
      setLogs(data.logs);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const completedStep = getCompletedStep(logs, status);
  const isApproved = status === 'Approved' || logs.some(l => l.action === 'DECISION_APPROVED');
  const isRejected = status === 'Rejected' || logs.some(l => l.action === 'DECISION_REJECTED');
  const isTerminal = isApproved || isRejected;
  const isProcessing = status === 'Under Review';

  if (loading) {
    return (
      <div data-testid="tab-content-audit-log" className="p-8 text-center text-muted text-sm">
        Loading audit trail...
      </div>
    );
  }

  return (
    <div data-testid="tab-content-audit-log">
      <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>
        Application Audit Trail
      </h3>

      {/* Stepper */}
      <div className="audit-stepper" style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 0,
        padding: '24px 0 32px',
      }}>
        {STEP_CONFIG.map((s, i) => (
          <React.Fragment key={s.step}>
            {i > 0 && (
              <div className="audit-stepper-line" style={{
                width: 80,
                height: 2,
                background: completedStep >= s.step ? '#22C55E' : isRejected && i <= completedStep ? '#EF4444' : '#d1d5db',
                marginTop: 18,
                flexShrink: 0,
                transition: 'background 0.5s ease',
              }} />
            )}
            <div className="audit-stepper-step" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: `2px solid ${
                  completedStep > s.step ? '#22C55E' :
                  completedStep === s.step && isRejected ? '#EF4444' :
                  completedStep === s.step && !isTerminal ? '#8B1A1A' :
                  completedStep === s.step && isTerminal ? '#22C55E' :
                  '#d1d5db'
                }`,
                background: completedStep > s.step ? '#22C55E' :
                  completedStep === s.step && isRejected ? '#EF4444' :
                  completedStep === s.step && isTerminal ? '#22C55E' :
                  '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: completedStep > s.step ? '#ffffff' :
                  completedStep === s.step && (isRejected || isTerminal) ? '#ffffff' :
                  completedStep === s.step ? '#8B1A1A' :
                  '#9CA3AF',
                boxShadow: completedStep === s.step && !isTerminal ?
                  '0 0 0 4px rgba(139, 26, 26, 0.15)' : 'none',
                transition: 'all 0.3s ease',
              }}>
                {completedStep > s.step ? '✓' :
                 completedStep === s.step && isRejected ? '✗' :
                 completedStep === s.step && isTerminal ? '✓' :
                 completedStep === s.step && s.step < 4 && isProcessing ? (
                   <div style={{
                     width: 18,
                     height: 18,
                     border: '2px solid rgba(139, 26, 26, 0.2)',
                     borderTopColor: '#8B1A1A',
                     borderRadius: '50%',
                     animation: 'auditSpin 0.7s linear infinite',
                   }} />
                 ) : s.step}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: completedStep > s.step ? '#22C55E' :
                  completedStep === s.step && isRejected ? '#EF4444' :
                  completedStep === s.step ? '#8B1A1A' :
                  '#6B7280',
                textAlign: 'center',
                marginTop: 8,
                maxWidth: 90,
                fontWeight: completedStep === s.step ? 600 : 400,
              }}>
                {s.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <style>{`
        @keyframes auditSpin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Review Result Banner */}
      {isTerminal && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: -8,
          marginBottom: 20,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 9999,
            background: isApproved ? '#DCFCE7' : '#FEE2E2',
            color: isApproved ? '#16A34A' : '#DC2626',
            fontWeight: 600,
            fontSize: 14,
          }}>
            {isApproved ? 'Approved' : 'Rejected'}
            <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>
              {logs.find(l => l.action === (isApproved ? 'DECISION_APPROVED' : 'DECISION_REJECTED'))?.actor ?? ''}
            </span>
          </div>
        </div>
      )}

      {/* Audit Log Cards */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center text-muted text-sm py-8">No audit events recorded.</div>
        ) : (
          logs.map((log, i) => {
            const isProcessing_log = log.action === 'MANUAL_REVIEW' && !isTerminal;
            const stepLabel = STEP_CONFIG.find(s => s.actions.includes(log.action))?.label ?? '—';
            return (
              <div
                key={log.id}
                className="rounded-xl border px-4 py-3"
                style={{
                  borderColor: '#e2e8f0',
                  background: isProcessing_log ? '#FFFBEB' : '#ffffff',
                  animation: i === logs.length - 1 ? 'slideIn 0.3s ease' : 'none',
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-semibold" style={{ color: '#64748B' }}>
                    {stepLabel}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: '#94A3B8' }}>
                    #{i + 1}
                  </span>
                </div>
                <div className="text-sm font-medium mb-2" style={{ color: '#1E293B' }}>
                  {formatAction(log.action)}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: '#94A3B8' }}>
                    <span>{log.actor}</span>
                    <span>·</span>
                    <span>{formatTime(log.created_at)}</span>
                  </div>
                  {isTerminal && log.action === 'DECISION_APPROVED' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#16A34A' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                      Approved
                    </span>
                  ) : isTerminal && log.action === 'DECISION_REJECTED' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#DC2626' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                      Rejected
                    </span>
                  ) : isProcessing_log ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#D97706' }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block',
                        animation: 'blink 0.8s ease-in-out infinite',
                      }} />
                      In Review
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#16A34A' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
