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

const STAGE_ACTIONS = [
  { label: 'Approve', next: 'Approved',  bg: '#1f6b3a', color: '#fff' },
  { label: 'Reject',  next: 'Rejected',  bg: '#a83232', color: '#fff' },
  { label: 'Cancel',  next: 'Cancelled', bg: 'transparent', color: '#4a4a4a', border: '1px solid #d8d8d8' },
];

function Pill({ text, style }: { text: string; style: { bg: string; color: string; border: string } }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 8px',
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
  const [showPrint, setShowPrint] = useState(false);
  const [hasAiMemo, setHasAiMemo] = useState(false);
  const [toast, setToast] = useState<{ text: string; bg: string } | null>(null);

  const activeTab = searchParams.get('tab') ?? 'profil-debitur';

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
        setLoading(false);
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
      const s = STAGE_ACTIONS.find(a => a.next === next)!;
      setToast({ text: `Application ${next}`, bg: s.bg });
      setTimeout(() => setToast(null), 3500);
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
  const isUnderwriting = application.status === 'Under Review';

  // AML warning check
  const hasAmlFlag = amlFraud && (amlFraud.is_pep || amlFraud.dttot_match || amlFraud.adverse_media);

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
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 12,
            color: '#4a4a4a',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          ‹ Task List
        </button>
        <span style={{ color: '#b8b8b8', fontSize: 12 }}>·</span>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: '#1f3b5c' }}>
          {application.id}
        </span>
        <span style={{ color: '#b8b8b8', fontSize: 12 }}>·</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>
          {debtor?.full_name}
        </span>
        <span style={{ color: '#b8b8b8', fontSize: 12 }}>·</span>
        <span style={{ fontSize: 11, color: '#8a8a8a' }}>
          {application.product_type} · {formatRp(application.amount_requested)}
        </span>

        {/* Right side: status pill */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            data-testid="loan-detail-status"
          >
            <Pill text={application.status} style={statusStyle} />
          </span>
        </div>
      </div>

      {/* Detail header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              data-testid="loan-detail-id"
              style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, fontWeight: 500, color: '#1f3b5c' }}
            >
              {application.id}
            </span>
          </div>
          <div
            data-testid="loan-detail-debtor-name"
            style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}
          >
            {debtor?.full_name}
          </div>
          {/* Agent trace */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            color: '#8a8a8a',
            fontFamily: '"IBM Plex Mono", monospace',
            marginTop: 6,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1f3b5c', flexShrink: 0 }} />
            last reviewed by agent · {new Date(application.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setShowPrint(true)}
            style={{
              background: 'transparent',
              color: '#4a4a4a',
              border: '1px solid #d8d8d8',
              height: 32,
              padding: '0 14px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Print Memo
          </button>
          {isUnderwriting && STAGE_ACTIONS.map(action => (
            <button
              key={action.next}
              data-testid={`btn-action-${action.next.toLowerCase().replace(' ', '-')}`}
              onClick={() => setConfirmAction({ label: action.label, next: action.next, bg: action.bg })}
              style={{
                background: action.bg,
                color: action.color,
                border: action.border ?? 'none',
                height: 32,
                padding: '0 14px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
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

      {/* AI memo banner */}
      {hasAiMemo && activeTab !== 'notes' && (
        <div style={{
          background: '#f0f3f8',
          border: '1px solid #c4d0e0',
          borderLeft: '3px solid #1f3b5c',
          padding: '8px 12px',
          marginBottom: 12,
          fontSize: 12,
          color: '#1f3b5c',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 600, background: '#9b1c2c', color: '#fff', padding: '1px 6px' }}>Copilot</span>
          <span>Copilot Analyst memo available for this application.</span>
          <button
            onClick={() => navigate(`/loans/${application.id}?tab=notes`)}
            style={{ marginLeft: 'auto', fontSize: 11, color: '#1f3b5c', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontFamily: 'Inter, sans-serif' }}
          >
            View in Notes & Memo →
          </button>
        </div>
      )}

      {/* Tab bar + content */}
      <div>
        <TabNav loanId={application.id} activeTab={activeTab} />
        <div style={{
          padding: 20,
          border: '1px solid #d8d8d8',
          borderTop: 'none',
        }}>
          {activeTab === 'data-summary'      && <DataSummaryTab application={application} debtor={debtor} financials={financials} slik={slik} aml={amlFraud} crde={crde} collateral={collateral} />}
          {activeTab === 'permohonan-kredit' && <PermohonanKreditTab application={application} financials={financials} />}
          {activeTab === 'profil-debitur'    && debtor    && <ProfilDebiturTab debtor={debtor} />}
          {activeTab === 'data-keuangan'     && financials && <DataKeuanganTab financials={financials} />}
          {activeTab === 'slik-ojk'          && slik      && <SlikOjkTab slik={slik} />}
          {activeTab === 'aml-fraud'         && amlFraud  && <AmlFraudTab aml={amlFraud} />}
          {activeTab === 'hasil-crde'        && crde      && <CrdeResultTab crde={crde} />}
          {activeTab === 'agunan'            && collateral && <AgunanTab collateral={collateral} />}
          {activeTab === 'audit-log'         && <AuditLogTab loanId={application.id} />}
          {activeTab === 'notes'             && <NotesTab loanId={application.id} />}
        </div>
      </div>

      {/* Print memo modal */}
      {showPrint && loan && (
        <PrintMemoView loan={loan} onClose={() => setShowPrint(false)} />
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
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #d8d8d8',
            padding: 24,
            maxWidth: 380,
            width: '100%',
            margin: '0 16px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>
              Confirm Action
            </div>
            <p style={{ fontSize: 13, color: '#4a4a4a', marginBottom: 20 }}>
              Change <strong>{application.id}</strong> status to{' '}
              <strong style={{ color: confirmAction.bg }}>{confirmAction.next}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                data-testid="btn-confirm-action"
                onClick={() => applyAction(confirmAction.next)}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  height: 36,
                  background: confirmAction.bg,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                style={{
                  flex: 1,
                  height: 36,
                  background: 'transparent',
                  color: '#4a4a4a',
                  border: '1px solid #d8d8d8',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: toast.bg,
          color: '#fff',
          padding: '12px 28px',
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          <span style={{ fontSize: 16 }}>{toast.text.includes('Approved') ? '✓' : toast.text.includes('Rejected') ? '✗' : '–'}</span>
          {toast.text}
        </div>
      )}
    </Layout>
  );
}
