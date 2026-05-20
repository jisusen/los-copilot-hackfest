import React from 'react';
import { formatDate, formatRp } from '../../lib/api';

type Slik = {
  check_date: string; kolektibilitas: number; kolektibilitas_label: string;
  worst_kol_12m: number; payment_history_24m: string; existing_bank: string;
  existing_facility: string; existing_amount: number; total_obligations_slik: number;
  blacklist_status: number; notes: string;
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

export function SlikOjkTab({ slik }: { slik: Slik }) {
  const kolColor = KOL_COLORS[slik.kolektibilitas] ?? '#6b7c93';

  return (
    <div data-testid="tab-content-slik-ojk">
      <div className="bg-white border border-border rounded-lg px-5 mb-6">
        <Field label="Check Date" testId="slik-tanggal">{formatDate(slik.check_date)}</Field>
        <div data-testid="field-kolektibilitas" className="flex border-b border-border py-2.5">
          <span className="w-56 flex-shrink-0 text-xs text-muted font-medium">Current Collectability</span>
          <span data-testid="value-kolektibilitas">
            <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ background: kolColor }}>
              {slik.kolektibilitas} — {slik.kolektibilitas_label}
            </span>
          </span>
        </div>
        <Field label="Worst Collectability (12 months)" testId="kol-terburuk-12m">
          <span className="font-medium" style={{ color: KOL_COLORS[slik.worst_kol_12m] ?? '#6b7c93' }}>
            {slik.worst_kol_12m} — {slik.kolektibilitas_label}
          </span>
        </Field>
        <Field label="Payment History (24 months)" testId="riwayat-24m">{slik.payment_history_24m}</Field>
      </div>

      <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Existing Credit Facilities</h3>
      <div className="bg-white border border-border rounded-lg px-5 mb-6">
        <Field label="Existing Bank / Institution" testId="bank-existing">{slik.existing_bank}</Field>
        <Field label="Facility Type" testId="fasilitas-existing">{slik.existing_facility}</Field>
        <Field label="Facility Amount" testId="total-kewajiban-slik">
          <span className="font-mono">{slik.existing_amount ? formatRp(slik.existing_amount) : '—'}</span>
        </Field>
        <Field label="Blacklist Status" testId="blacklist-status">
          {slik.blacklist_status ? '⚠️ LISTED' : '✅ Not Listed'}
        </Field>
      </div>

      <div className="bg-white border border-border rounded-lg px-5">
        <Field label="SLIK Notes" testId="slik-catatan">{slik.notes}</Field>
      </div>
    </div>
  );
}
