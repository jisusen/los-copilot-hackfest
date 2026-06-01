import React from 'react';
import { formatDate, formatRp } from '../../lib/api';

type SlikFacility = {
  bank: string; facility_type: string; limit: number; outstanding: number;
  collectability: number; collectability_label: string; open_date: string; tenure_months: number;
};

type SlikHistoryMonth = {
  period: string; collectability: number; collectability_label: string;
};

type SlikInquiry = {
  date: string; purpose: string; institution: string; amount: string;
};

type Slik = {
  check_date: string; kolektibilitas: number; kolektibilitas_label: string;
  worst_kol_12m: number; payment_history_24m: string; existing_bank: string;
  existing_facility: string; existing_amount: number; total_obligations_slik: number;
  blacklist_status: number; notes: string;
  slik_score?: number; slik_grade?: string;
  facilities?: SlikFacility[];
  total_facilities?: number; total_limit?: number; total_outstanding?: number;
  credit_utilization_ratio?: number;
  payment_history_grid?: SlikHistoryMonth[];
  id_verified?: number; id_verification_note?: string;
  last_inquiry_date?: string; total_inquiries_last_12m?: number;
  inquiries?: SlikInquiry[];
  guaranteed_by?: string | null;
};

const KOL_COLORS: Record<number, string> = {
  1: '#1a7f4b',
  2: '#c47d0e',
  3: '#d97706',
  4: '#dc2626',
  5: '#991b1b',
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex border-b border-border py-2.5">
      <span className="w-56 flex-shrink-0 text-xs text-muted font-medium">{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm text-text">{children || '—'}</span>
    </div>
  );
}

function KolBadge({ kol, label }: { kol: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: KOL_COLORS[kol] ?? '#6b7c93' }}>
      {label || `${kol}`}
    </span>
  );
}

