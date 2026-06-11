import React from 'react';
import { formatDate } from '../../lib/api';

type AmlFraud = {
  screening_date: string; dttot_match: number; un_sanctions_match: number;
  pep_status: number; pep_edd_required: number; pep_detail: string; income_consistent: number;
  address_flag: number; fraud_signals: string; notes: string; engine_version: string;
  screening_reference_id?: string; screening_type?: string; data_source?: string;
  dttot_list_name?: string | null; dttot_category?: string | null; dttot_match_date?: string | null;
  un_list_name?: string | null; un_category?: string | null;
  pep_position?: string; pep_country?: string; pep_scope?: string; pep_source?: string;
  adverse_media_match?: number; adverse_media_count?: number; adverse_media_details?: string;
  edd_status?: string; edd_completed_date?: string | null; edd_notes?: string | null;
  domestic_watchlist_match?: number; domestic_watchlist_detail?: string;
  tx_behavior_flagged?: number; tx_behavior_note?: string;
  overall_aml_score?: number; overall_aml_verdict?: string;
  reviewed_by?: string; review_date?: string;
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex flex-col sm:flex-row sm:items-center border-b py-3 px-4 gap-0.5 sm:gap-0 field-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <span className="w-full sm:w-56 flex-shrink-0 text-xs sm:text-sm font-medium field-label" style={{ color: '#475569' }}>{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm font-semibold" style={{ color: '#0f172a' }}>{children || '—'}</span>
    </div>
  );
}

function StatusBadge({ good, label, badLabel }: { good: boolean; label: string; badLabel?: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded" style={{
      background: good ? '#e3f0e9' : '#fef2f2',
      color: good ? '#0d6e3f' : '#b91c1c',
    }}>
      {good ? label : (badLabel || label)}
    </span>
  );
}

