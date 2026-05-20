import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  crde_decision: string;
  risk_score: string;
  analyst_id?: string;
};

function statusPill(status: string) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    'Approved':     { bg: '#e3efe6', color: '#1f6b3a', border: '#1f6b3a' },
    'Rejected':     { bg: '#fbe6e6', color: '#a83232', border: '#a83232' },
    'Under Review': { bg: '#fff1d8', color: '#b46a00', border: '#b46a00' },
    'Cancelled':    { bg: '#f6f6f4', color: '#8a8a8a', border: '#d8d8d8' },
  };
  const s = map[status] ?? { bg: '#f6f6f4', color: '#4a4a4a', border: '#d8d8d8' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 8px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontSize: 11,
      fontWeight: 500,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function crdePill(decision: string) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    'APPROVED':         { bg: '#e3efe6', color: '#1f6b3a', border: '#1f6b3a' },
    'COMMITTEE REVIEW': { bg: '#fff1d8', color: '#b46a00', border: '#b46a00' },
    'REJECTED':         { bg: '#fbe6e6', color: '#a83232', border: '#a83232' },
  };
  const s = map[decision] ?? { bg: '#f6f6f4', color: '#4a4a4a', border: '#d8d8d8' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 8px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontSize: 11,
      fontWeight: 500,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {decision || '—'}
    </span>
  );
}

function productPill(product: string) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 20,
      padding: '0 8px',
      border: '1px solid #1a1a1a',
      fontSize: 11,
      fontWeight: 500,
      color: '#1a1a1a',
      whiteSpace: 'nowrap',
    }}>
      {product}
    </span>
  );
}

export function LoanQueuePage() {
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [search, setSearch] = useState('');

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

  const underwriting = loans.filter(l => l.status === 'Under Review').length;
  const approved = loans.filter(l => l.status === 'Approved').length;
  const rejected = loans.filter(l => l.status === 'Rejected').length;

  const inputStyle: React.CSSProperties = {
    border: '1px solid #1a1a1a',
    height: 36,
    padding: '0 10px',
    fontSize: 13,
    color: '#1a1a1a',
    background: '#ffffff',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxSizing: 'border-box',
  };

  return (
    <Layout>
      {/* Page head */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: '#1a1a1a' }}>
          Consumer Credit Application Queue
        </div>
        <div style={{ fontSize: 12, color: '#8a8a8a', marginTop: 4 }}>
          {total} applications · last refresh {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'TOTAL APPLICATIONS', value: total },
          { label: 'UNDER REVIEW',       value: underwriting },
          { label: 'APPROVED',           value: approved },
          { label: 'REJECTED',           value: rejected },
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1,
            padding: 12,
            background: '#f6f6f4',
            border: '1px solid #d8d8d8',
          }}>
            <div style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#8a8a8a',
              fontWeight: 600,
              marginBottom: 4,
            }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          data-testid="filter-status"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ ...inputStyle, width: 160 }}
        >
          <option value="">All Statuses</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          data-testid="filter-product"
          value={filterProduct}
          onChange={e => setFilterProduct(e.target.value)}
          style={{ ...inputStyle, width: 140 }}
        >
          <option value="">All Products</option>
          <option value="KTA">KTA</option>
          <option value="KPR">KPR</option>
          <option value="KKB">KKB</option>
          <option value="Multiguna">Multiguna</option>
        </select>
        <input
          data-testid="search-input"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name / NIK / App No..."
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', fontSize: 13, color: '#8a8a8a' }}>
          Loading data...
        </div>
      ) : (
        <table
          data-testid="loan-queue-table"
          style={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr style={{ background: '#f6f6f4' }}>
              {['App No.', 'Debtor Name', 'Product', 'Amount', 'Tenor', 'Date', 'Status', 'Analyst', 'CRDE', 'Action'].map(h => (
                <th key={h} style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#8a8a8a',
                  fontWeight: 600,
                  padding: '8px 10px',
                  borderBottom: '1px solid #1a1a1a',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 40, fontSize: 13, color: '#8a8a8a' }}>
                  No applications found
                </td>
              </tr>
            ) : loans.map((loan, i) => (
              <tr
                key={loan.id}
                data-testid={`loan-row-${loan.id}`}
                style={{
                  background: i % 2 === 0 ? '#ffffff' : '#f6f6f4',
                  borderBottom: '1px solid #d8d8d8',
                  cursor: 'default',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e6ecf2')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#ffffff' : '#f6f6f4')}
              >
                <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: '"IBM Plex Mono", monospace', color: '#1f3b5c' }}>
                  {loan.id}
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>
                  {loan.debtor_name}
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12 }}>
                  {productPill(loan.product_type)}
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12, fontFamily: '"IBM Plex Mono", monospace', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                  {formatRp(loan.amount_requested)}
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                  {loan.tenor_months} mo
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12, color: '#8a8a8a', whiteSpace: 'nowrap' }}>
                  {formatDate(loan.created_at)}
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12 }}>
                  {statusPill(loan.status)}
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12 }}>
                  {loan.analyst_id
                    ? <span style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#1f3b5c', fontSize: 11 }}>{loan.analyst_id}</span>
                    : <span style={{ color: '#b8b8b8' }}>—</span>
                  }
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12 }}>
                  {crdePill(loan.crde_decision)}
                </td>
                <td style={{ padding: '8px 10px', fontSize: 12 }}>
                  <Link
                    data-testid={`loan-link-${loan.id}`}
                    to={`/loans/${loan.id}`}
                    style={{
                      fontSize: 11,
                      color: '#1f3b5c',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Open ›
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
