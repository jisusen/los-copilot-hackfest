import React from 'react';
import { formatRp, formatDate, formatPercent } from '../../lib/api';

type Collateral = {
  required: number; collateral_type: string | null; asset_description: string | null;
  market_value: number | null; liquidation_value: number | null; appraisal_date: string | null;
  ltv_ratio: number | null; ltv_threshold: number | null; certificate_number: string | null;
  legal_status: string | null; notes: string | null;
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex flex-col sm:flex-row sm:items-center border-b py-3 px-4 gap-0.5 sm:gap-0 field-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <span className="w-full sm:w-56 flex-shrink-0 text-xs sm:text-sm font-medium field-label" style={{ color: '#475569' }}>{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm font-semibold" style={{ color: '#0f172a' }}>{children || '—'}</span>
    </div>
  );
}

export function AgunanTab({ collateral }: { collateral: Collateral }) {
  if (!collateral.required) {
    return (
      <div data-testid="tab-content-agunan">
        <div className="bg-white border rounded-lg p-8 text-center" style={{ borderColor: '#e2e8f0' }}>
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-display font-semibold text-text mb-2">Collateral Not Required</h3>
          <p className="text-muted text-sm">Unsecured loan product — no collateral required.</p>
          <div data-testid="value-agunan-required" className="hidden">No</div>
        </div>
      </div>
    );
  }

  const ltvColor = collateral.ltv_ratio && collateral.ltv_threshold && collateral.ltv_ratio < collateral.ltv_threshold ? '#1a7f4b' : '#c47d0e';

  return (
    <div data-testid="tab-content-agunan">
      <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
        <Field label="Collateral Required" testId="agunan-required">Yes</Field>
        <Field label="Asset Type" testId="jenis-agunan">{collateral.collateral_type}</Field>
        <Field label="Asset Description" testId="deskripsi-aset">{collateral.asset_description}</Field>
        <Field label="Market Value" testId="nilai-pasar">
          <span className="font-mono">{collateral.market_value ? formatRp(collateral.market_value) : '—'}</span>
        </Field>
        <Field label="Liquidation Value" testId="nilai-likuidasi">
          <span className="font-mono">{collateral.liquidation_value ? formatRp(collateral.liquidation_value) : '—'}</span>
        </Field>
        <Field label="LTV Ratio" testId="ltv-ratio">
          <span className="font-bold" style={{ color: ltvColor }}>
            {collateral.ltv_ratio ? formatPercent(collateral.ltv_ratio) : '—'}
          </span>
        </Field>
        <Field label="LTV Limit (RAC)" testId="ltv-threshold">
          {collateral.ltv_threshold ? `${Math.round(collateral.ltv_threshold * 100)}% (${collateral.collateral_type})` : '—'}
        </Field>
        <Field label="Appraisal Date" testId="tanggal-appraisal">
          {collateral.appraisal_date ? formatDate(collateral.appraisal_date) : '—'}
        </Field>
        <Field label="Certificate No." testId="no-sertifikat">
          <span className="font-mono">{collateral.certificate_number}</span>
        </Field>
        <Field label="Legal Status" testId="status-hukum">
          {collateral.legal_status === 'Clear' ? '✅ Clear' : collateral.legal_status}
        </Field>
        <Field label="Collateral Notes" testId="agunan-catatan">{collateral.notes}</Field>
      </div>
    </div>
  );
}