export function AmlFraudTab({ aml }: { aml: AmlFraud }) {
  const hasFlag = aml.pep_status || aml.dttot_match || aml.un_sanctions_match || !aml.income_consistent || aml.address_flag;

  const verdictColor = (v: string) => {
    if (v === 'Low Risk') return { bg: '#e3f0e9', text: '#0d6e3f' };
    if (v === 'Medium Risk') return { bg: '#fff1d8', text: '#8a5a08' };
    return { bg: '#fef2f2', text: '#b91c1c' };
  };

  const vc = verdictColor(aml.overall_aml_verdict || 'Low Risk');

  return (
    <div data-testid="tab-content-aml-fraud">
      {hasFlag ? (
        <div
          data-testid="aml-warning-banner"
          className="mb-5 p-4 rounded-lg border text-sm font-medium"
          style={{ background: '#fef2f2', borderColor: '#b91c1c', color: '#b91c1c' }}
        >
          <div className="font-semibold mb-1">ALERT: Debtor identified with AML/Fraud risk flags.</div>
          {aml.dttot_match ? <div className="mt-0.5">DTTOT match — debtor listed on Indonesian terrorism financing watchlist.</div> : null}
          {aml.un_sanctions_match ? <div className="mt-0.5">UN Sanctions match — debtor appears on UNSC sanctions list.</div> : null}
          {aml.pep_status ? <div className="mt-0.5">PEP — enhanced due diligence required per PPATK regulations.</div> : null}
          {!aml.income_consistent ? <div className="mt-0.5">Income inconsistency detected. Source of funds verification required.</div> : null}
          {aml.address_flag ? <div className="mt-0.5">Address flag — domicile data inconsistency found.</div> : null}
        </div>
      ) : null}

      <div className="mb-6 p-4 rounded-lg border" style={{ background: '#f9fafb', borderColor: '#e2e8f0' }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748b' }}>AML Screening Score</span>
            <div className="text-2xl font-bold font-mono mt-1" style={{ color: vc.text }}>
              {aml.overall_aml_score}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748b' }}>Verdict</span>
            <div className="text-sm font-bold font-mono mt-1 px-3 py-1 rounded inline-block" style={{ background: vc.bg, color: vc.text }}>
              {aml.overall_aml_verdict}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#64748b' }}>Screening Ref</span>
            <div className="text-sm font-mono mt-1" style={{ color: '#1a3a5c' }}>{aml.screening_reference_id}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div className="bg-white border rounded-lg" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="font-semibold text-sm uppercase tracking-wide px-5 pt-4 pb-2" style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>DTTOT Screening</h3>
          <div className="px-5">
            <Field label="DTTOT Status" testId="dttot-status">
              <StatusBadge good={!aml.dttot_match} label="Not Listed" badLabel="LISTED" />
            </Field>
            <Field label="Screening Type" testId="screening-type">{aml.screening_type}</Field>
            {aml.dttot_list_name ? <Field label="Listed Name" testId="dttot-name" children={<span className="font-mono">{aml.dttot_list_name}</span>} /> : null}
            {aml.dttot_category ? <Field label="Category" testId="dttot-category">{aml.dttot_category}</Field> : null}
            {aml.dttot_match_date ? <Field label="Match Date" testId="dttot-date">{aml.dttot_match_date}</Field> : null}
          </div>
        </div>

        <div className="bg-white border rounded-lg" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="font-semibold text-sm uppercase tracking-wide px-5 pt-4 pb-2" style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>UN Sanctions Screening</h3>
          <div className="px-5">
            <Field label="UN Sanctions Status" testId="un-sanctions-status">
              <StatusBadge good={!aml.un_sanctions_match} label="Not Listed" badLabel="LISTED" />
            </Field>
            <Field label="Data Source" testId="data-source">{aml.data_source}</Field>
            {aml.un_list_name ? <Field label="Listed Name" testId="un-name" children={<span className="font-mono">{aml.un_list_name}</span>} /> : null}
            {aml.un_category ? <Field label="Sanctions Regime" testId="un-category">{aml.un_category}</Field> : null}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg px-5 mb-6" style={{ borderColor: '#e2e8f0' }}>
        <h3 className="font-semibold text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>PEP Screening</h3>
        <Field label="PEP Status" testId="pep-status">
          <StatusBadge good={!aml.pep_status} label="Not a PEP" badLabel="IDENTIFIED AS PEP" />
        </Field>
        <Field label="Position" testId="pep-jabatan">{aml.pep_position}</Field>
        <Field label="Scope" testId="pep-scope">{aml.pep_scope}</Field>
        <Field label="Country" testId="pep-negara">{aml.pep_country}</Field>
        <Field label="Source" testId="pep-source">{aml.pep_source}</Field>
        <Field label="EDD Required" testId="pep-edd">
          {aml.pep_edd_required ? 'Enhanced Due Diligence Required' : 'Not Required'}
        </Field>
        {aml.pep_detail ? (
          <Field label="PEP Detail" testId="pep-detail">{aml.pep_detail}</Field>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div className="bg-white border rounded-lg px-5" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="font-semibold text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>Adverse Media</h3>
          <Field label="Adverse Media Match" testId="adverse-media-status">
            <StatusBadge good={!aml.adverse_media_match} label="No Match" badLabel="Match Found" />
          </Field>
          {aml.adverse_media_match ? (
            <>
              <Field label="Matches Found" testId="adverse-media-count">{aml.adverse_media_count}</Field>
              <Field label="Details" testId="adverse-media-detail" children={<span style={{ color: '#b91c1c' }}>{aml.adverse_media_details}</span>} />
            </>
          ) : null}
          <Field label="Income Consistency" testId="income-consistency">
            <StatusBadge good={!!aml.income_consistent} label="Consistent" badLabel="Inconsistent" />
          </Field>
          <Field label="Address Flag" testId="address-flag">
            <StatusBadge good={!aml.address_flag} label="No Flag" badLabel="Flagged" />
          </Field>
        </div>

        <div className="bg-white border rounded-lg px-5" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="font-semibold text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>Transaction Behavior</h3>
          <Field label="Anomalies Flagged" testId="tx-flag">
            <StatusBadge good={!aml.tx_behavior_flagged} label="No Anomalies" badLabel="Flagged" />
          </Field>
          {aml.tx_behavior_note ? (
            <Field label="Transaction Note" testId="tx-note">{aml.tx_behavior_note}</Field>
          ) : null}
          <Field label="Fraud Signals" testId="fraud-signals">
            {aml.fraud_signals ? <span style={{ color: '#b91c1c', fontWeight: 600 }}>{aml.fraud_signals}</span> : 'No Signals'}
          </Field>
          <Field label="Domestic Watchlist" testId="watchlist-status">
            <StatusBadge good={!aml.domestic_watchlist_match} label="No Match" badLabel="Match Found" />
          </Field>
          {aml.domestic_watchlist_detail && aml.domestic_watchlist_detail !== '—' ? (
            <Field label="Watchlist Detail" testId="watchlist-detail">{aml.domestic_watchlist_detail}</Field>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div className="bg-white border rounded-lg px-5" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="font-semibold text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>EDD Status</h3>
          <Field label="EDD Status" testId="edd-status">{aml.edd_status}</Field>
          {aml.edd_completed_date ? (
            <Field label="EDD Complete Date" testId="edd-date">{aml.edd_completed_date}</Field>
          ) : null}
          {aml.edd_notes ? (
            <Field label="EDD Notes" testId="edd-notes">{aml.edd_notes}</Field>
          ) : null}
        </div>

        <div className="bg-white border rounded-lg px-5" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="font-semibold text-sm uppercase tracking-wide pt-4 pb-2" style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>Review</h3>
          <Field label="AML Notes" testId="aml-catatan">{aml.notes}</Field>
          <Field label="Reviewed By" testId="aml-reviewer">{aml.reviewed_by}</Field>
          <Field label="Review Date" testId="aml-review-date">{aml.review_date || formatDate(aml.screening_date)}</Field>
          <Field label="Screening Date" testId="aml-tanggal">{formatDate(aml.screening_date)}</Field>
          <Field label="Engine Version" testId="aml-system">{aml.engine_version}</Field>
        </div>
      </div>
    </div>
  );
}
