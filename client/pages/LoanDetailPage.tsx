import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { TabNav } from '../components/TabNav';
import { ProfilDebiturTab } from '../components/tabs/ProfilDebiturTab';
import { DataKeuanganTab } from '../components/tabs/DataKeuanganTab';
import { SlikOjkTab } from '../components/tabs/SlikOjkTab';
import { AmlFraudTab } from '../components/tabs/AmlFraudTab';
import { CrdeResultTab } from '../components/tabs/CrdeResultTab';
import { AgunanTab } from '../components/tabs/AgunanTab';
import { PermohonanKreditTab } from '../components/tabs/PermohonanKreditTab';
import { AuditLogTab } from '../components/tabs/AuditLogTab';
import { DataSummaryTab } from '../components/tabs/DataSummaryTab';
import { PrintMemoView } from '../components/PrintMemoView';
import { NotesTab } from '../components/tabs/NotesTab';
import { apiFetch, formatRp } from '../lib/api';
import { getUser } from '../lib/auth';

type LoanDetail = {
  application: {
    id: string; status: string; product_type: string; amount_requested: number;
    tenor_months: number; interest_rate: number; loan_purpose: string;
    branch: string; marketing_officer: string; created_at: string;
  };
  debtor: any;
  financials: any;
  slik: any;
  amlFraud: any;
  crde: any;
  collateral: any;
};

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'Approved':     { bg: '#e3efe6', color: '#1f6b3a', border: '#1f6b3a' },
  'Rejected':     { bg: '#fbe6e6', color: '#a83232', border: '#a83232' },
  'Under Review': { bg: '#fff1d8', color: '#b46a00', border: '#b46a00' },
  'Cancelled':    { bg: '#f6f6f4', color: '#8a8a8a', border: '#d8d8d8' },
};

const AI_AGENT_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  'APPROVED':         { bg: '#e3efe6', color: '#1f6b3a', border: '#1f6b3a' },
  'COMMITTEE REVIEW': { bg: '#fff1d8', color: '#b46a00', border: '#b46a00' },
  'REJECTED':         { bg: '#fbe6e6', color: '#a83232', border: '#a83232' },
};

const STAGE_ACTIONS = [
  { label: 'Approve', next: 'Approved',  bg: '#22C55E', color: '#fff' },
  { label: 'Reject',  next: 'Rejected',  bg: '#EF4444', color: '#fff' },
  { label: 'Cancel',  next: 'Cancelled', bg: 'transparent', color: '#4a4a4a', border: '1px solid #d8d8d8' },
];

