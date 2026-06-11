import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiFetch, formatRp, formatDate } from '../lib/api';

type LoanSummary = {
  id: string;
  status: string;
  created_at: string;
  product_type: string;
  amount_requested: number;
  tenor_months: number;
  debtor_name: string;
  ai_agent_decision: string;
  analyst_id?: string;
};

const theme = {
  primaryDark: '#7A1520',
  primary: '#8B1A1A',
  primaryLight: '#A52A2A',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  success: '#22C55E',
  successBg: '#DCFCE7',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  info: '#3B82F6',
  fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  radiusSm: '0.25rem',
  radiusMd: '0.5rem',
  radiusLg: '0.75rem',
  radiusFull: '9999px',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'Approved': { bg: theme.success, color: theme.white },
    'Submitted': { bg: theme.info, color: theme.white },
    'Draft': { bg: theme.gray200, color: theme.gray700 },
    'Under Review': { bg: theme.warning, color: theme.white },
    'Rejected': { bg: theme.danger, color: theme.white },
    'Cancelled': { bg: theme.gray200, color: theme.gray700 },
  };
  const t = map[status] ?? { bg: theme.gray200, color: theme.gray700 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 22,
      padding: '0 10px', fontSize: '0.75rem', fontWeight: 500,
      borderRadius: theme.radiusFull,
      background: t.bg, color: t.color, whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function ProductBadge({ product }: { product: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 22,
      padding: '0 10px', fontSize: '0.75rem', fontWeight: 500,
      color: theme.gray600, whiteSpace: 'nowrap',
    }}>
      {product}
    </span>
  );
}

function AiAgentBadge({ decision }: { decision: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    'APPROVED': { bg: '#DCFCE7', color: '#22C55E' },
    'COMMITTEE REVIEW': { bg: '#FEF3C7', color: '#F59E0B' },
    'REJECTED': { bg: '#FEE2E2', color: '#EF4444' },
  };
  if (!decision || decision === 'N/A') return <span style={{ fontSize: '0.75rem', color: theme.gray400 }}>—</span>;
  const t = map[decision] ?? { bg: theme.gray100, color: theme.gray600 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, height: 22,
      padding: '0 10px', fontSize: '0.75rem', fontWeight: 500,
      borderRadius: theme.radiusFull,
      background: t.bg, color: t.color, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
      {decision}
    </span>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 4, height: 24, background: theme.primary, borderRadius: 2, flexShrink: 0 }} />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.gray800, margin: 0 }}>{title}</h2>
    </div>
  );
}

const statIcons = {
  pending: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  review: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  approved: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  rejected: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  total: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
};

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: keyof typeof statIcons; color: 'red' | 'green' | 'blue' | 'teal' }) {
  const iconBg: Record<string, string> = { red: '#FEE2E2', green: '#DCFCE7', blue: '#DBEAFE', teal: '#CCFBF1' };
  const iconColor: Record<string, string> = { red: '#EF4444', green: '#22C55E', blue: '#3B82F6', teal: '#14B8A6' };
  return (
    <div style={{
      background: '#FFF3F3', border: '1px solid #FBB5B3',
      borderRadius: theme.radiusLg, padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: '0px 2px 8px 0px #0000001A',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: theme.radiusLg,
        background: '#FFFFFF', color: iconColor[color],
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d={statIcons[icon]} />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: theme.gray500 }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.gray800 }}>{value}</div>
      </div>
    </div>
  );
}

