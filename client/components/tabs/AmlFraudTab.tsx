import React from 'react';
import { formatDate } from '../../lib/api';

type AmlFraud = {
  screening_date: string; dttot_match: number; un_sanctions_match: number;
  pep_status: number; pep_edd_required: number; pep_detail: string; income_consistent: number;
  address_flag: number; fraud_signals: string; notes: string; engine_version: string;
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex border-b border-border py-2.5">
      <span className="w-56 flex-shrink-0 text-xs text-muted font-medium">{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm text-text">{children || '—'}</span>
    </div>
  );
}

export function AmlFraudTab({ aml }: { aml: AmlFraud }) {
  const hasFlag = aml.pep_status || aml.dttot_match || aml.un_sanctions_match || !aml.income_consistent || aml.address_flag;

  return (
    <div data-testid="tab-content-aml-fraud">
      {hasFlag ? (
        <div
          data-testid="aml-warning-banner"
          className="mb-5 p-4 rounded-lg border text-sm font-medium flex items-start gap-2"
          style={{ background: '#fef2f2', borderColor: '#b91c1c', color: '#b91c1c' }}
        >
          <span>⚠️</span>
          <div>
            <div className="font-semibold">ALERT: Debtor has been identified with AML/Fraud risk flags.</div>
            {aml.pep_status ? <div className="mt-1 text-sm">Debtor identified as PEP. Manual review required per PPATK regulations.</div> : null}
            {!aml.income_consistent ? <div className="mt-1 text-sm">Income inconsistency detected. Enhanced due diligence required.</div> : null}
            {aml.address_flag ? <div className="mt-1 text-sm">Address flag detected — data inconsistency found.</div> : null}
          </div>
        </div>
      ) : null}

      <div className="bg-white border border-border rounded-lg px-5 mb-6">
        <Field label="DTTOT Status" testId="dttot-status">
          {aml.dttot_match ? '⚠️ LISTED' : '✅ Not Listed'}
        </Field>
        <Field label="UN Sanctions Status" testId="un-sanctions-status">
          {aml.un_sanctions_match ? '⚠️ LISTED' : '✅ Not Listed'}
        </Field>
        <Field label="PEP Status" testId="pep-status">
          {aml.pep_status ? '⚠️ IDENTIFIED AS PEP' : '✅ Not a PEP'}
        </Field>
        <Field label="PEP EDD Required" testId="pep-edd">
          {aml.pep_edd_required ? '⚠️ Enhanced Due Diligence Required' : '✅ Not Required'}
        </Field>
        {aml.pep_detail ? (
          <Field label="PEP Detail" testId="pep-detail">{aml.pep_detail}</Field>
        ) : null}
        <Field label="Income vs Employment Consistency" testId="income-consistency">
          {aml.income_consistent ? '✅ Consistent' : '⚠️ Inconsistent — verification required'}
        </Field>
        <Field label="Address Flag" testId="address-flag">
          {aml.address_flag ? '⚠️ Flagged — data inconsistency' : '✅ No Flag'}
        </Field>
        <Field label="Fraud Signals" testId="fraud-signals">
          {aml.fraud_signals ? <span className="text-danger">{aml.fraud_signals}</span> : '✅ No Signals'}
        </Field>
      </div>

      <div className="bg-white border border-border rounded-lg px-5">
        <Field label="AML Notes" testId="aml-catatan">{aml.notes}</Field>
        <Field label="Screening Date" testId="aml-tanggal">{formatDate(aml.screening_date)}</Field>
        <Field label="Run by" testId="aml-system">{aml.engine_version}</Field>
      </div>
    </div>
  );
}