function Pill({ text, style }: { text: string; style: { bg: string; color: string; border: string } }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 8px',
      borderRadius: 20,
      background: style.bg,
      border: `1px solid ${style.border}`,
      fontSize: 11,
      fontWeight: 500,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ label: string; next: string; bg: string } | null>(null);
  const [successAction, setSuccessAction] = useState<string | null>(null);
  const [assignedAnalyst, setAssignedAnalyst] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [hasAiMemo, setHasAiMemo] = useState(false);

  const activeTab = searchParams.get('tab') ?? 'data-summary';
  const user = getUser();

  useEffect(() => {
    if (id) {
      apiFetch<{ notes: { author_type: string }[] }>(`/api/loans/${id}/notes`)
        .then(data => setHasAiMemo(data.notes.some(n => n.author_type === 'agent')))
        .catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    apiFetch<{ loan: LoanDetail }>(`/api/loans/${id}`)
      .then(data => {
        setLoan(data.loan);
        setAssignedAnalyst(data.loan.application.analyst_id ?? null);
        setLoading(false);
        // Auto-assign if not already assigned
        if (!data.loan.application.analyst_id && user?.username) {
          apiFetch(`/api/loans/${id}/assign`, {
            method: 'POST',
            body: JSON.stringify({ analystId: user.username }),
          }).then((res: any) => {
            if (res?.assigned?.analyst_id) {
              setAssignedAnalyst(res.assigned.analyst_id);
              setLoan(prev => prev ? {
                ...prev,
                application: { ...prev.application, analyst_id: res.assigned.analyst_id }
              } : prev);
            }
          }).catch(() => {});
        }
      })
      .catch(() => { setError('Application not found.'); setLoading(false); });
  }, [id]);

  async function applyAction(next: string) {
    if (!id || actionLoading) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/loans/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      const data = await apiFetch<{ loan: LoanDetail }>(`/api/loans/${id}`);
      setLoan(data.loan);
      setSuccessAction(next);
    } catch {
      // silently ignore — status display will be stale until next load
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: '#8a8a8a' }}>
          Loading application data...
        </div>
      </Layout>
    );
  }

  if (error || !loan) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: '#a83232' }}>
          {error || 'An error occurred.'}
        </div>
      </Layout>
    );
  }

  const { application, debtor, financials, slik, amlFraud, crde, collateral } = loan;
  const statusStyle = STATUS_STYLES[application.status] ?? { bg: '#f6f6f4', color: '#8a8a8a', border: '#d8d8d8' };
  const aiAgentStyle = AI_AGENT_STYLES[crde?.decision] ?? null;
  const isUnderwriting = application.status === 'Under Review';

  // AML warning check
  const hasAmlFlag = amlFraud && (
    amlFraud.pep_status || amlFraud.dttot_match || amlFraud.un_sanctions_match || amlFraud.adverse_media_match
  );

  return (
    <Layout>
      {/* Breadcrumb row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => navigate('/loans')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '0.375rem 0.75rem',
            background: '#FFFFFF',
            border: '1px solid #8B1A1A',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: '#8B1A1A',
            cursor: 'pointer',
            fontFamily: 'Open Sans, system-ui, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          Back
        </button>

        <div style={{ marginLeft: 'auto' }} />
      </div>

      {/* AML warning */}
      {hasAmlFlag && (
        <div
          data-testid="aml-warning-banner"
          style={{
            border: '1px solid #a83232',
            background: '#fbe6e6',
            padding: 10,
            fontSize: 12,
            color: '#a83232',
            marginBottom: 16,
          }}
        >
          Warning: This application has AML/compliance flags — PEP or DTTOT match detected. Manual review required.
        </div>
      )}

      {/* Application info card */}
      <div data-testid="application-info-card" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '16px 20px',
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span data-testid="loan-detail-id" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
                {application.id}
              </span>
              <span data-testid="loan-detail-status">
                <Pill text={application.status} style={statusStyle} />
              </span>
              {crde?.decision && aiAgentStyle && (
                <span data-testid="loan-detail-crde-badge">
                  <Pill text={crde.decision} style={aiAgentStyle} />
                </span>
              )}
            </div>
            <div data-testid="loan-detail-debtor-name" style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.01em' }}>
              {debtor?.full_name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3"/></svg>
                {application.product_type}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {formatRp(application.amount_requested)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {application.tenor_months} months
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                {application.interest_rate}%
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="detail-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowPrint(true)}
              className="btn-print"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #14B8A6',
                borderRadius: 10,
                height: 38,
                padding: '0 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Open Sans, system-ui, sans-serif',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(20, 184, 166, 0.15)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(20, 184, 166, 0.15)';
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print Memo
            </button>
            {isUnderwriting && STAGE_ACTIONS.filter(a => a.label !== 'Cancel').map(action => {
              const isApprove = action.label === 'Approve';
              const icon = isApprove
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
              return (
                <button
                  key={action.next}
                  data-testid={`btn-action-${action.next.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setConfirmAction({ label: action.label, next: action.next, bg: action.bg })}
                  className={isApprove ? 'btn-approve' : 'btn-reject'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: isApprove
                      ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                      : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    height: 38,
                    padding: '0 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Open Sans, system-ui, sans-serif',
                    transition: 'all 0.2s ease',
                    boxShadow: isApprove
                      ? '0 2px 8px rgba(34, 197, 94, 0.3)'
                      : '0 2px 8px rgba(239, 68, 68, 0.3)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = isApprove
                      ? '0 4px 12px rgba(34, 197, 94, 0.4)'
                      : '0 4px 12px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isApprove
                      ? '0 2px 8px rgba(34, 197, 94, 0.3)'
                      : '0 2px 8px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  {icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI memo banner */}
      {hasAiMemo && activeTab !== 'notes' && (
        <div style={{
          background: '#f0f3f8',
          border: '1px solid #c4d0e0',
          borderLeft: '3px solid #8B1A1A',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 12,
          fontSize: 12,
          color: '#8B1A1A',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 10, fontWeight: 600, background: '#8B1A1A', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>AI</span>
          <span>AI analysis memo is available for this application.</span>
          <button
            onClick={() => navigate(`/loans/${application.id}?tab=notes`)}
            style={{ marginLeft: 'auto', fontSize: 11, color: '#8B1A1A', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontFamily: "'Open Sans', sans-serif" }}
          >
            View in Notes & Memo →
          </button>
        </div>
      )}

      {/* Assignment info */}
      {assignedAnalyst && (
        <div style={{
          background: '#f0f3f8',
          border: '1px solid #c4d0e0',
          borderLeft: '3px solid #8B1A1A',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 12,
          fontSize: 12,
          color: '#8B1A1A',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <svg width="14" height="14" fill="none" stroke="#8B1A1A" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Under review by:</span>
          <span style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 600 }}>{assignedAnalyst}</span>
          {application.assigned_at && (
            <span style={{ marginLeft: 'auto', color: '#4a4a4a', fontSize: 11 }}>
              Assigned: {new Date(application.assigned_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
        </div>
      )}

      {/* Tab bar + content */}
      <div className="tab-section">
        <TabNav loanId={application.id} activeTab={activeTab} />
        <div className="tab-content-area" style={{
          padding: 20,
          border: '1px solid #d8d8d8',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          backgroundColor: '#ffffff',
        }}>
          {activeTab === 'data-summary'      && <DataSummaryTab application={application} debtor={debtor} financials={financials} slik={slik} aml={amlFraud} crde={crde} collateral={collateral} />}
          {activeTab === 'profil-debitur'    && debtor    && <ProfilDebiturTab debtor={debtor} />}
          {activeTab === 'data-keuangan'     && financials && <DataKeuanganTab financials={financials} />}
          {activeTab === 'slik-ojk'          && slik      && <SlikOjkTab slik={slik} />}
          {activeTab === 'aml-fraud'         && amlFraud  && <AmlFraudTab aml={amlFraud} />}
          {activeTab === 'hasil-crde'        && crde      && <CrdeResultTab crde={crde} />}
          {activeTab === 'agunan'            && collateral && <AgunanTab collateral={collateral} />}
          {activeTab === 'permohonan-kredit' && <PermohonanKreditTab application={application} financials={financials} />}
          {activeTab === 'audit-log'         && <AuditLogTab loanId={application.id} status={application.status} />}
          {activeTab === 'notes'             && <NotesTab loanId={application.id} />}
        </div>
      </div>

      {/* Print memo modal */}
      {showPrint && loan && (
        <PrintMemoView loan={loan} onClose={() => setShowPrint(false)} />
      )}

      {/* Success modal */}
      {successAction && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="bg-white rounded-2xl p-7 max-w-md w-[90%] shadow-2xl" style={{ textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: successAction === 'Approved'
                ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: successAction === 'Approved'
                ? '0 8px 24px rgba(34, 197, 94, 0.3)'
                : '0 8px 24px rgba(239, 68, 68, 0.3)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {successAction === 'Approved' ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                )}
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Application {successAction === 'Approved' ? 'Approved' : 'Rejected'}
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: '1.6', marginBottom: 24 }}>
              <strong style={{ color: '#1e40af' }}>{application.id}</strong> has been successfully{' '}
              {successAction === 'Approved' ? 'approved' : 'rejected'}.
            </p>
            <button
              onClick={() => navigate('/loans')}
              className="w-full py-2.5 text-sm font-semibold rounded-xl text-white transition-colors"
              style={{
                background: successAction === 'Approved'
                  ? 'linear-gradient(175deg, #22C55E 0%, #16A34A 100%)'
                  : 'linear-gradient(175deg, rgba(207, 0, 0, 1) 0%, rgba(89, 0, 0, 1) 100%)',
                fontFamily: "'Open Sans', system-ui, sans-serif",
              }}
            >
              Back to Queue
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmAction && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }} onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-2xl p-7 max-w-md w-[90%] shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={confirmAction.label === 'Approve' ? '/img/approve.png' : '/img/reject.png'} alt="Confirmation" className="flex items-center justify-center mx-auto mb-4" style={{width:"60%"}} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', textAlign: 'center', marginBottom: 8 }}>
              {confirmAction.label === 'Approve' ? 'Approve Application?' : 'Reject Application?'}
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: '1.6', marginBottom: 24 }}>
              You are about to <strong style={{ color: confirmAction.label === 'Approve' ? '#16A34A' : '#DC2626' }}>{confirmAction.label.toLowerCase()}</strong> application{' '}
              <strong style={{ color: '#1e40af' }}>{application.id}</strong> for{' '}
              <strong style={{ color: '#0f172a' }}>{debtor?.full_name}</strong>. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                data-testid="btn-confirm-action"
                onClick={() => applyAction(confirmAction.next)}
                disabled={actionLoading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors"
                style={{
                  background: confirmAction.label === 'Approve'
                    ? 'linear-gradient(175deg, #22C55E 0%, #16A34A 100%)'
                    : 'linear-gradient(175deg, rgba(207, 0, 0, 1) 0%, rgba(89, 0, 0, 1) 100%)',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1,
                  fontFamily: "'Open Sans', system-ui, sans-serif",
                }}
              >
                {actionLoading ? 'Processing...' : `Yes, ${confirmAction.label}`}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn-print:hover {
          background: #F0FDFA !important;
        }
        .btn-approve:hover {
          background: #16A34A !important;
          box-shadow: 0 2px 8px rgba(34,197,94,0.35) !important;
        }
        .btn-reject:hover {
          background: #DC2626 !important;
          box-shadow: 0 2px 8px rgba(239,68,68,0.35) !important;
        }
      `}</style>

    </Layout>
  );
}