export function LoanQueuePage() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (filterProduct) params.set('product', filterProduct);
    if (search) params.set('search', search);
    const data = await apiFetch<{ loans: LoanSummary[]; total: number }>(`/api/loans?${params}`);
    setLoans(data.loans);
    setTotal(data.total);
    setLoading(false);
  }, [filterStatus, filterProduct, search]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLoans = loans.slice(startIndex, startIndex + itemsPerPage);

  const reviewCount = loans.filter(l => l.status === 'Under Review').length;
  const approvedCount = loans.filter(l => l.status === 'Approved').length;
  const rejectedCount = loans.filter(l => l.status === 'Rejected').length;

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 36, padding: '0 18px', fontFamily: theme.fontFamily,
    fontSize: '0.875rem', fontWeight: 500,
    borderRadius: theme.radiusFull, cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
  };

  const inputBase: React.CSSProperties = {
    height: 36, padding: '0 12px', fontFamily: theme.fontFamily,
    fontSize: '0.875rem', border: `1px solid ${theme.gray300}`,
    borderRadius: theme.radiusMd, background: theme.white,
    color: theme.gray800, outline: 'none', boxSizing: 'border-box',
  };

  const selectBase: React.CSSProperties = {
    height: 36, padding: '0 36px 0 12px', fontFamily: theme.fontFamily,
    fontSize: '0.875rem', border: `1px solid ${theme.gray300}`,
    borderRadius: theme.radiusMd, background: theme.white,
    color: theme.gray700, appearance: 'none', cursor: 'pointer',
    outline: 'none', minWidth: 140,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
  };

  return (
    <Layout>
      <SectionHeader title="Loan Application" />

      <div className="stat-cards" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <StatCard label="Awaiting Review" value={reviewCount} icon="review" color="blue" />
        <StatCard label="Approved" value={approvedCount} icon="approved" color="green" />
        <StatCard label="Rejected" value={rejectedCount} icon="rejected" color="red" />
        <StatCard label="Total Applications" value={total} icon="total" color="teal" />
      </div>

      {/* Toolbar */}
      <div className="filter-toolbar" style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width="16" height="16" fill="none" stroke="#9CA3AF" stroke-width="2" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            data-testid="search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or NIK…"
            style={{ ...inputBase, paddingLeft: 36, width: '100%' }}
            onFocus={e => {
              e.currentTarget.style.borderColor = theme.primary;
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 26, 26, 0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = theme.gray300;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        <select
          data-testid="filter-status"
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          style={selectBase}
          onFocus={e => {
            e.currentTarget.style.borderColor = theme.primary;
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 26, 26, 0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = theme.gray300;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="">Status: All</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          data-testid="filter-product"
          value={filterProduct}
          onChange={e => { setFilterProduct(e.target.value); setCurrentPage(1); }}
          style={selectBase}
          onFocus={e => {
            e.currentTarget.style.borderColor = theme.primary;
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 26, 26, 0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = theme.gray300;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="">Product: All</option>
          <option value="KTA">KTA</option>
          <option value="KPR">KPR</option>
          <option value="KKB">KKB</option>
          <option value="Multiguna">Multiguna</option>
        </select>

        <div style={{ fontSize: '0.75rem', color: theme.gray400, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Showing {paginatedLoans.length} of {total}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap" style={{
        background: theme.white, border: `1px solid ${theme.gray200}`,
        borderRadius: theme.radiusLg,
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', fontSize: '0.875rem', color: theme.gray500 }}>
            Loading data...
          </div>
        ) : (
          <table
            data-testid="loan-queue-table"
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}
          >
            <thead>
              <tr>
                {[
                  { label: 'App ID', cls: '' },
                  { label: 'Debtor', cls: '' },
                  { label: 'Product', cls: '' },
                  { label: 'Amount', cls: '' },
                  { label: 'Tenor', cls: 'hide-mobile' },
                  { label: 'Submitted', cls: 'hide-mobile' },
                  { label: 'Status', cls: '' },
                  { label: 'AI Agent', cls: 'hide-mobile' },
                ].map(h => (
                  <th key={h.label} className={h.cls} style={{
                    padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 600,
                    color: theme.gray700, textAlign: 'left', whiteSpace: 'nowrap',
                    borderBottom: `1px solid ${theme.gray200}`, background: theme.white,
                  }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 60, fontSize: '0.875rem', color: theme.gray500 }}>
                    No applications found
                  </td>
                </tr>
              ) : paginatedLoans.map((loan, i) => (
                <tr
                  key={loan.id}
                  data-testid={`loan-row-${loan.id}`}
                  className="loan-row"
                  onClick={() => navigate(`/loans/${loan.id}`)}
                  style={{
                    background: theme.white,
                    borderBottom: `1px solid ${theme.gray100}`,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.gray50; }}
                  onMouseLeave={e => { e.currentTarget.style.background = theme.white; }}
                >
                  <td className="loan-cell" data-label="App ID" style={{ padding: '0.875rem 1rem' }}>
                    <span
                      data-testid={`loan-link-${loan.id}`}
                      style={{
                        fontWeight: 500, color: theme.primary,
                        fontFamily: "'Open Sans', sans-serif", fontSize: '0.875rem',
                      }}
                    >
                      {loan.id}
                    </span>
                  </td>
                  <td className="loan-cell" data-label="Debtor" style={{ padding: '0.875rem 1rem', fontWeight: 500, color: theme.gray800 }}>
                    {loan.debtor_name}
                  </td>
                  <td className="loan-cell" data-label="Product" style={{ padding: '0.875rem 1rem' }}>
                    <ProductBadge product={loan.product_type} />
                  </td>
                  <td className="loan-cell" data-label="Amount" style={{
                    padding: '0.875rem 1rem', fontFamily: "'Open Sans', sans-serif",
                    color: theme.gray800, whiteSpace: 'nowrap', fontSize: '0.875rem',
                  }}>
                    {formatRp(loan.amount_requested)}
                  </td>
                  <td className="loan-cell hide-mobile" data-label="Tenor" style={{ padding: '0.875rem 1rem', color: theme.gray600 }}>
                    {loan.tenor_months}mo
                  </td>
                  <td className="loan-cell hide-mobile" data-label="Submitted" style={{
                    padding: '0.875rem 1rem', color: theme.gray500, whiteSpace: 'nowrap', fontSize: '0.75rem',
                  }}>
                    {formatDate(loan.created_at)}
                  </td>
                  <td className="loan-cell" data-label="Status" style={{ padding: '0.875rem 1rem' }}>
                    <StatusBadge status={loan.status} />
                  </td>
                  <td className="loan-cell hide-mobile" data-label="AI Agent" style={{ padding: '0.875rem 1rem' }}>
                    <AiAgentBadge decision={loan.ai_agent_decision} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', borderTop: `1px solid ${theme.gray200}`,
            fontSize: '0.75rem', color: theme.gray500,
          }}>
            <span>
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, total)} of {total}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, padding: 0,
                  background: 'transparent', border: 'none',
                  borderRadius: theme.radiusFull,
                  color: currentPage === 1 ? theme.gray300 : theme.gray500,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: 500,
                }}
                onMouseEnter={e => {
                  if (currentPage !== 1) e.currentTarget.style.background = theme.gray100;
                }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, padding: 0,
                  background: 'transparent', border: 'none',
                  borderRadius: theme.radiusFull,
                  color: currentPage === 1 ? theme.gray300 : theme.gray500,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: 500,
                }}
                onMouseEnter={e => {
                  if (currentPage !== 1) e.currentTarget.style.background = theme.gray100;
                }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                &lsaquo;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, padding: 0,
                    background: page === currentPage ? theme.primary : 'transparent',
                    border: 'none', borderRadius: theme.radiusFull,
                    color: page === currentPage ? theme.white : theme.gray500,
                    cursor: 'pointer', fontSize: '0.875rem',
                    fontWeight: page === currentPage ? 600 : 400,
                  }}
                  onMouseEnter={e => {
                    if (page !== currentPage) e.currentTarget.style.background = theme.gray100;
                  }}
                  onMouseLeave={e => {
                    if (page !== currentPage) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, padding: 0,
                  background: 'transparent', border: 'none',
                  borderRadius: theme.radiusFull,
                  color: currentPage === totalPages ? theme.gray300 : theme.gray500,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: 500,
                }}
                onMouseEnter={e => {
                  if (currentPage !== totalPages) e.currentTarget.style.background = theme.gray100;
                }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                &rsaquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, padding: 0,
                  background: 'transparent', border: 'none',
                  borderRadius: theme.radiusFull,
                  color: currentPage === totalPages ? theme.gray300 : theme.gray500,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: 500,
                }}
                onMouseEnter={e => {
                  if (currentPage !== totalPages) e.currentTarget.style.background = theme.gray100;
                }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>

    </Layout>
  );
}