export function SlikOjkTab({ slik }: { slik: Slik }) {
  const kolColor = KOL_COLORS[slik.kolektibilitas] ?? '#6b7c93';

  return (
    <div data-testid="tab-content-slik-ojk">
      <div className="mb-6 p-4 rounded-lg border" style={{ background: '#f9fafb', borderColor: '#d1d9e0' }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted font-medium uppercase tracking-wide">SLIK Credit Score</span>
            <div className="text-2xl font-bold font-mono mt-1" style={{ color: '#1a3a5c' }}>
              {slik.slik_score}
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-muted font-medium uppercase tracking-wide">Grade</span>
            <div className="text-sm font-bold font-mono mt-1 px-3 py-1 rounded inline-block" style={{
              background: slik.slik_grade === 'Low Risk' ? '#e3f0e9' : slik.slik_grade === 'Medium Risk' ? '#fff1d8' : '#fef2f2',
              color: slik.slik_grade === 'Low Risk' ? '#0d6e3f' : slik.slik_grade === 'Medium Risk' ? '#8a5a08' : '#b91c1c',
            }}>
              {slik.slik_grade}
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-muted font-medium uppercase tracking-wide">Check Date</span>
            <div className="text-sm font-mono mt-1" style={{ color: '#1a3a5c' }}>{formatDate(slik.check_date)}</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted font-medium uppercase tracking-wide">Total Facilities</span>
            <div className="text-sm font-mono mt-1" style={{ color: '#1a3a5c' }}>{slik.total_facilities}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white border border-border rounded-lg px-5">
          <h3 className="font-display font-semibold text-text text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>Current Collectability</h3>
          <Field label="Current KOL" testId="kolektibilitas">
            <KolBadge kol={slik.kolektibilitas} label={`${slik.kolektibilitas} - ${slik.kolektibilitas_label}`} />
          </Field>
          <Field label="Worst KOL (12 months)" testId="kol-terburuk-12m">
            <KolBadge kol={slik.worst_kol_12m} label={`${slik.worst_kol_12m} - ${slik.kolektibilitas_label}`} />
          </Field>
          <Field label="SLIK Obligations" testId="total-kewajiban-slik">
            <span className="font-mono">{formatRp(slik.total_obligations_slik)}</span>
          </Field>
        </div>

        <div className="bg-white border border-border rounded-lg px-5">
          <h3 className="font-display font-semibold text-text text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>Debtor Verification</h3>
          <Field label="NIK Verification" testId="nik-verification">
            {slik.id_verified ? (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#e3f0e9', color: '#0d6e3f' }}>Verified</span>
            ) : (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#fef2f2', color: '#b91c1c' }}>Mismatch</span>
            )}
          </Field>
          <Field label="Verification Note" testId="verification-note">{slik.id_verification_note}</Field>
          <Field label="SLIK Blacklist" testId="blacklist-status">
            {slik.blacklist_status ? (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#fef2f2', color: '#b91c1c' }}>LISTED</span>
            ) : 'Not Listed'}
          </Field>
          {slik.guaranteed_by ? (
            <Field label="Guaranteed By" testId="guarantor">{slik.guaranteed_by}</Field>
          ) : null}
        </div>
      </div>

      <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">24-Month Payment History</h3>
      <div className="bg-white border border-border rounded-lg overflow-hidden mb-6">
        <div className="grid grid-cols-6 gap-0">
          {slik.payment_history_grid?.map((m, i) => (
            <div key={i} className="p-2.5 text-center border-r border-b border-border" style={{
              background: m.collectability === 1 ? '#f0fdf4' : m.collectability === 2 ? '#fffbeb' : m.collectability === 3 ? '#fff7ed' : '#fef2f2',
            }}>
              <div className="text-[10px] font-mono text-muted">{m.period.split('-')[1]}/{m.period.split('-')[0].slice(2)}</div>
              <div className="mt-0.5">
                <KolBadge kol={m.collectability} />
              </div>
              <div className="text-[9px] text-muted mt-0.5 leading-tight">{m.collectability_label.split(' - ')[1] || m.collectability_label}</div>
            </div>
          ))}
        </div>
      </div>

      <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Credit Facilities</h3>
      <div className="bg-white border border-border rounded-lg overflow-hidden mb-6">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#f4f6f8' }}>
              <th className="text-left px-4 py-2.5 font-semibold text-muted uppercase tracking-wide">Bank / Institution</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted uppercase tracking-wide">Facility Type</th>
              <th className="text-right px-4 py-2.5 font-semibold text-muted uppercase tracking-wide">Limit</th>
              <th className="text-right px-4 py-2.5 font-semibold text-muted uppercase tracking-wide">Outstanding</th>
              <th className="text-center px-4 py-2.5 font-semibold text-muted uppercase tracking-wide">KOL</th>
              <th className="text-center px-4 py-2.5 font-semibold text-muted uppercase tracking-wide">Open Date</th>
              <th className="text-right px-4 py-2.5 font-semibold text-muted uppercase tracking-wide">Tenure</th>
            </tr>
          </thead>
          <tbody>
            {slik.facilities?.map((f, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium">{f.bank}</td>
                <td className="px-4 py-2.5 text-muted">{f.facility_type}</td>
                <td className="px-4 py-2.5 font-mono text-right">{formatRp(f.limit)}</td>
                <td className="px-4 py-2.5 font-mono text-right">{formatRp(f.outstanding)}</td>
                <td className="px-4 py-2.5 text-center"><KolBadge kol={f.collectability} label={`${f.collectability}`} /></td>
                <td className="px-4 py-2.5 text-center font-mono text-muted">{f.open_date}</td>
                <td className="px-4 py-2.5 font-mono text-right">{f.tenure_months}mo</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end gap-8 px-4 py-2.5 text-xs font-medium" style={{ background: '#f9fafb', borderTop: '1px solid #d1d9e0' }}>
          <div>
            <span className="text-muted">Total Limit: </span>
            <span className="font-mono" style={{ color: '#1a3a5c' }}>{formatRp(slik.total_limit)}</span>
          </div>
          <div>
            <span className="text-muted">Total Outstanding: </span>
            <span className="font-mono" style={{ color: '#1a3a5c' }}>{formatRp(slik.total_outstanding)}</span>
          </div>
          <div>
            <span className="text-muted">Utilization: </span>
            <span className="font-mono">{((slik.credit_utilization_ratio ?? 0) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white border border-border rounded-lg px-5">
          <h3 className="font-display font-semibold text-text text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>Credit Inquiries (Last 12mo)</h3>
          <Field label="Total Inquiries" testId="total-inquiries">{slik.total_inquiries_last_12m}</Field>
          <Field label="Last Inquiry" testId="last-inquiry">{slik.last_inquiry_date}</Field>
          {slik.inquiries?.map((inq, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-border last:border-b-0">
              <div>
                <div className="text-xs text-muted">{inq.date}</div>
                <div className="text-sm text-text">{inq.purpose}</div>
                <div className="text-xs text-muted font-mono">{inq.institution}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted">Amount</div>
                <div className="text-sm font-mono">{inq.amount}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-lg px-5">
          <h3 className="font-display font-semibold text-text text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>SLIK Notes</h3>
          <Field label="Payment Track Record" testId="riwayat-24m">{slik.payment_history_24m}</Field>
          <Field label="SLIK Notes" testId="slik-catatan">{slik.notes}</Field>
        </div>
      </div>
    </div>
  );
}