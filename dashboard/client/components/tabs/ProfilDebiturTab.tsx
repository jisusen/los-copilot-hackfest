import React from 'react';
import { formatRp, formatDate, formatYears } from '../../lib/api';

type Debtor = {
  full_name: string; nik: string; npwp: string; date_of_birth: string;
  marital_status: string; dependents: number; employment_type: string;
  employer_name: string; job_title: string; years_employed: number;
  domicile_city: string; domicile_address: string; phone: string; email: string;
  tempat_lahir?: string; jenis_kelamin?: string; agama?: string;
  pendidikan_terakhir?: string; nama_ibu_kandung?: string; kewarganegaraan?: string;
  kode_pos?: string; kelurahan?: string; kecamatan?: string; rt_rw?: string;
  masa_berlaku_ktp?: string; status_rumah?: string; lama_tinggal?: string;
  tagihan_bulanan?: number;
};

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <div data-testid={`field-${testId}`} className="flex flex-col sm:flex-row sm:items-center border-b py-3 px-4 gap-0.5 sm:gap-0 field-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
      <span className="w-full sm:w-56 flex-shrink-0 text-xs sm:text-sm font-medium field-label" style={{ color: '#475569' }}>{label}</span>
      <span data-testid={`value-${testId}`} className="text-sm font-semibold" style={{ color: '#0f172a' }}>{children || '—'}</span>
    </div>
  );
}

export function ProfilDebiturTab({ debtor }: { debtor: Debtor }) {
  const age = debtor.date_of_birth
    ? Math.floor((Date.now() - new Date(debtor.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : 0;

  return (
    <div data-testid="tab-content-profil-debitur">
      <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Personal Identity</h3>
      <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
        <Field label="Full Name" testId="nama-lengkap">{debtor.full_name}</Field>
        <Field label="NIK" testId="nik"><span className="font-mono">{debtor.nik}</span></Field>
        <Field label="NPWP" testId="npwp"><span className="font-mono">{debtor.npwp}</span></Field>
        <Field label="Date of Birth" testId="tanggal-lahir">
          {debtor.date_of_birth ? `${formatDate(debtor.date_of_birth)} (Age: ${age} years)` : '—'}
        </Field>
        <Field label="Marital Status" testId="status-pernikahan">{debtor.marital_status}</Field>
        <Field label="Dependents" testId="jumlah-tanggungan">{debtor.dependents} person(s)</Field>
      </div>

      <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Employment</h3>
      <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
        <Field label="Employment Type" testId="jenis-pekerjaan">{debtor.employment_type}</Field>
        <Field label="Employer" testId="nama-perusahaan">{debtor.employer_name}</Field>
        <Field label="Job Title" testId="jabatan">{debtor.job_title}</Field>
        <Field label="Years Employed" testId="lama-bekerja">{formatYears(debtor.years_employed)}</Field>
      </div>

      <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Address & Contact</h3>
      <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
        <Field label="City" testId="domisili">{debtor.domicile_city}</Field>
        <Field label="Full Address" testId="alamat-lengkap">{debtor.domicile_address}</Field>
        <Field label="Phone" testId="no-telepon">{debtor.phone}</Field>
        <Field label="Email" testId="email">{debtor.email}</Field>
        {debtor.kode_pos && <Field label="Postal Code" testId="kode-pos">{debtor.kode_pos}</Field>}
        {debtor.kelurahan && <Field label="Kelurahan" testId="kelurahan">{debtor.kelurahan}</Field>}
        {debtor.kecamatan && <Field label="Kecamatan" testId="kecamatan">{debtor.kecamatan}</Field>}
        {debtor.rt_rw && <Field label="RT / RW" testId="rt-rw">{debtor.rt_rw}</Field>}
      </div>

      {debtor.tempat_lahir && (
        <>
          <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Additional Identity</h3>
          <div className="bg-white border rounded-lg overflow-hidden mb-6" style={{ borderColor: '#e2e8f0' }}>
            <Field label="Place of Birth" testId="tempat-lahir">{debtor.tempat_lahir}</Field>
            <Field label="Gender" testId="jenis-kelamin">{debtor.jenis_kelamin}</Field>
            <Field label="Religion" testId="agama">{debtor.agama}</Field>
            <Field label="Education" testId="pendidikan">{debtor.pendidikan_terakhir}</Field>
            <Field label="Mother's Maiden Name" testId="nama-ibu">{debtor.nama_ibu_kandung}</Field>
            <Field label="Nationality" testId="kewarganegaraan">{debtor.kewarganegaraan}</Field>
            <Field label="ID Card Expiry" testId="masa-berlaku-ktp">{debtor.masa_berlaku_ktp}</Field>
          </div>

          <h3 className="font-semibold text-base mb-3" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Residence & Financial Profile</h3>
          <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
            <Field label="Home Ownership" testId="status-rumah">{debtor.status_rumah}</Field>
            <Field label="Length of Residence" testId="lama-tinggal">{debtor.lama_tinggal}</Field>
            <Field label="Monthly Utilities" testId="tagihan-bulanan">
              <span className="font-mono">{formatRp(debtor.tagihan_bulanan)}</span>
            </Field>
          </div>
        </>
      )}
    </div>
  );
}
