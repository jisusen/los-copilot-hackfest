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
    <div data-testid={`field-${testId}`} className="flex border-b border-border py-2.5">
      <span className="w-52 flex-shrink-0 text-xs text-muted font-medium">{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm text-text">{children || '—'}</span>
    </div>
  );
}

export function AgunanTab({ collateral }: { collateral: Collateral }) {
  if (!collateral.required) {
    return (
      <div data-testid="tab-content-agunan">
        <div className="bg-white border border-border rounded-lg p-8 text-center">
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
      <div className="bg-white border border-border rounded-lg px-5 mb-6">
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
          {collateral.legal_status === 'Clear' ? 'Clear' : collateral.legal_status}
        </Field>
        <Field label="Collateral Notes" testId="agunan-catatan">{collateral.notes}</Field>
      </div>
    </div>
  );
}
