import React from 'react';
import { formatDate, formatYears } from '../../lib/api';

type Debtor = {
  full_name: string; nik: string; npwp: string; date_of_birth: string;
  marital_status: string; dependents: number; employment_type: string;
  employer_name: string; job_title: string; years_employed: number;
  domicile_city: string; domicile_address: string; phone: string; email: string;
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex border-b border-border py-2.5">
      <span className="w-52 flex-shrink-0 text-xs text-muted font-medium">{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm text-text">{children || '—'}</span>
    </div>
  );
}

export function ProfilDebiturTab({ debtor }: { debtor: Debtor }) {
  const age = debtor.date_of_birth
    ? Math.floor((Date.now() - new Date(debtor.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : 0;

  return (
    <div data-testid="tab-content-profil-debitur">
      <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Personal Identity</h3>
      <div className="bg-white border border-border rounded-lg px-5 mb-6">
        <Field label="Full Name" testId="nama-lengkap">{debtor.full_name}</Field>
        <Field label="NIK" testId="nik"><span className="font-mono">{debtor.nik}</span></Field>
        <Field label="NPWP" testId="npwp"><span className="font-mono">{debtor.npwp}</span></Field>
        <Field label="Date of Birth" testId="tanggal-lahir">
          {debtor.date_of_birth ? `${formatDate(debtor.date_of_birth)} (Age: ${age} years)` : '—'}
        </Field>
        <Field label="Marital Status" testId="status-pernikahan">{debtor.marital_status}</Field>
        <Field label="Dependents" testId="jumlah-tanggungan">{debtor.dependents} person(s)</Field>
      </div>

      <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Employment</h3>
      <div className="bg-white border border-border rounded-lg px-5 mb-6">
        <Field label="Employment Type" testId="jenis-pekerjaan">{debtor.employment_type}</Field>
        <Field label="Employer" testId="nama-perusahaan">{debtor.employer_name}</Field>
        <Field label="Job Title" testId="jabatan">{debtor.job_title}</Field>
        <Field label="Years Employed" testId="lama-bekerja">{formatYears(debtor.years_employed)}</Field>
      </div>

      <h3 className="font-display font-semibold text-text mb-4 text-sm uppercase tracking-wide text-muted">Address & Contact</h3>
      <div className="bg-white border border-border rounded-lg px-5">
        <Field label="City" testId="domisili">{debtor.domicile_city}</Field>
        <Field label="Full Address" testId="alamat-lengkap">{debtor.domicile_address}</Field>
        <Field label="Phone" testId="no-telepon">{debtor.phone}</Field>
        <Field label="Email" testId="email">{debtor.email}</Field>
      </div>
    </div>
  );
}
